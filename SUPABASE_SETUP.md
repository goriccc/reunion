# Supabase 설정 가이드

## 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에 로그인
2. "reunion" 프로젝트 선택 또는 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - API Key (anon/public key)

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

예시:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

```

## 3. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 "SQL Editor" 메뉴로 이동
2. `supabase-setup.sql` 파일의 내용을 복사하여 실행
3. 또는 다음 SQL을 직접 실행:

```sql
CREATE TABLE IF NOT EXISTS prompts (
  id BIGSERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL UNIQUE,
  system_prompt TEXT DEFAULT '',
  worldview TEXT DEFAULT '',
  personality_prompt TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_product_id ON prompts(product_id);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON prompts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access" ON prompts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access" ON prompts
  FOR UPDATE
  USING (true);
```

## 4. 개발 서버 재시작

환경 변수를 추가한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

## 5. 테스트

1. 관리 페이지(`/admin`)로 이동
2. 상품을 선택하고 프롬프트를 입력
3. "저장" 버튼 클릭
4. Supabase 대시보드의 "Table Editor"에서 `prompts` 테이블에 데이터가 저장되었는지 확인

## 문제 해결

### 환경 변수가 인식되지 않는 경우
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버를 재시작했는지 확인
- 변수명이 `NEXT_PUBLIC_`로 시작하는지 확인

### Supabase 연결 오류
- Supabase URL과 API Key가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인


