#!/bin/bash
# Script to update nginx configuration for the leaderboard route

set -e

echo "Updating nginx configuration for /score route..."

# Backup current config
sudo cp /etc/nginx/sites-available/avurudhu.artslabcreatives.com /etc/nginx/sites-available/avurudhu.artslabcreatives.com.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backup created"

# Copy new config
sudo cp /var/www/avu-bitharay/nginx-site.conf /etc/nginx/sites-available/avurudhu.artslabcreatives.com
echo "✓ New config copied"

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# Reload nginx if test passes
if [ $? -eq 0 ]; then
    echo "✓ Configuration valid, reloading nginx..."
    sudo systemctl reload nginx
    echo "✓ Nginx reloaded successfully"
    echo ""
    echo "The /score route is now available!"
else
    echo "✗ Configuration test failed. Restoring backup..."
    sudo cp /etc/nginx/sites-available/avurudhu.artslabcreatives.com.backup.* /etc/nginx/sites-available/avurudhu.artslabcreatives.com
    exit 1
fi
