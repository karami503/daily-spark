# Daily Spark

Google 로그인 후 일상 미션을 받고 완료 기록을 남기는 웹앱.

- 최초 미션은 무료. 랜덤 뽑기와 Gemini 생성은 계정당 하루 합산 3회.
- 한국 시간 자정에 횟수와 완료 상태만 초기화. 새로고침·재로그인해도 미션 유지.
- Gemini 실패 시 기존 미션·횟수 유지. API 키는 현재 탭의 sessionStorage에만 저장, 로그아웃 시 삭제.
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
6. `main`에 push하면 GitHub Actions가 테스트·빌드 후 Pages 배포.

Gemini는 사용자 본인의 키로 직접 Google에 요청합니다. 무료 사용량은 모델과 프로젝트 설정에 따라 달라집니다. Google 로그인 설정과 유효한 Gemini 키를 연결하기 전에는 실제 서비스 호출 완료로 간주하지 않습니다.
