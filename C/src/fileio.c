#include "hypertex.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/stat.h>

#define HT3D_MAGIC 0x32565448 // "HTV2"

// Helper to paint a 3D box unwrapped to standard 2D layout
// Box dimensions: dx, dy, dz
// Layout inside canvas at (dstX, dstY):
//   Row 1: [Top (dx*dz)] [Bottom (dx*dz)]
//   Row 2: [Right (dz*dy)] [Front (dx*dy)] [Left (dz*dy)] [Back (dx*dy)]
static void UnwrapBoxPartToImage(Image* img, int minX, int minY, int minZ, int dx, int dy, int dz, int dstX, int dstY) {
    // 1. Top face (+Y): x in 0..dx-1, z in 0..dz-1
    for (int x = 0; x < dx; x++) {
        for (int z = 0; z < dz; z++) {
            int gx = minX + x, gy = minY + dy - 1, gz = minZ + z;
            if (InBounds(gx, gy, gz)) {
                Voxel v = grid[GetIndex(gx, gy, gz)];
                if (v.active && v.color.a > 0) {
                    ImageDrawPixel(img, dstX + dz + x, dstY + z, v.color);
                }
            }
        }
    }

    // 2. Bottom face (-Y)
    for (int x = 0; x < dx; x++) {
        for (int z = 0; z < dz; z++) {
            int gx = minX + x, gy = minY, gz = minZ + z;
            if (InBounds(gx, gy, gz)) {
                Voxel v = grid[GetIndex(gx, gy, gz)];
                if (v.active && v.color.a > 0) {
                    ImageDrawPixel(img, dstX + dz + dx + x, dstY + z, v.color);
                }
            }
        }
    }

    // 3. Right face (+X): z in 0..dz-1, y in 0..dy-1
    for (int z = 0; z < dz; z++) {
        for (int y = 0; y < dy; y++) {
            int gx = minX + dx - 1, gy = minY + (dy - 1 - y), gz = minZ + (dz - 1 - z);
            if (InBounds(gx, gy, gz)) {
                Voxel v = grid[GetIndex(gx, gy, gz)];
                if (v.active && v.color.a > 0) {
                    ImageDrawPixel(img, dstX + z, dstY + dz + y, v.color);
                }
            }
        }
    }

    // 4. Front face (+Z): x in 0..dx-1, y in 0..dy-1
    for (int x = 0; x < dx; x++) {
        for (int y = 0; y < dy; y++) {
            int gx = minX + x, gy = minY + (dy - 1 - y), gz = minZ + dz - 1;
            if (InBounds(gx, gy, gz)) {
                Voxel v = grid[GetIndex(gx, gy, gz)];
                if (v.active && v.color.a > 0) {
                    ImageDrawPixel(img, dstX + dz + x, dstY + dz + y, v.color);
                }
            }
        }
    }

    // 5. Left face (-X)
    for (int z = 0; z < dz; z++) {
        for (int y = 0; y < dy; y++) {
            int gx = minX, gy = minY + (dy - 1 - y), gz = minZ + z;
            if (InBounds(gx, gy, gz)) {
                Voxel v = grid[GetIndex(gx, gy, gz)];
                if (v.active && v.color.a > 0) {
                    ImageDrawPixel(img, dstX + dz + dx + z, dstY + dz + y, v.color);
                }
            }
        }
    }

    // 6. Back face (-Z)
    for (int x = 0; x < dx; x++) {
        for (int y = 0; y < dy; y++) {
            int gx = minX + (dx - 1 - x), gy = minY + (dy - 1 - y), gz = minZ;
            if (InBounds(gx, gy, gz)) {
                Voxel v = grid[GetIndex(gx, gy, gz)];
                if (v.active && v.color.a > 0) {
                    ImageDrawPixel(img, dstX + dz + dx + dz + x, dstY + dz + y, v.color);
                }
            }
        }
    }
}

