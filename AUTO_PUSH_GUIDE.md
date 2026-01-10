# 자동 GitHub 푸시 가이드

## 🔄 자동 푸시 설정

현재 프로젝트는 커밋 시 자동으로 **두 개의 GitHub 저장소**에 모두 푸시됩니다:

1. **smart_stocks** (기존 저장소): `https://github.com/k1300k/smart_stocks`
2. **stock_smart2** (새 저장소): `https://github.com/k1300k/stock_smart2`

## 🚀 동작 방식

### 1. 자동 푸시 (post-commit hook)

커밋할 때마다 자동으로 두 저장소에 모두 푸시됩니다:

```bash
git commit -m "변경사항 설명"
# → 자동으로 origin과 stock_smart2에 푸시
```

### 2. 빌드 테스트 (pre-push hook)

푸시 전에 프론트엔드 빌드 테스트를 실행합니다:
- 빌드 실패 시: 푸시 중단
- 빌드 성공 시: 푸시 진행

## 📋 원격 저장소 확인

```bash
git remote -v
```

출력 예시:
```
origin       https://github.com/k1300k/smart_stocks.git (fetch)
origin       https://github.com/k1300k/smart_stocks.git (push)
stock_smart2 https://github.com/k1300k/stock_smart2.git (fetch)
stock_smart2 https://github.com/k1300k/stock_smart2.git (push)
```

## 🔧 수동 푸시

필요 시 수동으로 각 저장소에 푸시할 수 있습니다:

### 기존 저장소에만 푸시
```bash
git push origin main
```

### 새 저장소에만 푸시
```bash
git push stock_smart2 main
```

### 모든 저장소에 푸시
```bash
git push origin main
git push stock_smart2 main
```

## 🔄 저장소 기본값 변경

### 새 저장소를 기본(origin)으로 변경

```bash
# 기존 origin을 backup으로 변경
git remote rename origin backup

# 새 저장소를 origin으로 설정
git remote add origin https://github.com/k1300k/stock_smart2.git

# 기존 저장소는 별도로 유지
git remote rename backup smart_stocks
```

### 현재 설정 유지 (권장)

두 저장소 모두 유지하고 자동으로 푸시되도록 현재 설정 유지

## 📝 주의사항

1. **자동 푸시는 post-commit hook에서 실행됩니다**
   - 커밋 시 자동으로 두 저장소에 푸시
   - 빌드 테스트는 pre-push hook에서 실행

2. **인증 토큰 필요**
   - GitHub Personal Access Token (PAT)이 필요합니다
   - `.git/config` 또는 환경 변수에 설정

3. **에러 발생 시**
   - 한 저장소 푸시 실패해도 다른 저장소는 계속 진행
   - 로그를 확인하여 문제 해결

## 🎯 Vercel 배포 연동

두 저장소 중 하나를 Vercel에 연결하면 자동 배포됩니다:

### stock_smart2 저장소를 Vercel에 연결
1. Vercel 대시보드 접속
2. "Add New Project" 클릭
3. `stock_smart2` 저장소 선택
4. Root Directory: `frontend`
5. 자동 배포 완료!

## 📚 관련 파일

- `.git/hooks/post-commit` - 커밋 후 자동 푸시
- `.git/hooks/pre-push` - 푸시 전 빌드 테스트
- `AUTO_SYNC.md` - 기존 자동 동기화 가이드

## ✅ 확인 방법

1. **커밋 생성**
   ```bash
   echo "test" > test.txt
   git add test.txt
   git commit -m "테스트 커밋"
   ```

2. **자동 푸시 확인**
   - 터미널에 두 저장소 푸시 메시지 표시
   - GitHub에서 두 저장소 모두 확인

3. **GitHub 저장소 확인**
   - https://github.com/k1300k/smart_stocks
   - https://github.com/k1300k/stock_smart2
