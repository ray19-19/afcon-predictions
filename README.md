# AFCON 2025 Football Prediction App

A full-stack web application for predicting AFCON 2025 match scores and competing with friends.

## Features

-🔐 **Authentication**: Secure user registration and login with JWT
- ⚽ **Match Predictions**: Submit predictions before kickoff, locked after match starts
- 🏆 **Leaderboard**: Global ranking based on prediction accuracy
- 📊 **Scoring System**: 5/3/1/0 points for exact/close/correct winner/wrong predictions
- 👨‍💼 **Admin Panel**: Manually create matches and enter final scores
- 📱 **Responsive Design**: Mobile-first, works on all devices

## Tech Stack

- **Frontend**: Next.js 15 with React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Vercel Postgres (PostgreSQL)
- **Authentication**: JWT with HTTP-only cookies, bcrypt password hashing
- **Hosting**: Vercel (free tier)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Vercel account (free)
- Database (Vercel Postgres recommended)

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=7d
ADMIN_API_KEY=your_admin_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize the database:
   - First time only: Visit `http://localhost:3000/api/init` to create tables

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Creating First Admin User

You'll need to create an admin user manually in the database:

```sql
-- Register a normal user first via the app, then update:
UPDATE users SET is_admin = true WHERE username = 'your_username';
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub

2. Import project in Vercel dashboard

3. Add environment variables in Vercel project settings

4. Deploy!

5. After deployment, visit `/api/init` once to initialize database tables

## Usage

### For Users

1. **Register**: Create account with username and password
2. **View Matches**: See all upcoming AFCON matches
3. **Make Predictions**: Submit your score predictions before kickoff
4. **Check Leaderboard**: See how you rank against friends

### For Admins

1. **Create Matches**: Add matches manually via admin panel
   - Enter home team, away team, date, time, venue
2. **Enter Scores**: After matches finish, submit final scores
   - Points are automatically calculated for all predictions

## Scoring System

- **5 points**: Exact score match (e.g., predicted 2-1, actual 2-1)
- **3 points**: Correct winner + correct goal difference (e.g., predicted 3-1, actual 2-0)
- **1 point**: Correct winner only (e.g., predicted 2-1, actual 3-0)
- **0 points**: Wrong prediction

## Project Structure

```
├── app/
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── matches/       # Match CRUD & scoring
│   │   ├── predictions/   # Prediction submission
│   │   └── leaderboard/   # Rankings
│   ├── admin/             # Admin pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── leaderboard/       # Leaderboard page
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   ├── db.ts             # Database client
│   ├── auth.ts           # Authentication utilities
│   └── scoring.ts        # Points calculation
└── types/                # TypeScript type definitions
```

## Database Schema

### Users
- id, username (unique), password_hash, is_admin, created_at

### Matches
- id, home_team, away_team, competition, venue, match_date, kickoff_time, home_score, away_score, status

### Predictions
- id, user_id, match_id, predicted_home_score, predicted_away_score, points

## Contributing

This is a private project for friends. Feel free to fork and customize for your own use!

## License

MIT

---

**Enjoy predicting AFCON 2025 matches!** ⚽🏆
