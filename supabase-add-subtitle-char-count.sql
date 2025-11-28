-- 기존 테이블에 subtitle_char_count 컬럼 추가
-- 이미 테이블이 생성되어 있는 경우 이 스크립트를 실행하세요

ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS subtitle_char_count TEXT DEFAULT '1000';



