#include "hypertex.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

Color HexToC(const char* hex) {
    int r = 255, g = 255, b = 255, a = 255;
    if (strlen(hex) >= 7) sscanf(hex, "#%02x%02x%02x", &r, &g, &b);
    if (strlen(hex) == 9) sscanf(hex, "#%02x%02x%02x%02x", &r, &g, &b, &a);
    return (Color){ r, g, b, a };
}

static bool DrawStyledButton(Rectangle rec, const char* text, Color baseCol, Color textCol, int fontSize) {
    Vector2 m = GetMousePosition();
    bool hover = CheckCollisionPointRec(m, rec);
    Color drawCol = hover ? ColorBrightness(baseCol, 0.18f) : baseCol;
    DrawRectangleRec(rec, drawCol);
    DrawRectangleLinesEx(rec, 2, hover ? WHITE : ColorAlpha(BLACK, 0.5f));
    int tw = MeasureText(text, fontSize);
    DrawText(text, rec.x + (rec.width - tw) / 2, rec.y + (rec.height - fontSize) / 2, fontSize, textCol);
    return (hover && IsMouseButtonPressed(MOUSE_BUTTON_LEFT));
}

void DrawStartupUI(int w, int h, Camera3D* cam) {
    DrawRectangleGradientV(0, 0, w, h, (Color){ 14, 18, 28, 255 }, (Color){ 26, 33, 50, 255 });

    Rectangle card = { w/2 - 280, h/2 - 250, 560, 500 };
    DrawRectangleRec(card, (Color){ 22, 27, 40, 245 });
    DrawRectangleLinesEx(card, 2, (Color){ 65, 130, 255, 255 });

    DrawText("HYPERTEX 3D - PRO VOXEL STUDIO", w/2 - 220, card.y + 25, 24, WHITE);
    DrawText("Enter Workspace X, Y, Z Dimensions or Design a Character", w/2 - 210, card.y + 58, 14, LIGHTGRAY);

    const char* axisLabels[3] = { "WIDTH (X):", "HEIGHT (Y):", "DEPTH (Z):" };
    char* axisBuffers[3] = { inputX, inputY, inputZ };
    Color axisColors[3] = { (Color){230, 70, 70, 255}, (Color){60, 200, 100, 255}, (Color){70, 150, 255, 255} };

    for (int i = 0; i < 3; i++) {
        int bx = card.x + 50 + (i * 165);
        int by = card.y + 115;
        DrawText(axisLabels[i], bx, by - 22, 14, axisColors[i]);

        Rectangle box = { bx, by, 130, 44 };
        bool active = (activeStartupInput == i);
        DrawRectangleRec(box, active ? (Color){ 40, 50, 75, 255 } : (Color){ 15, 20, 30, 255 });
        DrawRectangleLinesEx(box, 2, active ? YELLOW : axisColors[i]);
        DrawText(axisBuffers[i], box.x + 16, box.y + 11, 22, WHITE);

        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(GetMousePosition(), box)) {
            activeStartupInput = i;
        }

        Rectangle btnMinus = { bx, by + 50, 62, 26 };
        Rectangle btnPlus  = { bx + 68, by + 50, 62, 26 };
        if (DrawStyledButton(btnMinus, "-4", (Color){45, 52, 70, 255}, WHITE, 14)) {
            int val = atoi(axisBuffers[i]);
            val = (val - 4 < 4) ? 4 : val - 4;
            sprintf(axisBuffers[i], "%d", val);
        }
        if (DrawStyledButton(btnPlus, "+4", (Color){45, 52, 70, 255}, WHITE, 14)) {
            int val = atoi(axisBuffers[i]);
            val = (val + 4 > 128) ? 128 : val + 4;
            sprintf(axisBuffers[i], "%d", val);
        }
    }

    int key = GetCharPressed();
    char* curBuf = (activeStartupInput == 0) ? inputX : (activeStartupInput == 1) ? inputY : inputZ;
    int len = strlen(curBuf);
    if (key >= '0' && key <= '9' && len < 3) {
        curBuf[len] = (char)key;
        curBuf[len + 1] = '\0';
    }
    if (IsKeyPressed(KEY_BACKSPACE) && len > 0) {
        curBuf[len - 1] = '\0';
    }
    if (IsKeyPressed(KEY_TAB)) {
        activeStartupInput = (activeStartupInput + 1) % 3;
    }

    Rectangle btnConfirm = { card.x + 50, card.y + 220, 460, 50 };
    if (DrawStyledButton(btnConfirm, "CONFIRM XYZ SIZE & START EDITOR (ENTER)", (Color){ 36, 160, 90, 255 }, WHITE, 17) || IsKeyPressed(KEY_ENTER)) {
        int sx = atoi(inputX), sy = atoi(inputY), sz = atoi(inputZ);
        if (sx <= 0) sx = 32;
        if (sy <= 0) sy = 32;
        if (sz <= 0) sz = 32;
        InitEngine(sx, sy, sz);
        cam->position = (Vector3){ gridX / 2.0f, gridY / 2.0f, fmax(gridX, gridZ) * 1.35f };
        cameraAngle.x = -PI / 2.0f;
        cameraAngle.y = 0.0f;
        appState = STATE_EDITOR;
        isMouseLocked = true;
        DisableCursor();
    }

    Rectangle btnChar = { card.x + 50, card.y + 288, 460, 56 };
    if (DrawStyledButton(btnChar, "DESIGN CHARACTER (16x16 Head | 11 Parts | 9 Joints)", (Color){ 215, 95, 25, 255 }, WHITE, 16)) {
        InitCharacterTemplate();
        charPanelPos = (Vector2){ (float)(w - 265), 56.0f };
        cam->position = (Vector3){ gridX / 2.0f, 38.0f, 68.0f };
        cameraAngle.x = -PI / 2.0f;
        cameraAngle.y = -0.05f;
        appState = STATE_EDITOR;
        isMouseLocked = true;
        DisableCursor();
    }
    DrawText("Includes breakable voxel skeleton: 4 Arm parts, 4 Leg parts, 2 Torso parts & 16x16 Head", card.x + 52, card.y + 350, 11, YELLOW);

    Rectangle btnBackup = { card.x + 50, card.y + 385, 460, 48 };
    char backupLabel[96];
    snprintf(backupLabel, sizeof(backupLabel), "OPEN AUTO-BACKUP (Recover Crash - %d / 30 Saved)", backupCount);
    if (DrawStyledButton(btnBackup, backupLabel, (Color){ 55, 90, 175, 255 }, WHITE, 16)) {
        LoadBackupIndex();
        prevStateBeforeBackup = STATE_STARTUP;
        appState = STATE_BACKUP_LIST;
    }

    DrawText("Auto-Backup runs every 5 seconds automatically in the background.", card.x + 95, card.y + 455, 12, GRAY);
}

