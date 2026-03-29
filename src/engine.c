#include "hypertex.h"
#include <stdlib.h>
#include <math.h>

AppState appState = STATE_STARTUP;
int gridSize = 16;
Voxel* grid = NULL;
bool isMouseLocked = false;
bool showInventory = false;
float moveSpeed = 1.0f;
Vector2 cameraAngle = { 0.0f, 0.0f };

Tool currentTool = TOOL_BRUSH;
Color hotbar[10] = { BLANK, BLANK, (Color){0,0,0,0}, RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, WHITE }; 
int selColorIdx = 3; 
char hexInput[10] = "#FFFFFFFF";
bool hexBoxActive = false;
int currentAlpha = 255;

float pickerHue = 0.0f;
Vector2 pickerSV = { 1.0f, 1.0f };

int hpState = 0;
int hpPos = 0;
int activeGizmo = 0;

bool showSelectPopup = false;
bool showToolsPopup = false;
Vector3 selStart = {0}, selEnd = {0};
ClipVoxel* clipboard = NULL;
int clipCount = 0;
Vector3 clipSize = {0};
bool isPasting = false;
int pasteMode = 0; 
Vector3 pastePos = {0};

bool showFileMenu = false;
bool showExportPopup = false;
char exportFileName[128] = "my_texture";
char importFileName[128] = "";
bool isTypingPath = false;

Image importImage = {0};
Texture2D importTexture = {0};
Rectangle importSelectRec = {0};
bool isImportDragging = false;
Vector2 importDragStart = {0};

char cropX[10] = "0", cropY[10] = "0", cropW[10] = "16", cropH[10] = "16";
int activeCropInput = 0;

void InitEngine(int size) {
    gridSize = size;
    if (grid != NULL) { free(grid); }
    grid = (Voxel*)malloc(gridSize * gridSize * gridSize * sizeof(Voxel));
    for (int i = 0; i < gridSize * gridSize * gridSize; i++) {
        grid[i].active = false; grid[i].exposed = false; grid[i].color = BLANK;
    }
}

int GetIndex(int x, int y, int z) { return (z * gridSize * gridSize) + (y * gridSize) + x; }
bool InBounds(int x, int y, int z) { return (x >= 0 && x < gridSize && y >= 0 && y < gridSize && z >= 0 && z < gridSize); }
bool IsSolid(int x, int y, int z) { 
    if (!InBounds(x, y, z)) { return false; }
    return grid[GetIndex(x,y,z)].active && grid[GetIndex(x,y,z)].color.a == 255; 
}

void UpdateCulling(void) {
    for (int x = 0; x < gridSize; x++) {
        for (int y = 0; y < gridSize; y++) {
            for (int z = 0; z < gridSize; z++) {
                int idx = GetIndex(x, y, z);
                if (!grid[idx].active) { grid[idx].exposed = false; continue; }
                
                if (x == 0 || x == gridSize - 1 || y == 0 || y == gridSize - 1 || z == 0 || z == gridSize - 1) { 
                    grid[idx].exposed = true; 
                } else {
                    if (!IsSolid(x-1,y,z) || !IsSolid(x+1,y,z) || !IsSolid(x,y-1,z) || !IsSolid(x,y+1,z) || !IsSolid(x,y,z-1) || !IsSolid(x,y,z+1)) {
                        grid[idx].exposed = true;
                    } else { grid[idx].exposed = false; }
                }
            }
        }
    }
}

void CopySelection(bool deleteOriginal) {
    if (clipboard != NULL) { free(clipboard); clipboard = NULL; }
    int minX = fmin(selStart.x, selEnd.x), maxX = fmax(selStart.x, selEnd.x);
    int minY = fmin(selStart.y, selEnd.y), maxY = fmax(selStart.y, selEnd.y);
    int minZ = fmin(selStart.z, selEnd.z), maxZ = fmax(selStart.z, selEnd.z);
    
    clipSize = (Vector3){ maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1 };
    clipCount = 0;
    
    for (int x=minX; x<=maxX; x++) {
        for (int y=minY; y<=maxY; y++) {
            for (int z=minZ; z<=maxZ; z++) { 
                if (grid[GetIndex(x,y,z)].active) { clipCount++; }
            }
        }
    }
    
    if (clipCount == 0) return;

    clipboard = (ClipVoxel*)malloc(clipCount * sizeof(ClipVoxel));
    int i = 0;
    for (int x=minX; x<=maxX; x++) {
        for (int y=minY; y<=maxY; y++) {
            for (int z=minZ; z<=maxZ; z++) {
                if (grid[GetIndex(x,y,z)].active) {
                    clipboard[i].dx = x - minX; clipboard[i].dy = y - minY; clipboard[i].dz = z - minZ;
                    clipboard[i].color = grid[GetIndex(x,y,z)].color;
                    if (deleteOriginal) { grid[GetIndex(x,y,z)].active = false; }
                    i++;
                }
            }
        }
    }
    if (deleteOriginal) { UpdateCulling(); }
}

