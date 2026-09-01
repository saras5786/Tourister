-- =======================================================
-- TOURISTER AI — POSTGRESQL DATABASE SCHEMA
-- =======================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_points INTEGER DEFAULT 300,
    wallet_balance NUMERIC(10, 2) DEFAULT 2500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SAVED TRIP PLANS TABLE
CREATE TABLE IF NOT EXISTS saved_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    budget VARCHAR(100),
    transport VARCHAR(100),
    travelers INTEGER DEFAULT 2,
    duration_days INTEGER DEFAULT 3,
    guide_id VARCHAR(100),
    auto_transit_enabled BOOLEAN DEFAULT TRUE,
    selected_places_count INTEGER DEFAULT 0,
    itinerary_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COMMUNITY POSTS & SCAM ALERTS TABLE
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    author_tier VARCHAR(100) DEFAULT 'Active Explorer',
    destination VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    location VARCHAR(255),
    image_url TEXT,
    upvotes INTEGER DEFAULT 1,
    comments_count INTEGER DEFAULT 0,
    ai_verification JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. T-POINTS & REWARDS LEDGER
CREATE TABLE IF NOT EXISTS tpoints_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gem_id VARCHAR(100) NOT NULL,
    gem_name VARCHAR(255) NOT NULL,
    points_earned INTEGER NOT NULL,
    unlocked_perk VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SEED DEFAULT ADMIN / TEST USER (PASSWORD: password123)
INSERT INTO users (username, email, password_hash, user_points, wallet_balance)
VALUES (
    'saraschandra',
    'saraschandra5786@gmail.com',
    'password123',
    300,
    2500.00
)
ON CONFLICT (username) DO UPDATE 
SET user_points = EXCLUDED.user_points, wallet_balance = EXCLUDED.wallet_balance;
