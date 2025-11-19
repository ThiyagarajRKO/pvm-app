# PVM Pawn Shop Management Tool

A complete pawn shop management system built with Next.js, TypeScript, and PostgreSQL. Manage pawn records with image uploads, track gold/silver items, and generate reports.

## Features

- **Record Management**: Create, view, edit, and delete pawn records
- **Image Uploads**: Upload person and item images with S3 storage
- **Search & Filter**: Search by name, mobile, place with item type filtering
- **Dashboard**: Overview of total records, amounts, weights, and recent activity
- **CSV Export**: Export records to CSV for reporting
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Sequelize ORM
- **Storage**: AWS S3 for image uploads
- **Validation**: Zod schemas with react-hook-form
- **UI Components**: Radix UI primitives

## Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for image storage)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=pvm_db
DB_SCHEMA=pvm
DB_SSL=false

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_ENDPOINT=https://your-s3-endpoint.com
S3_BUCKET=your-bucket-name
S3_PRESIGN_EXPIRE=3600
S3_MAX_FILE_SIZE=5242880
S3_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# JWT (for future authentication)
JWT_SECRET=your_jwt_secret
```

## Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd pvm-app
   npm install
   ```

2. **Set up the database:**

   ```bash
   # Create PostgreSQL database and schema
   createdb pvm_db
   psql -d pvm_db -c "CREATE SCHEMA IF NOT EXISTS pvm;"

   # Sync database schema
   npm run db:sync
   ```

3. **Seed sample data (optional):**

   ```bash
   npm run db:seed
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Database Schema

The `records` table includes:

- `id`: Primary key (UUID)
- `date`: Date of pawn transaction
- `name`: Customer full name
- `fatherName`: Father's name
- `street`: Street address
- `place`: City/place
- `weightGrams`: Item weight in grams
- `itemType`: 'Gold' or 'Silver'
- `amount`: Pawn amount in rupees
- `mobile`: 10-digit mobile number
- `personImageUrl`: S3 URL for person photo
- `itemImageUrl`: S3 URL for item photo
- `createdAt`/`updatedAt`: Timestamps

## API Endpoints

- `GET /api/records` - List records with pagination/filtering
- `POST /api/records` - Create new record
- `GET /api/records/[id]` - Get single record
- `PUT /api/records/[id]` - Update record
- `DELETE /api/records/[id]` - Delete record
- `GET /api/records/stats` - Get aggregate statistics
- `POST /api/s3/presign` - Get presigned URL for S3 upload

## Project Structure

```
pvm-app/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── dashboard/     # Dashboard page
│   │   └── records/       # Records pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── RecordForm.tsx    # Record form component
│   └── RecordTable.tsx   # Records table component
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connection
│   ├── models/          # Sequelize models
│   ├── s3.ts            # S3 utilities
│   ├── validators/      # Zod schemas
│   └── client-s3.ts     # Client-side S3 helpers
├── scripts/             # Database scripts
└── public/              # Static assets
```

## Development

- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Testing**: `npm test`
- **Build**: `npm run build`

## Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
