from rest_framework.pagination import PageNumberPagination
from common.responses.api_response import APIResponse


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        return APIResponse.success(
            message=f"{self.request.parser_context['view'].__class__.__name__} fetched",
            data={
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data
            }
        )