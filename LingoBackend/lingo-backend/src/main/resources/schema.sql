-- ==========================================
-- RESET: Xóa toàn bộ schema cũ trước khi tạo lại
-- ==========================================
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS study_logs CASCADE;
DROP TABLE IF EXISTS playlist_videos CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS video_history CASCADE;
DROP TABLE IF EXISTS subtitles CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- ==========================================
-- TRIGGER FUNCTION: Tự động cập nhật updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. Bảng users
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    xp_points INT DEFAULT 0,
    streak_count INT DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- 2. Bảng achievements
-- ==========================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    requirement_type VARCHAR(50),
    requirement_value INT
);

-- ==========================================
-- 3. Bảng videos
-- ==========================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    youtube_id VARCHAR(20) NOT NULL,
    title TEXT,
    thumbnail_url TEXT,
    duration_seconds INT,
    original_language VARCHAR(10),
    target_language VARCHAR(10),
    script_url TEXT,
    status VARCHAR(50) CHECK (status IN ('PENDING', 'PROCESSING', 'READY', 'FAILED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);

-- ==========================================
-- 4. Bảng subtitles
-- ==========================================
CREATE TABLE subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    start_time FLOAT,
    original_text TEXT,
    translated_text TEXT,
    sequence_order INT
);

CREATE INDEX idx_subtitles_video_id ON subtitles(video_id);

-- ==========================================
-- 5. Bảng video_history
-- ==========================================
CREATE TABLE video_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_position_seconds INT DEFAULT 0,
    watch_count INT DEFAULT 1,
    CONSTRAINT uq_video_history UNIQUE (user_id, video_id)
);

-- ==========================================
-- 6. Bảng vocabulary
-- ==========================================
CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subtitle_id UUID REFERENCES subtitles(id) ON DELETE SET NULL,  -- SET NULL để không mất vocab khi xóa subtitle
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    phonetic VARCHAR(255),
    definition TEXT,
    part_of_speech VARCHAR(50),
    source_language VARCHAR(10),
    target_language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);

-- ==========================================
-- 7. Bảng decks
-- ==========================================
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. Bảng flashcards
-- ==========================================
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('NEW', 'LEARNING', 'REVIEW')) DEFAULT 'NEW',
    next_review_date DATE,
    interval_days INT DEFAULT 0,
    ease_factor FLOAT DEFAULT 2.5,
    repetitions INT DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review_date);

-- ==========================================
-- 9. Bảng playlists
-- ==========================================
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 10. Bảng playlist_videos (N-N)
-- ==========================================
CREATE TABLE playlist_videos (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    position INT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (playlist_id, video_id)
);

-- ==========================================
-- 11. Bảng study_logs
-- ==========================================
CREATE TABLE study_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    words_learned INT DEFAULT 0,
    words_reviewed INT DEFAULT 0,
    videos_watched INT DEFAULT 0,
    study_minutes INT DEFAULT 0,
    CONSTRAINT uq_study_logs UNIQUE (user_id, date)
);

-- ==========================================
-- 12. Bảng user_achievements (N-N)
-- ==========================================
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);