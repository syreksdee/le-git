# Deploying Lé Git to Vercel with Free Cloud MySQL (TiDB Cloud / Aiven)

## 1. Local Setup
1. Initialize Next.js 15 + Prisma:
   ```bash
   npx create-next-app@latest le-git --typescript --tailwind --eslint --app --src-dir
   cd le-git
   npm install @prisma/client
   npm install -D prisma ts-node
   ```

## Updating the database schema

After adding or changing Prisma models, apply the schema to the configured MySQL
database before deploying:

```bash
npx prisma db push
```