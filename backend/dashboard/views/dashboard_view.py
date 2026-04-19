from datetime import timedelta

from django.db.models import Sum
from rest_framework.generics import GenericAPIView
from django.db.models import Sum, Count
from django.utils import timezone

from members.models import MemberPayment, Member, MemberSubscription
from staff.models import StaffPayment
from common.responses.api_response import APIResponse


class DashboardView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        revenue = MemberPayment.objects.filter(
            gym_id=gym_id
        ).aggregate(total=Sum("amount"))["total"] or 0

        expense = StaffPayment.objects.filter(
            gym_id=gym_id
        ).aggregate(total=Sum("amount"))["total"] or 0

        profit = revenue - expense

        return APIResponse.success(
            data={
                "total_revenue": revenue,
                "total_expense": expense,
                "net_profit": profit
            }
        )


class RevenueTrendView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        data = (
            MemberPayment.objects
            .filter(gym_id=gym_id)
            .extra(select={"day": "date(payment_date)"})
            .values("day")
            .annotate(total=Sum("amount"))
            .order_by("day")
        )

        labels = [str(d["day"]) for d in data]
        revenue = [d["total"] for d in data]

        return APIResponse.success({
            "labels": labels,
            "revenue": revenue
        })


class ExpenseTrendView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        data = (
            StaffPayment.objects
            .filter(gym_id=gym_id)
            .extra(select={"day": "date(payment_date)"})
            .values("day")
            .annotate(total=Sum("amount"))
            .order_by("day")
        )

        return APIResponse.success({
            "labels": [str(d["day"]) for d in data],
            "expense": [d["total"] for d in data]
        })


class RevenueExpenseGraphView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        # revenue
        revenue_data = (
            MemberPayment.objects
            .filter(gym_id=gym_id)
            .extra(select={"day": "date(payment_date)"})
            .values("day")
            .annotate(total=Sum("amount"))
        )

        # expense
        expense_data = (
            StaffPayment.objects
            .filter(gym_id=gym_id)
            .extra(select={"day": "date(payment_date)"})
            .values("day")
            .annotate(total=Sum("amount"))
        )

        return APIResponse.success({
            "revenue": list(revenue_data),
            "expense": list(expense_data)
        })




class DashboardKPIView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        today = timezone.now().date()
        month_start = today.replace(day=1)

        # revenue
        total_revenue = MemberPayment.objects.filter(
            gym_id=gym_id
        ).aggregate(total=Sum("amount"))["total"] or 0

        monthly_revenue = MemberPayment.objects.filter(
            gym_id=gym_id,
            payment_date__date__gte=month_start
        ).aggregate(total=Sum("amount"))["total"] or 0

        today_revenue = MemberPayment.objects.filter(
            gym_id=gym_id,
            payment_date__date=today
        ).aggregate(total=Sum("amount"))["total"] or 0

        # expense
        total_expense = StaffPayment.objects.filter(
            gym_id=gym_id
        ).aggregate(total=Sum("amount"))["total"] or 0

        # members
        total_members = Member.objects.filter(gym_id=gym_id).count()

        active_members = MemberSubscription.objects.filter(
            gym_id=gym_id,
            is_active=True
        ).count()

        return APIResponse.success({
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "today_revenue": today_revenue,
            "total_expense": total_expense,
            "net_profit": total_revenue - total_expense,
            "total_members": total_members,
            "active_members": active_members
        })

class ExpiringMembersView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        from datetime import timedelta
        from django.utils import timezone

        upcoming = timezone.now() + timedelta(days=3)

        members = MemberSubscription.objects.filter(
            gym_id=gym_id,
            end_date__lte=upcoming,
            is_active=True
        )

        data = [
            {
                "member_name": f"{m.member.user.first_name}",
                "expiry_date": m.end_date
            }
            for m in members
        ]

        return APIResponse.success(data=data)

class RevenueAlertView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        from django.utils import timezone
        from datetime import timedelta

        last_7_days = timezone.now() - timedelta(days=7)
        prev_7_days = timezone.now() - timedelta(days=14)

        recent = MemberPayment.objects.filter(
            gym_id=gym_id,
            payment_date__gte=last_7_days
        ).aggregate(total=Sum("amount"))["total"] or 0

        previous = MemberPayment.objects.filter(
            gym_id=gym_id,
            payment_date__range=[prev_7_days, last_7_days]
        ).aggregate(total=Sum("amount"))["total"] or 0

        alert = recent < previous

        return APIResponse.success({
            "alert": alert,
            "message": "Revenue dropped" if alert else "Stable revenue"
        })


class FullDashboardView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        # reuse logic (short version)
        revenue = MemberPayment.objects.filter(
            gym_id=gym_id
        ).aggregate(total=Sum("amount"))["total"] or 0

        expense = StaffPayment.objects.filter(
            gym_id=gym_id
        ).aggregate(total=Sum("amount"))["total"] or 0

        return APIResponse.success({
            "summary": {
                "revenue": revenue,
                "expense": expense,
                "profit": revenue - expense
            },
            "message": "Dashboard loaded"
        })