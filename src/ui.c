#include "hypertex.h"
#include <stdio.h>
#include <stdlib.h> // FIXED: Added for atoi
#include <string.h>
#include <math.h>   // FIXED: Added for fmin and fabs

// FIXED: Moved HexToC to the very top so all functions can see it
Color HexToC(const char* hex) {
    int r=255, g=255, b=255, a=255;
    if (strlen(hex) >= 7) {
        sscanf(hex, "#%02x%02x%02x", &r, &g, &b);
    }
    if (strlen(hex) == 9) {
        sscanf(hex, "#%02x%02x%02x%02x", &r, &g, &b, &a);
    }
    return (Color){ r, g, b, a };
}

void DrawSelectPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.7f));
    DrawRectangle(w/2 - 200, h/2 - 150, 400, 300, RAYWHITE);
    DrawText("SELECTION SETTINGS", w/2 - 120, h/2 - 130, 20, BLACK);
    
    Rectangle btnCopy = { w/2 - 100, h/2 - 80, 200, 35 }; 
    Rectangle btnMove = { w/2 - 100, h/2 - 35, 200, 35 };
    Rectangle btnRotate = { w/2 - 100, h/2 + 10, 200, 35 }; 
    Rectangle btnDelete = { w/2 - 100, h/2 + 55, 200, 35 };
    Rectangle btnCancel = { w/2 - 100, h/2 + 100, 200, 35 };

    DrawRectangleRec(btnCopy, LIGHTGRAY); DrawText("Copy Area", btnCopy.x+60, btnCopy.y+10, 15, BLACK);
    DrawRectangleRec(btnMove, LIGHTGRAY); DrawText("Move Area (Cut)", btnMove.x+45, btnMove.y+10, 15, BLACK);
    DrawRectangleRec(btnRotate, LIGHTGRAY); DrawText("Rotate 90*", btnRotate.x+60, btnRotate.y+10, 15, BLACK);
    DrawRectangleRec(btnDelete, MAROON); DrawText("Delete Area", btnDelete.x+60, btnDelete.y+10, 15, WHITE);
    DrawRectangleRec(btnCancel, DARKGRAY); DrawText("Do Nothing", btnCancel.x+60, btnCancel.y+10, 15, WHITE);

    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
        Vector2 m = GetMousePosition();
        if (CheckCollisionPointRec(m, btnCopy)) { 
            CopySelection(false); 
            showSelectPopup = false; 
            isMouseLocked = true; 
            DisableCursor(); 
        }
        if (CheckCollisionPointRec(m, btnMove)) { 
            CopySelection(true); 
            showSelectPopup = false; 
            isPasting = true; 
            pasteMode = 0; 
            pastePos = selStart; 
            isMouseLocked = false; 
            EnableCursor(); 
        }
        if (CheckCollisionPointRec(m, btnRotate)) { 
            CopySelection(true); 
            RotateClipboardY(); 
            CommitPaste(); 
            showSelectPopup = false; 
            isMouseLocked = true; 
            DisableCursor(); 
        }
        if (CheckCollisionPointRec(m, btnDelete)) { 
            DeleteSelection(); 
            showSelectPopup = false; 
            isMouseLocked = true; 
            DisableCursor(); 
        }
        if (CheckCollisionPointRec(m, btnCancel)) { 
            showSelectPopup = false; 
            isMouseLocked = true; 
            DisableCursor(); 
        }
    }
}

void DrawToolsPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.7f));
    DrawRectangle(w/2 - 150, h/2 - 150, 300, 250, RAYWHITE);
    DrawText("SELECT TOOL", w/2 - 70, h/2 - 130, 20, BLACK);
    
    const char* tNames[] = {"Normal Brush", "2D Rectangle", "Draw Line", "Select Area"};
    Tool tVals[] = {TOOL_BRUSH, TOOL_RECT_2D, TOOL_LINE, TOOL_SELECT};
    
    for (int i=0; i<4; i++) {
        Rectangle btn = { w/2 - 100, h/2 - 80 + (i*45), 200, 35 };
        DrawRectangleRec(btn, (currentTool == tVals[i]) ? ORANGE : LIGHTGRAY);
        DrawText(tNames[i], btn.x+40, btn.y+10, 15, BLACK);
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && CheckCollisionPointRec(GetMousePosition(), btn)) {
            currentTool = tVals[i]; 
            showToolsPopup = false; 
            isMouseLocked = true; 
            DisableCursor();
        }
    }
}

void DrawExportPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.7f));
    DrawRectangle(w/2 - 200, h/2 - 100, 400, 200, RAYWHITE);
    DrawText("EXPORT SETTINGS", w/2 - 100, h/2 - 80, 20, BLACK);
    
    DrawText("Filename (.png):", w/2 - 150, h/2 - 30, 15, DARKGRAY);
    Rectangle nameBox = { w/2 - 150, h/2, 300, 40 };
    DrawRectangleRec(nameBox, isTypingPath ? LIGHTGRAY : GRAY);
    DrawRectangleLinesEx(nameBox, 2, BLACK);
    DrawText(exportFileName, nameBox.x + 10, nameBox.y + 10, 20, BLACK);
    DrawText("Press ENTER to Save | ESC to Cancel", w/2 - 140, h/2 + 60, 15, RED);
}

void DrawImportPathPopup(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.7f));
    DrawRectangle(w/2 - 250, h/2 - 100, 500, 200, RAYWHITE);
    DrawText("IMPORT PNG TEXTURE", w/2 - 120, h/2 - 80, 20, BLACK);
    
    DrawText("Type Filename/Path (e.g., texture.png):", w/2 - 200, h/2 - 30, 15, DARKGRAY);
    Rectangle nameBox = { w/2 - 200, h/2, 400, 40 };
    DrawRectangleRec(nameBox, isTypingPath ? LIGHTGRAY : GRAY);
    DrawRectangleLinesEx(nameBox, 2, BLACK);
    DrawText(importFileName, nameBox.x + 10, nameBox.y + 10, 20, BLACK);
    DrawText("Press ENTER to Load | ESC to Cancel", w/2 - 150, h/2 + 60, 15, RED);
}

void HandlePopupInputs(void) {
    if (IsKeyPressed(KEY_ESCAPE)) {
        showExportPopup = false;
        if (appState == STATE_IMPORT_PATH) {
            appState = STATE_EDITOR;
        }
        isMouseLocked = true; 
        DisableCursor(); 
        return;
    }
    
    char* targetStr = showExportPopup ? exportFileName : importFileName;
    
    if (isTypingPath) {
        int key = GetCharPressed();
        int len = strlen(targetStr);
        if ((key >= 32) && (key <= 125) && (len < 100)) { 
            targetStr[len] = (char)key; 
            targetStr[len+1] = '\0'; 
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 0) { 
            targetStr[len-1] = '\0'; 
        }
        
        if (IsKeyPressed(KEY_ENTER)) { 
            if (showExportPopup && strlen(exportFileName) > 0) {
                if (!strstr(exportFileName, ".png")) { 
                    strcat(exportFileName, ".png"); 
                }
                char path[150]; 
                sprintf(path, "app/%s", exportFileName);
                ExportToPNG(path);
                showExportPopup = false; 
                isMouseLocked = true; 
                DisableCursor();
            } else if (appState == STATE_IMPORT_PATH && strlen(importFileName) > 0) {
                if (importImage.data != NULL) { 
                    UnloadImage(importImage); 
                }
                if (importTexture.id != 0) { 
                    UnloadTexture(importTexture); 
                }
                importImage = LoadImage(importFileName);
                if (importImage.data != NULL) {
                    importTexture = LoadTextureFromImage(importImage);
                    importSelectRec = (Rectangle){0, 0, importImage.width, importImage.height};
                    sprintf(cropX, "0"); 
                    sprintf(cropY, "0"); 
                    sprintf(cropW, "%d", importImage.width); 
                    sprintf(cropH, "%d", importImage.height);
                    appState = STATE_IMPORT_2D;
                } else {
                    appState = STATE_EDITOR; 
                    isMouseLocked = true; 
                    DisableCursor();
                }
            }
        }
    }
}

