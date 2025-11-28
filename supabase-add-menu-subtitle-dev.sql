-- 기존 테이블에 menu_subtitle_dev 컬럼 추가
-- 이미 테이블이 생성되어 있는 경우 이 스크립트를 실행하세요

ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS menu_subtitle_dev TEXT DEFAULT '';



