from rest_framework import serializers
from staff.models import Staff


class StaffCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True)
    gym_id = serializers.UUIDField(required=False)
    role = serializers.CharField(required=False, allow_blank=True)
    salary = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)


class StaffSerializer(serializers.ModelSerializer):
    staff_id = serializers.IntegerField(source="id", read_only=True)
    name = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            "staff_id",
            "name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
            "salary",
            "joining_date",
            "is_active",
            "created_at",
        ]

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_email(self, obj):
        return obj.user.email

    def get_phone(self, obj):
        return obj.user.phone
