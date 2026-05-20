#!/bin/bash
# 파일 변경 감지 → 자동 빌드 + 서버 재시작
PORT=12730
SERVER_PID=""

start_server() {
  kill -9 $SERVER_PID 2>/dev/null
  kill -9 $(lsof -t -i:$PORT) 2>/dev/null
  wait $SERVER_PID 2>/dev/null
  sleep 1
  npm run start -- --port $PORT --hostname 0.0.0.0 &>/tmp/nextprod.log &
  SERVER_PID=$!
  echo "✓ 서버 재시작 완료 (PID: $SERVER_PID) → http://192.168.50.102:$PORT"
}

echo "🔨 초기 빌드 중..."
npm run build && start_server || { echo "❌ 초기 빌드 실패"; exit 1; }

echo "👀 파일 감시 시작 (app/ components/ lib/)..."
while inotifywait -r -q -e modify,create,delete \
  --exclude '(node_modules|\.next|\.git)' \
  app/ components/ lib/ 2>/dev/null; do
  echo ""
  echo "🔄 변경 감지 → 빌드 중..."
  rm -rf .next
  if npm run build 2>&1; then
    start_server
  else
    echo "❌ 빌드 실패 - 서버 유지 중"
  fi
done
