from rest_framework import serializers
from gyms.models import Gym
from common.models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "address_line_1", "address_line_2", "city", "state", "country", "pincode", "landmark"
        ]

class GymCreateSerializer(serializers.ModelSerializer):
    # address = AddressSerializer()

    class Meta:
        model = Gym
        fields = ["name", "email", "phone"]

    # def create(self, validated_data):
    #     address_data = validated_data.pop("address")
    #     address = Address.objects.create(**address_data)
    #     gym = Gym.objects.create(address=address, **validated_data)
    #     return gym

class GymListSerializer(serializers.ModelSerializer):
    address = AddressSerializer()
    class Meta:
        model = Gym
        fields = ["gym_id", "name", "email", "phone", "address", "onboarding_step"]