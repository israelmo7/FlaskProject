#!/bin/bash

# פונקציה שתופסת את ה-Ctrl+C (SIGINT) וסוגרת את כל תהליכי הרקע שהסקריפט פתח
trap "kill 0" EXIT

echo "🚀 Starting React Dev Server..."
pushd room-ui/src
npm run dev &
popd

echo "🐍 Starting Flask Server..."
FLASK_DEBUG=1 python3 -m srcs.app
