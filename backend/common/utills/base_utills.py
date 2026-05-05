def normalize_to_date(d):
    return d.date() if hasattr(d, "date") else d