// Exports proper structured Minecraft / 4D Miner style UV texture sheet
// along with a ready-to-use AI Prompt file and Rig JSON definition!
void ExportCharacterSkinSheet(const char* baseFilename) {
    if (!grid) return;

    // Standard high-res character texture sheet (128x128 pixels)
    int sheetW = 128;
    int sheetH = 128;
    Image sheet = GenImageColor(sheetW, sheetH, BLANK);

    // Bounding definitions for all 11 pieces
    PartLayoutInfo layouts[11] = {
        // Part 1: Head (16x16x16) -> Net size: (16+16+16+16)=64 wide, (16+16)=32 tall
        { 1, "Head",               16, 50,  8, 16, 16, 16,  0,  0, 64, 32 },
        // Part 2: Upper Torso (16x12x8) -> Net size: (8+16+8+16)=48 wide, (8+12)=20 tall
        { 2, "Upper_Torso",        16, 38, 12, 16, 12,  8, 64,  0, 48, 20 },
        // Part 3: Lower Torso (16x12x8)
        { 3, "Lower_Torso",        16, 26, 12, 16, 12,  8, 64, 22, 48, 20 },
        // Part 4: Left Arm Upper (8x12x8) -> Net size: (8+8+8+8)=32 wide, (8+12)=20 tall
        { 4, "L_Arm_Upper",         8, 38, 12,  8, 12,  8,  0, 36, 32, 20 },
        // Part 5: Left Arm Lower (8x12x8)
        { 5, "L_Arm_Lower",         8, 26, 12,  8, 12,  8, 34, 36, 32, 20 },
        // Part 6: Right Arm Upper (8x12x8)
        { 6, "R_Arm_Upper",        32, 38, 12,  8, 12,  8,  0, 60, 32, 20 },
        // Part 7: Right Arm Lower (8x12x8)
        { 7, "R_Arm_Lower",        32, 26, 12,  8, 12,  8, 34, 60, 32, 20 },
        // Part 8: Left Leg Upper (8x12x8)
        { 8, "L_Leg_Upper",        16, 14, 12,  8, 12,  8, 68, 46, 32, 20 },
        // Part 9: Left Leg Lower (8x12x8)
        { 9, "L_Leg_Lower",        16,  2, 12,  8, 12,  8, 68, 68, 32, 20 },
        // Part 10: Right Leg Upper (8x12x8)
        { 10, "R_Leg_Upper",       24, 14, 12,  8, 12,  8,  0, 84, 32, 20 },
        // Part 11: Right Leg Lower (8x12x8)
        { 11, "R_Leg_Lower",       24,  2, 12,  8, 12,  8, 34, 84, 32, 20 }
    };

    for (int i = 0; i < 11; i++) {
        PartLayoutInfo p = layouts[i];
        if (IsPartVisible(p.partId)) {
            UnwrapBoxPartToImage(&sheet, p.minX, p.minY, p.minZ, p.sizeX, p.sizeY, p.sizeZ, p.sheetX, p.sheetY);
        }
    }

    // Save PNG
    char pngPath[256];
    snprintf(pngPath, sizeof(pngPath), "%s.png", baseFilename);
    ExportImage(sheet, pngPath);
    UnloadImage(sheet);

    // Save RIG JSON for Game Engine / Parser
    char jsonPath[256];
    snprintf(jsonPath, sizeof(jsonPath), "%s_rig_joints.json", baseFilename);
    FILE* fJson = fopen(jsonPath, "w");
    if (fJson) {
        fprintf(fJson, "{\n");
        fprintf(fJson, "  \"modelType\": \"Minecraft_4DMiner_Rig\",\n");
        fprintf(fJson, "  \"textureResolution\": [ %d, %d ],\n", sheetW, sheetH);
        fprintf(fJson, "  \"totalParts\": %d,\n", NUM_BODY_PARTS);
        fprintf(fJson, "  \"totalJoints\": %d,\n", NUM_JOINTS);
        fprintf(fJson, "  \"parts\": [\n");
        for (int i = 0; i < 11; i++) {
            PartLayoutInfo p = layouts[i];
            fprintf(fJson, "    {\n");
            fprintf(fJson, "      \"id\": %d,\n", p.partId);
            fprintf(fJson, "      \"name\": \"%s\",\n", p.name);
            fprintf(fJson, "      \"size\": [ %d, %d, %d ],\n", p.sizeX, p.sizeY, p.sizeZ);
            fprintf(fJson, "      \"worldBoundsMin\": [ %d, %d, %d ],\n", p.minX, p.minY, p.minZ);
            fprintf(fJson, "      \"uvSheetRect\": [ %d, %d, %d, %d ]\n", p.sheetX, p.sheetY, p.sheetW, p.sheetH);
            fprintf(fJson, "    }%s\n", (i == 10) ? "" : ",");
        }
        fprintf(fJson, "  ],\n");
        fprintf(fJson, "  \"joints\": [\n");
        for (int j = 0; j < NUM_JOINTS; j++) {
            JointInfo jt = charJoints[j];
            fprintf(fJson, "    {\n");
            fprintf(fJson, "      \"jointId\": \"%s\",\n", jt.id);
            fprintf(fJson, "      \"name\": \"%s\",\n", jt.name);
            fprintf(fJson, "      \"position\": [ %.2f, %.2f, %.2f ],\n", jt.pos.x, jt.pos.y, jt.pos.z);
            fprintf(fJson, "      \"parentPartId\": %d,\n", jt.parentPart);
            fprintf(fJson, "      \"childPartId\": %d\n", jt.childPart);
            fprintf(fJson, "    }%s\n", (j == NUM_JOINTS - 1) ? "" : ",");
        }
        fprintf(fJson, "  ]\n");
        fprintf(fJson, "}\n");
        fclose(fJson);
    }

    // Generate Natural Language AI Prompt for other AI systems
    char promptPath[256];
    snprintf(promptPath, sizeof(promptPath), "%s_ai_prompt.txt", baseFilename);
    FILE* fPrompt = fopen(promptPath, "w");
    if (fPrompt) {
        fprintf(fPrompt, "========================================================================\n");
        fprintf(fPrompt, "AI RECONSTRUCTION PROMPT & RIG SPECIFICATION (HyperTex3D -> Game Engine)\n");
        fprintf(fPrompt, "========================================================================\n\n");
        fprintf(fPrompt, "PROJECT: Minecraft & 4D-Miner Style Articulated Character\n");
        fprintf(fPrompt, "TEXTURE FILE: %s.png (%dx%d standard unwrapped 2D UV sheet)\n", baseFilename, sheetW, sheetH);
        fprintf(fPrompt, "RIG TYPE: 11 Individual Articulated Body Segments with 9 Rotational Joints\n\n");

        fprintf(fPrompt, "--- 1. BODY PARTS SPECIFICATION & UV SHEET RECTANGLES ---\n");
        fprintf(fPrompt, "1. Head: Size 16x16x16 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[0].sheetX, layouts[0].sheetY, layouts[0].sheetW, layouts[0].sheetH);
        fprintf(fPrompt, "2. Upper Torso (Chest): Size 16x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[1].sheetX, layouts[1].sheetY, layouts[1].sheetW, layouts[1].sheetH);
        fprintf(fPrompt, "3. Lower Torso (Pelvis): Size 16x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[2].sheetX, layouts[2].sheetY, layouts[2].sheetW, layouts[2].sheetH);
        fprintf(fPrompt, "4. Left Arm Upper: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[3].sheetX, layouts[3].sheetY, layouts[3].sheetW, layouts[3].sheetH);
        fprintf(fPrompt, "5. Left Arm Lower: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[4].sheetX, layouts[4].sheetY, layouts[4].sheetW, layouts[4].sheetH);
        fprintf(fPrompt, "6. Right Arm Upper: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[5].sheetX, layouts[5].sheetY, layouts[5].sheetW, layouts[5].sheetH);
        fprintf(fPrompt, "7. Right Arm Lower: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[6].sheetX, layouts[6].sheetY, layouts[6].sheetW, layouts[6].sheetH);
        fprintf(fPrompt, "8. Left Leg Upper: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[7].sheetX, layouts[7].sheetY, layouts[7].sheetW, layouts[7].sheetH);
        fprintf(fPrompt, "9. Left Leg Lower: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[8].sheetX, layouts[8].sheetY, layouts[8].sheetW, layouts[8].sheetH);
        fprintf(fPrompt, "10. Right Leg Upper: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n", layouts[9].sheetX, layouts[9].sheetY, layouts[9].sheetW, layouts[9].sheetH);
        fprintf(fPrompt, "11. Right Leg Lower: Size 8x12x8 voxels. Unwrapped UV Rect: [X:%d, Y:%d, W:%d, H:%d]\n\n", layouts[10].sheetX, layouts[10].sheetY, layouts[10].sheetW, layouts[10].sheetH);

        fprintf(fPrompt, "--- 2. THE 9 ARTICULATED SKELETAL JOINTS & HIERARCHY ---\n");
        for (int j = 0; j < NUM_JOINTS; j++) {
            JointInfo jt = charJoints[j];
            fprintf(fPrompt, "%d. %s -> 3D Pivot: (%.1f, %.1f, %.1f) | Connects: [Parent: Part %d (%s)] -> [Child: Part %d (%s)]\n",
                    j + 1, jt.name, jt.pos.x, jt.pos.y, jt.pos.z,
                    jt.parentPart, bodyPartNames[jt.parentPart],
                    jt.childPart, bodyPartNames[jt.childPart]);
        }

        fprintf(fPrompt, "\n--- 3. AI RECONSTRUCTION INSTRUCTIONS FOR ANY 3D RENDERER ---\n");
        fprintf(fPrompt, "To reconstruct this 3D character in Three.js, Babylon.js, Unity, or Godot:\n");
        fprintf(fPrompt, "1. Instantiate 11 BoxGeometry meshes matching each part's voxel dimension.\n");
        fprintf(fPrompt, "2. Map each box's 6 faces (Top, Bottom, Right, Front, Left, Back) to the 2D UV coordinates given in the unwrapped sheet.\n");
        fprintf(fPrompt, "3. Connect child mesh pivot points to their parent joint coordinates as defined above.\n");
        fprintf(fPrompt, "4. The Lower Torso connects to the Upper Torso at Waist Joint (24, 38, 16). Arms connect at Shoulder Joints. Elbows and Knees rotate on X-axis.\n");
        fprintf(fPrompt, "========================================================================\n");
        fclose(fPrompt);
    }

    char msg[128];
    snprintf(msg, sizeof(msg), "Exported UV Sheet + AI Prompt + JSON Rig: %s", baseFilename);
    SetStatus(msg);
}

void ExportToPNG(const char* filename) {
    if (!grid) return;

    // Check if character mode skin export is selected
    if (isCharacterMode && exportAsCharacterSkin) {
        char cleanPath[256];
        strncpy(cleanPath, filename, 255);
        char* ext = strstr(cleanPath, ".png");
        if (ext) *ext = '\0';
        ExportCharacterSkinSheet(cleanPath);
        return;
    }

    // Default Voxel Slices Export
    int imgWidth = gridX * gridZ;
    int imgHeight = gridY;

    Image exportImg = GenImageColor(imgWidth, imgHeight, BLANK);

    for (int z = 0; z < gridZ; z++) {
        for (int y = 0; y < gridY; y++) {
            for (int x = 0; x < gridX; x++) {
                int idx = GetIndex(x, y, z);
                if (grid[idx].active && grid[idx].color.a > 0) {
                    if (!IsPartVisible(grid[idx].partId)) continue;
                    int imgX = (z * gridX) + x;
                    int imgY = (gridY - 1) - y;
                    ImageDrawPixel(&exportImg, imgX, imgY, grid[idx].color);
                }
            }
        }
    }

    ExportImage(exportImg, filename);
    UnloadImage(exportImg);

    char msg[128];
    snprintf(msg, sizeof(msg), "Exported PNG (%dx%d): %s", imgWidth, imgHeight, filename);
    SetStatus(msg);
}

void SaveProject(const char* filename) {
    if (!grid) return;
    FILE* file = fopen(filename, "wb");
    if (file) {
        unsigned int magic = HT3D_MAGIC;
        int charFlag = isCharacterMode ? 1 : 0;
        fwrite(&magic, sizeof(unsigned int), 1, file);
        fwrite(&gridX, sizeof(int), 1, file);
        fwrite(&gridY, sizeof(int), 1, file);
        fwrite(&gridZ, sizeof(int), 1, file);
        fwrite(&charFlag, sizeof(int), 1, file);
        fwrite(grid, sizeof(Voxel), (size_t)gridX * gridY * gridZ, file);
        fclose(file);

        char msg[128];
        snprintf(msg, sizeof(msg), "Saved Project: %s", filename);
        SetStatus(msg);
    }
}

bool LoadProject(const char* filename) {
    FILE* file = fopen(filename, "rb");
    if (!file) {
        SetStatus("Error: Could not open file!");
        return false;
    }

    unsigned int magic = 0;
    fread(&magic, sizeof(unsigned int), 1, file);

    if (magic == HT3D_MAGIC) {
        int nx = 16, ny = 16, nz = 16, charFlag = 0;
        fread(&nx, sizeof(int), 1, file);
        fread(&ny, sizeof(int), 1, file);
        fread(&nz, sizeof(int), 1, file);
        fread(&charFlag, sizeof(int), 1, file);

        if (charFlag) {
            InitCharacterTemplate();
        }
        InitEngine(nx, ny, nz);
        isCharacterMode = (charFlag != 0);
        fread(grid, sizeof(Voxel), (size_t)gridX * gridY * gridZ, file);
    } else {
        int legacySize = (int)magic;
        if (legacySize >= 4 && legacySize <= 128) {
            InitEngine(legacySize, legacySize, legacySize);
            fread(grid, sizeof(Voxel), (size_t)legacySize * legacySize * legacySize, file);
        }
    }

    fclose(file);
    UpdateCulling();

    char msg[128];
    snprintf(msg, sizeof(msg), "Loaded: %s (%dx%dx%d)", filename, gridX, gridY, gridZ);
    SetStatus(msg);
    return true;
}

static void SaveBackupIndex(void) {
    FILE* f = fopen("app/backups/index.dat", "wb");
    if (f) {
        fwrite(&backupCount, sizeof(int), 1, f);
        fwrite(backupList, sizeof(BackupEntry), backupCount, f);
        fclose(f);
    }
}

void LoadBackupIndex(void) {
    mkdir("app", 0777);
    mkdir("app/backups", 0777);
    FILE* f = fopen("app/backups/index.dat", "rb");
    if (f) {
        fread(&backupCount, sizeof(int), 1, f);
        if (backupCount < 0) backupCount = 0;
        if (backupCount > MAX_BACKUPS) backupCount = MAX_BACKUPS;
        fread(backupList, sizeof(BackupEntry), backupCount, f);
        fclose(f);
    } else {
        backupCount = 0;
    }
}

void PerformAutoBackup(void) {
    if (!grid) return;
    mkdir("app", 0777);
    mkdir("app/backups", 0777);

    if (backupCount >= MAX_BACKUPS) {
        remove(backupList[MAX_BACKUPS - 1].filename);
        backupCount = MAX_BACKUPS - 1;
    }

    for (int i = backupCount; i > 0; i--) {
        backupList[i] = backupList[i - 1];
    }

    time_t now = time(NULL);
    struct tm* t = localtime(&now);

    BackupEntry entry;
    strftime(entry.timestamp, sizeof(entry.timestamp), "%Y-%m-%d  %H:%M:%S", t);
    snprintf(entry.filename, sizeof(entry.filename), "app/backups/backup_%ld_%d.ht3d", (long)now, rand() % 1000);
    entry.sx = gridX;
    entry.sy = gridY;
    entry.sz = gridZ;
    entry.isCharMode = isCharacterMode;

    FILE* file = fopen(entry.filename, "wb");
    if (file) {
        unsigned int magic = HT3D_MAGIC;
        int charFlag = isCharacterMode ? 1 : 0;
        fwrite(&magic, sizeof(unsigned int), 1, file);
        fwrite(&gridX, sizeof(int), 1, file);
        fwrite(&gridY, sizeof(int), 1, file);
        fwrite(&gridZ, sizeof(int), 1, file);
        fwrite(&charFlag, sizeof(int), 1, file);
        fwrite(grid, sizeof(Voxel), (size_t)gridX * gridY * gridZ, file);
        fclose(file);

        backupList[0] = entry;
        backupCount++;
        SaveBackupIndex();
    }
}