void DrawImport2DScreen(int w, int h) {
    DrawRectangle(0, 0, w, h, (Color){ 30, 30, 30, 255 });
    DrawText("2D CROP SCREEN (Drag mouse OR type values)", 20, 20, 20, WHITE);
    DrawText("Press ENTER to Apply | ESC to Cancel", 20, 50, 15, YELLOW);

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
    DrawRectangle(pX, 0, 300, h, LIGHTGRAY);
    DrawRectangleLines(pX, 0, 300, h, BLACK);
    DrawText("CROP PROPERTIES", pX + 20, 30, 20, BLACK);
    
    const char* lbls[] = {"X Pos:", "Y Pos:", "Width:", "Height:"};
    char* vals[] = {cropX, cropY, cropW, cropH};
    
    for (int i=0; i<4; i++) {
        DrawText(lbls[i], pX + 20, 100 + (i*60), 15, DARKGRAY);
        Rectangle box = { pX + 90, 90 + (i*60), 150, 40 };
        DrawRectangleRec(box, (activeCropInput == i+1) ? WHITE : GRAY);
        DrawRectangleLinesEx(box, 2, BLACK);
        DrawText(vals[i], box.x + 10, box.y + 10, 20, BLACK);
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
            if (CheckCollisionPointRec(GetMousePosition(), box)) { 
                activeCropInput = i+1; 
            }
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
            str[len+1] = '\0'; 
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 0) { 
            str[len-1] = '\0'; 
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
            
            if (rx < 0) { rx = 0; } 
            if (ry < 0) { ry = 0; }
            if (rx + rw > importImage.width) { rw = importImage.width - rx; }
            if (ry + rh > importImage.height) { rh = importImage.height - ry; }
            
            importSelectRec = (Rectangle){rx, ry, rw, rh};
            sprintf(cropX, "%d", (int)rx); 
            sprintf(cropY, "%d", (int)ry);
            sprintf(cropW, "%d", (int)rw); 
            sprintf(cropH, "%d", (int)rh);
        }
        
        if (IsMouseButtonReleased(MOUSE_BUTTON_LEFT)) { 
            isImportDragging = false; 
        }
    }
}

void DrawStartupUI(int w, int h) {
    DrawRectangle(0, 0, w, h, (Color){ 20, 24, 34, 255 });
    DrawText("HYPERTEX 3D - ULTIMATE CAD", w/2 - 200, h/2 - 100, 25, WHITE);
    DrawText(TextFormat("Workspace Size: %d x %d x %d", gridSize, gridSize, gridSize), w/2 - 160, h/2, 20, GREEN);
    DrawText("Press UP / DOWN arrows to scale.", w/2 - 150, h/2 + 40, 15, GRAY);
    DrawText("Press ENTER to Begin", w/2 - 110, h/2 + 90, 20, YELLOW);
}

void DrawTopHUD(int w, int h, int tX, int tY, int tZ) {
    DrawRectangle(0, 0, w, 40, ColorAlpha(BLACK, 0.9f));
    
    Rectangle fileBtn = { 10, 5, 80, 30 };
    DrawRectangleRec(fileBtn, showFileMenu ? ORANGE : LIGHTGRAY);
    DrawText("FILE", fileBtn.x + 20, fileBtn.y + 8, 15, BLACK);

    const char* hpNames[] = {"CUBIC WALLS", "Y-PLATE", "X-PLATE", "Z-PLATE"};
    DrawText(TextFormat("XYZ: [%d, %d, %d] | Mode: %s", tX, tY, tZ, hpNames[hpState]), 120, 10, 20, (hpState>0) ? ORANGE : LIME);

    if (showFileMenu) {
        DrawRectangle(10, 35, 150, 140, RAYWHITE);
        DrawRectangleLines(10, 35, 150, 140, BLACK);
        
        Rectangle b1 = {10, 35, 150, 35}; 
        DrawRectangleLinesEx(b1, 1, LIGHTGRAY); 
        DrawText("Import PNG", 20, 45, 15, BLACK);
        
        Rectangle b2 = {10, 70, 150, 35}; 
        DrawRectangleLinesEx(b2, 1, LIGHTGRAY); 
        DrawText("Export PNG", 20, 80, 15, BLACK);
        
        Rectangle b3 = {10, 105, 150, 35}; 
        DrawRectangleLinesEx(b3, 1, LIGHTGRAY); 
        DrawText("Save HT3D", 20, 115, 15, BLACK);
        
        Rectangle b4 = {10, 140, 150, 35}; 
        DrawRectangleLinesEx(b4, 1, LIGHTGRAY); 
        DrawText("Load HT3D", 20, 150, 15, BLACK);
    }
}

