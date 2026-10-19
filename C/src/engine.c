#include "hypertex.h"
#include "rlgl.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <math.h>

AppState appState = STATE_STARTUP;
AppState prevStateBeforeBackup = STATE_STARTUP;

int gridX = 32, gridY = 32, gridZ = 32;
char inputX[8] = "32", inputY[8] = "32", inputZ[8] = "32";
int activeStartupInput = 0;

Voxel* grid = NULL;
bool isCharacterMode = false;
int activePartFilter = 0;
bool partHidden[NUM_BODY_PARTS + 1] = { false };

Vector2 charPanelPos = { 1015.0f, 56.0f };
bool isDraggingCharPanel = false;
Vector2 charPanelDragOffset = { 0.0f, 0.0f };

bool showJointsOverlay = true;
bool smoothShading = true;
bool showWireframe = true;

const char* bodyPartNames[NUM_BODY_PARTS + 1] = {
    "SHOW ALL PARTS",
    "1. Head (16x16x16)",
    "2. Upper Torso",
    "3. Lower Torso",
    "4. L-Arm Upper",
    "5. L-Arm Lower",
    "6. R-Arm Upper",
    "7. R-Arm Lower",
    "8. L-Leg Upper",
    "9. L-Leg Lower",
    "10. R-Leg Upper",
    "11. R-Leg Lower"
};

JointInfo charJoints[NUM_JOINTS];

bool isMouseLocked = false;
bool showInventory = false;
bool showSlot4Palette = false;
float moveSpeed = 1.4f;
Vector2 cameraAngle = { 0.0f, 0.0f };

Tool currentTool = TOOL_BRUSH;
Color hotbar[10] = {
    BLANK,
    BLANK,
    (Color){0, 0, 0, 0},
    (Color){0, 210, 255, 255},
    (Color){42, 157, 143, 255},
    (Color){58, 134, 255, 255},
    (Color){255, 190, 11, 255},
    (Color){251, 86, 7, 255},
    (Color){131, 56, 236, 255},
    (Color){248, 249, 250, 255}
};
int selColorIdx = 3;
char hexInput[10] = "#00D2FFFF";
bool hexBoxActive = false;
int currentAlpha = 255;

float pickerHue = 190.0f;
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
bool showSaveAsPopup = false;
bool exportAsCharacterSkin = true; // Default to Minecraft UV Sheet & AI Rig Prompt
char exportFileName[128] = "minecraft_character";
char saveAsFileName[128] = "my_character";
char importFileName[128] = "";
bool isTypingPath = false;

double lastBackupTime = 0.0;
BackupEntry backupList[MAX_BACKUPS];
int backupCount = 0;
char statusMessage[128] = "Ready";
float statusTimer = 0.0f;

Image importImage = {0};
Texture2D importTexture = {0};
Rectangle importSelectRec = {0};
bool isImportDragging = false;
Vector2 importDragStart = {0};

char cropX[10] = "0", cropY[10] = "0", cropW[10] = "16", cropH[10] = "16";
int activeCropInput = 0;

void SetStatus(const char* msg) {
    strncpy(statusMessage, msg, 127);
    statusMessage[127] = '\0';
    statusTimer = 3.5f;
}

int GetIndex(int x, int y, int z) {
    return (z * gridX * gridY) + (y * gridX) + x;
}

bool InBounds(int x, int y, int z) {
    return (x >= 0 && x < gridX && y >= 0 && y < gridY && z >= 0 && z < gridZ);
}

bool IsPartVisible(unsigned char partId) {
    if (!isCharacterMode) return true;
    if (partId >= 1 && partId <= NUM_BODY_PARTS) {
        if (partHidden[partId]) return false;
    }
    if (activePartFilter != 0 && partId != activePartFilter) {
        return false;
    }
    return true;
}

void InitEngine(int sx, int sy, int sz) {
    if (sx < 4) sx = 4; if (sx > 128) sx = 128;
    if (sy < 4) sy = 4; if (sy > 128) sy = 128;
    if (sz < 4) sz = 4; if (sz > 128) sz = 128;

    gridX = sx; gridY = sy; gridZ = sz;
    sprintf(inputX, "%d", gridX);
    sprintf(inputY, "%d", gridY);
    sprintf(inputZ, "%d", gridZ);

    if (grid != NULL) {
        free(grid);
        grid = NULL;
    }

    size_t total = (size_t)gridX * gridY * gridZ;
    grid = (Voxel*)malloc(total * sizeof(Voxel));
    for (size_t i = 0; i < total; i++) {
        grid[i].active = false;
        grid[i].exposedMask = 0;
        grid[i].partId = 0;
        grid[i].color = BLANK;
    }
    isCharacterMode = false;
    activePartFilter = 0;
    for (int i = 0; i <= NUM_BODY_PARTS; i++) partHidden[i] = false;
}

