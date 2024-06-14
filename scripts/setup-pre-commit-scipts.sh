#!/bin/sh

# Define the file path
HOOK_FILE="../.git/hooks/pre-push"

# Define the content of the hook
HOOK_CONTENT='#!/bin/sh

# Run ESLint
echo "Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
  echo "ESLint failed, aborting push."
  exit 1
fi

echo "ESLint passed, pushing changes."
exit 0'

# Create the hooks directory if it doesn't exist
mkdir -p "$(dirname "$HOOK_FILE")"

# Write the content to the file
echo "$HOOK_CONTENT" > "$HOOK_FILE"

# Make the file executable
chmod +x "$HOOK_FILE"

echo "pre-push hook created successfully."
