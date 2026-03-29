#include "hypertex.h"
#include <stdio.h>
#include <stdlib.h>

void ExportToPNG(const char* filename) {
    if (!grid) { return; }
    
    // As requested: Width = 16 * 16 (for layer by layer), Height = 16
    int imgWidth = gridSize * gridSize;
    int imgHeight = gridSize;
    
    Image exportImg = GenImageColor(imgWidth, imgHeight, BLANK);
    
    for (int z = 0; z < gridSize; z++) {
        for (int y = 0; y < gridSize; y++) {
            for (int x = 0; x < gridSize; x++) {
                int idx = GetIndex(x, y, z);
                if (grid[idx].active) {
                    int imgX = (z * gridSize) + x;
                    int imgY = (gridSize - 1) - y;
                    ImageDrawPixel(&exportImg, imgX, imgY, grid[idx].color);
                }
            }
        }
    }
    
    ExportImage(exportImg, filename);
    UnloadImage(exportImg);
    printf("[+] Exported Map %dx%d to %s!\n", imgWidth, imgHeight, filename);
}

void SaveProject(const char* filename) {
    FILE* file = fopen(filename, "wb");
    if (file && grid) {
        fwrite(&gridSize, sizeof(int), 1, file);
        fwrite(grid, sizeof(Voxel), gridSize * gridSize * gridSize, file);
        fclose(file);
    }
}

void LoadProject(const char* filename) {
    FILE* file = fopen(filename, "rb");
    if (file) {
        int newSize; 
        fread(&newSize, sizeof(int), 1, file); 
        InitEngine(newSize);
        fread(grid, sizeof(Voxel), gridSize * gridSize * gridSize, file);
        fclose(file); 
        UpdateCulling(); 
    }
}
