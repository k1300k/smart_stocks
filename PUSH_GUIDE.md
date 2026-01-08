# GitHub 푸시 가이드

## 현재 상태
- ✅ 모든 파일이 커밋됨 (3개 커밋)
- ⏳ GitHub 푸시 대기 중

## 푸시 방법

### 방법 1: 직접 푸시 (가장 간단)
터미널에서 다음 명령어 실행:

```bash
cd /Users/john/smart_stocks
git push -u origin main
```

GitHub 인증 정보를 입력하라는 프롬프트가 나타나면:
- Username: `k1300k`
- Password: Personal Access Token (비밀번호가 아닌 토큰 필요)

### 방법 2: GitHub CLI 사용
```bash
# GitHub CLI 로그인
gh auth login

# 푸시
git push -u origin main
```

### 방법 3: SSH 사용
```bash
# 원격 URL을 SSH로 변경
git remote set-url origin git@github.com:k1300k/smart_stocks.git

# 푸시
git push -u origin main
```

## Personal Access Token 생성 방법
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택: `repo` (전체 저장소 접근)
4. 토큰 복사 후 비밀번호 입력 시 사용

## 커밋 내역
- `ca0550e`: feat: 마인드맵 기반 주식 포트폴리오 관리 서비스 초기 구현
- `0f345b8`: chore: Vercel 배포 설정 추가
- `73359af`: ci: GitHub Actions를 통한 Vercel 자동 배포 워크플로우 추가
