# Vercel 404 에러 해결 가이드

## 문제
Vercel에서 404 NOT_FOUND 에러가 발생합니다.

## 해결 방법

### 방법 1: Vercel 대시보드에서 설정 확인 (권장)

1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택: `smart-stocks`
3. Settings → General로 이동
4. 다음 설정 확인:

**Root Directory**: `frontend`
**Build Command**: `npm run build` (또는 비워두기 - 자동 감지)
**Output Directory**: `dist`
**Install Command**: `npm install` (또는 비워두기)

5. **중요**: Root Directory를 `frontend`로 설정했다면:
   - Build Command는 자동으로 `frontend` 폴더에서 실행됨
   - Output Directory는 `dist` (frontend/dist가 아님!)

### 방법 2: 프로젝트 루트에서 빌드

Root Directory를 비워두고 (프로젝트 루트), 다음 설정:

**Root Directory**: (비워두기)
**Build Command**: `cd frontend && npm install && npm run build`
**Output Directory**: `frontend/dist`
**Install Command**: `cd frontend && npm install`

### 방법 3: vercel.json 사용

프로젝트 루트에 `vercel.json` 파일이 있으면 자동으로 인식됩니다.
현재 설정:
- Root Directory: 프로젝트 루트
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`

## 확인 사항

1. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → 최신 배포 클릭
   - Build Logs에서 에러 확인

2. **빌드 출력 확인**
   - Build Logs에서 `dist` 폴더가 생성되었는지 확인
   - `index.html` 파일이 있는지 확인

3. **파일 구조 확인**
   ```
   frontend/
     dist/
       index.html
       assets/
         ...
   ```

## 재배포

설정 변경 후:
1. Vercel 대시보드에서 "Redeploy" 클릭
2. 또는 GitHub에 푸시하면 자동 재배포

## 현재 설정 파일

- `vercel.json` (루트): 프로젝트 루트에서 빌드하는 설정
- `frontend/vercel.json`: 프론트엔드 전용 설정

두 파일 중 하나만 사용하세요!
