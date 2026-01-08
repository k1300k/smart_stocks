# Vercel 배포 가이드

## 🚀 Vercel에 배포하기

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 `k1300k/smart_stocks` 선택
4. 프로젝트 설정:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 배포
cd frontend
vercel

# 프로덕션 배포
vercel --prod
```

## 📝 환경 변수 설정

현재는 프론트엔드만 배포하므로 환경 변수가 필요하지 않습니다.
백엔드 API 연동 시 다음 환경 변수를 설정하세요:

- `VITE_API_URL`: 백엔드 API URL

## 🔧 빌드 설정

Vercel은 자동으로 다음을 감지합니다:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

`frontend/vercel.json` 파일에 설정이 포함되어 있습니다.

## 📦 배포 후 확인

배포가 완료되면:
1. Vercel 대시보드에서 배포 URL 확인
2. 브라우저에서 접속하여 마인드맵 확인
3. "포트폴리오 관리" 기능 테스트

## 🔄 자동 배포

GitHub 저장소에 푸시하면 자동으로 배포됩니다:
- `main` 브랜치: 프로덕션 배포
- 다른 브랜치: 프리뷰 배포

## ⚠️ 주의사항

- 현재는 프론트엔드만 배포됩니다
- 백엔드 API는 별도로 배포해야 합니다 (예: Railway, Render, AWS 등)
- CORS 설정이 필요할 수 있습니다