void DrawBackupListUI(int w, int h, Camera3D* cam) {
    DrawRectangle(0, 0, w, h, (Color){ 14, 18, 28, 255 });
    DrawText("RECOVERY & AUTO-BACKUP MANAGER (LAST 30 BACKUPS - EVERY 5 SEC)", 40, 24, 22, WHITE);
    DrawText("Click any backup below to restore your exact 3D workspace immediately:", 40, 54, 15, LIGHTGRAY);

    Rectangle btnBack = { w - 180, 22, 140, 40 };
    if (DrawStyledButton(btnBack, "BACK (ESC)", MAROON, WHITE, 15) || IsKeyPressed(KEY_ESCAPE)) {
        appState = prevStateBeforeBackup;
        return;
    }

    if (backupCount == 0) {
        DrawText("No backups found yet. Backups are saved automatically every 5 seconds while editing.", 40, 140, 18, YELLOW);
        return;
    }

    for (int i = 0; i < backupCount; i++) {
        int col = i / 15;
        int row = i % 15;
        Rectangle rowRec = { 40 + col * 600, 90 + row * 39, 580, 34 };

        char itemText[256];
        snprintf(itemText, sizeof(itemText), "#%02d | %s | Size: %dx%dx%d | %s",
                 i + 1,
                 backupList[i].timestamp,
                 backupList[i].sx, backupList[i].sy, backupList[i].sz,
                 backupList[i].isCharMode ? "CHARACTER" : "CUSTOM XYZ");

        if (DrawStyledButton(rowRec, itemText, (i == 0) ? (Color){30, 95, 65, 255} : (Color){32, 40, 58, 255}, WHITE, 14)) {
            if (LoadProject(backupList[i].filename)) {
                cam->position = (Vector3){ gridX / 2.0f, gridY / 2.0f, fmax(gridX, gridZ) * 1.3f };
                cameraAngle.x = -PI / 2.0f;
                cameraAngle.y = 0.0f;
                appState = STATE_EDITOR;
                isMouseLocked = true;
                DisableCursor();
            }
        }
    }
}

void DrawCharacterPartPanel(int w, int h) {
    if (!isCharacterMode) return;

    float pw = 250.0f;
    float ph = 425.0f;
    Vector2 m = GetMousePosition();

    Rectangle headerBar = { charPanelPos.x, charPanelPos.y, pw, 30 };
    if (!isMouseLocked && !showFileMenu && IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(m, headerBar)) {
        isDraggingCharPanel = true;
        charPanelDragOffset = (Vector2){ m.x - charPanelPos.x, m.y - charPanelPos.y };
    }
    if (isDraggingCharPanel) {
        if (IsMouseButtonDown(MOUSE_BUTTON_LEFT)) {
            charPanelPos.x = m.x - charPanelDragOffset.x;
            charPanelPos.y = m.y - charPanelDragOffset.y;
            if (charPanelPos.x < 4) charPanelPos.x = 4;
            if (charPanelPos.y < 46) charPanelPos.y = 46;
            if (charPanelPos.x + pw > w - 4) charPanelPos.x = w - pw - 4;
            if (charPanelPos.y + ph > h - 4) charPanelPos.y = h - ph - 4;
        } else {
            isDraggingCharPanel = false;
        }
    }

    Rectangle panel = { charPanelPos.x, charPanelPos.y, pw, ph };
    DrawRectangleRec(panel, (Color){ 16, 20, 32, 240 });
    DrawRectangleRec(headerBar, isDraggingCharPanel ? (Color){ 235, 115, 30, 255 } : (Color){ 185, 80, 20, 255 });
    DrawRectangleLinesEx(panel, 2, (Color){ 235, 125, 45, 255 });

    DrawText("CHARACTER PARTS [DRAG]", panel.x + 10, panel.y + 8, 13, WHITE);
    DrawText("Click Part to Solo | Eye = Full Hide:", panel.x + 10, panel.y + 35, 11, LIGHTGRAY);

    Rectangle btnAll = { panel.x + 8, panel.y + 52, pw - 16, 24 };
    if (DrawStyledButton(btnAll, "SHOW ALL PARTS (RESET)", (activePartFilter == 0) ? (Color){35, 135, 80, 255} : (Color){36, 44, 64, 255}, WHITE, 12)) {
        activePartFilter = 0;
        for (int k = 1; k <= NUM_BODY_PARTS; k++) partHidden[k] = false;
        UpdateCulling();
    }

    for (int i = 1; i <= NUM_BODY_PARTS; i++) {
        float ry = panel.y + 54 + i * 26;
        Rectangle soloBtn = { panel.x + 8, ry, pw - 74, 23 };
        Rectangle hideBtn = { panel.x + pw - 62, ry, 54, 23 };

        bool isSolo = (activePartFilter == i);
        bool isHid  = partHidden[i];

        Color partBg = isHid ? (Color){ 25, 28, 38, 255 } : (isSolo ? (Color){ 210, 95, 20, 255 } : (Color){ 34, 42, 62, 255 });
        if (DrawStyledButton(soloBtn, bodyPartNames[i], partBg, isHid ? GRAY : WHITE, 11)) {
            if (activePartFilter == i) {
                activePartFilter = 0;
            } else {
                activePartFilter = i;
                partHidden[i] = false;
            }
            UpdateCulling();
        }

        if (DrawStyledButton(hideBtn, isHid ? "HIDDEN" : "SHOW", isHid ? MAROON : (Color){35, 125, 75, 255}, WHITE, 10)) {
            partHidden[i] = !partHidden[i];
            if (partHidden[i] && activePartFilter == i) activePartFilter = 0;
            UpdateCulling();
        }
    }

    Rectangle jointBtn = { panel.x + 8, panel.y + 370, pw - 16, 28 };
    if (DrawStyledButton(jointBtn, showJointsOverlay ? "9 JOINTS RIG: VISIBLE" : "9 JOINTS RIG: HIDDEN",
                         showJointsOverlay ? (Color){40, 140, 90, 255} : DARKGRAY, WHITE, 12)) {
        showJointsOverlay = !showJointsOverlay;
    }
    DrawText("Hidden parts are 100% invisible", panel.x + 28, panel.y + 404, 11, YELLOW);
}

