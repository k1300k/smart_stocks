# MindStock - 마인드맵 기반 주식 포트폴리오 관리 서비스

주식 포트폴리오를 마인드맵으로 시각화하여 직관적인 투자 관리를 지원하는 서비스입니다.

## 🚀 빠른 시작

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

### 백엔드 실행 (준비 중)

```bash
cd backend
npm install
cp .env.example .env
# .env 파일에 필요한 환경 변수 설정
npm run dev
```

## 📁 프로젝트 구조

```
smart_stocks/
├── frontend/          # React + Vite + TypeScript 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   └── MindMap/    # 마인드맵 관련 컴포넌트
│   │   ├── services/        # 비즈니스 로직
│   │   ├── types/          # TypeScript 타입 정의
│   │   └── App.tsx         # 메인 앱 컴포넌트
│   └── package.json
├── backend/           # Node.js + Express 백엔드
│   └── src/
└── prd.mdc           # 프로젝트 요구사항 문서
```

## 🎨 주요 기능

### 마인드맵 시각화
- **섹터별 뷰**: 산업별로 포트폴리오를 그룹화
- **수익률별 뷰**: 수익률 구간별로 분류
- **테마별 뷰**: 사용자 정의 태그 기반 분류

### 인터랙션
- 노드 클릭: 우측 패널에서 상세 정보 확인
- 호버: 툴팁으로 기본 정보 미리보기
- 드래그: 노드 위치 재배치
- 줌/팬: 마우스 휠로 확대/축소 및 이동

### 시각적 표현
- 노드 크기: 포트폴리오 가치에 비례
- 색상: 수익(녹색) / 손실(빨간색) / 보합(회색)

## 🛠 기술 스택

### Frontend
- React 18
- TypeScript
- Vite
- D3.js (마인드맵 시각화)
- TailwindCSS
- Zustand (상태 관리)
- TanStack Query

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL (Prisma)
- Redis
- JWT 인증

## 📝 개발 가이드

자세한 개발 가이드는 `prd.mdc` 파일을 참고하세요.

## 🚀 배포

Vercel 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

### 빠른 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. Root Directory를 `frontend`로 설정
4. 자동 배포 완료!

## 🔒 보안

- API 키는 환경 변수로 관리
- JWT 토큰 기반 인증
- HTTPS 통신

## 📄 라이선스

ISC
