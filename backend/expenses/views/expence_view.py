from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import status
from expenses.models import Expense
from expenses.serializers.expense_serializer import ExpenseSerializer
from common.responses.api_response import APIResponse
from common.utills.subscription_guard import ensure_gym_write_access


class CreateExpenseView(APIView):

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        user = getattr(request, "user_claims", None)
        if not user:
            return APIResponse.error(
                message=getattr(request, "auth_error", None) or "Authentication required",
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = ExpenseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(gym_id=user.get("gym_id"))

            return APIResponse.success(
                message="Expense created",
                data=serializer.data
            )

        return APIResponse.error(message=serializer.errors)



class ExpenseListView(ListAPIView):
    serializer_class = ExpenseSerializer

    def list(self, request, *args, **kwargs):
        user = getattr(request, "user_claims", None)
        if not user:
            return APIResponse.error(
                message=getattr(request, "auth_error", None) or "Authentication required",
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user = getattr(self.request, "user_claims", None)
        if not user:
            return Expense.objects.none()
        return Expense.objects.filter(
            gym_id=user.get("gym_id"),
            is_deleted=False,
        ).order_by("-created_at")


class UpdateExpenseView(APIView):

    def put(self, request, pk):
        try:
            access_error = ensure_gym_write_access(request)
            if access_error:
                return access_error

            user = getattr(request, "user_claims", None)
            if not user:
                return APIResponse.error(
                    message=getattr(request, "auth_error", None) or "Authentication required",
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            expense = Expense.objects.get(id=pk, gym_id=user.get("gym_id"), is_deleted=False)

            serializer = ExpenseSerializer(expense, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return APIResponse.success(message="Updated", data=serializer.data)

            return APIResponse.error(message=serializer.errors)

        except Expense.DoesNotExist:
            return APIResponse.error(message="Expense not found", status=status.HTTP_404_NOT_FOUND)


class DeleteExpenseView(APIView):

    def delete(self, request, pk):
        try:
            access_error = ensure_gym_write_access(request)
            if access_error:
                return access_error

            user = getattr(request, "user_claims", None)
            if not user:
                return APIResponse.error(
                    message=getattr(request, "auth_error", None) or "Authentication required",
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            expense = Expense.objects.get(id=pk, gym_id=user.get("gym_id"), is_deleted=False)
            expense.is_active = False
            expense.is_deleted = True
            expense.save(update_fields=["is_active", "is_deleted", "updated_at"])

            return APIResponse.success(message="Deleted")

        except Expense.DoesNotExist:
            return APIResponse.error(message="Not found", status=status.HTTP_404_NOT_FOUND)
