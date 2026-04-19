import logging


from rest_framework.response import Response


from common.constants.enums import ResponseStatus

logger = logging.getLogger(__name__)


class APIResponse(Response):

    def __init__(self, status_type=ResponseStatus.SUCCESS.value, message="", data=None, errors=None, status=200):

        response_data = {
            "status": status_type,   # success | error | warning | info
            "message": message,
            "data": data,
            "errors": errors,
        }

        # 🔥 central logging
        if status_type == ResponseStatus.ERROR:
            logger.error(response_data)
        elif status_type == ResponseStatus.WARNING:
            logger.warning(response_data)
        elif status_type == ResponseStatus.INFO:
            logger.info(response_data)
        else:
            logger.info(response_data)

        super().__init__(response_data, status=status)


    @staticmethod
    def success(message="", data=None):
        return APIResponse(ResponseStatus.SUCCESS.value, message, data, None, 200)

    @staticmethod
    def error(message="", errors=None, status=400):
        return APIResponse(ResponseStatus.ERROR.value, message, None, errors, status)

    @staticmethod
    def warning(message="", data=None):
        return APIResponse(ResponseStatus.WARNING.value, message, data, None, 200)

    @staticmethod
    def info(message="", data=None):
        return APIResponse(ResponseStatus.INFO.value, message, data, None, 200)