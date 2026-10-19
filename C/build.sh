#!/bin/bash

echo "[*] Setting up directories..."
mkdir -p build app app/backups

echo "[*] Cleaning old object files & Compiling HyperTex3D Ultimate..."
make clean
make

if [ $? -eq 0 ]; then
    echo "[+] Build Successful! Launching App..."
    ./app/hypertex3d
else
    echo "[-] Build Failed. Fix the errors above."
fi
