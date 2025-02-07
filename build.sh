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

# Remove output directories if they exist
echo "Removing existing directories..."
rm -rf "$DARWIN_ARM64_DIR" "$DARWIN_X64_DIR" "$WIN32_X64_DIR"

build_and_package() {
  local PLATFORM=$1
  local ARCH=$2
  local OUTPUT_DIR=$3

  echo "Building for $PLATFORM $ARCH..."
  time quasar build -m electron -T $PLATFORM -A $ARCH
  mkdir -p "$OUTPUT_DIR"
  mv dist/electron/Packaged/民眾大聲公-$PLATFORM-$ARCH/* "$OUTPUT_DIR"
  cd "$OUTPUT_DIR/.."
  ditto -c -k --keepParent "./$(basename "$OUTPUT_DIR")" "./$(basename "$OUTPUT_DIR").zip"
  cd -
}

build_and_package darwin arm64 "$DARWIN_ARM64_DIR"
build_and_package darwin x64 "$DARWIN_X64_DIR"
build_and_package win32 x64 "$WIN32_X64_DIR"

echo "Builds completed and moved to respective directories."