void CreateClipboardFromImage(void) {
    if (clipboard != NULL) { free(clipboard); clipboard = NULL; }
    clipCount = 0;
    int sX = (int)importSelectRec.x; int sY = (int)importSelectRec.y;
    int rw = (int)importSelectRec.width; int rh = (int)importSelectRec.height;

    if (sX < 0) { sX = 0; } if (sY < 0) { sY = 0; }
    if (sX + rw > importImage.width) { rw = importImage.width - sX; }
    if (sY + rh > importImage.height) { rh = importImage.height - sY; }

    for (int y = 0; y < rh; y++) {
        for (int x = 0; x < rw; x++) {
            Color c = GetImageColor(importImage, sX + x, sY + y);
            if (c.a > 0) { clipCount++; }
        }
    }
    if (clipCount == 0) return;
    
    clipboard = (ClipVoxel*)malloc(clipCount * sizeof(ClipVoxel));
    clipSize = (Vector3){rw, rh, 1}; 
    
    int i = 0;
    for (int y = 0; y < rh; y++) {
        for (int x = 0; x < rw; x++) {
            Color c = GetImageColor(importImage, sX + x, sY + y);
            if (c.a > 0) {
                clipboard[i].dx = x;
                clipboard[i].dy = (rh - 1 - y); // Flip Y for 3D space
                clipboard[i].dz = 0;
                clipboard[i].color = c;
                i++;
            }
        }
    }
}

void DeleteSelection(void) {
    int minX = fmin(selStart.x, selEnd.x), maxX = fmax(selStart.x, selEnd.x);
    int minY = fmin(selStart.y, selEnd.y), maxY = fmax(selStart.y, selEnd.y);
    int minZ = fmin(selStart.z, selEnd.z), maxZ = fmax(selStart.z, selEnd.z);
    for (int x=minX; x<=maxX; x++) {
        for (int y=minY; y<=maxY; y++) {
            for (int z=minZ; z<=maxZ; z++) { grid[GetIndex(x,y,z)].active = false; }
        }
    }
    UpdateCulling();
}

void RotateClipboardY(void) {
    if (!clipboard || clipCount == 0) return;
    float newWidth = clipSize.z; float newDepth = clipSize.x;
    for (int i = 0; i < clipCount; i++) { 
        int oldX = clipboard[i].dx; int oldZ = clipboard[i].dz; 
        clipboard[i].dx = (newWidth - 1) - oldZ; clipboard[i].dz = oldX; 
    }
    clipSize.x = newWidth; clipSize.z = newDepth;
}

void CommitPaste(void) {
    if (!clipboard) return;
    for (int i = 0; i < clipCount; i++) {
        int wX = pastePos.x + clipboard[i].dx;
        int wY = pastePos.y + clipboard[i].dy;
        int wZ = pastePos.z + clipboard[i].dz;
        if (InBounds(wX, wY, wZ)) { 
            grid[GetIndex(wX,wY,wZ)].active = true; 
            grid[GetIndex(wX,wY,wZ)].color = clipboard[i].color; 
        }
    }
    UpdateCulling();
}

void ApplyTool(int sX, int sY, int sZ, int eX, int eY, int eZ, Tool tool, Color c) {
    if (tool == TOOL_LINE) {
        float dx = eX - sX, dy = eY - sY, dz = eZ - sZ; 
        float steps = fmax(fabs(dx), fmax(fabs(dy), fabs(dz)));
        for (int i = 0; i <= steps; i++) {
            float t = (steps == 0) ? 0.0f : (float)i / steps;
            int x = round(sX + t * dx), y = round(sY + t * dy), z = round(sZ + t * dz);
            if (InBounds(x,y,z)) { grid[GetIndex(x,y,z)].active = true; grid[GetIndex(x,y,z)].color = c; }
        }
    } else {
        int minX = fmin(sX, eX), maxX = fmax(sX, eX);
        int minY = fmin(sY, eY), maxY = fmax(sY, eY);
        int minZ = fmin(sZ, eZ), maxZ = fmax(sZ, eZ);
        
        for (int x = minX; x <= maxX; x++) {
            for (int y = minY; y <= maxY; y++) {
                for (int z = minZ; z <= maxZ; z++) {
                    if (!InBounds(x, y, z)) { continue; }
                    int idx = GetIndex(x, y, z);
                    
                    if (tool == TOOL_RECT_2D) { 
                        if (y != sY) { continue; }
                        if (x == minX || x == maxX || z == minZ || z == maxZ) { grid[idx].active = true; grid[idx].color = c; } 
                    } else if (tool == TOOL_BRUSH) { 
                        grid[idx].active = true; grid[idx].color = c; 
                    }
                }
            }
        }
    }
    UpdateCulling();
}
