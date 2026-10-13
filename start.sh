#!/usr/bin/env bash
echo "============================================================"
echo "Starting StudySphere AI — Backend & Frontend Services"
echo "============================================================"

# Detect python
if [ -f "./backend/.venv/bin/python" ]; then
    PYTHON_BIN="./backend/.venv/bin/python"
elif [ -f "./backend/.venv/Scripts/python.exe" ]; then
    PYTHON_BIN="./backend/.venv/Scripts/python.exe"
else
    PYTHON_BIN="python3"
fi

export PYTHONPATH="backend"

echo "Launching FastAPI backend on http://localhost:8000..."
$PYTHON_BIN -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Launching Vite frontend on http://localhost:3000..."
node ./node_modules/vite/bin/vite.js --port=3000 --host=0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "Both services launched:"
echo "  - Frontend UI:  http://localhost:3000"
echo "  - API Backend:  http://localhost:8000"
echo "  - OpenAPI Docs: http://localhost:8000/docs"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
