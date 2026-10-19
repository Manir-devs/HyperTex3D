#ifndef HYPERTEX_H
#define HYPERTEX_H

#include "raylib.h"
#include <stdbool.h>

#define MAX_BACKUPS 30
#define NUM_BODY_PARTS 11
#define NUM_JOINTS 9

typedef enum AppState {
    STATE_STARTUP,
    STATE_EDITOR,
    STATE_IMPORT_PATH,
    STATE_IMPORT_2D,
    STATE_BACKUP_LIST
} AppState;

typedef enum Tool {
    TOOL_BRUSH,
    TOOL_RECT_2D,
    TOOL_LINE,
    TOOL_SELECT,
    TOOL_PICKER,
    TOOL_ERASER
} Tool;

typedef struct Voxel {
    bool active;
    unsigned char exposedMask; // +X(1), -X(2), +Y(4), -Y(8), +Z(16), -Z(32)
    unsigned char partId;      // 0=World, 1=Head, 2..3=Torso, 4..7=Arms, 8..11=Legs
    Color color;
} Voxel;

typedef struct ClipVoxel {
    int dx, dy, dz;
    unsigned char partId;
    Color color;
} ClipVoxel;

typedef struct JointInfo {
    const char* id;
    const char* name;
    Vector3 pos;           // Global 3D position
    int parentPart;        // Parent Part ID (0..11)
    int childPart;         // Child Part ID (0..11)
    Vector3 parentAnchor;  // Local anchor on parent
    Vector3 childAnchor;   // Local anchor on child
} JointInfo;

typedef struct PartLayoutInfo {
    int partId;
    const char* name;
    int minX, minY, minZ;
    int sizeX, sizeY, sizeZ;
    int sheetX, sheetY;    // 2D UV sheet placement
    int sheetW, sheetH;
} PartLayoutInfo;

typedef struct BackupEntry {
    char filename[128];
    char timestamp[64];
    int sx, sy, sz;
    bool isCharMode;
} BackupEntry;

// --- ENGINE STATE ---
extern AppState appState;
extern AppState prevStateBeforeBackup;
extern int gridX, gridY, gridZ;
extern char inputX[8], inputY[8], inputZ[8];
extern int activeStartupInput;

extern Voxel* grid;
extern bool isCharacterMode;
extern int activePartFilter;
extern bool partHidden[NUM_BODY_PARTS + 1];
extern Vector2 charPanelPos;
extern bool isDraggingCharPanel;
extern Vector2 charPanelDragOffset;

extern bool showJointsOverlay;
extern bool smoothShading;
extern bool showWireframe;
extern JointInfo charJoints[NUM_JOINTS];
extern const char* bodyPartNames[NUM_BODY_PARTS + 1];

extern bool isMouseLocked;
extern bool showInventory;
extern bool showSlot4Palette;
extern float moveSpeed;
extern Vector2 cameraAngle;

extern Tool currentTool;
extern Color hotbar[10];
extern int selColorIdx;
extern char hexInput[10];
extern bool hexBoxActive;
extern int currentAlpha;

extern float pickerHue;
extern Vector2 pickerSV;

extern int hpState;
extern int hpPos;
extern int activeGizmo;

extern bool showSelectPopup;
extern bool showToolsPopup;
extern Vector3 selStart, selEnd;
extern ClipVoxel* clipboard;
extern int clipCount;
extern Vector3 clipSize;
extern bool isPasting;
extern int pasteMode;
extern Vector3 pastePos;

// --- FILE / SAVE AS / EXPORT AS / BACKUPS ---
extern bool showFileMenu;
extern bool showExportPopup;
extern bool showSaveAsPopup;
extern bool exportAsCharacterSkin; // Toggle between Minecraft/4DMiner Skin sheet or Voxel Slices
extern char exportFileName[128];
extern char saveAsFileName[128];
extern char importFileName[128];
extern bool isTypingPath;

extern double lastBackupTime;
extern BackupEntry backupList[MAX_BACKUPS];
extern int backupCount;
extern char statusMessage[128];
extern float statusTimer;

extern Image importImage;
extern Texture2D importTexture;
extern Rectangle importSelectRec;
extern bool isImportDragging;
extern Vector2 importDragStart;
extern char cropX[10], cropY[10], cropW[10], cropH[10];
extern int activeCropInput;

// --- ENGINE FUNCTIONS ---
void InitEngine(int sx, int sy, int sz);
void InitCharacterTemplate(void);
int GetIndex(int x, int y, int z);
bool InBounds(int x, int y, int z);
bool IsPartVisible(unsigned char partId);
void UpdateCulling(void);
void ApplyTool(int sX, int sY, int sZ, int eX, int eY, int eZ, Tool tool, Color c);
void SetStatus(const char* msg);

void CopySelection(bool deleteOriginal);
void DeleteSelection(void);
void RotateClipboardY(void);
void CommitPaste(void);
void CreateClipboardFromImage(void);

// --- RENDERING & UI ---
void DrawVoxelShaded(int x, int y, int z, Voxel v);
void DrawStartupUI(int w, int h, Camera3D* cam);
void DrawBackupListUI(int w, int h, Camera3D* cam);
void DrawTopHUD(int w, int h, int tX, int tY, int tZ);
void DrawBottomHotbar(int w, int h);
void DrawCharacterPartPanel(int w, int h);
void DrawSlot4PalettePopup(int w, int h);
void DrawInventory(int w, int h);
void DrawSelectPopup(int w, int h);
void DrawToolsPopup(int w, int h);
void DrawExportPopup(int w, int h);
void DrawSaveAsPopup(int w, int h);
void DrawImportPathPopup(int w, int h);
void DrawImport2DScreen(int w, int h);

void HandleInventoryInput(void);
void HandleTopHUDClicks(void);
void HandlePopupInputs(void);
void HandleImport2DInput(void);

// --- FILE I/O & EXPORT ---
void ExportToPNG(const char* filename);
void ExportCharacterSkinSheet(const char* baseFilename);
void SaveProject(const char* filename);
bool LoadProject(const char* filename);
void PerformAutoBackup(void);
void LoadBackupIndex(void);

#endif
