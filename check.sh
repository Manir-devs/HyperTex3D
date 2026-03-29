#!/bin/bash
# File: check_deps.sh
# Location: HyperTex3D/check_deps.sh
# Usage: chmod +x check_deps.sh && ./check_deps.sh

echo "[*] Checking system dependencies for HyperTex3D Engine..."

PACKAGES=("build-essential" "gcc" "make" "cmake" "git" "libasound2-dev" "mesa-common-dev" "libx11-dev" "libxrandr-dev" "libxi-dev" "xorg-dev" "libgl1-mesa-dev" "libglu1-mesa-dev")
MISSING=0

for pkg in "${PACKAGES[@]}"; do
    if dpkg -s "$pkg" >/dev/null 2>&1; then
        echo -e "[✔] $pkg is installed."
    else
        echo -e "[❌] $pkg is MISSING!"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    echo -e "\n[-] You have missing packages. Run this command to install them:"
    echo "sudo apt update && sudo apt install build-essential gcc make cmake git libasound2-dev mesa-common-dev libx11-dev libxrandr-dev libxi-dev xorg-dev libgl1-mesa-dev libglu1-mesa-dev"
else
    echo -e "\n[+] All dependencies are installed! You are ready to compile."
fi
