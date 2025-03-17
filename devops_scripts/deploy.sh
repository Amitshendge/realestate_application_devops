. venv/bin/activate

kill -9 $(lsof -t -i:8500)

nohup streamlit run git_code/app.py --server.port 8500 --server.address 0.0.0.0 > nohup2.out 2>&1 &