static void FillBoxPart(int x1, int y1, int z1, int x2, int y2, int z2, unsigned char partId, Color baseCol) {
    for (int x = x1; x <= x2; x++) {
        for (int y = y1; y <= y2; y++) {
            for (int z = z1; z <= z2; z++) {
                if (InBounds(x, y, z)) {
                    int idx = GetIndex(x, y, z);
                    grid[idx].active = true;
                    grid[idx].partId = partId;
                    int checker = ((x + y + z) % 2 == 0) ? 6 : -6;
                    Color c = baseCol;
                    c.r = (unsigned char)fmin(255, fmax(0, (int)c.r + checker));
                    c.g = (unsigned char)fmin(255, fmax(0, (int)c.g + checker));
                    c.b = (unsigned char)fmin(255, fmax(0, (int)c.b + checker));
                    grid[idx].color = c;
                }
            }
        }
    }
}

void InitCharacterTemplate(void) {
    InitEngine(48, 72, 32);
    isCharacterMode = true;
    activePartFilter = 0;
    for (int i = 0; i <= NUM_BODY_PARTS; i++) partHidden[i] = false;

    // Legs (4 parts)
    FillBoxPart(16,  2, 12, 23, 13, 19, 9, (Color){45, 70, 150, 255});   // 9. L-Leg Lower
    FillBoxPart(16, 14, 12, 23, 25, 19, 8, (Color){55, 85, 175, 255});  // 8. L-Leg Upper
    FillBoxPart(24,  2, 12, 31, 13, 19, 11, (Color){45, 70, 150, 255});  // 11. R-Leg Lower
    FillBoxPart(24, 14, 12, 31, 25, 19, 10, (Color){55, 85, 175, 255}); // 10. R-Leg Upper

    // Torso (2 parts)
    FillBoxPart(16, 26, 12, 31, 37, 19, 3, (Color){0, 150, 165, 255});  // 3. Lower Torso
    FillBoxPart(16, 38, 12, 31, 49, 19, 2, (Color){0, 180, 195, 255});  // 2. Upper Torso

    // Arms (4 parts)
    FillBoxPart(8,  26, 12, 15, 37, 19, 5, (Color){225, 170, 135, 255}); // 5. L-Arm Lower
    FillBoxPart(8,  38, 12, 15, 49, 19, 4, (Color){0, 165, 180, 255});   // 4. L-Arm Upper
    FillBoxPart(32, 26, 12, 39, 37, 19, 7, (Color){225, 170, 135, 255}); // 7. R-Arm Lower
    FillBoxPart(32, 38, 12, 39, 49, 19, 6, (Color){0, 165, 180, 255});   // 6. R-Arm Upper

    // Head (16x16x16)
    FillBoxPart(16, 50, 8, 31, 65, 23, 1, (Color){235, 180, 145, 255});
    FillBoxPart(16, 61, 8, 31, 65, 23, 1, (Color){65, 40, 25, 255});     // Hair top
    FillBoxPart(16, 50, 8, 31, 65, 10, 1, (Color){65, 40, 25, 255});     // Hair back
    FillBoxPart(18, 56, 23, 19, 57, 23, 1, WHITE);                       // Left eye
    FillBoxPart(20, 56, 23, 21, 57, 23, 1, (Color){40, 60, 160, 255});
    FillBoxPart(26, 56, 23, 27, 57, 23, 1, (Color){40, 60, 160, 255});  // Right eye
    FillBoxPart(28, 56, 23, 29, 57, 23, 1, WHITE);

    // 9 Fully Structured Articulated Joints
    charJoints[0] = (JointInfo){ "neck_joint",       "1. Neck Joint",       (Vector3){24.0f, 50.0f, 16.0f}, 2,  1, (Vector3){0, 12, 0}, (Vector3){0, 0, 0} };
    charJoints[1] = (JointInfo){ "waist_joint",      "2. Waist Joint",      (Vector3){24.0f, 38.0f, 16.0f}, 2,  3, (Vector3){0, 0, 0},  (Vector3){0, 12, 0} };
    charJoints[2] = (JointInfo){ "l_shoulder_joint", "3. L-Shoulder Joint", (Vector3){16.0f, 48.0f, 16.0f}, 2,  4, (Vector3){-8, 10, 0}, (Vector3){4, 11, 0} };
    charJoints[3] = (JointInfo){ "l_elbow_joint",    "4. L-Elbow Joint",    (Vector3){12.0f, 38.0f, 16.0f}, 4,  5, (Vector3){0, 0, 0},  (Vector3){0, 12, 0} };
    charJoints[4] = (JointInfo){ "r_shoulder_joint", "5. R-Shoulder Joint", (Vector3){32.0f, 48.0f, 16.0f}, 2,  6, (Vector3){8, 10, 0},  (Vector3){-4, 11, 0} };
    charJoints[5] = (JointInfo){ "r_elbow_joint",    "6. R-Elbow Joint",    (Vector3){36.0f, 38.0f, 16.0f}, 6,  7, (Vector3){0, 0, 0},  (Vector3){0, 12, 0} };
    charJoints[6] = (JointInfo){ "l_hip_joint",      "7. L-Hip Joint",      (Vector3){20.0f, 26.0f, 16.0f}, 3,  8, (Vector3){-4, 0, 0}, (Vector3){0, 12, 0} };
    charJoints[7] = (JointInfo){ "l_knee_joint",     "8. L-Knee Joint",     (Vector3){20.0f, 14.0f, 16.0f}, 8,  9, (Vector3){0, 0, 0},  (Vector3){0, 12, 0} };
    charJoints[8] = (JointInfo){ "r_hip_joint",      "9. R-Hip Joint",      (Vector3){28.0f, 26.0f, 16.0f}, 3, 10, (Vector3){4, 0, 0},  (Vector3){0, 12, 0} };

    UpdateCulling();
    SetStatus("Character Loaded! Export supports 2D UV Skin Sheet + AI Rig Prompt.");
}

