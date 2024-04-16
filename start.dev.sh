#!/bin/sh
# Ejecuta los scripts de Prisma
npx prisma db pull
npx prisma generate
# Inicia la aplicación
npm run start:dev
