. venv/bin/activate

kill -9 $(lsof -t -i:8000)

nohup uvicorn git_code_realestate/main:app --host 0.0.0.0 --port 8000 > fastapi.log 2>&1 &