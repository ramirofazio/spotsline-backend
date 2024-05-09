#!/bin/sh

# Ejecuta las migraciones de Prisma
npx prisma migrate deploy

# Inicia tu aplicación
npm run build
npm run start:dev