void DrawSlot4PalettePopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.78f));

    Rectangle card = { w/2 - 280, h/2 - 230, 560, 460 };
    DrawRectangleRec(card, (Color){ 20, 26, 40, 255 });
    DrawRectangleLinesEx(card, 2, (Color){ 0, 210, 255, 255 });

    DrawText("SLOT [4] CUSTOM COLOR PALETTE", card.x + 25, card.y + 18, 20, WHITE);
    DrawText("Pick any custom color, HSV shade, or preset swatch for Slot [4]:", card.x + 25, card.y + 44, 13, LIGHTGRAY);

    Rectangle closeBtn = { card.x + card.width - 110, card.y + 14, 95, 32 };
    if (DrawStyledButton(closeBtn, "DONE [E/ESC]", (Color){ 35, 150, 85, 255 }, WHITE, 12) || IsKeyPressed(KEY_ESCAPE)) {
        showSlot4Palette = false;
        isMouseLocked = true;
        DisableCursor();
        return;
    }

    Color presets[16] = {
        (Color){230, 57, 70, 255},  (Color){251, 86, 7, 255},   (Color){255, 190, 11, 255}, (Color){6, 214, 160, 255},
        (Color){17, 138, 178, 255}, (Color){58, 134, 255, 255}, (Color){131, 56, 236, 255}, (Color){255, 0, 110, 255},
        (Color){235, 180, 145, 255},(Color){195, 135, 100, 255},(Color){110, 70, 45, 255},  (Color){65, 40, 25, 255},
        (Color){248, 249, 250, 255},(Color){173, 181, 189, 255},(Color){73, 80, 87, 255},   (Color){20, 24, 30, 255}
    };

    DrawText("QUICK SWATCHES:", card.x + 25, card.y + 75, 12, SKYBLUE);
    for (int i = 0; i < 16; i++) {
        Rectangle sw = { card.x + 25 + (i * 32), card.y + 94, 28, 28 };
        DrawRectangleRec(sw, presets[i]);
        DrawRectangleLinesEx(sw, 1, WHITE);
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(GetMousePosition(), sw)) {
            hotbar[3] = presets[i];
            selColorIdx = 3;
            Vector3 hsv = ColorToHSV(hotbar[3]);
            pickerHue = hsv.x;
            pickerSV = (Vector2){ hsv.y, hsv.z };
            sprintf(hexInput, "#%02X%02X%02X%02X", hotbar[3].r, hotbar[3].g, hotbar[3].b, hotbar[3].a);
        }
    }

    Rectangle hueBar = { card.x + 25, card.y + 138, 510, 22 };
    for (int i = 0; i < (int)hueBar.width; i++) {
        Color c = ColorFromHSV((float)i / hueBar.width * 360.0f, 1.0f, 1.0f);
        DrawLine(hueBar.x + i, hueBar.y, hueBar.x + i, hueBar.y + hueBar.height, c);
    }
    DrawRectangleLinesEx(hueBar, 2, WHITE);

    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), hueBar)) {
        pickerHue = ((GetMousePosition().x - hueBar.x) / hueBar.width) * 360.0f;
        hotbar[3] = ColorFromHSV(pickerHue, pickerSV.x, pickerSV.y);
        hotbar[3].a = currentAlpha;
        selColorIdx = 3;
        sprintf(hexInput, "#%02X%02X%02X%02X", hotbar[3].r, hotbar[3].g, hotbar[3].b, hotbar[3].a);
    }

    Rectangle svBox = { card.x + 25, card.y + 172, 320, 210 };
    Color pureHue = ColorFromHSV(pickerHue, 1.0f, 1.0f);
    DrawRectangleGradientEx(svBox, WHITE, BLACK, BLACK, pureHue);
    DrawRectangleLinesEx(svBox, 2, WHITE);

    Vector2 svCursor = { svBox.x + pickerSV.x * svBox.width, svBox.y + (1.0f - pickerSV.y) * svBox.height };
    DrawCircleLines((int)svCursor.x, (int)svCursor.y, 6, WHITE);
    DrawCircleLines((int)svCursor.x, (int)svCursor.y, 5, BLACK);

    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), svBox)) {
        pickerSV.x = (GetMousePosition().x - svBox.x) / svBox.width;
        pickerSV.y = 1.0f - ((GetMousePosition().y - svBox.y) / svBox.height);
        if (pickerSV.x < 0) pickerSV.x = 0; if (pickerSV.x > 1) pickerSV.x = 1;
        if (pickerSV.y < 0) pickerSV.y = 0; if (pickerSV.y > 1) pickerSV.y = 1;
        hotbar[3] = ColorFromHSV(pickerHue, pickerSV.x, pickerSV.y);
        hotbar[3].a = currentAlpha;
        selColorIdx = 3;
        sprintf(hexInput, "#%02X%02X%02X%02X", hotbar[3].r, hotbar[3].g, hotbar[3].b, hotbar[3].a);
    }

    DrawText("SLOT [4] PREVIEW:", card.x + 365, card.y + 172, 13, LIGHTGRAY);
    Rectangle previewBox = { card.x + 365, card.y + 194, 170, 75 };
    DrawRectangleRec(previewBox, hotbar[3]);
    DrawRectangleLinesEx(previewBox, 2, WHITE);

    DrawText("HEX CODE:", card.x + 365, card.y + 285, 13, LIGHTGRAY);
    Rectangle hexRect = { card.x + 365, card.y + 305, 170, 36 };
    DrawRectangleRec(hexRect, hexBoxActive ? (Color){50, 65, 95, 255} : (Color){14, 18, 26, 255});
    DrawRectangleLinesEx(hexRect, 2, SKYBLUE);
    DrawText(hexInput, hexRect.x + 10, hexRect.y + 8, 18, WHITE);
    if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
        hexBoxActive = CheckCollisionPointRec(GetMousePosition(), hexRect);
    }
    if (hexBoxActive) {
        int key = GetCharPressed();
        int len = strlen(hexInput);
        if ((key >= 32) && (key <= 125) && (len < 9)) {
            hexInput[len] = (char)key;
            hexInput[len + 1] = '\0';
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 1) hexInput[len - 1] = '\0';
        if (IsKeyPressed(KEY_ENTER)) {
            hexBoxActive = false;
            hotbar[3] = HexToC(hexInput);
            selColorIdx = 3;
        }
    }

    DrawText(TextFormat("ALPHA: %d", currentAlpha), card.x + 25, card.y + 398, 13, LIGHTGRAY);
    Rectangle alphaBar = { card.x + 115, card.y + 395, 420, 22 };
    DrawRectangleGradientH(alphaBar.x, alphaBar.y, alphaBar.width, alphaBar.height, BLANK, hotbar[3]);
    DrawRectangleLinesEx(alphaBar, 2, WHITE);
    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), alphaBar)) {
        currentAlpha = (int)(((GetMousePosition().x - alphaBar.x) / alphaBar.width) * 255);
        if (currentAlpha < 0) currentAlpha = 0;
        if (currentAlpha > 255) currentAlpha = 255;
        hotbar[3].a = currentAlpha;
    }
}