void HandleTopHUDClicks(void) {
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
        Vector2 m = GetMousePosition();
        
        if (m.x > 10 && m.x < 90 && m.y > 5 && m.y < 35) {
            showFileMenu = !showFileMenu;
        } else if (showFileMenu) {
            if (m.x > 10 && m.x < 160) {
                if (m.y > 35 && m.y < 70) { 
                    appState = STATE_IMPORT_PATH; 
                    isTypingPath = true; 
                    isMouseLocked = false; 
                    EnableCursor(); 
                }
                if (m.y > 70 && m.y < 105) { 
                    showExportPopup = true; 
                    isTypingPath = true; 
                    isMouseLocked = false; 
                    EnableCursor(); 
                }
                if (m.y > 105 && m.y < 140) { 
                    SaveProject("app/project.ht3d"); 
                }
                if (m.y > 140 && m.y < 175) { 
                    LoadProject("app/project.ht3d"); 
                }
            }
            showFileMenu = false;
        }
    }
}

void HandleInventoryInput(void) {
    if (hexBoxActive) {
        int key = GetCharPressed(); 
        int len = strlen(hexInput);
        if ((key >= 32) && (key <= 125) && (len < 9)) { 
            hexInput[len] = (char)key; 
            hexInput[len+1] = '\0'; 
        }
        if (IsKeyPressed(KEY_BACKSPACE) && len > 1) {
            hexInput[len-1] = '\0';
        }
        if (IsKeyPressed(KEY_ENTER)) { 
            hexBoxActive = false; 
            hotbar[selColorIdx] = HexToC(hexInput); 
            currentAlpha = hotbar[selColorIdx].a; 
        }
    }
}

