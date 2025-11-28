-- Supabase 테이블 생성 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- prompts 테이블 생성
CREATE TABLE IF NOT EXISTS prompts (
  id BIGSERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL UNIQUE,
  system_prompt TEXT DEFAULT '',
  worldview TEXT DEFAULT '',
  personality_prompt TEXT DEFAULT '',
  menu_subtitle_dev TEXT DEFAULT '',
  menu_subtitle TEXT DEFAULT '',
  subtitle_char_count TEXT DEFAULT '1000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_prompts_product_id ON prompts(product_id);

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- 모든 사용자가 읽기/쓰기 가능하도록 설정
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access" ON prompts
  FOR SELECT
  USING (true);

-- 모든 사용자가 쓰기 가능 (실제 운영 시에는 인증된 사용자만 허용하도록 변경)
CREATE POLICY "Allow public insert access" ON prompts
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 업데이트 가능
CREATE POLICY "Allow public update access" ON prompts
  FOR UPDATE
  USING (true);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