void DrawTopHUD(int w, int h, int tX, int tY, int tZ) {
    DrawRectangle(0, 0, w, 44, (Color){ 15, 19, 28, 240 });
    DrawLine(0, 44, w, 44, (Color){ 55, 70, 100, 255 });

    Rectangle fileBtn = { 10, 6, 95, 32 };
    DrawStyledButton(fileBtn, "FILE MENU", showFileMenu ? ORANGE : (Color){ 45, 58, 85, 255 }, WHITE, 14);

    Rectangle backupBtn = { 112, 6, 130, 32 };
    if (DrawStyledButton(backupBtn, "OPEN BACKUP", (Color){ 40, 95, 160, 255 }, WHITE, 13)) {
        LoadBackupIndex();
        prevStateBeforeBackup = STATE_EDITOR;
        appState = STATE_BACKUP_LIST;
        isMouseLocked = false;
        EnableCursor();
    }

    Rectangle shadeBtn = { 250, 6, 115, 32 };
    if (DrawStyledButton(shadeBtn, smoothShading ? "SHADING: ON" : "SHADING: OFF", smoothShading ? (Color){35, 125, 75, 255} : DARKGRAY, WHITE, 13)) {
        smoothShading = !smoothShading;
    }

    Rectangle wireBtn = { 372, 6, 105, 32 };
    if (DrawStyledButton(wireBtn, showWireframe ? "EDGES: ON" : "EDGES: OFF", showWireframe ? (Color){65, 80, 110, 255} : DARKGRAY, WHITE, 13)) {
        showWireframe = !showWireframe;
    }

    const char* hpNames[] = {"3D CUBE", "Y-SLICE", "X-SLICE", "Z-SLICE"};
    DrawText(TextFormat("XYZ: [%d, %d, %d] (%dx%dx%d) | Plane: %s",
             tX, tY, tZ, gridX, gridY, gridZ, hpNames[hpState]),
             495, 14, 16, (hpState > 0) ? ORANGE : LIME);

    if (statusTimer > 0.0f) {
        DrawText(statusMessage, w - MeasureText(statusMessage, 15) - 20, 14, 15, YELLOW);
    }

    if (showFileMenu) {
        Rectangle menuBox = { 10, 40, 230, 250 };
        DrawRectangleRec(menuBox, (Color){ 18, 24, 38, 255 });
        DrawRectangleLinesEx(menuBox, 2, (Color){ 90, 145, 255, 255 });

        const char* items[] = {
            "Save Project",
            "Save As (.ht3d)...",
            "Export Rig & UV (.png)...",
            "Import PNG Texture",
            "Load Project (.ht3d)",
            "Open Backup List",
            "New / Resize XYZ"
        };
        for (int i = 0; i < 7; i++) {
            Rectangle itemRec = { 14, 44 + i * 34, 222, 31 };
            DrawStyledButton(itemRec, items[i], (Color){ 38, 48, 70, 255 }, WHITE, 14);
        }
    }
}

void HandleTopHUDClicks(void) {
    Vector2 m = GetMousePosition();

    if (CheckCollisionPointRec(m, (Rectangle){ 10, 6, 95, 32 })) {
        showFileMenu = !showFileMenu;
        return;
    }

    if (showFileMenu) {
        if (m.x >= 14 && m.x <= 236 && m.y >= 44 && m.y <= 282) {
            int idx = (int)(m.y - 44) / 34;
            if (idx == 0) { SaveProject("app/project.ht3d"); }
            else if (idx == 1) { showSaveAsPopup = true; isTypingPath = true; isMouseLocked = false; EnableCursor(); }
            else if (idx == 2) { showExportPopup = true; isTypingPath = true; isMouseLocked = false; EnableCursor(); }
            else if (idx == 3) { appState = STATE_IMPORT_PATH; isTypingPath = true; isMouseLocked = false; EnableCursor(); }
            else if (idx == 4) { LoadProject("app/project.ht3d"); }
            else if (idx == 5) { LoadBackupIndex(); prevStateBeforeBackup = STATE_EDITOR; appState = STATE_BACKUP_LIST; isMouseLocked = false; EnableCursor(); }
            else if (idx == 6) { appState = STATE_STARTUP; isMouseLocked = false; EnableCursor(); }
        }
        showFileMenu = false;
    }
}

