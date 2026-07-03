#!/bin/sh
set -e

echo "Starting application..."
exec node apps/upstream/server.js