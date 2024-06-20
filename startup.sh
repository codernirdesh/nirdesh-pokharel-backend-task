#!/bin/sh



# Exit immediately if a command exits with a non-zero status
set -e

until nc -z -v -w30 postgres 5432
do
  echo "Waiting for database connection..."
  sleep 1
done

# Wait until redis is ready
until nc -z -v -w30 redis 6379
do
  echo "Waiting for redis connection..."
  sleep 1
done

# Wait until redis-insight is ready
until nc -z -v -w30 redis-insight 5540
do
  echo "Waiting for redis-insight connection..."
  sleep 1
done

# wait 

npx prisma migrate deploy
npm run build
npm run start