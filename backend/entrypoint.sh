#!/bin/sh

echo "Waiting for PostgreSQL..."

# while ! nc -z db 5432; do
#   sleep 1
# done

# echo "PostgreSQL started"

# 🔥 now run migrations
python manage.py migrate

python manage.py collectstatic --noinput

# start server
exec python manage.py runserver 0.0.0.0:8000
exec python manage.py runserver 0.0.0.0:10000