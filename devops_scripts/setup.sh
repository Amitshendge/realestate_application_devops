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

#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker not found, installing..."

    # Update package list
    echo "Updating package list..."
    sudo apt-get update -y

    # Install dependencies
    echo "Installing dependencies..."
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

    # Add Docker's official GPG key
    echo "Adding Docker's GPG key..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    # Add the Docker repository
    echo "Adding Docker repository..."
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    # Update package list again
    echo "Updating package list again..."
    sudo apt-get update -y

    # Install Docker
    echo "Installing Docker..."
    sudo apt-get install -y docker-ce

    # Start Docker service
    echo "Starting Docker..."
    sudo systemctl start docker

    # Enable Docker to start on boot
    echo "Enabling Docker to start on boot..."
    sudo systemctl enable docker

    # Verify installation
    echo "Verifying Docker installation..."
    sudo docker --version

    echo "Docker installation complete!"
else
    echo "Docker is already installed. Skipping installation."
fi

if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose not found. Installing..."

    # Install docker-compose
    sudo curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "docker-compose installed successfully."
else
    echo "docker-compose is already installed."
fi

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
    server_name onestrealestate.co www.onestrealestate.co;

    # Redirect HTTP to HTTPS only once
    return 301 https://onestrealestate.co$request_uri;
}

server {
    listen 443 ssl;
    server_name onestrealestate.co www.onestrealestate.co;

    root /home/deploy/git_code_realestate/UI/dist;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/onestrealestate.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/onestrealestate.co/privkey.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /auth/ {
        try_files $uri $uri/ /index.html;
    }
}


EOF
# Enable Nginx config
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration for syntax errors
sudo nginx -t && sudo systemctl restart nginx
# Restart Nginx
sudo systemctl restart nginx

# Open firewall for HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw reload

# Obtain SSL certificate (if not already obtained)
if ! sudo certbot certificates | grep -q $DOMAIN; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m Amitshendge1990@gmail.com
    sudo systemctl restart nginx
      echo "SSL certificate generated for $DOMAIN."
else
    echo "SSL certificate already exists for $DOMAIN, skipping certificate generation."
fi

echo "Deployment completed successfully!"

