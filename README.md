# Daily Spark

Google 로그인 후 일상 미션을 받고 완료 기록을 남기는 웹앱.

- 최초 미션은 무료. 랜덤 뽑기와 Gemini 생성은 계정당 하루 합산 3회.
- 한국 시간 자정에 횟수와 완료 상태만 초기화. 새로고침·재로그인해도 미션 유지.
- 사용자는 API 키를 입력하지 않습니다. 모든 AI 요청은 서버 주인 김가람의 Gemini API 키로 처리합니다.
- API 키는 Edge Function의 비밀 환경 변수에만 저장합니다. 브라우저·GitHub에 전달하지 않습니다.
- AI 요청은 Gemini 호출 전에 1회를 예약·차감합니다. 실패해도 현재 미션은 유지되지만 횟수는 사용됩니다.
- 계정 데이터와 횟수는 Supabase PostgreSQL 함수에서 인증·행 잠금으로 처리. 직접 수정 금지 RLS.

## 실행

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

## 서비스 연결

1. Supabase Free 프로젝트에서 `supabase/migrations/202610160001_daily_spark.sql`을 적용.
2. `config.js`에 프로젝트 URL과 공개 publishable/anon 키를 입력. **service_role 키·Gemini 키는 커밋 금지.**
3. Supabase Auth의 Site URL과 Redirect URL에 `https://karami503.github.io/daily-spark/` 등록.
4. Google Cloud의 기존 프로젝트에서 Web OAuth 클라이언트 생성. 원본은 `https://karami503.github.io`, 리디렉션은 `https://<프로젝트 ref>.supabase.co/auth/v1/callback`.
5. Google Client ID/Secret은 Supabase Google provider에만 등록. 기본 openid/email/profile 범위 사용. 일반 사용자 로그인 허용 시 OAuth Audience 게시 상태도 확인.
6. Supabase Edge Function Secrets에서 `GEMINI_API_KEY`에 운영자 키를 직접 입력. 키를 채팅·코드에 붙여넣지 않습니다.
7. `npx supabase functions deploy generate-mission --project-ref <프로젝트 ref>`로 AI 서버 배포. 함수는 Supabase Auth에서 로그인 토큰을 검증하고 service_role 권한으로 계정당 하루 3회 예산을 선차감합니다.
8. `main`에 push하면 GitHub Actions가 테스트·빌드 후 Pages 배포.

사용자는 공통 서버 주소로 요청하며 서버에서만 Gemini를 호출합니다. 무료 사용량은 모델과 프로젝트 설정에 따라 달라집니다. Google 로그인 설정과 유효한 Gemini 키를 연결하기 전에는 실제 서비스 호출 완료로 간주하지 않습니다.