static bool IsOccluder(int x, int y, int z, unsigned char selfPart) {
    if (!InBounds(x, y, z)) return false;
    Voxel v = grid[GetIndex(x, y, z)];
    if (!v.active || v.color.a < 255) return false;
    if (!IsPartVisible(v.partId)) return false;
    if (isCharacterMode && v.partId != selfPart) return false;
    return true;
}

void UpdateCulling(void) {
    if (!grid) return;
    for (int z = 0; z < gridZ; z++) {
        for (int y = 0; y < gridY; y++) {
            for (int x = 0; x < gridX; x++) {
                int idx = GetIndex(x, y, z);
                if (!grid[idx].active || !IsPartVisible(grid[idx].partId)) {
                    grid[idx].exposedMask = 0;
                    continue;
                }
                unsigned char pid = grid[idx].partId;
                unsigned char mask = 0;
                if (!IsOccluder(x + 1, y, z, pid)) mask |= 1;  // +X
                if (!IsOccluder(x - 1, y, z, pid)) mask |= 2;  // -X
                if (!IsOccluder(x, y + 1, z, pid)) mask |= 4;  // +Y
                if (!IsOccluder(x, y - 1, z, pid)) mask |= 8;  // -Y
                if (!IsOccluder(x, y, z + 1, pid)) mask |= 16; // +Z
                if (!IsOccluder(x, y, z - 1, pid)) mask |= 32; // -Z
                grid[idx].exposedMask = mask;
            }
        }
    }
}

static Color ShadeColor(Color c, float factor) {
    if (!smoothShading) return c;
    return (Color){
        (unsigned char)fmin(255.0f, c.r * factor),
        (unsigned char)fmin(255.0f, c.g * factor),
        (unsigned char)fmin(255.0f, c.b * factor),
        c.a
    };
}