void DrawBottomHotbar(int w, int h) {
    int barW = 640, barH = 56;
    int sX = (w - barW) / 2;
    int sY = h - barH - 10;

    DrawRectangleRec((Rectangle){ sX - 10, sY - 6, barW + 20, barH + 12 }, (Color){ 14, 18, 28, 235 });
    DrawRectangleLinesEx((Rectangle){ sX - 10, sY - 6, barW + 20, barH + 12 }, 2, (Color){ 65, 90, 140, 255 });

    const char* toolNames[] = { "BRUSH", "2D RECT", "LINE", "SELECT", "PICKER", "ERASER" };

    for (int i = 0; i < 10; i++) {
        Rectangle slot = { sX + (i * 64), sY, 56, 44 };
        bool isSelected = (selColorIdx == i);

        if (i == 0) {
            if (DrawStyledButton(slot, toolNames[currentTool], (Color){ 200, 95, 20, 255 }, WHITE, 11)) {
                showToolsPopup = true; isMouseLocked = false; EnableCursor();
            }
        } else if (i == 1) {
            if (DrawStyledButton(slot, (hpState > 0) ? "PLANE ON" : "PLANE", (hpState > 0) ? DARKGREEN : (Color){ 120, 40, 50, 255 }, WHITE, 11)) {
                hpState = (hpState + 1) % 4;
            }
        } else if (i == 2) {
            DrawRectangleRec(slot, (Color){ 35, 40, 55, 255 });
            DrawText("AIR/INV", slot.x + 6, slot.y + 16, 11, LIGHTGRAY);
            if (isSelected) DrawRectangleLinesEx(slot, 3, YELLOW);
        } else if (i == 3) {
            DrawRectangleRec(slot, hotbar[3]);
            DrawRectangleGradientH(slot.x + 2, slot.y + 2, slot.width - 4, 8, RED, BLUE);
            DrawRectangle(slot.x + 2, slot.y + slot.height - 13, slot.width - 4, 11, ColorAlpha(BLACK, 0.65f));
            DrawText("PALETTE", slot.x + 5, slot.y + slot.height - 12, 10, YELLOW);
            DrawRectangleLinesEx(slot, isSelected ? 3 : 1, isSelected ? WHITE : BLACK);

            if (!isMouseLocked && IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(GetMousePosition(), slot)) {
                selColorIdx = 3;
                currentTool = TOOL_BRUSH;
                showSlot4Palette = true;
                isMouseLocked = false;
                EnableCursor();
            }
        } else {
            DrawRectangleRec(slot, hotbar[i]);
            DrawRectangleLinesEx(slot, isSelected ? 3 : 1, isSelected ? WHITE : BLACK);
        }

        DrawText(TextFormat("[%d]", (i == 9) ? 0 : i + 1), slot.x + 18, slot.y - 14, 11, isSelected ? YELLOW : LIGHTGRAY);

        if (i >= 2 && i != 3 && !isMouseLocked && IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(GetMousePosition(), slot)) {
            selColorIdx = i;
            currentTool = TOOL_BRUSH;
        }
    }

    DrawText("[Q] Unlock Cursor | [4] Custom Color Palette | [E] Full Settings | [WASD] Fly", sX + 35, sY - 28, 12, ColorAlpha(WHITE, 0.85f));
}

void DrawSelectPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.7f));
    DrawRectangle(w/2 - 200, h/2 - 150, 400, 300, (Color){ 25, 32, 48, 255 });
    DrawRectangleLinesEx((Rectangle){w/2 - 200, h/2 - 150, 400, 300}, 2, SKYBLUE);
    DrawText("SELECTION ACTIONS", w/2 - 110, h/2 - 130, 20, WHITE);

    Rectangle btnCopy   = { w/2 - 110, h/2 - 80, 220, 36 };
    Rectangle btnMove   = { w/2 - 110, h/2 - 35, 220, 36 };
    Rectangle btnRotate = { w/2 - 110, h/2 + 10, 220, 36 };
    Rectangle btnDelete = { w/2 - 110, h/2 + 55, 220, 36 };
    Rectangle btnCancel = { w/2 - 110, h/2 + 100, 220, 36 };

    if (DrawStyledButton(btnCopy, "Copy Area", (Color){45, 85, 150, 255}, WHITE, 15)) {
        CopySelection(false); showSelectPopup = false; isMouseLocked = true; DisableCursor();
    }
    if (DrawStyledButton(btnMove, "Move / Cut Area", (Color){45, 130, 95, 255}, WHITE, 15)) {
        CopySelection(true); showSelectPopup = false; isPasting = true; pasteMode = 0; pastePos = selStart; isMouseLocked = false; EnableCursor();
    }
    if (DrawStyledButton(btnRotate, "Rotate 90 Deg", (Color){180, 110, 30, 255}, WHITE, 15)) {
        CopySelection(true); RotateClipboardY(); CommitPaste(); showSelectPopup = false; isMouseLocked = true; DisableCursor();
    }
    if (DrawStyledButton(btnDelete, "Delete Selected Voxels", MAROON, WHITE, 15)) {
        DeleteSelection(); showSelectPopup = false; isMouseLocked = true; DisableCursor();
    }
    if (DrawStyledButton(btnCancel, "Cancel", DARKGRAY, WHITE, 15)) {
        showSelectPopup = false; isMouseLocked = true; DisableCursor();
    }
}

void DrawToolsPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.7f));
    DrawRectangle(w/2 - 160, h/2 - 150, 320, 270, (Color){ 24, 30, 44, 255 });
    DrawRectangleLinesEx((Rectangle){w/2 - 160, h/2 - 150, 320, 270}, 2, ORANGE);
    DrawText("SELECT DRAWING TOOL", w/2 - 115, h/2 - 130, 18, WHITE);

    const char* tNames[] = {"1. Voxel Brush", "2. 2D Hollow Rect", "3. 3D Line Tool", "4. Box Select Area"};
    Tool tVals[] = {TOOL_BRUSH, TOOL_RECT_2D, TOOL_LINE, TOOL_SELECT};

    for (int i = 0; i < 4; i++) {
        Rectangle btn = { w/2 - 110, h/2 - 80 + (i * 48), 220, 38 };
        if (DrawStyledButton(btn, tNames[i], (currentTool == tVals[i]) ? ORANGE : (Color){45, 55, 78, 255}, WHITE, 15)) {
            currentTool = tVals[i];
            showToolsPopup = false;
            isMouseLocked = true;
            DisableCursor();
        }
    }
}

