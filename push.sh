#!/bin/bash

# GitHub 푸시 스크립트
# 사용법: ./push.sh

echo "🚀 GitHub에 푸시를 시작합니다..."
echo ""

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo "현재 브랜치: $CURRENT_BRANCH"
echo ""

# 커밋 내역 확인
echo "📝 커밋 내역:"
git log --oneline -5
echo ""

# 푸시 시도
echo "📤 GitHub에 푸시 중..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 푸시 성공!"
    echo "🌐 저장소: https://github.com/k1300k/smart_stocks"
else
    echo ""
    echo "❌ 푸시 실패"
    echo ""
    echo "인증이 필요합니다. 다음 중 하나를 시도하세요:"
    echo ""
    echo "1. Personal Access Token 사용:"
    echo "   - GitHub → Settings → Developer settings → Personal access tokens"
    echo "   - 'Generate new token' 클릭"
    echo "   - 'repo' 권한 선택"
    echo "   - 생성된 토큰을 비밀번호로 사용"
    echo ""
    echo "2. SSH 사용:"
    echo "   git remote set-url origin git@github.com:k1300k/smart_stocks.git"
    echo "   git push -u origin main"
    echo ""
    echo "3. GitHub CLI 사용:"
    echo "   brew install gh"
    echo "   gh auth login"
    echo "   git push -u origin main"
fi