void DrawVoxelShaded(int x, int y, int z, Voxel v) {
    if (v.exposedMask == 0 || !IsPartVisible(v.partId)) return;

    Color base = v.color;
    if (base.a == 0) {
        DrawCubeWires((Vector3){ x + 0.5f, y + 0.5f, z + 0.5f }, 1.0f, 1.0f, 1.0f, Fade(RED, 0.4f));
        return;
    }

    float fx = (float)x, fy = (float)y, fz = (float)z;
    Color cTop    = ShadeColor(base, 1.05f);
    Color cBottom = ShadeColor(base, 0.52f);
    Color cFront  = ShadeColor(base, 0.92f);
    Color cBack   = ShadeColor(base, 0.78f);
    Color cRight  = ShadeColor(base, 0.84f);
    Color cLeft   = ShadeColor(base, 0.68f);

    rlBegin(RL_QUADS);
    if (v.exposedMask & 4) {
        rlColor4ub(cTop.r, cTop.g, cTop.b, cTop.a);
        rlVertex3f(fx,     fy + 1, fz);
        rlVertex3f(fx,     fy + 1, fz + 1);
        rlVertex3f(fx + 1, fy + 1, fz + 1);
        rlVertex3f(fx + 1, fy + 1, fz);
    }
    if (v.exposedMask & 8) {
        rlColor4ub(cBottom.r, cBottom.g, cBottom.b, cBottom.a);
        rlVertex3f(fx,     fy, fz);
        rlVertex3f(fx + 1, fy, fz);
        rlVertex3f(fx + 1, fy, fz + 1);
        rlVertex3f(fx,     fy, fz + 1);
    }
    if (v.exposedMask & 16) {
        rlColor4ub(cFront.r, cFront.g, cFront.b, cFront.a);
        rlVertex3f(fx,     fy,     fz + 1);
        rlVertex3f(fx + 1, fy,     fz + 1);
        rlVertex3f(fx + 1, fy + 1, fz + 1);
        rlVertex3f(fx,     fy + 1, fz + 1);
    }
    if (v.exposedMask & 32) {
        rlColor4ub(cBack.r, cBack.g, cBack.b, cBack.a);
        rlVertex3f(fx + 1, fy,     fz);
        rlVertex3f(fx,     fy,     fz);
        rlVertex3f(fx,     fy + 1, fz);
        rlVertex3f(fx + 1, fy + 1, fz);
    }
    if (v.exposedMask & 1) {
        rlColor4ub(cRight.r, cRight.g, cRight.b, cRight.a);
        rlVertex3f(fx + 1, fy,     fz + 1);
        rlVertex3f(fx + 1, fy,     fz);
        rlVertex3f(fx + 1, fy + 1, fz);
        rlVertex3f(fx + 1, fy + 1, fz + 1);
    }
    if (v.exposedMask & 2) {
        rlColor4ub(cLeft.r, cLeft.g, cLeft.b, cLeft.a);
        rlVertex3f(fx, fy,     fz);
        rlVertex3f(fx, fy,     fz + 1);
        rlVertex3f(fx, fy + 1, fz + 1);
        rlVertex3f(fx, fy + 1, fz);
    }
    rlEnd();

    if (showWireframe) {
        DrawCubeWires((Vector3){ fx + 0.5f, fy + 0.5f, fz + 0.5f }, 1.0f, 1.0f, 1.0f, ColorAlpha(BLACK, 0.22f));
    }
}

void CopySelection(bool deleteOriginal) {
    if (clipboard != NULL) { free(clipboard); clipboard = NULL; }
    int minX = fmin(selStart.x, selEnd.x), maxX = fmax(selStart.x, selEnd.x);
    int minY = fmin(selStart.y, selEnd.y), maxY = fmax(selStart.y, selEnd.y);
    int minZ = fmin(selStart.z, selEnd.z), maxZ = fmax(selStart.z, selEnd.z);

    clipSize = (Vector3){ maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1 };
    clipCount = 0;

    for (int x = minX; x <= maxX; x++) {
        for (int y = minY; y <= maxY; y++) {
            for (int z = minZ; z <= maxZ; z++) {
                if (InBounds(x, y, z)) {
                    Voxel v = grid[GetIndex(x, y, z)];
                    if (v.active && IsPartVisible(v.partId)) clipCount++;
                }
            }
        }
    }

    if (clipCount == 0) return;

    clipboard = (ClipVoxel*)malloc(clipCount * sizeof(ClipVoxel));
    int i = 0;
    for (int x = minX; x <= maxX; x++) {
        for (int y = minY; y <= maxY; y++) {
            for (int z = minZ; z <= maxZ; z++) {
                if (InBounds(x, y, z)) {
                    int idx = GetIndex(x, y, z);
                    if (grid[idx].active && IsPartVisible(grid[idx].partId)) {
                        clipboard[i].dx = x - minX;
                        clipboard[i].dy = y - minY;
                        clipboard[i].dz = z - minZ;
                        clipboard[i].partId = grid[idx].partId;
                        clipboard[i].color = grid[idx].color;
                        if (deleteOriginal) grid[idx].active = false;
                        i++;
                    }
                }
            }
        }
    }
    if (deleteOriginal) UpdateCulling();
}