// UPGRADED EXPORT POPUP WITH MINECRAFT / 4D MINER SHEET & AI PROMPT TOGGLE
void DrawExportPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.75f));
    Rectangle box = { w/2 - 250, h/2 - 160, 500, 320 };
    DrawRectangleRec(box, (Color){ 24, 30, 44, 255 });
    DrawRectangleLinesEx(box, 2, GREEN);
    DrawText("EXPORT AS 2D TEXTURE & RIG PROMPT", box.x + 40, box.y + 20, 20, WHITE);

    // Format mode selector
    if (isCharacterMode) {
        Rectangle btnSkin = { box.x + 35, box.y + 58, 210, 34 };
        Rectangle btnSlice = { box.x + 255, box.y + 58, 210, 34 };
        if (DrawStyledButton(btnSkin, "MINECRAFT / 4D RIG", exportAsCharacterSkin ? (Color){35, 140, 80, 255} : DARKGRAY, WHITE, 13)) {
            exportAsCharacterSkin = true;
        }
        if (DrawStyledButton(btnSlice, "VOXEL SLICE SHEET", !exportAsCharacterSkin ? (Color){35, 140, 80, 255} : DARKGRAY, WHITE, 13)) {
            exportAsCharacterSkin = false;
        }
    }

    DrawText("Filename (output saved in app/):", box.x + 35, box.y + 105, 14, LIGHTGRAY);
    Rectangle nameBox = { box.x + 35, box.y + 128, 430, 42 };
    DrawRectangleRec(nameBox, (Color){ 14, 18, 26, 255 });
    DrawRectangleLinesEx(nameBox, 2, YELLOW);
    DrawText(exportFileName, nameBox.x + 12, nameBox.y + 11, 20, WHITE);

    if (isCharacterMode && exportAsCharacterSkin) {
        DrawText("* Generates 3 files automatically:", box.x + 35, box.y + 182, 13, GOLD);
        DrawText("1. [name].png: Standard Minecraft/4DMiner 2D UV Skin Atlas", box.x + 45, box.y + 204, 12, WHITE);
        DrawText("2. [name]_ai_prompt.txt: Complete prompt for AI to rebuild rig", box.x + 45, box.y + 224, 12, SKYBLUE);
        DrawText("3. [name]_rig_joints.json: Exact coordinates of 9 joints & parts", box.x + 45, box.y + 244, 12, LIME);
    } else {
        DrawText("* Generates standard 2D layered voxel atlas for games.", box.x + 35, box.y + 195, 13, LIGHTGRAY);
    }

    Rectangle btnConfirm = { box.x + 35, box.y + 268, 210, 38 };
    Rectangle btnCancel = { box.x + 255, box.y + 268, 210, 38 };
    if (DrawStyledButton(btnConfirm, "EXPORT FILES (ENTER)", (Color){35, 150, 85, 255}, WHITE, 14)) {
        char path[180];
        snprintf(path, sizeof(path), "app/%s", exportFileName);
        ExportToPNG(path);
        showExportPopup = false;
        isMouseLocked = true;
        DisableCursor();
    }
    if (DrawStyledButton(btnCancel, "CANCEL (ESC)", MAROON, WHITE, 14)) {
        showExportPopup = false;
        isMouseLocked = true;
        DisableCursor();
    }
}

void DrawSaveAsPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.75f));
    DrawRectangle(w/2 - 220, h/2 - 110, 440, 220, (Color){ 24, 30, 44, 255 });
    DrawRectangleLinesEx((Rectangle){w/2 - 220, h/2 - 110, 440, 220}, 2, SKYBLUE);
    DrawText("SAVE PROJECT AS (.HT3D)", w/2 - 135, h/2 - 85, 18, WHITE);

    DrawText("Project Filename (saved in app/):", w/2 - 170, h/2 - 35, 14, LIGHTGRAY);
    Rectangle nameBox = { w/2 - 170, h/2 - 10, 340, 42 };
    DrawRectangleRec(nameBox, (Color){ 14, 18, 26, 255 });
    DrawRectangleLinesEx(nameBox, 2, SKYBLUE);
    DrawText(saveAsFileName, nameBox.x + 12, nameBox.y + 11, 20, WHITE);
    DrawText("Press ENTER to Save Project  |  ESC to Cancel", w/2 - 165, h/2 + 55, 14, YELLOW);
}

void DrawImportPathPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.75f));
    DrawRectangle(w/2 - 250, h/2 - 100, 500, 200, (Color){ 24, 30, 44, 255 });
    DrawRectangleLinesEx((Rectangle){w/2 - 250, h/2 - 100, 500, 200}, 2, ORANGE);
    DrawText("IMPORT PNG TEXTURE", w/2 - 115, h/2 - 80, 20, WHITE);

    DrawText("Type Filename/Path (or Drag & Drop a .png window):", w/2 - 200, h/2 - 30, 14, LIGHTGRAY);
    Rectangle nameBox = { w/2 - 200, h/2, 400, 40 };
    DrawRectangleRec(nameBox, (Color){ 14, 18, 26, 255 });
    DrawRectangleLinesEx(nameBox, 2, ORANGE);
    DrawText(importFileName, nameBox.x + 10, nameBox.y + 10, 20, WHITE);
    DrawText("Press ENTER to Load  |  ESC to Cancel", w/2 - 140, h/2 + 60, 14, YELLOW);
}

