#!/bin/sh
cp .env.example ./.env
npx prisma migrate deploy
npm run build
npm run start