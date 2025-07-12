#!/bin/bash

# Replace YOUR_USERNAME with your GitHub username
# Replace REPO_NAME with the repository name you created

echo "Enter your GitHub username:"
read GITHUB_USERNAME

echo "Enter your repository name:"
read REPO_NAME

# Add remote origin
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "Repository pushed to GitHub successfully!"