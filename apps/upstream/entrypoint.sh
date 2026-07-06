#!/bin/sh
set -e

echo "Starting Upstream Server..."
exec node apps/upstream/server.js