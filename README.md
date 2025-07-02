# JFT Sales Dashboard

A comprehensive sales performance tracking dashboard with three specialized views for different roles in the organization.

## Features

- **Sales Director Dashboard**: High-level performance metrics and strategic insights
- **Sales Manager Dashboard**: Team performance tracking and operational metrics  
- **Sales Trader Dashboard**: Individual performance and transaction-level analytics
- **Excel Data Upload**: Regular data uploads for real-time dashboard updates
- **Advanced Filtering**: Filter by year, month, representative, supplier, customer, and product
- **Data Visualization**: Interactive charts and performance indicators

## Architecture

- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: Supabase for data storage and management
- **Deployment**: Vercel for frontend, backend API integration

## Quick Start

### Frontend Development
```bash
cd jft-frontend
npm install
npm run dev
```

### Backend Development
```bash
cd jft-backend
poetry install
poetry run uvicorn app.main:app --reload
```

## Environment Configuration

The application uses Supabase for data storage. Configure the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://uaozpzqpqjpmgkzrjtkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhb3pwenFwcWpwbWdrenJqdGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU3MzcsImV4cCI6MjA2NjI4MTczN30.vmBRWsuTbu3c4s2ylUMz8h0ekE0-gI5dz6vbV0fEgeA
```

## Data Upload

Upload Excel files containing sales data through the web interface. The system supports:
- Historical data (12+ months)
- Regular updates (multiple times per week)
- Automatic data processing and dashboard updates

## Dashboard Views

1. **Sales Director**: Strategic overview with year-over-year comparisons
2. **Sales Manager**: Team performance and operational insights
3. **Sales Trader**: Individual metrics and transaction details

Each dashboard includes comprehensive filtering options and real-time data visualization.
