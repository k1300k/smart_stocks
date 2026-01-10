# Vercel 배포 설정 확인 가이드

## 🔍 현재 상태 확인

### GitHub 저장소
- 저장소: https://github.com/k1300k/smart_stocks
- 최신 커밋: 확인 완료
- 상태: ✅ 동기화 완료

### Vercel 설정 확인 필요 사항

## 📋 Vercel 대시보드에서 확인할 사항

### 1. 프로젝트 연결 확인
1. https://vercel.com/dashboard 접속
2. 프로젝트 목록에서 `smart_stocks` 또는 `smart-stocks` 찾기
3. 프로젝트가 없으면 "Add New Project" 클릭

### 2. GitHub 저장소 연결 확인
- **Import Git Repository**에서 `k1300k/smart_stocks` 선택되어 있는지 확인
- 연결이 안 되어 있으면 "Connect" 클릭

### 3. 프로젝트 설정 확인 (중요!)

#### General Settings → Root Directory
```
frontend
```
⚠️ **반드시 `frontend`로 설정되어 있어야 합니다!**

#### Build & Development Settings
- **Framework Preset**: `Vite` (자동 감지되거나 수동 선택)
- **Build Command**: `cd frontend && npm install && npm run build`
  또는 `npm run build` (Root Directory가 `frontend`로 설정되어 있으면)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. vercel.json 파일 확인
프로젝트 루트에 `vercel.json` 파일이 있어야 합니다:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🔄 수동 배포 트리거

### 방법 1: 빈 커밋으로 트리거
```bash
git commit --allow-empty -m "chore: Vercel 배포 트리거"
git push origin main
```

### 방법 2: Vercel 대시보드에서 재배포
1. Vercel 대시보드 → 프로젝트 선택
2. **Deployments** 탭 클릭
3. 최신 배포 옆 **"..."** 메뉴 클릭
4. **"Redeploy"** 선택

### 방법 3: GitHub Webhook 확인
1. GitHub 저장소 → **Settings** → **Webhooks**
2. Vercel webhook이 있는지 확인
3. 없으면 Vercel에서 프로젝트를 다시 연결

## 🐛 문제 해결

### 문제 1: 자동 배포가 안 됨
**원인**: GitHub webhook이 설정되지 않음
**해결**:
1. Vercel 대시보드 → 프로젝트 → Settings → Git
2. "Disconnect" 후 다시 "Connect Git Repository"
3. `k1300k/smart_stocks` 선택

### 문제 2: 빌드 실패
**원인**: Root Directory 설정 오류
**해결**:
1. Vercel 대시보드 → Settings → General
2. Root Directory를 `frontend`로 설정
3. 저장 후 재배포

### 문제 3: 404 에러
**원인**: rewrites 설정 문제
**해결**:
1. `vercel.json` 파일 확인
2. `rewrites` 설정이 있는지 확인
3. 모든 경로가 `/index.html`로 리다이렉트되는지 확인

### 문제 4: 빌드 명령어 오류
**원인**: Build Command 경로 문제
**해결**:
- Root Directory가 `frontend`인 경우:
  ```
  Build Command: npm run build
  Output Directory: dist
  ```
- Root Directory가 루트인 경우:
  ```
  Build Command: cd frontend && npm install && npm run build
  Output Directory: frontend/dist
  ```

## ✅ 체크리스트

배포 전 확인:
- [ ] GitHub 저장소에 최신 코드가 푸시되어 있음
- [ ] Vercel 프로젝트가 GitHub 저장소와 연결되어 있음
- [ ] Root Directory가 `frontend`로 설정되어 있음
- [ ] Build Command가 올바르게 설정되어 있음
- [ ] Output Directory가 `dist`로 설정되어 있음
- [ ] `vercel.json` 파일이 프로젝트 루트에 있음
- [ ] GitHub webhook이 설정되어 있음

## 🚀 배포 확인

배포가 시작되면:
1. Vercel 대시보드 → Deployments 탭
2. 최신 배포 상태 확인:
   - **Building...** → 빌드 진행 중
   - **Ready** → 배포 완료
   - **Error** → 빌드 로그 확인 필요

## 📞 추가 도움

문제가 계속되면:
1. Vercel 대시보드의 Build Logs 확인
2. 로컬에서 빌드 테스트:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Vercel 지원팀에 문의
