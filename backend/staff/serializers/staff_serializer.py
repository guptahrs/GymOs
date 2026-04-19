from rest_framework import serializers


class StaffCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    password = serializers.CharField()

    gym_id = serializers.UUIDField()
    role = serializers.CharField()