void DrawInventory(int w, int h) {
    DrawRectangle(0, 0, w, h, ColorAlpha(BLACK, 0.9f));
    DrawRectangle(w/2 - 400, h/2 - 320, 800, 640, RAYWHITE);
    DrawText("INVENTORY & WORKSPACE", w/2 - 140, h/2 - 300, 20, BLACK);
    
    Rectangle pickBtn = { w/2 - 50, h/2 - 260, 100, 30 };
    DrawRectangleRec(pickBtn, (currentTool == TOOL_PICKER) ? ORANGE : LIGHTGRAY);
    DrawText("EYEDROPPER", pickBtn.x + 10, pickBtn.y + 10, 10, BLACK);
    
    if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), pickBtn)) { 
        showInventory = false; 
        isMouseLocked = true; 
        DisableCursor(); 
        currentTool = TOOL_PICKER; 
    }

    DrawText("COLORS (Slots 4 to 0):", w/2 - 325, h/2 - 200, 15, DARKGRAY);
    for (int i=0; i<10; i++) {
        Rectangle rect = { w/2 - 325 + (i*65), h/2 - 170, 60, 50 };
        if (i == 0) { 
            DrawRectangleRec(rect, DARKGRAY); 
            DrawText("OPT", rect.x+20, rect.y+20, 10, WHITE); 
        } 
        else if (i == 1) { 
            DrawRectangleRec(rect, DARKGRAY); 
            DrawText("HLP", rect.x+20, rect.y+20, 10, WHITE); 
        } 
        else if (i == 2) { 
            DrawRectangleRec(rect, DARKGRAY); 
            DrawText("BAR", rect.x+20, rect.y+20, 10, WHITE); 
            if (selColorIdx==2) { 
                DrawRectangleLinesEx(rect, 3, BLUE); 
            } 
        } 
        else { 
            DrawRectangleRec(rect, hotbar[i]); 
            if (selColorIdx == i) { 
                DrawRectangleLinesEx(rect, 3, BLUE); 
            } 
        }
        
        DrawRectangleLinesEx(rect, 1, DARKGRAY);
        DrawText(TextFormat("%d", (i==9)?0:i+1), rect.x+25, rect.y-15, 10, BLACK);
        
        if (i > 1 && IsMouseButtonPressed(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), rect)) {
            selColorIdx = i;
        }
    }

    DrawText("PRO COLOR PICKER (Select Slot First):", w/2 - 350, h/2 - 90, 15, DARKGRAY);
    
    Rectangle hueBar = { w/2 - 350, h/2 - 60, 700, 20 };
    for (int i = 0; i < 700; i++) { 
        Color c = ColorFromHSV((float)i / 700.0f * 360.0f, 1.0f, 1.0f); 
        DrawLine(hueBar.x + i, hueBar.y, hueBar.x + i, hueBar.y + 20, c); 
    }
    DrawRectangleLinesEx(hueBar, 2, BLACK);
    
    float pX = hueBar.x + (pickerHue / 360.0f) * 700.0f;
    DrawTriangle((Vector2){pX - 5, hueBar.y + 25}, (Vector2){pX + 5, hueBar.y + 25}, (Vector2){pX, hueBar.y + 15}, BLACK);

    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), (Rectangle){hueBar.x, hueBar.y, hueBar.width, hueBar.height + 10}) && selColorIdx > 2) {
        pickerHue = ((GetMousePosition().x - hueBar.x) / 700.0f) * 360.0f;
        hotbar[selColorIdx] = ColorFromHSV(pickerHue, pickerSV.x, pickerSV.y); 
        hotbar[selColorIdx].a = currentAlpha;
    }

    Rectangle svBox = { w/2 - 350, h/2 - 20, 300, 150 };
    Color pureHue = ColorFromHSV(pickerHue, 1.0f, 1.0f);
    DrawRectangleGradientEx(svBox, WHITE, BLACK, BLACK, pureHue); 
    DrawRectangleLinesEx(svBox, 2, BLACK);

    Vector2 svPt = { svBox.x + (pickerSV.x * svBox.width), svBox.y + ((1.0f - pickerSV.y) * svBox.height) };
    DrawCircleLines(svPt.x, svPt.y, 5, (pickerSV.y < 0.5f) ? WHITE : BLACK);

    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), svBox) && selColorIdx > 2) {
        pickerSV.x = (GetMousePosition().x - svBox.x) / svBox.width;
        pickerSV.y = 1.0f - ((GetMousePosition().y - svBox.y) / svBox.height);
        hotbar[selColorIdx] = ColorFromHSV(pickerHue, pickerSV.x, pickerSV.y); 
        hotbar[selColorIdx].a = currentAlpha;
        sprintf(hexInput, "#%02X%02X%02X%02X", hotbar[selColorIdx].r, hotbar[selColorIdx].g, hotbar[selColorIdx].b, hotbar[selColorIdx].a);
    }

    DrawText(TextFormat("ALPHA / TRANSPARENCY (A: %d)", currentAlpha), w/2 + 50, h/2 - 20, 15, DARKGRAY);
    Rectangle alphaBar = { w/2 + 50, h/2, 300, 30 }; 
    DrawRectangleGradientH(alphaBar.x, alphaBar.y, alphaBar.width, alphaBar.height, BLANK, BLACK); 
    DrawRectangleLinesEx(alphaBar, 1, DARKGRAY);
    DrawCircle(alphaBar.x + (currentAlpha / 255.0f * 300), alphaBar.y + 15, 8, WHITE);
    
    if (IsMouseButtonDown(MOUSE_LEFT_BUTTON) && CheckCollisionPointRec(GetMousePosition(), alphaBar) && selColorIdx > 2) {
        currentAlpha = ((GetMousePosition().x - alphaBar.x) / 300.0f) * 255;
        if (currentAlpha < 0) {
            currentAlpha = 0; 
        }
        if (currentAlpha > 255) {
            currentAlpha = 255; 
        }
        hotbar[selColorIdx].a = currentAlpha;
    }

    Rectangle sM = { w/2 - 50, h/2 + 150, 30, 30 }; 
    Rectangle sP = { w/2 - 10, h/2 + 150, 30, 30 };
    DrawRectangleRec(sM, RED); 
    DrawText("-", sM.x+10, sM.y+5, 20, WHITE); 
    DrawRectangleRec(sP, GREEN); 
    DrawText("+", sP.x+10, sP.y+5, 20, WHITE);
    DrawText(TextFormat("SPEED: %d%%", (int)(moveSpeed * 100)), w/2 + 40, h/2 + 155, 15, DARKGRAY);
    
    if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
        if (CheckCollisionPointRec(GetMousePosition(), sM) && moveSpeed > 0.1f) {
            moveSpeed -= 0.5f;
        }
        if (CheckCollisionPointRec(GetMousePosition(), sP) && moveSpeed < 10.0f) {
            moveSpeed += 0.5f;
        }
    }

    Rectangle hexRect = { w/2 + 200, h/2 + 150, 150, 30 };
    DrawRectangleRec(hexRect, hexBoxActive ? LIGHTGRAY : GRAY); 
    DrawText(hexInput, hexRect.x + 10, hexRect.y + 5, 20, BLACK);
    if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
        hexBoxActive = CheckCollisionPointRec(GetMousePosition(), hexRect);
    }
    
    DrawText("Press 'E' to Close", w/2 - 80, h/2 + 280, 20, RED);
}
