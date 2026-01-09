# 실시간 주식 API 연동 가이드

## 🎯 개요

이 프로젝트는 실시간 주식 데이터를 가져오기 위해 두 가지 API를 지원합니다:
- **한국투자증권 KIS API**: 국내 주식 (코스피, 코스닥)
- **Alpha Vantage API**: 해외 주식 (NYSE, NASDAQ)

API 키가 설정되지 않은 경우 자동으로 로컬 샘플 데이터를 사용합니다.

## 🔑 API 키 발급

### 1. 한국투자증권 KIS API

#### 발급 절차
1. https://apiportal.koreainvestment.com 접속
2. 회원가입 및 로그인
3. "My App" 메뉴에서 "App 등록" 클릭
4. App 이름, 서비스 유형 선택
5. App Key와 App Secret 발급 받기

#### 기능
- 국내 주식 종목 검색
- 실시간 현재가 조회
- 호가, 체결 정보
- 일봉, 분봉 차트 데이터

#### 제한사항
- 초당 20건 (일반 사용자)
- 하루 10,000건 (일반 사용자)
- 실전투자 계좌가 있으면 더 높은 한도

### 2. Alpha Vantage API

#### 발급 절차
1. https://www.alphavantage.co/support/#api-key 접속
2. 이메일 입력하여 무료 API 키 발급
3. 즉시 사용 가능

#### 기능
- 해외 주식 종목 검색
- 실시간 현재가 조회 (15분 지연)
- 일봉, 주봉, 월봉 데이터
- 기술적 지표

#### 제한사항
- 무료: 분당 5회, 하루 100회
- 유료: 분당 30회 이상 (플랜별 상이)

## ⚙️ 설정 방법

### 1. 환경 변수 설정

#### 백엔드 (.env)
```bash
cd backend
cp .env.example .env
```

`.env` 파일을 열어 API 키를 입력:
```bash
# 한국투자증권 KIS API
KIS_APP_KEY=your-kis-app-key-here
KIS_APP_SECRET=your-kis-app-secret-here
KIS_BASE_URL=https://openapi.koreainvestment.com:9443

# Alpha Vantage API
ALPHA_VANTAGE_API_KEY=TB6MLLZCCCNOCVLR
```

#### 프론트엔드 (앱 내 입력)
- 앱 상단 오른쪽의 **API 키 설정** 버튼을 눌러 Alpha Vantage 키를 입력합니다.
- 입력한 키는 브라우저 로컬 저장소에 보관되며, 유효 기간 동안 `alphaKey` 파라미터로 자동 전송됩니다.
- 키가 없거나 올바르지 않으면 기존 샘플 데이터에서 정상적으로 검색/현재가를 보여줍니다.

### 2. 서버 재시작

```bash
# 백엔드 재시작
cd backend
npm run dev
```

## 📊 동작 방식

### API 우선순위
1. **API 키가 있는 경우**: 실제 API 호출
2. **API 키가 없는 경우**: 로컬 샘플 데이터 사용
3. **API 오류 발생 시**: 자동으로 로컬 데이터로 폴백

### 검색 흐름
```
사용자 입력 → API 호출 시도 → 성공: API 데이터 반환
                           → 실패: 로컬 데이터에서 검색
```

### 가격 조회 흐름
```
종목 선택 → 시장 구분 (국내/해외)
         → 국내: KIS API 호출
         → 해외: Alpha Vantage API 호출
         → 실패 시: 샘플 가격 반환
```

## 🧪 테스트 방법

### 1. API 연동 전 (샘플 데이터)
```bash
# 백엔드 실행
cd backend
npm run dev

# 프론트엔드 실행
cd frontend
npm run dev
```

브라우저에서 http://localhost:5173 접속하여 검색 테스트

### 2. API 연동 후 (실제 데이터)

#### KIS API 테스트
```bash
# 국내 주식 검색
curl "http://localhost:3000/api/stocks/search?q=삼성전자&market=KRX"

# 국내 주식 현재가
curl "http://localhost:3000/api/stocks/price/005930?market=KRX"
```

#### Alpha Vantage API 테스트
```bash
# 해외 주식 검색
curl "http://localhost:3000/api/stocks/search?q=Apple&market=NYSE"

# 해외 주식 현재가
curl "http://localhost:3000/api/stocks/price/AAPL?market=NASDAQ"
```

## 🔧 고급 설정

### Redis 캐싱 (선택사항)

API 호출 횟수를 줄이기 위해 Redis 캐싱을 설정할 수 있습니다:

```bash
# Redis 설치 (macOS)
brew install redis
brew services start redis

# .env 설정
REDIS_HOST=localhost
REDIS_PORT=6379
```

캐싱 전략:
- 종목 검색 결과: 1시간
- 현재가: 1분
- 차트 데이터: 5분

### Rate Limiting

API 호출 한도를 초과하지 않도록 Rate Limiting 구현:

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 5, // 최대 5회
  message: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도하세요.',
});
```

## 📝 주요 파일

- `backend/.env.example`: 환경 변수 템플릿
- `backend/src/services/kisApiService.ts`: KIS API 클라이언트
- `backend/src/services/alphaVantageService.ts`: Alpha Vantage API 클라이언트
- `backend/src/services/stockService.ts`: 통합 주식 서비스
- `backend/src/routes/stockRoutes.ts`: API 라우트

## ⚠️ 주의사항

1. **API 키 보안**
   - `.env` 파일은 절대 GitHub에 커밋하지 마세요
   - `.gitignore`에 `.env`가 포함되어 있는지 확인하세요

2. **Rate Limiting**
   - 각 API의 호출 한도를 준수하세요
   - 프로덕션에서는 Redis 캐싱을 반드시 사용하세요

3. **에러 처리**
   - API 오류 시 자동으로 폴백되지만, 로그를 확인하세요
   - 에러가 반복되면 API 키를 확인하세요

4. **개발 vs 프로덕션**
   - 개발: 샘플 데이터 사용 가능
   - 프로덕션: 반드시 실제 API 키 설정

## 🆘 문제 해결

### API 키가 작동하지 않을 때
1. `.env` 파일 경로 확인
2. 환경 변수 로드 확인: `console.log(process.env.KIS_APP_KEY)`
3. 서버 재시작
4. API 키 유효성 확인

### API 호출 한도 초과 시
1. Redis 캐싱 활성화
2. Rate Limiting 설정
3. API 플랜 업그레이드 고려

### 가격 데이터가 이상할 때
1. API 응답 로그 확인
2. 시장 개장 시간 확인 (장 마감 후에는 이전 종가)
3. 샘플 데이터로 폴백되었는지 확인

## 📚 참고 문서

- [한국투자증권 KIS API 문서](https://apiportal.koreainvestment.com/apiservice/oauth2)
- [Alpha Vantage API 문서](https://www.alphavantage.co/documentation/)
- [프로젝트 README](./README.md)
- [주식 API 가이드](./STOCK_API_GUIDE.md)
