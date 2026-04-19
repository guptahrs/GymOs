from common.models import Address


def create_address(data):
    return Address.objects.create(
        address_line_1=data.get("address_line_1"),
        address_line_2=data.get("address_line_2"),
        city=data.get("city"),
        state=data.get("state"),
        country=data.get("country"),
        pincode=data.get("pincode"),
        landmark=data.get("landmark"),
    )