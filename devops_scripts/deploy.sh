. venv/bin/activate

kill -9 $(lsof -t -i:8000)
cd git_code_realestate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > fastapi.log 2>&1 &