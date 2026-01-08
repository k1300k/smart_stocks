# 자동 GitHub 동기화 가이드

## 🚀 자동 푸시 설정 완료!

변경사항이 발생하면 자동으로 GitHub에 반영됩니다.

## 설정된 기능

### 1. 자동 푸시 (Post-Commit Hook)
커밋 시 자동으로 GitHub에 푸시됩니다.

```bash
git add .
git commit -m "변경사항"
# 자동으로 git push origin main 실행됨
```

### 2. 파일 변경 감시 스크립트 (선택사항)
파일이 변경되면 자동으로 커밋하고 푸시합니다.

```bash
./auto-sync.sh
```

이 스크립트는:
- `frontend/src`, `backend/src` 디렉토리 감시
- 변경사항 감지 시 자동 커밋 및 푸시
- Ctrl+C로 종료

### 3. 푸시 전 빌드 테스트
푸시 전에 빌드가 성공하는지 확인합니다.

## 사용 방법

### 방법 1: 수동 커밋 (권장)
```bash
# 변경사항 확인
git status

# 변경사항 추가
git add .

# 커밋 (자동으로 푸시됨)
git commit -m "변경사항 설명"
```

### 방법 2: 자동 감시 (개발 중)
```bash
# 터미널에서 실행
./auto-sync.sh

# 별도 터미널에서 파일 수정
# 자동으로 커밋 및 푸시됨
```

## 주의사항

1. **커밋 메시지**: 자동 커밋은 타임스탬프를 사용하므로, 중요한 변경사항은 수동으로 의미있는 메시지를 작성하세요.

2. **빌드 실패**: 빌드가 실패하면 푸시가 중단됩니다. 에러를 수정한 후 다시 시도하세요.

3. **브랜치**: 자동 푸시는 `main` 브랜치에서만 작동합니다.

## 비활성화 방법

자동 푸시를 비활성화하려면:

```bash
# post-commit hook 비활성화
mv .git/hooks/post-commit .git/hooks/post-commit.disabled

# 다시 활성화
mv .git/hooks/post-commit.disabled .git/hooks/post-commit
```

## 문제 해결

### 푸시 실패 시
- GitHub 인증 토큰 확인
- 네트워크 연결 확인
- 수동으로 푸시: `git push origin main`

### 빌드 실패 시
```bash
cd frontend
npm run build
# 에러 메시지 확인 후 수정
```
