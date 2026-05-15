from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear
from django.utils import timezone
from rest_framework.generics import GenericAPIView

from common.utills.base_utills import normalize_to_date
from common.responses.api_response import APIResponse
from expenses.models import Expense
from members.models import Member, MemberPayment, MemberSubscription


def get_gym_id(request):
    """Read gym_id from JWT claims (set by middleware)."""
    claims = getattr(request, "user_claims", {}) or {}
    return claims.get("gym_id")


def aggregate_total(queryset, field="amount"):
    return queryset.aggregate(total=Sum(field))["total"] or Decimal("0")


def month_bounds(current_date):
    start = current_date.replace(day=1)
    if start.month == 12:
        next_start = start.replace(year=start.year + 1, month=1)
    else:
        next_start = start.replace(month=start.month + 1)
    return start, next_start


def previous_month_bounds(current_date):
    current_start, _ = month_bounds(current_date)
    previous_end = current_start - timedelta(days=1)
    previous_start = previous_end.replace(day=1)
    return previous_start, current_start


def aligned_previous_period_end(previous_start, current_date):
    elapsed_days = max((current_date - current_date.replace(day=1)).days + 1, 1)
    return previous_start + timedelta(days=elapsed_days)


def calculate_trend(current_value, previous_value):
    current_value = Decimal(str(current_value or 0))
    previous_value = Decimal(str(previous_value or 0))

    if previous_value == 0:
        return 0 if current_value == 0 else None

    return round(float(((current_value - previous_value) / previous_value) * 100), 2)