void HandlePopupInputs(void) {
    if (IsKeyPressed(KEY_ESCAPE)) {
        showExportPopup = false;
        showSaveAsPopup = false;
        if (appState == STATE_IMPORT_PATH) appState = STATE_EDITOR;
        isMouseLocked = true;
        DisableCursor();
        return;
    }

    char* targetStr = showExportPopup ? exportFileName : (showSaveAsPopup ? saveAsFileName : importFileName);

    if (isTypingPath) {
        int key = GetCharPressed();
        int len = strlen(targetStr);
        if ((key >= 32) && (key <= 125) && (len < 100)) {
            targetStr[len] = (char)key;
            targetStr[len + 1] = '\0';
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 0) {
            targetStr[len - 1] = '\0';
        }

        if (IsKeyPressed(KEY_ENTER)) {
            if (showExportPopup && strlen(exportFileName) > 0) {
                char path[160];
                snprintf(path, sizeof(path), "app/%s", exportFileName);
                ExportToPNG(path);
                showExportPopup = false;
                isMouseLocked = true;
                DisableCursor();
            } else if (showSaveAsPopup && strlen(saveAsFileName) > 0) {
                if (!strstr(saveAsFileName, ".ht3d")) strcat(saveAsFileName, ".ht3d");
                char path[160];
                snprintf(path, sizeof(path), "app/%s", saveAsFileName);
                SaveProject(path);
                showSaveAsPopup = false;
                isMouseLocked = true;
                DisableCursor();
            } else if (appState == STATE_IMPORT_PATH && strlen(importFileName) > 0) {
                if (importImage.data != NULL) UnloadImage(importImage);
                if (importTexture.id != 0) UnloadTexture(importTexture);
                importImage = LoadImage(importFileName);
                if (importImage.data != NULL) {
                    importTexture = LoadTextureFromImage(importImage);
                    importSelectRec = (Rectangle){0, 0, importImage.width, importImage.height};
                    sprintf(cropX, "0"); sprintf(cropY, "0");
                    sprintf(cropW, "%d", importImage.width); sprintf(cropH, "%d", importImage.height);
                    appState = STATE_IMPORT_2D;
                } else {
                    SetStatus("Failed to load PNG file!");
                    appState = STATE_EDITOR;
                    isMouseLocked = true;
                    DisableCursor();
                }
            }
        }
    }
}

void DrawImport2DScreen(int w, int h) {
    DrawRectangle(0, 0, w, h, (Color){ 20, 24, 34, 255 });
    DrawText("2D CROP SCREEN (Drag mouse OR type values)", 20, 20, 20, WHITE);
    DrawText("Press ENTER to Convert to 3D Voxels | ESC to Cancel", 20, 50, 15, YELLOW);

    if (importTexture.id != 0) {
        float scale = fmin((float)(w - 300) / importTexture.width, (float)h / importTexture.height) * 0.8f;
        Vector2 offset = { (w - 300)/2 - (importTexture.width * scale)/2, h/2 - (importTexture.height * scale)/2 };

        DrawTextureEx(importTexture, offset, 0.0f, scale, WHITE);

        if (importSelectRec.width > 0 && importSelectRec.height > 0) {
            Rectangle sRec = {
                offset.x + importSelectRec.x * scale,
                offset.y + importSelectRec.y * scale,
                importSelectRec.width * scale,
                importSelectRec.height * scale
            };
            DrawRectangleLinesEx(sRec, 2, RED);
            DrawRectangleRec(sRec, ColorAlpha(RED, 0.3f));
        }
    }

    int pX = w - 280;
    DrawRectangle(pX, 0, 300, h, (Color){ 28, 34, 48, 255 });
    DrawText("CROP PROPERTIES", pX + 20, 30, 20, WHITE);

    const char* lbls[] = {"X Pos:", "Y Pos:", "Width:", "Height:"};
    char* vals[] = {cropX, cropY, cropW, cropH};

    for (int i = 0; i < 4; i++) {
        DrawText(lbls[i], pX + 20, 100 + (i * 60), 15, LIGHTGRAY);
        Rectangle box = { pX + 90, 90 + (i * 60), 150, 40 };
        DrawRectangleRec(box, (activeCropInput == i + 1) ? (Color){50, 65, 95, 255} : (Color){18, 22, 32, 255});
        DrawRectangleLinesEx(box, 2, WHITE);
        DrawText(vals[i], box.x + 10, box.y + 10, 20, WHITE);
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(GetMousePosition(), box)) {
            activeCropInput = i + 1;
        }
    }
}

void HandleImport2DInput(void) {
    if (activeCropInput > 0) {
        char* str = (activeCropInput == 1) ? cropX : (activeCropInput == 2) ? cropY : (activeCropInput == 3) ? cropW : cropH;
        int key = GetCharPressed();
        int len = strlen(str);
        if ((key >= 48 && key <= 57) && len < 8) {
            str[len] = (char)key;
            str[len + 1] = '\0';
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 0) {
            str[len - 1] = '\0';
        }
        importSelectRec.x = atoi(cropX);
        importSelectRec.y = atoi(cropY);
        importSelectRec.width = atoi(cropW);
        importSelectRec.height = atoi(cropH);
    }

    if (importTexture.id != 0 && !activeCropInput) {
        int w = GetScreenWidth(), h = GetScreenHeight();
        float scale = fmin((float)(w - 300) / importTexture.width, (float)h / importTexture.height) * 0.8f;
        Vector2 offset = { (w - 300)/2 - (importTexture.width * scale)/2, h/2 - (importTexture.height * scale)/2 };
        Vector2 mousePos = GetMousePosition();

        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && mousePos.x < w - 300) {
            importDragStart = mousePos;
            isImportDragging = true;
        }
        if (isImportDragging) {
            float rx = (fmin(importDragStart.x, mousePos.x) - offset.x) / scale;
            float ry = (fmin(importDragStart.y, mousePos.y) - offset.y) / scale;
            float rw = fabs(importDragStart.x - mousePos.x) / scale;
            float rh = fabs(importDragStart.y - mousePos.y) / scale;

            if (rx < 0) rx = 0;
            if (ry < 0) ry = 0;
            if (rx + rw > importImage.width) rw = importImage.width - rx;
            if (ry + rh > importImage.height) rh = importImage.height - ry;

            importSelectRec = (Rectangle){rx, ry, rw, rh};
            sprintf(cropX, "%d", (int)rx); sprintf(cropY, "%d", (int)ry);
            sprintf(cropW, "%d", (int)rw); sprintf(cropH, "%d", (int)rh);
        }
        if (IsMouseButtonReleased(MOUSE_BUTTON_LEFT)) isImportDragging = false;
    }
}

