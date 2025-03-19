#!/bin/bash

# Update package lists
sudo apt update

# Install Python and virtual environment support
sudo apt install -y python3
sudo apt install -y python3.12-venv
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
. venv/bin/activate

# Upgrade pip to the latest version
pip install --upgrade pip

# Install dependencies from requirements.txt (if exists)
if [ -f git_code_realestate/requirements.txt ]; then
   pip install -r git_code_realestate/requirements.txt
else
   echo "requirements.txt not found, skipping dependency installation."
fi

echo "Python setup complete. Virtual environment is ready."

# UI Setup
# Install Nginx
sudo apt update && sudo apt install nginx -y

# Remove the default Nginx configuration
sudo rm /etc/nginx/sites-enabled/default


# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
# Check Node.js and npm versions
node -v
npm -v

# allow traffic on port 5173 for the UI
sudo ufw allow 5173
sudo ufw enable

set -e

# Variables
APP_DIR="git_code_realestate/UI" # Change this to your project path
DOMAIN="onestrealestate.co" # Change this to your actual domain

echo "Starting deployment..."

# Update and install required packages
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Navigate to project directory
cd $APP_DIR

# Install dependencies and build React app
npm install
npm run build

# Ensure Nginx is installed and configured
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location = $APP_DIR/favicon.ico {
        log_not_found off;
        access_log off;
    }

    error_page 404 /index.html;
}
EOF

# Enable Nginx config
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx

# Open firewall for HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Obtain SSL certificate (if not already obtained)
if ! sudo certbot certificates | grep -q $DOMAIN; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m Amitshendge1990@gmail.com
    sudo systemctl restart nginx
fi

echo "Deployment completed successfully!"

