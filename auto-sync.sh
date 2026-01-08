#!/bin/bash

# 파일 변경 감시 및 자동 커밋/푸시 스크립트
# 사용법: ./auto-sync.sh

echo "🔄 파일 변경 감시 시작... (Ctrl+C로 종료)"
echo ""

# 감시할 디렉토리 (node_modules, dist 제외)
WATCH_DIRS="frontend/src backend/src frontend/public"

# Git 상태 확인 함수
check_and_commit() {
    # 변경사항 확인
    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        echo "📝 변경사항 감지됨!"
        git status --short
        
        # 자동으로 모든 변경사항 추가
        git add -A
        
        # 커밋 메시지 생성
        COMMIT_MSG="chore: 자동 커밋 - $(date '+%Y-%m-%d %H:%M:%S')"
        
        # 변경된 파일 목록을 커밋 메시지에 추가
        CHANGED_FILES=$(git diff --cached --name-only | head -5 | tr '\n' ', ' | sed 's/,$//')
        if [ -n "$CHANGED_FILES" ]; then
            COMMIT_MSG="$COMMIT_MSG

변경된 파일: $CHANGED_FILES"
        fi
        
        # 커밋
        git commit -m "$COMMIT_MSG"
        
        if [ $? -eq 0 ]; then
            echo "✅ 커밋 완료"
            # post-commit hook이 자동으로 푸시함
        else
            echo "❌ 커밋 실패"
        fi
    fi
}

# 초기 체크
check_and_commit

# 파일 감시 시작 (macOS용 fswatch, Linux는 inotifywait 사용)
if command -v fswatch &> /dev/null; then
    # macOS
    fswatch -o $WATCH_DIRS | while read f; do
        sleep 2  # 여러 파일이 동시에 변경될 수 있으므로 잠시 대기
        check_and_commit
    done
elif command -v inotifywait &> /dev/null; then
    # Linux
    while true; do
        inotifywait -r -e modify,create,delete $WATCH_DIRS 2>/dev/null
        sleep 2
        check_and_commit
    done
else
    echo "❌ fswatch 또는 inotifywait가 설치되어 있지 않습니다."
    echo "macOS: brew install fswatch"
    echo "Linux: sudo apt-get install inotify-tools"
    exit 1
fi
