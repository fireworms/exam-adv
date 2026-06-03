#!/usr/bin/env bash
# Claude Code 세션 수명에 묶인 임시 Next.js dev 서버 관리 스크립트.
#
# 이 프로젝트에서 Claude Code로 화면 확인이 필요할 때만 dev 서버를 띄우고,
# Claude Code가 종료되면 서버도 함께 종료되도록 설계됨.
#
#   - 1차 방어: SessionEnd 훅이 `stop` 을 호출 (정상 종료 시)
#   - 2차 방어: start 시 WATCH_PID(보통 Claude Code PID) 감시 워치독을 띄워,
#               그 PID가 사라지면(강제 종료·크래시 등 훅이 못 도는 경우) 서버 그룹을 정리
#
# 사용법:
#   session-dev-server.sh start [WATCH_PID]   # 서버 시작 (이미 떠 있으면 재사용)
#   session-dev-server.sh stop                # 서버 종료
#   session-dev-server.sh status              # 상태 출력
set -uo pipefail

PROJECT_DIR="/home/fireworms/exam-adv"
RUN_DIR="$PROJECT_DIR/.claude/.session-server"
PID_FILE="$RUN_DIR/dev.pgid"      # 서버 프로세스 그룹 리더 PID = PGID
LOG_FILE="$RUN_DIR/dev.log"
PORT="${PORT:-3030}"
mkdir -p "$RUN_DIR"

# 그룹 리더가 살아있는지 확인
is_running() {
  local pgid="${1:-}"
  [ -n "$pgid" ] && kill -0 "$pgid" 2>/dev/null
}

stop_server() {
  if [ -f "$PID_FILE" ]; then
    local pgid
    pgid="$(cat "$PID_FILE" 2>/dev/null)"
    if is_running "$pgid"; then
      # 음수 PID = 프로세스 그룹 전체에 시그널 전송 (next dev 자식들 포함)
      kill -TERM "-$pgid" 2>/dev/null
      for _ in 1 2 3 4 5 6 7 8 9 10; do
        is_running "$pgid" || break
        sleep 0.3
      done
      is_running "$pgid" && kill -KILL "-$pgid" 2>/dev/null
    fi
    rm -f "$PID_FILE"
  fi
}

case "${1:-}" in
  start)
    WATCH_PID="${2:-}"
    if [ -f "$PID_FILE" ]; then
      existing="$(cat "$PID_FILE" 2>/dev/null)"
      if is_running "$existing"; then
        echo "already running (pgid=$existing, port=$PORT)"
        exit 0
      fi
    fi
    cd "$PROJECT_DIR"
    # 프로덕션 빌드 서빙: dev HMR 웹소켓(/_next/webpack-hmr)이 없어 LAN 접속 시 ws 에러 안 남.
    # 빌드는 동기 실행하여 실패를 즉시 드러냄.
    echo "building (next build)..."
    if ! npm run build >"$RUN_DIR/build.log" 2>&1; then
      echo "build failed — see $RUN_DIR/build.log" >&2
      tail -20 "$RUN_DIR/build.log" >&2
      exit 1
    fi
    # setsid 로 새 세션을 만들어 자체 프로세스 그룹 리더가 되게 함 → PGID == 리더 PID
    setsid bash -c "exec npm run start -- -p $PORT -H 0.0.0.0" >"$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo "$SERVER_PID" > "$PID_FILE"

    # 워치독: WATCH_PID 가 사라지면 서버 그룹 정리 (SessionEnd 훅이 못 도는 상황 대비)
    if [ -n "$WATCH_PID" ]; then
      setsid bash -c "
        while kill -0 $WATCH_PID 2>/dev/null; do sleep 5; done
        kill -TERM -$SERVER_PID 2>/dev/null
        sleep 2
        kill -KILL -$SERVER_PID 2>/dev/null
        rm -f '$PID_FILE'
      " >/dev/null 2>&1 &
    fi
    echo "started (pgid=$SERVER_PID, port=$PORT, watch=${WATCH_PID:-none})"
    ;;
  stop)
    stop_server
    echo "stopped"
    ;;
  status)
    if [ -f "$PID_FILE" ]; then
      pgid="$(cat "$PID_FILE" 2>/dev/null)"
      if is_running "$pgid"; then
        echo "running (pgid=$pgid, port=$PORT)"
        exit 0
      fi
    fi
    echo "not running"
    ;;
  *)
    echo "usage: $0 {start [WATCH_PID]|stop|status}" >&2
    exit 1
    ;;
esac
