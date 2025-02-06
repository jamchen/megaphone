#!/bin/bash

# Get the current date
CURRENT_DATE=$(date +"%Y-%m-%d")

# Define the output directories with the current date
ELECTRON_BUILD_DIR="/Users/jamchen/Developer/code/megaphone-electron/dist/electron"
OUTPUT_DIR="/Users/jamchen/Developer/code/megaphone-electron/dist/packaged"
DARWIN_ARM64_DIR="$OUTPUT_DIR/民眾大聲公-macOS-Apple-chip-$CURRENT_DATE"
DARWIN_X64_DIR="$OUTPUT_DIR/民眾大聲公-macOS-Intel-chip-$CURRENT_DATE"
WIN32_X64_DIR="$OUTPUT_DIR/民眾大聲公-win32-x64-$CURRENT_DATE"

# Create the output directories if they don't exist
mkdir -p "$OUTPUT_DIR"

# Remove output directies if it exists
echo "Removing existing directories..."
if [ -d "$DARWIN_ARM64_DIR" ]; then
  rm -rf "$DARWIN_ARM64_DIR"
fi
if [ -d "$DARWIN_X64_DIR" ]; then
  rm -rf "$DARWIN_X64_DIR"
fi
if [ -d "$WIN32_X64_DIR" ]; then
  rm -rf "$WIN32_X64_DIR"
fi

# Build for darwin arm64
# if [ -d "$ELECTRON_BUILD_DIR" ]; then
#   rm -rf "$ELECTRON_BUILD_DIR"
# fi
echo "Building for darwin arm64..."
time quasar build -m electron -T darwin -A arm64
mkdir -p "$DARWIN_ARM64_DIR"
mv dist/electron/Packaged/民眾大聲公-darwin-arm64 "$DARWIN_ARM64_DIR"
time zip -qdgds 100m -r "$DARWIN_ARM64_DIR.zip" "$DARWIN_ARM64_DIR"
rm -rf "$DARWIN_ARM64_DIR"

# Build for darwin x64
# if [ -d "$ELECTRON_BUILD_DIR" ]; then
#   rm -rf "$ELECTRON_BUILD_DIR"
# fi
echo "Building for darwin x64..."
time quasar build -m electron -T darwin -A x64
mkdir -p "$DARWIN_X64_DIR"
mv dist/electron/Packaged/民眾大聲公-darwin-x64 "$DARWIN_X64_DIR"
time zip -qdgds 100m -r "$DARWIN_X64_DIR.zip" "$DARWIN_X64_DIR"
rm -rf "$DARWIN_X64_DIR"

# Build for win32 x64
# if [ -d "$ELECTRON_BUILD_DIR" ]; then
#   rm -rf "$ELECTRON_BUILD_DIR"
# fi
echo "Building for win32 x64..."
time quasar build -m electron -T win32 -A x64
mkdir -p "$WIN32_X64_DIR"
mv dist/electron/Packaged/民眾大聲公-win32-x64 "$WIN32_X64_DIR"
time zip -qdgds 100m -r "$WIN32_X64_DIR.zip" "$WIN32_X64_DIR"
rm -rf "$WIN32_X64_DIR"

echo "Builds completed and moved to respective directories."
