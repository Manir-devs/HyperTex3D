#!/bin/bash

echo "[*] Setting up directories..."
mkdir -p build app

echo "[*] Compiling HyperTex3D..."
make

if [ $? -eq 0 ]; then
    echo "[+] Build Successful! Launching App..."
    ./app/hypertex3d
else
    echo "[-] Build Failed. Fix the errors above."
fi
