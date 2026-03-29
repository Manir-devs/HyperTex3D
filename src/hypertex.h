#ifndef HYPERTEX_H
#define HYPERTEX_H

#include "raylib.h"
#include <stdbool.h>

typedef enum AppState { STATE_STARTUP, STATE_EDITOR, STATE_IMPORT_PATH, STATE_IMPORT_2D } AppState;
typedef enum Tool { TOOL_BRUSH, TOOL_RECT_2D, TOOL_LINE, TOOL_SELECT, TOOL_PICKER } Tool;

typedef struct Voxel {
    bool active;
    bool exposed; 
    Color color;
} Voxel;

typedef struct ClipVoxel {
    int dx, dy, dz;
    Color color;
} ClipVoxel;

extern AppState appState;
extern int gridSize;
extern Voxel* grid;
extern bool isMouseLocked;
extern bool showInventory;
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

extern bool showSelectPopup;
extern bool showToolsPopup; 
extern Vector3 selStart, selEnd;
extern ClipVoxel* clipboard;
extern int clipCount;
extern Vector3 clipSize;
extern bool isPasting;
extern int pasteMode; 
extern Vector3 pastePos;
extern int activeGizmo; 

// --- NEW: FILE MENU & IMPORT/EXPORT ---
extern bool showFileMenu;
extern bool showExportPopup;
extern char exportFileName[128];
extern char importFileName[128];
extern bool isTypingPath;

extern Image importImage;
extern Texture2D importTexture;
extern Rectangle importSelectRec;
extern bool isImportDragging;
extern Vector2 importDragStart;

extern char cropX[10], cropY[10], cropW[10], cropH[10];
extern int activeCropInput; // 0=None, 1=X, 2=Y, 3=W, 4=H

void InitEngine(int size);
int GetIndex(int x, int y, int z);
bool InBounds(int x, int y, int z);
void UpdateCulling(void); 
void ApplyTool(int sX, int sY, int sZ, int eX, int eY, int eZ, Tool tool, Color c);

void CopySelection(bool deleteOriginal);
void DeleteSelection(void);
void RotateClipboardY(void);
void CommitPaste(void);
void CreateClipboardFromImage(void);

void DrawStartupUI(int w, int h);
void DrawTopHUD(int w, int h, int tX, int tY, int tZ);
void DrawInventory(int w, int h);
void DrawSelectPopup(int w, int h);
void DrawToolsPopup(int w, int h); 
void DrawExportPopup(int w, int h);
void DrawImportPathPopup(int w, int h);
void DrawImport2DScreen(int w, int h);

void HandleInventoryInput(void);
void HandleTopHUDClicks(void);
void HandlePopupInputs(void);
void HandleImport2DInput(void);

void ExportToPNG(const char* filename);
void SaveProject(const char* filename);
void LoadProject(const char* filename);

#endif