void CreateClipboardFromImage(void) {
    if (clipboard != NULL) { free(clipboard); clipboard = NULL; }
    clipCount = 0;
    int sX = (int)importSelectRec.x, sY = (int)importSelectRec.y;
    int rw = (int)importSelectRec.width, rh = (int)importSelectRec.height;

    if (sX < 0) sX = 0;
    if (sY < 0) sY = 0;
    if (sX + rw > importImage.width) rw = importImage.width - sX;
    if (sY + rh > importImage.height) rh = importImage.height - sY;

    for (int y = 0; y < rh; y++) {
        for (int x = 0; x < rw; x++) {
            Color c = GetImageColor(importImage, sX + x, sY + y);
            if (c.a > 0) clipCount++;
        }
    }
    if (clipCount == 0) return;

    clipboard = (ClipVoxel*)malloc(clipCount * sizeof(ClipVoxel));
    clipSize = (Vector3){ rw, rh, 1 };

    int i = 0;
    for (int y = 0; y < rh; y++) {
        for (int x = 0; x < rw; x++) {
            Color c = GetImageColor(importImage, sX + x, sY + y);
            if (c.a > 0) {
                clipboard[i].dx = x;
                clipboard[i].dy = (rh - 1 - y);
                clipboard[i].dz = 0;
                clipboard[i].partId = (activePartFilter > 0) ? activePartFilter : 1;
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
    for (int x = minX; x <= maxX; x++) {
        for (int y = minY; y <= maxY; y++) {
            for (int z = minZ; z <= maxZ; z++) {
                if (InBounds(x, y, z)) {
                    int idx = GetIndex(x, y, z);
                    if (IsPartVisible(grid[idx].partId)) grid[idx].active = false;
                }
            }
        }
    }
    UpdateCulling();
}

void RotateClipboardY(void) {
    if (!clipboard || clipCount == 0) return;
    float newWidth = clipSize.z;
    float newDepth = clipSize.x;
    for (int i = 0; i < clipCount; i++) {
        int oldX = clipboard[i].dx;
        int oldZ = clipboard[i].dz;
        clipboard[i].dx = (int)(newWidth - 1) - oldZ;
        clipboard[i].dz = oldX;
    }
    clipSize.x = newWidth;
    clipSize.z = newDepth;
}

void CommitPaste(void) {
    if (!clipboard) return;
    for (int i = 0; i < clipCount; i++) {
        int wX = (int)pastePos.x + clipboard[i].dx;
        int wY = (int)pastePos.y + clipboard[i].dy;
        int wZ = (int)pastePos.z + clipboard[i].dz;
        if (InBounds(wX, wY, wZ)) {
            int idx = GetIndex(wX, wY, wZ);
            grid[idx].active = true;
            grid[idx].partId = (activePartFilter > 0) ? activePartFilter : clipboard[i].partId;
            grid[idx].color = clipboard[i].color;
        }
    }
    UpdateCulling();
}

void ApplyTool(int sX, int sY, int sZ, int eX, int eY, int eZ, Tool tool, Color c) {
    unsigned char targetPart = (activePartFilter > 0) ? activePartFilter : (isCharacterMode ? 1 : 0);

    if (tool == TOOL_LINE) {
        float dx = eX - sX, dy = eY - sY, dz = eZ - sZ;
        float steps = fmax(fabs(dx), fmax(fabs(dy), fabs(dz)));
        for (int i = 0; i <= steps; i++) {
            float t = (steps == 0) ? 0.0f : (float)i / steps;
            int x = round(sX + t * dx), y = round(sY + t * dy), z = round(sZ + t * dz);
            if (InBounds(x, y, z)) {
                int idx = GetIndex(x, y, z);
                grid[idx].active = true;
                grid[idx].partId = targetPart;
                grid[idx].color = c;
            }
        }
    } else {
        int minX = fmin(sX, eX), maxX = fmax(sX, eX);
        int minY = fmin(sY, eY), maxY = fmax(sY, eY);
        int minZ = fmin(sZ, eZ), maxZ = fmax(sZ, eZ);

        for (int x = minX; x <= maxX; x++) {
            for (int y = minY; y <= maxY; y++) {
                for (int z = minZ; z <= maxZ; z++) {
                    if (!InBounds(x, y, z)) continue;
                    int idx = GetIndex(x, y, z);
                    if (tool == TOOL_RECT_2D) {
                        if (y != sY) continue;
                        if (x == minX || x == maxX || z == minZ || z == maxZ) {
                            grid[idx].active = true;
                            grid[idx].partId = targetPart;
                            grid[idx].color = c;
                        }
                    } else if (tool == TOOL_BRUSH) {
                        grid[idx].active = true;
                        grid[idx].partId = targetPart;
                        grid[idx].color = c;
                    }
                }
            }
        }
    }
    UpdateCulling();
}
