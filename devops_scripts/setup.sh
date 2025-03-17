#!/bin/bash

# Update package lists
sudo apt update

# Install Python and virtual environment support
sudo apt install -y python3
ls
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
. venv/bin/activate

# Upgrade pip to the latest version
pip install --upgrade pip

# Install dependencies from requirements.txt (if exists)
if [ -f git_code/requirements.txt ]; then
   pip install -r git_code/requirements.txt
else
   echo "requirements.txt not found, skipping dependency installation."
fi

echo "Python setup complete. Virtual environment is ready."
