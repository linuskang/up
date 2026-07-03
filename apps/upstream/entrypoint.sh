#!/bin/sh
set -e

echo "Starting application..."
echo "Current directory: $(pwd)"

if [ -f "./server.js" ]; then
    echo "Found server.js in current directory"
    exec node ./server.js
fi

# Fallback: search for server.js in /app
echo "server.js not found in $(pwd), searching /app..."
SERVER_JS=$(find /app -name "server.js" -not -path "*/node_modules/*" 2>/dev/null | head -n 1)

if [ -n "$SERVER_JS" ]; then
    echo "Found server.js at: $SERVER_JS"
    exec node "$SERVER_JS"
fi

echo "ERROR: server.js not found anywhere in /app"
echo "Contents of current directory ($(pwd)):"
ls -la
echo "Contents of /app:"
ls -la /app || true
echo "Contents of /app/apps/upstream if it exists:"
ls -la /app/apps/upstream 2>/dev/null || true
exit 1
