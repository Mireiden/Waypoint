# Waypoint

A web application for discovering and sharing places on a map — users add points of interest and routes, rate and review them, attach photos, and save favorites. It also includes an admin area for moderating content and user reports.

Software Engineering course project.

## Tech stack

**Backend**

- Node.js + Express 5 (TypeScript, ESM)
- Prisma 7 + PostgreSQL with PostGIS (destination geometry, GiST index)
- JWT auth (via HTTP-only cookie), bcrypt
- Cloudinary (image/video storage), Multer (uploads)
- Zod (request and `.env` validation)
- Nominatim (OpenStreetMap) for reverse geocoding

**Frontend**

- Angular 21
- Leaflet + Leaflet-Geoman (interactive map and geometry drawing)
- SCSS

## Repository structure

```
.
├── Aplikacija/
│   ├── server/        # Express + Prisma API
│   └── client/        # Angular app
└── Dokumentacija/     # Project documentation (vision, requirements, architecture, testing, user guide)
```

## Getting started

### Prerequisites

- Node.js
- PostgreSQL with the **PostGIS** extension
- A Cloudinary account

### Backend

```bash
cd Aplikacija/server
npm install
# create .env (see table below)
npx prisma migrate deploy   # or: npx prisma migrate dev
npm run build               # generates Prisma client + typedSql and compiles TS
npm run dev                 # dev server (tsx --watch) at http://localhost:3000
```

Optionally seed the database with sample data:

```bash
npx prisma db seed
```

The API is served under the `/api` prefix.

#### Environment variables (`server/.env`)

| Variable                           | Required | Default                                       |
| ---------------------------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`                     | yes      | —                                             |
| `DIRECT_URL`                       | yes      | —                                             |
| `FRONTEND_URL`                     | yes      | —                                             |
| `JWT_SECRET`                       | yes      | — (min. 32 characters)                        |
| `CLOUDINARY_CLOUD_NAME`            | yes      | —                                             |
| `CLOUDINARY_API_KEY`               | yes      | —                                             |
| `CLOUDINARY_API_SECRET`            | yes      | —                                             |
| `CLOUDINARY_URL`                   | yes      | —                                             |
| `JWT_ALGO`                         | no       | `HS256`                                       |
| `JWT_EXPIRES_IN`                   | no       | `7d`                                          |
| `NOMINATIM_URL`                    | no       | `https://nominatim.openstreetmap.org/reverse` |
| `NODE_ENV`                         | no       | `development`                                 |
| `PORT`                             | no       | `3000`                                        |
| `UPLOAD_MAX_FILES`                 | no       | `10`                                          |
| `UPLOAD_MAX_FILE_SIZE_MB`          | no       | `10`                                          |
| `UPLOAD_MAX_MEDIA_PER_DESTINATION` | no       | `10`                                          |
| `UPLOAD_MAX_MEDIA_PER_REVIEW`      | no       | `10`                                          |
| `SEED_RESET`                       | no       | — (value `"true"` wipes existing data)        |

### Frontend

```bash
cd Aplikacija/client
npm install
npm start                   # ng serve at http://localhost:4200
```

## Useful scripts

**Server:** `npm run dev`, `npm run build`, `npm start`, `npm run lint`, `npm run format`, `npm run type-check`
**Client:** `npm start`, `npm run build`, `npm run watch`, `npm test`
