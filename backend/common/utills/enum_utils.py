from enum import Enum


class BaseEnum(str, Enum):

    @classmethod
    def choices(cls):
        return [
            (item.value, item.name.replace("_", " ").title())
            for item in cls
        ]

    @classmethod
    def values(cls):
        return [item.value for item in cls]

    @classmethod
    def labels(cls):
        return [item.name for item in cls]