def format_period_label(period_value, period):
    if not period_value:
        return ""

    if period == "yearly":
        return str(period_value.year)

    if period == "quarterly":
        quarter = ((period_value.month - 1) // 3) + 1
        return f"Q{quarter} {period_value.year}"

    return period_value.strftime("%b %Y")


class DashboardKPIView(GenericAPIView):

    def get(self, request):
        gym_id = get_gym_id(request)
        if not gym_id:
            return APIResponse.error("gym_id missing from token", status=401)

        today = timezone.now().date()
        current_month_start, next_month_start = month_bounds(today)
        previous_month_start, current_month_start_again = previous_month_bounds(today)
        current_period_end = min(today + timedelta(days=1), next_month_start)
        previous_period_end = min(
            aligned_previous_period_end(previous_month_start, today),
            current_month_start_again,
        )

        revenue_queryset = MemberPayment.objects.filter(gym_id=gym_id, is_deleted=False)
        expense_queryset = Expense.objects.filter(gym_id=gym_id, is_deleted=False)
        member_queryset = Member.objects.filter(gym_id=gym_id, is_deleted=False)

        total_revenue = aggregate_total(revenue_queryset)
        total_expense = aggregate_total(expense_queryset)
        total_members = member_queryset.count()

        current_month_revenue = aggregate_total(
            revenue_queryset.filter(
                payment_date__date__gte=current_month_start,
                payment_date__date__lt=current_period_end,
            )
        )
        previous_month_revenue = aggregate_total(
            revenue_queryset.filter(
                payment_date__date__gte=previous_month_start,
                payment_date__date__lt=previous_period_end,
            )
        )

        current_month_expense = aggregate_total(
            expense_queryset.filter(
                expense_date__gte=current_month_start,
                expense_date__lt=current_period_end,
            )
        )
        previous_month_expense = aggregate_total(
            expense_queryset.filter(
                expense_date__gte=previous_month_start,
                expense_date__lt=previous_period_end,
            )
        )

        current_month_member_count = member_queryset.filter(
            created_at__date__gte=current_month_start,
            created_at__date__lt=current_period_end,
        ).count()
        previous_month_member_count = member_queryset.filter(
            created_at__date__gte=previous_month_start,
            created_at__date__lt=previous_period_end,
        ).count()

        today_revenue = aggregate_total(
            revenue_queryset.filter(payment_date__date=today)
        )

        active_members = MemberSubscription.objects.filter(
            gym_id=gym_id,
            status="active",
            is_deleted=False,
        ).count()

        current_month_profit = current_month_revenue - current_month_expense
        previous_month_profit = previous_month_revenue - previous_month_expense

        return APIResponse.success(data={
            "total_revenue": float(total_revenue),
            "monthly_revenue": float(current_month_revenue),
            "today_revenue": float(today_revenue),
            "total_expense": float(total_expense),
            "monthly_expense": float(current_month_expense),
            "net_profit": float(total_revenue - total_expense),
            "monthly_net_profit": float(current_month_profit),
            "total_members": total_members,
            "active_members": active_members,
            "trends": {
                "revenue": calculate_trend(current_month_revenue, previous_month_revenue),
                "expense": calculate_trend(current_month_expense, previous_month_expense),
                "net_profit": calculate_trend(current_month_profit, previous_month_profit),
                "members": calculate_trend(current_month_member_count, previous_month_member_count),
            },
        })


class RevenueExpenseGraphView(GenericAPIView):
    """Grouped revenue + expense for chart."""

    def get(self, request):
        gym_id = get_gym_id(request)
        if not gym_id:
            return APIResponse.error("gym_id missing from token", status=401)

        period = request.query_params.get("period", "monthly")
        trunc_fn = {
            "monthly": TruncMonth,
            "quarterly": TruncQuarter,
            "yearly": TruncYear,
        }.get(period, TruncMonth)

        revenue_qs = (
            MemberPayment.objects
            .filter(gym_id=gym_id, is_deleted=False)
            .annotate(period_value=trunc_fn("payment_date"))
            .values("period_value")
            .annotate(total=Sum("amount"))
            .order_by("period_value")
        )

        expense_qs = (
            Expense.objects
            .filter(gym_id=gym_id, is_deleted=False)
            .annotate(period_value=trunc_fn("expense_date"))
            .values("period_value")
            .annotate(total=Sum("amount"))
            .order_by("period_value")
        )

        revenue_map = {}
        for row in revenue_qs:
            normalized_period = normalize_to_date(row["period_value"])
            revenue_map[normalized_period] = revenue_map.get(normalized_period, 0) + float(row["total"] or 0)

        expense_map = {}
        for row in expense_qs:
            normalized_period = normalize_to_date(row["period_value"])
            expense_map[normalized_period] = expense_map.get(normalized_period, 0) + float(row["total"] or 0)

        all_periods = sorted(
            {normalize_to_date(k) for k in revenue_map.keys()} |
            {normalize_to_date(k) for k in expense_map.keys()}
        )

        chart_data = [
            {
                "month": format_period_label(period_value, period),
                "revenue": revenue_map.get(period_value, 0),
                "expense": expense_map.get(period_value, 0),
            }
            for period_value in all_periods
        ]

        return APIResponse.success(data=chart_data)


class UpcomingRenewalsView(GenericAPIView):
    """Members whose subscription expires within N days."""

    def get(self, request):
        gym_id = get_gym_id(request)
        if not gym_id:
            return APIResponse.error("gym_id missing from token", status=401)

        days = int(request.query_params.get("days", 7))
        today = timezone.now().date()
        until = today + timedelta(days=days)

        subs = (
            MemberSubscription.objects
            .filter(
                gym_id=gym_id,
                status="active",
                is_deleted=False,
                end_date__date__gte=today,
                end_date__date__lte=until,
            )
            .select_related("member__user", "plan")
            .order_by("end_date")
        )

        data = []
        for sub in subs:
            end = sub.end_date.date()
            days_left = (end - today).days
            data.append({
                "member_id": str(sub.member.member_id),
                "name": f"{sub.member.user.first_name} {sub.member.user.last_name}",
                "plan": sub.plan.name,
                "renewal_date": str(end),
                "days_left": days_left,
                "amount": float(sub.plan.price),
                "remaining": float(sub.remaining_amount or 0),
                "status": sub.status,
            })

        return APIResponse.success(data=data)


class UpcomingDuePaymentsView(GenericAPIView):
    """Members with payments due within N days."""

    def get(self, request):
        gym_id = get_gym_id(request)
        if not gym_id:
            return APIResponse.error("gym_id missing from token", status=401)

        days = int(request.query_params.get("days", 7))
        today = timezone.now().date()
        until = today + timedelta(days=days)

        subscriptions = (
            MemberSubscription.objects
            .filter(
                gym_id=gym_id,
                status="active",
                is_deleted=False,
                remaining_amount__gt=0,
                estimated_remaining_payment_date__isnull=False,
                estimated_remaining_payment_date__gte=today,
                estimated_remaining_payment_date__lte=until,
            )
            .select_related("member__user", "plan")
            .order_by("estimated_remaining_payment_date", "end_date")
        )

        data = []
        for subscription in subscriptions:
            due_date = subscription.estimated_remaining_payment_date
            days_left = (due_date - today).days
            data.append({
                "member_id": str(subscription.member.member_id),
                "name": f"{subscription.member.user.first_name} {subscription.member.user.last_name}",
                "plan": subscription.plan.name if subscription.plan else None,
                "due_date": str(due_date),
                "days_left": days_left,
                "amount": float(subscription.remaining_amount or 0),
                "status": "due",
            })

        return APIResponse.success(data=data)