void HandleInventoryInput(void) {
    if (hexBoxActive) {
        int key = GetCharPressed();
        int len = strlen(hexInput);
        if ((key >= 32) && (key <= 125) && (len < 9)) {
            hexInput[len] = (char)key;
            hexInput[len + 1] = '\0';
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 1) hexInput[len - 1] = '\0';
        if (IsKeyPressed(KEY_ENTER)) {
            hexBoxActive = false;
            hotbar[selColorIdx] = HexToC(hexInput);
            currentAlpha = hotbar[selColorIdx].a;
        }
    }
}

void DrawInventory(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.85f));
    DrawRectangle(w/2 - 400, h/2 - 310, 800, 620, (Color){ 22, 28, 42, 255 });
    DrawRectangleLinesEx((Rectangle){w/2 - 400, h/2 - 310, 800, 620}, 2, (Color){70, 130, 255, 255});
    DrawText("COLOR PALETTE, SHADING & CAMERA SETTINGS", w/2 - 220, h/2 - 285, 20, WHITE);

    Rectangle pickBtn = { w/2 - 70, h/2 - 245, 140, 32 };
    if (DrawStyledButton(pickBtn, "EYEDROPPER TOOL", (currentTool == TOOL_PICKER) ? ORANGE : (Color){50, 65, 95, 255}, WHITE, 13)) {
        showInventory = false;
        isMouseLocked = true;
        DisableCursor();
        currentTool = TOOL_PICKER;
    }

    DrawText("HOTBAR SLOTS (Select Slot 4..0 to customize color):", w/2 - 325, h/2 - 195, 14, LIGHTGRAY);
    for (int i = 0; i < 10; i++) {
        Rectangle rect = { w/2 - 325 + (i * 65), h/2 - 170, 60, 50 };
        if (i < 3) {
            DrawRectangleRec(rect, DARKGRAY);
            DrawText((i == 0) ? "TOOL" : (i == 1) ? "PLN" : "AIR", rect.x + 12, rect.y + 18, 12, WHITE);
        } else {
            DrawRectangleRec(rect, hotbar[i]);
            if (i == 3) DrawText("PAL", rect.x + 16, rect.y + 18, 11, BLACK);
        }
        DrawRectangleLinesEx(rect, (selColorIdx == i) ? 3 : 1, (selColorIdx == i) ? YELLOW : BLACK);
        if (i >= 2 && IsMouseButtonPressed(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), rect)) {
            selColorIdx = i;
        }
    }

    Rectangle hueBar = { w/2 - 350, h/2 - 70, 700, 24 };
    for (int i = 0; i < 700; i++) {
        Color c = ColorFromHSV((float)i / 700.0f * 360.0f, 1.0f, 1.0f);
        DrawLine(hueBar.x + i, hueBar.y, hueBar.x + i, hueBar.y + 24, c);
    }
    DrawRectangleLinesEx(hueBar, 2, WHITE);

    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), hueBar) && selColorIdx > 2) {
        pickerHue = ((GetMousePosition().x - hueBar.x) / 700.0f) * 360.0f;
        hotbar[selColorIdx] = ColorFromHSV(pickerHue, pickerSV.x, pickerSV.y);
        hotbar[selColorIdx].a = currentAlpha;
    }

    Rectangle svBox = { w/2 - 350, h/2 - 25, 320, 160 };
    Color pureHue = ColorFromHSV(pickerHue, 1.0f, 1.0f);
    DrawRectangleGradientEx(svBox, WHITE, BLACK, BLACK, pureHue);
    DrawRectangleLinesEx(svBox, 2, WHITE);

    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), svBox) && selColorIdx > 2) {
        pickerSV.x = (GetMousePosition().x - svBox.x) / svBox.width;
        pickerSV.y = 1.0f - ((GetMousePosition().y - svBox.y) / svBox.height);
        hotbar[selColorIdx] = ColorFromHSV(pickerHue, pickerSV.x, pickerSV.y);
        hotbar[selColorIdx].a = currentAlpha;
        sprintf(hexInput, "#%02X%02X%02X%02X", hotbar[selColorIdx].r, hotbar[selColorIdx].g, hotbar[selColorIdx].b, hotbar[selColorIdx].a);
    }

    DrawText(TextFormat("OPACITY / ALPHA: %d", currentAlpha), w/2 + 30, h/2 - 20, 15, LIGHTGRAY);
    Rectangle alphaBar = { w/2 + 30, h/2 + 5, 320, 28 };
    DrawRectangleGradientH(alphaBar.x, alphaBar.y, alphaBar.width, alphaBar.height, BLANK, WHITE);
    DrawRectangleLinesEx(alphaBar, 2, WHITE);
    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), alphaBar) && selColorIdx > 2) {
        currentAlpha = (int)(((GetMousePosition().x - alphaBar.x) / 320.0f) * 255);
        if (currentAlpha < 0) currentAlpha = 0;
        if (currentAlpha > 255) currentAlpha = 255;
        hotbar[selColorIdx].a = currentAlpha;
    }

    Rectangle sM = { w/2 - 350, h/2 + 165, 45, 36 };
    Rectangle sP = { w/2 - 295, h/2 + 165, 45, 36 };
    if (DrawStyledButton(sM, "-", MAROON, WHITE, 20) && moveSpeed > 0.3f) moveSpeed -= 0.3f;
    if (DrawStyledButton(sP, "+", DARKGREEN, WHITE, 20) && moveSpeed < 10.0f) moveSpeed += 0.3f;
    DrawText(TextFormat("FLY SPEED: %d%%", (int)(moveSpeed * 100)), w/2 - 235, h/2 + 175, 16, WHITE);

    Rectangle hexRect = { w/2 + 180, h/2 + 165, 170, 36 };
    DrawRectangleRec(hexRect, hexBoxActive ? (Color){50, 65, 95, 255} : (Color){16, 20, 30, 255});
    DrawRectangleLinesEx(hexRect, 2, SKYBLUE);
    DrawText(hexInput, hexRect.x + 12, hexRect.y + 8, 20, WHITE);
    if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
        hexBoxActive = CheckCollisionPointRec(GetMousePosition(), hexRect);
    }

    DrawText("Press [E] to Return to 3D Editor", w/2 - 130, h/2 + 260, 18, YELLOW);
}
