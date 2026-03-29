-- 床前 App Supabase 数据库迁移
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 用户档案表（与 Supabase Auth 关联）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE,
  nickname TEXT,
  -- 用户画像
  gender TEXT,
  age_range TEXT,
  relationship TEXT,
  occupation TEXT,
  stress_level INTEGER,
  mental_state TEXT,
  seeking_help BOOLEAN DEFAULT FALSE,
  concerns TEXT[], -- 数组
  -- 设置
  sleep_start_hour INTEGER DEFAULT 22,
  sleep_end_hour INTEGER DEFAULT 6,
  all_day_mode BOOLEAN DEFAULT FALSE,
  -- 会员
  is_deepsleep BOOLEAN DEFAULT FALSE,
  deepsleep_expires_at TIMESTAMPTZ,
  -- 时间
  profile_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 心情记录表
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood INTEGER NOT NULL, -- 1-5
  emotion TEXT,
  highlight TEXT,
  annotation TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 担忧记录表
CREATE TABLE IF NOT EXISTS worries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  ai_response TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  never_happened BOOLEAN DEFAULT FALSE,
  remind_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 灵感记录表
CREATE TABLE IF NOT EXISTS inspirations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 思绪记录表
CREATE TABLE IF NOT EXISTS thoughts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 睡眠日记表
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  bedtime TIMESTAMPTZ,
  sleep_onset_minutes INTEGER,
  wake_time TIMESTAMPTZ,
  worry_count INTEGER DEFAULT 0,
  guidance_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 情绪卡片表
CREATE TABLE IF NOT EXISTS emotion_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emotion TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 睡眠仪式表
CREATE TABLE IF NOT EXISTS sleep_rituals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]', -- RitualStep[]
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 索引
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_worries_user ON worries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_emotion_cards_user ON emotion_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_rituals_user ON sleep_rituals(user_id);

-- 10. RLS (Row Level Security) 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE worries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_rituals ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own mood entries" ON mood_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own worries" ON worries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own inspirations" ON inspirations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own thoughts" ON thoughts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sleep logs" ON sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own emotion cards" ON emotion_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sleep rituals" ON sleep_rituals FOR ALL USING (auth.uid() = user_id);

-- 11. 自动创建用户档案的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
