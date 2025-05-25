#!/bin/bash

# Path to package.json
PACKAGE_JSON="package.json"

# Check if package.json exists
if [ ! -f "$PACKAGE_JSON" ]; then
    echo "package.json not found"
    exit 1
fi

# Function to update packages
update_packages () {
    # Using sed to extract lines from one pattern to another
    sed -n "/$1/,/}/p" $PACKAGE_JSON | grep '": ".*"' | while read -r line
    do
        # Extract the package name
        package_name=$(echo $line | cut -d '"' -f 2)
        
        # # Skip updating eslint package
        # if [ "$package_name" == "eslint" ]; then
        #     echo "Skipping update for $package_name..."
        #     continue
        # fi
        
        echo "Updating $package_name to the latest version..."
        npm install "$package_name"@latest
    done
}

# Update dependencies and devDependencies
echo "Updating dependencies..."
update_packages "dependencies"

echo "Updating devDependencies..."
update_packages "devDependencies"

echo "All packages have been updated."

# Optionally, handle version control
git add package.json
git commit -m "update: node package dependencies"

# Run the git command below to safely `--force`` because it ensures that you do
# not overwrite any work on the remote branch that you haven't yet integrated 
# into your local branch. It checks if the remote branch has updated since your 
# last fetch, and if it has, the force push will be aborted.
# ```zsh
# git push origin <branch-name> --force-with-lease
# ```

# Check if a git command argument is provided
if [ "$1" ]; then
    eval "$1"
else
    git push
fi
