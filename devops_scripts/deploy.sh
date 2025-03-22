. venv/bin/activate

kill -9 $(lsof -t -i:8000)
cp .env git_code_realestate/.env

cd git_code_realestate

# Start the FastAPI backend
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > out.log 2>&1 &

# cd UI
# npm install
# npm run build
# npm run dev -- --host 0.0.0.0 --port 5173