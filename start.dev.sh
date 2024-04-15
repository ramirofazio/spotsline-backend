#!/bin/sh
# Ejecuta las migraciones de Prisma
npx prisma db pull
npx prisma generate

# Inicia tu aplicación
npm run start:dev
