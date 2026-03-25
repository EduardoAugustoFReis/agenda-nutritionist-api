#!/bin/sh

echo "⏳ Waiting for database..."

while ! nc -z postgres 5432; do
  sleep 1
done

echo "✅ Database is up!"

node dist/src/main.js