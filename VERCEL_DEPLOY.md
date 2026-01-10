# Vercel 배포 완료 가이드

## ✅ GitHub 반영 완료

모든 변경사항이 GitHub에 성공적으로 반영되었습니다:
- 회원가입/로그인 기능
- JSON/CSV 내보내기/불러오기
- API 키 설정 모달
- 해외주식 검색 기능

## 🚀 Vercel 자동 배포

GitHub에 푸시되면 Vercel이 자동으로 배포를 시작합니다.

### 배포 확인 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 로그인 후 프로젝트 `smart-stocks` 선택

2. **최신 배포 확인**
   - Deployments 탭에서 최신 배포 상태 확인
   - "Building..." → "Ready" 상태로 변경되면 완료

3. **배포 URL 확인**
   - 배포 완료 후 URL 확인 (예: `https://smart-stocks-xxx.vercel.app`)
   - Production 브랜치는 커스텀 도메인 사용 가능

### Vercel 설정 확인 (중요!)

Vercel 대시보드에서 다음 설정을 확인하세요:

#### General Settings
- **Root Directory**: `frontend`
- **Framework Preset**: Vite (자동 감지)
- **Build Command**: `npm run build` (자동 감지)
- **Output Directory**: `dist` (자동 감지)
- **Install Command**: `npm install` (자동 감지)

#### Environment Variables
현재는 필요 없지만, 나중에 백엔드 API URL 설정 시:
- `VITE_API_URL`: 백엔드 API URL (예: `https://your-api.railway.app/api`)

### 수동 재배포

자동 배포가 안 되면:
1. Vercel 대시보드 → 프로젝트 선택
2. Deployments 탭
3. "Redeploy" 버튼 클릭
4. 또는 GitHub에서 새 커밋 푸시

## 🔧 빌드 설정

프로젝트 루트의 `vercel.json` 파일이 자동으로 인식됩니다:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

이 설정으로:
- React Router의 클라이언트 사이드 라우팅 지원
- `/auth`, `/` 등 모든 경로가 `index.html`로 리다이렉트
- SPA 라우팅 정상 작동

## 📋 배포 후 체크리스트

배포 완료 후 다음을 확인하세요:

- [ ] 메인 페이지 로드 확인
- [ ] 로그인/회원가입 페이지 접근 (`/auth`)
- [ ] 회원가입 기능 테스트
- [ ] 로그인 기능 테스트
- [ ] 대시보드 접근 확인
- [ ] 포트폴리오 관리 기능 확인
- [ ] 종목 검색 기능 확인
- [ ] JSON/CSV 내보내기/불러오기 확인

## 🐛 문제 해결

### 빌드 실패 시

1. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → Build Logs
   - 에러 메시지 확인

2. **로컬에서 빌드 테스트**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **의존성 문제**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### 404 에러 시

1. **Rewrites 설정 확인**
   - `vercel.json`의 `rewrites` 설정 확인
   - 모든 경로가 `/index.html`로 리다이렉트되는지 확인

2. **Root Directory 확인**
   - Vercel 대시보드에서 Root Directory가 `frontend`로 설정되어 있는지 확인

### API 연결 문제 시

1. **CORS 설정 확인**
   - 백엔드에서 Vercel URL을 CORS 허용 목록에 추가
   - `CORS_ORIGIN` 환경 변수 설정

2. **API URL 설정**
   - 프론트엔드에서 백엔드 API URL이 올바르게 설정되었는지 확인
   - Vercel 환경 변수에 `VITE_API_URL` 설정

## 📚 관련 문서

- [DEPLOY.md](./DEPLOY.md) - 기본 배포 가이드
- [VERCEL_FIX.md](./VERCEL_FIX.md) - 404 에러 해결 가이드
- [README.md](./README.md) - 프로젝트 개요

## 🎉 배포 완료!

GitHub에 푸시되면 자동으로 Vercel에서 배포가 진행됩니다. 
Vercel 대시보드에서 배포 상태를 확인하세요!
