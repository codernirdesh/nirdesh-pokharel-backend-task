#!/bin/sh
cp .env.example ./prisma/.env
npx prisma migrate deploy
npm run build
npm run start