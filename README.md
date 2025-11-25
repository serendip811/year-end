# Manitto Secret Chat WebApp

## 📌 프로젝트 개요

회사 송년회를 위한 익명 마니또(Manitto) 채팅 웹앱을 개발한다.
각 사용자는 2개의 채팅 상대가 있다:
- `to_target`: 내가 챙겨야 하는 사람 → 실명 공개
- `from_manitto`: 나를 챙기는 사람 → 익명 (“비밀친구”)

웹앱은 SPA 기반이며 PWA로 설치 가능하고, 푸시 알림(Firebase FCM)으로 채팅 메시지를 받을 수 있다.
로그인은 관리자가 지정한 초기 비밀번호(예: 생년월일) 를 사용하며 사용자는 로그인 후 비밀번호를 변경할 수 있다.

## 1. 기능 요약

### ✔ Custom JWT 인증
- 초기 비밀번호 로그인
- JWT를 HttpOnly 쿠키에 저장
- 첫 로그인 시 비밀번호 변경 가능

### ✔ 채팅 기능
- Supabase Realtime 기반
- 양방향 실시간 메시지
- room_id 규칙: `sort([sender_id, receiver_id]).join('_')`

### ✔ PWA 기능
- next-pwa 기반
- 홈 화면 설치
- 오프라인 가능
- manifest.json 및 아이콘

### ✔ Firebase FCM 웹 푸시
- 새 메시지 도착 시 푸시 알림
- PWA 서비스워커에서 푸시 처리
- 푸시 토큰을 DB에 저장

## 2. 전체 기술 스택

| 컴포넌트 | 기술 |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS |
| DB | Supabase (PostgreSQL) |
| 실시간 | Supabase Realtime |
| Auth | Custom JWT |
| Push | Firebase Cloud Messaging |
| PWA | next-pwa |
| 배포 | Vercel + Supabase |

## 3. Supabase DB Schema

### users 테이블
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  initial_password text not null,
  password_hash text not null,
  manitto_from uuid,
  manitto_to uuid,
  created_at timestamp default now()
);
```

### messages 테이블
```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  sender uuid not null references users(id),
  receiver uuid not null references users(id),
  content text not null,
  created_at timestamp default now()
);
```

### push_tokens 테이블
```sql
create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token text not null,
  updated_at timestamp default now()
);
```

## 4. 매칭 구조

직원 리스트를 새팅 후 A → B → C → D → A 순환 구조로 매칭.
각 사용자 B는 다음 정보를 가진다:
- `from_manitto` = A (나에게 익명으로 메시지를 보내는 사람)
- `to_target` = C (내가 챙겨야 하는 사람)

## 5. room_id 규칙

모든 메시지는 단일 room_id 로 저장한다.
`room_id = [sender_id, receiver_id].sort().join("_");`
예: A ↔ B → `a_b`

## 6. Auth 설계 (Custom JWT)

### /api/auth/login
- 입력: `{ "name": "", "password": "" }`
- 처리:
    - DB user 조회
    - bcrypt로 비밀번호 검증
    - JWT 발급
    - HttpOnly 쿠키에 저장

### /api/auth/change-password
- 비밀번호 변경 API.

### 인증 미들웨어
- 모든 보호 API는 JWT를 읽어 user_id 검증.

## 7. API 명세

- `POST /api/auth/login`: 로그인 + JWT 쿠키 발급.
- `POST /api/auth/change-password`: 로그인된 사용자가 비밀번호 변경.
- `POST /api/messages/send`:
    - JWT 인증 필요
    - 메시지를 messages 테이블에 저장
    - receiver의 push_token 조회
    - Firebase FCM에 push 요청

## 8. PWA 설정

next-pwa 사용.

### /public/manifest.json
```json
{
  "name": "Manitto Secret Chat",
  "short_name": "ManittoChat",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## 9. Firebase FCM Push

- 클라이언트에서 token 등록
- Firebase messaging에서 token 발급 → `/api/push/save-token` 호출해서 저장.
- 서버에서 메시지 insert 후 push 발송

## 10. UI 명세

1. **로그인 화면**: name + password 입력, 성공 시 dashboard 이동.
2. **비밀번호 변경**: 현재 비밀번호, 새 비밀번호 입력.
3. **채팅 목록**: "비밀친구와 채팅하기" (익명), "내가 챙겨야 하는 사람과 채팅하기" (실명).
4. **채팅방**: 메시지 목록, 입력창, 실시간 수신.

## 11. 필요한 환경 변수(.env)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

JWT_SECRET=

# Firebase Configuration (for client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Firebase Service Account (for server-side FCM HTTP v1 API)
# Get this from Firebase Console > Project Settings > Service Accounts > Generate new private key
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Optional: App URL for push notification click actions
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
