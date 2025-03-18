. venv/bin/activate

kill -9 $(lsof -t -i:8000)
cd git_code_realestate
uvicorn main:app --host 0.0.0.0 --port 8000