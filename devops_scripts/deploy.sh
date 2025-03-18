. venv/bin/activate

kill -9 $(lsof -t -i:8500)
cd git_code_realestate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > out.log 2>&1 &

cd UI
npm install
npm run build
# npm run dev -- --host 0.0.0.0 --port 5173