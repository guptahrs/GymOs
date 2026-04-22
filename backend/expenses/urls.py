from django.urls import path
from expenses.views.expence_view import ExpenseListView, CreateExpenseView, UpdateExpenseView, DeleteExpenseView

urlpatterns = [
    path("", ExpenseListView.as_view()),
    path("create/", CreateExpenseView.as_view()),
    path("<int:pk>/update/", UpdateExpenseView.as_view()),
    path("<int:pk>/delete/", DeleteExpenseView.as_view()),
]