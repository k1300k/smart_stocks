# 주식 정보 연동 가이드

## 🎯 구현된 기능

### 1. 종목 검색
- 종목명 또는 종목 코드로 검색
- 실시간 검색 결과 표시
- 키보드 네비게이션 지원 (화살표 키, Enter)

### 2. 현재가 자동 조회
- 종목 선택 시 자동으로 현재가 조회
- "가격 조회" 버튼으로 수동 조회 가능

## 📡 API 엔드포인트

### 백엔드 API

#### 1. 종목 검색
```
GET /api/stocks/search?q=삼성전자
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "005930",
      "name": "삼성전자",
      "market": "KRX",
      "sector": "IT"
    }
  ],
  "timestamp": "2024-01-08T12:00:00.000Z"
}
```

#### 2. 현재가 조회
```
GET /api/stocks/price/:symbol
```

**응답:**
```json
{
  "success": true,
  "data": {
    "symbol": "005930",
    "name": "삼성전자",
    "currentPrice": 70000,
    "changeRate": 2.5,
    "changeAmount": 1700,
    "volume": 1234567,
    "sector": "IT"
  },
  "timestamp": "2024-01-08T12:00:00.000Z"
}
```

#### 3. 일괄 현재가 조회
```
POST /api/stocks/batch-price
Body: { "symbols": ["005930", "000660"] }
```

## 🚀 사용 방법

### 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

백엔드는 `http://localhost:3000`에서 실행됩니다.

### 프론트엔드 설정

프론트엔드는 자동으로 `http://localhost:3000/api`를 사용합니다.

환경 변수를 변경하려면:
```bash
# frontend/.env 파일 생성
VITE_API_URL=http://localhost:3000/api
```

### 종목 추가 시

1. "종목 추가" 버튼 클릭
2. "종목 검색" 필드에 종목명 또는 코드 입력
3. 검색 결과에서 종목 선택
4. 자동으로 종목명, 종목 코드, 현재가가 채워짐
5. 보유 수량, 평균 매수가 입력
6. "추가" 버튼 클릭

## 🔧 한국투자증권 API 연동

현재는 샘플 데이터를 사용하고 있습니다. 실제 한국투자증권 API를 연동하려면:

1. **API 키 발급**
   - https://apiportal.koreainvestment.com 접속
   - 앱 등록 및 API 키 발급

2. **환경 변수 설정**
   ```bash
   # backend/.env
   KIS_APP_KEY=your-app-key
   KIS_APP_SECRET=your-app-secret
   KIS_BASE_URL=https://openapi.koreainvestment.com:9443
   ```

3. **서비스 수정**
   - `backend/src/services/stockService.ts` 파일 수정
   - 한국투자증권 API 클라이언트 구현

## 📝 주요 파일

- `backend/src/services/stockService.ts`: 주식 정보 조회 서비스
- `backend/src/routes/stockRoutes.ts`: API 라우트
- `frontend/src/services/stockApi.ts`: 프론트엔드 API 클라이언트
- `frontend/src/components/Portfolio/StockSearchInput.tsx`: 종목 검색 컴포넌트
- `frontend/src/components/Portfolio/StockInputForm.tsx`: 주식 입력 폼

## ⚠️ 주의사항

- 현재는 샘플 데이터를 사용합니다
- 실제 한국투자증권 API 연동 시 Rate Limiting을 준수해야 합니다
- API 키는 환경 변수로 관리하세요
- 프로덕션에서는 Redis 캐싱을 사용하세요
