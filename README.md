# Daily Spark

로그인 없이 바로 일상 미션을 받고 완료 기록을 남기는 웹앱. 브라우저에 Supabase 익명 세션을 저장합니다.

- 최초 미션은 무료. 랜덤 뽑기와 Gemini 생성은 익명 사용자당 하루 합산 3회.
- 한국 시간 자정에 횟수와 완료 상태만 초기화. 새로고침·다시 방문해도 미션 유지.
- 사용자는 API 키를 입력하지 않습니다. 모든 AI 요청은 서버 주인 김가람의 Gemini API 키로 처리합니다.
- API 키는 Edge Function의 비밀 환경 변수에만 저장합니다. 브라우저·GitHub에 전달하지 않습니다.
- AI 요청은 Gemini 호출 전에 1회를 예약·차감합니다. 실패해도 현재 미션은 유지되지만 횟수는 사용됩니다.
- 브라우저 데이터 삭제·시크릿 창·다른 기기는 새 익명 사용자로 취급돼 횟수가 별도로 계산됩니다.
- 사용자 데이터와 횟수는 Supabase PostgreSQL 함수에서 인증·행 잠금으로 처리. 직접 수정 금지 RLS.

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
4. Supabase Auth에서 익명 로그인을 활성화 (`supabase config push --project-ref <프로젝트 ref>`).
5. Supabase Edge Function Secrets에서 `GEMINI_API_KEY`에 운영자 키를 직접 입력. 키를 채팅·코드에 붙여넣지 않습니다.
6. `npx supabase functions deploy generate-mission --project-ref <프로젝트 ref>`로 AI 서버 배포. 함수는 Supabase Auth에서 로그인 토큰을 검증하고 service_role 권한으로 계정당 하루 3회 예산을 선차감합니다.
7. `main`에 push하면 GitHub Actions가 테스트·빌드 후 Pages 배포.

사용자는 공통 서버 주소로 요청하며 서버에서만 Gemini를 호출합니다. 무료 사용량은 모델과 프로젝트 설정에 따라 달라집니다. 익명 세션과 유효한 Gemini 키를 검증하기 전에는 실제 서비스 호출 완료로 간주하지 않습니다.
