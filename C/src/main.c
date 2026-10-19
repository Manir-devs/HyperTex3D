#include "hypertex.h"
#include "raymath.h"
#include "rlgl.h"
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <stdio.h>

RayCollision GetCustomRayCollisionPlane(Ray ray, Vector3 planePos, Vector3 planeNormal) {
    RayCollision result = {0};
    float denom = Vector3DotProduct(ray.direction, planeNormal);
    if (fabs(denom) > 0.000001f) {
        float t = Vector3DotProduct(Vector3Subtract(planePos, ray.position), planeNormal) / denom;
        if (t >= 0) {
            result.hit = true;
            result.distance = t;
            result.point = Vector3Add(ray.position, Vector3Scale(ray.direction, t));
            result.normal = planeNormal;
        }
    }
    return result;
}

int main(void) {
    const int w = 1280, h = 720;
    SetConfigFlags(FLAG_MSAA_4X_HINT | FLAG_WINDOW_RESIZABLE);
    InitWindow(w, h, "HyperTex3D Ultimate - Voxel & Character Studio");
    SetExitKey(KEY_NULL);
    SetTargetFPS(60);

    LoadBackupIndex();
    lastBackupTime = GetTime();

    Camera3D camera = { 0 };
    camera.up = (Vector3){ 0.0f, 1.0f, 0.0f };
    camera.fovy = 60.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    bool isDragging = false;
    Vector3 dragStart = {0, 0, 0};

    while (!WindowShouldClose()) {
        int sw = GetScreenWidth();
        int sh = GetScreenHeight();

        if (statusTimer > 0.0f) {
            statusTimer -= GetFrameTime();
        }

        if (appState == STATE_EDITOR && grid != NULL && (GetTime() - lastBackupTime >= 5.0)) {
            PerformAutoBackup();
            lastBackupTime = GetTime();
        }

        if (IsFileDropped()) {
            FilePathList droppedFiles = LoadDroppedFiles();
            if (droppedFiles.count > 0 && IsFileExtension(droppedFiles.paths[0], ".png")) {
                if (importImage.data != NULL) UnloadImage(importImage);
                if (importTexture.id != 0) UnloadTexture(importTexture);
                importImage = LoadImage(droppedFiles.paths[0]);
                if (importImage.data != NULL) {
                    importTexture = LoadTextureFromImage(importImage);
                    importSelectRec = (Rectangle){0, 0, importImage.width, importImage.height};
                    sprintf(cropX, "0"); sprintf(cropY, "0");
                    sprintf(cropW, "%d", importImage.width); sprintf(cropH, "%d", importImage.height);
                    appState = STATE_IMPORT_2D;
                    isMouseLocked = false;
                    EnableCursor();
                }
            }
            UnloadDroppedFiles(droppedFiles);
        }

        if (appState == STATE_STARTUP) {
            BeginDrawing();
            DrawStartupUI(sw, sh, &camera);
            EndDrawing();
            continue;
        }

        if (appState == STATE_BACKUP_LIST) {
            BeginDrawing();
            DrawBackupListUI(sw, sh, &camera);
            EndDrawing();
            continue;
        }

        if (appState == STATE_IMPORT_PATH) {
            HandlePopupInputs();
            BeginDrawing();
            DrawImportPathPopup(sw, sh);
            EndDrawing();
            continue;
        }

        if (appState == STATE_IMPORT_2D) {
            HandleImport2DInput();
            if (IsKeyPressed(KEY_ESCAPE)) {
                appState = STATE_EDITOR;
                isMouseLocked = true;
                DisableCursor();
            } else if (IsKeyPressed(KEY_ENTER)) {
                CreateClipboardFromImage();
                appState = STATE_EDITOR;
                isPasting = true;
                pasteMode = 0;
                pastePos = (Vector3){ gridX / 2, gridY / 2, gridZ / 2 };
                isMouseLocked = false;
                EnableCursor();
            }
            BeginDrawing();
            DrawImport2DScreen(sw, sh);
            EndDrawing();
            continue;
        }

        if (showSelectPopup)  { BeginDrawing(); DrawSelectPopup(sw, sh);       EndDrawing(); continue; }
        if (showToolsPopup)   { BeginDrawing(); DrawToolsPopup(sw, sh);        EndDrawing(); continue; }
        if (showSlot4Palette) { BeginDrawing(); DrawSlot4PalettePopup(sw, sh); EndDrawing(); continue; }
        if (showExportPopup)  { HandlePopupInputs(); BeginDrawing(); DrawExportPopup(sw, sh); EndDrawing(); continue; }
        if (showSaveAsPopup)  { HandlePopupInputs(); BeginDrawing(); DrawSaveAsPopup(sw, sh); EndDrawing(); continue; }

        if (IsKeyPressed(KEY_Q) && !showInventory) {
            isMouseLocked = !isMouseLocked;
            if (isMouseLocked) DisableCursor(); else EnableCursor();
        }

        if (IsKeyPressed(KEY_E)) {
            showInventory = !showInventory;
            if (showInventory) {
                isMouseLocked = false;
                EnableCursor();
                hexBoxActive = false;
            } else {
                isMouseLocked = true;
                DisableCursor();
                if (currentTool == TOOL_PICKER) currentTool = TOOL_BRUSH;
            }
        }
        if (showInventory) HandleInventoryInput();

        if (IsKeyPressed(KEY_ONE)) { showToolsPopup = true; isMouseLocked = false; EnableCursor(); }
        if (IsKeyPressed(KEY_TWO)) {
            hpState = (hpState + 1) % 4;
            if (hpState == 1) hpPos = fmax(0, fmin((int)camera.position.y, gridY - 1));
            if (hpState == 2) hpPos = fmax(0, fmin((int)camera.position.x, gridX - 1));
            if (hpState == 3) hpPos = fmax(0, fmin((int)camera.position.z, gridZ - 1));
        }
        if (IsKeyPressed(KEY_THREE)) { selColorIdx = 2; currentTool = TOOL_BRUSH; }

        if (IsKeyPressed(KEY_FOUR)) {
            selColorIdx = 3;
            currentTool = TOOL_BRUSH;
            showSlot4Palette = true;
            isMouseLocked = false;
            EnableCursor();
        }

        for (int i = 4; i < 9; i++) {
            if (IsKeyPressed(KEY_ONE + i)) { selColorIdx = i; currentTool = TOOL_BRUSH; }
        }
        if (IsKeyPressed(KEY_ZERO)) { selColorIdx = 9; currentTool = TOOL_BRUSH; }

        if (IsKeyDown(KEY_LEFT_CONTROL) && IsKeyPressed(KEY_S)) {
            SaveProject("app/project.ht3d");
        }
        if (IsKeyDown(KEY_LEFT_CONTROL) && IsKeyPressed(KEY_V) && clipboard != NULL) {
            isPasting = true;
            pasteMode = 0;
            pastePos = (Vector3){ gridX / 2, gridY / 2, gridZ / 2 };
            isMouseLocked = false;
            EnableCursor();
        }

        Vector3 lookForward = {0};
        if (!isMouseLocked && !showInventory && !showToolsPopup && IsMouseButtonDown(MOUSE_BUTTON_RIGHT)) {
            Vector2 md = GetMouseDelta();
            cameraAngle.x += md.x * 0.003f;
            cameraAngle.y -= md.y * 0.003f;
            if (cameraAngle.y > 1.5f) cameraAngle.y = 1.5f;
            if (cameraAngle.y < -1.5f) cameraAngle.y = -1.5f;
        }

        if ((isMouseLocked || IsMouseButtonDown(MOUSE_BUTTON_RIGHT)) && !showInventory && !showToolsPopup) {
            if (isMouseLocked) {
                Vector2 md = GetMouseDelta();
                cameraAngle.x += md.x * 0.003f;
                cameraAngle.y -= md.y * 0.003f;
                if (cameraAngle.y > 1.5f) cameraAngle.y = 1.5f;
                if (cameraAngle.y < -1.5f) cameraAngle.y = -1.5f;
            }
            lookForward.x = cos(cameraAngle.y) * cos(cameraAngle.x);
            lookForward.y = sin(cameraAngle.y);
            lookForward.z = cos(cameraAngle.y) * sin(cameraAngle.x);

            Vector3 moveForward = Vector3Normalize((Vector3){ cos(cameraAngle.x), 0.0f, sin(cameraAngle.x) });
            Vector3 moveRight = { -moveForward.z, 0.0f, moveForward.x };

            float dt = GetFrameTime() * 14.0f * moveSpeed;
            if (IsKeyDown(KEY_W)) camera.position = Vector3Add(camera.position, Vector3Scale(moveForward, dt));
            if (IsKeyDown(KEY_S)) camera.position = Vector3Subtract(camera.position, Vector3Scale(moveForward, dt));
            if (IsKeyDown(KEY_D)) camera.position = Vector3Add(camera.position, Vector3Scale(moveRight, dt));
            if (IsKeyDown(KEY_A)) camera.position = Vector3Subtract(camera.position, Vector3Scale(moveRight, dt));
            if (IsKeyDown(KEY_SPACE)) camera.position.y += dt;
            if (IsKeyDown(KEY_LEFT_SHIFT)) camera.position.y -= dt;
        } else {
            lookForward.x = cos(cameraAngle.y) * cos(cameraAngle.x);
            lookForward.y = sin(cameraAngle.y);
            lookForward.z = cos(cameraAngle.y) * sin(cameraAngle.x);
        }
        camera.target = Vector3Add(camera.position, lookForward);

        Ray ray = isMouseLocked ? (Ray){camera.position, lookForward} : GetMouseRay(GetMousePosition(), camera);
        float closestDist = 10000.0f;
        Vector3 hitNorm = {0};
        int hitX = -1, hitY = -1, hitZ = -1, placeX = -1, placeY = -1, placeZ = -1;
        bool blockHit = false;

        if (!isMouseLocked && !showInventory && !showToolsPopup) {
            if (isPasting) {
                Vector3 cPos = { pastePos.x + clipSize.x/2.0f, pastePos.y + clipSize.y/2.0f, pastePos.z + clipSize.z/2.0f };
                BoundingBox boxX = { (Vector3){cPos.x, cPos.y-0.5f, cPos.z-0.5f}, (Vector3){cPos.x+4, cPos.y+0.5f, cPos.z+0.5f} };
                BoundingBox boxY = { (Vector3){cPos.x-0.5f, cPos.y, cPos.z-0.5f}, (Vector3){cPos.x+0.5f, cPos.y+4, cPos.z+0.5f} };
                BoundingBox boxZ = { (Vector3){cPos.x-0.5f, cPos.y-0.5f, cPos.z}, (Vector3){cPos.x+0.5f, cPos.y+0.5f, cPos.z+4} };

                int hover = 0;
                if (GetRayCollisionBox(ray, boxX).hit) hover = 1;
                else if (GetRayCollisionBox(ray, boxY).hit) hover = 2;
                else if (GetRayCollisionBox(ray, boxZ).hit) hover = 3;

                if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) activeGizmo = hover;
                if (IsMouseButtonReleased(MOUSE_BUTTON_LEFT)) activeGizmo = 0;

                if (activeGizmo != 0) {
                    Vector3 pNorm = {0};
                    if (activeGizmo == 1) pNorm = (fabs(camera.position.y - cPos.y) > fabs(camera.position.z - cPos.z)) ? (Vector3){0,1,0} : (Vector3){0,0,1};
                    if (activeGizmo == 2) pNorm = (fabs(camera.position.x - cPos.x) > fabs(camera.position.z - cPos.z)) ? (Vector3){1,0,0} : (Vector3){0,0,1};
                    if (activeGizmo == 3) pNorm = (fabs(camera.position.x - cPos.x) > fabs(camera.position.y - cPos.y)) ? (Vector3){1,0,0} : (Vector3){0,1,0};

                    RayCollision coll = GetCustomRayCollisionPlane(ray, cPos, pNorm);
                    if (coll.hit) {
                        if (activeGizmo == 1) pastePos.x = round(coll.point.x - clipSize.x/2.0f);
                        if (activeGizmo == 2) pastePos.y = round(coll.point.y - clipSize.y/2.0f);
                        if (activeGizmo == 3) pastePos.z = round(coll.point.z - clipSize.z/2.0f);
                    }
                }
                if (IsKeyPressed(KEY_ENTER)) {
                    if (pasteMode == 0) pasteMode = 1;
                    else { CommitPaste(); isPasting = false; isMouseLocked = true; DisableCursor(); }
                }
                if (pasteMode == 1 && (IsKeyPressed(KEY_LEFT) || IsKeyPressed(KEY_RIGHT))) RotateClipboardY();
            }
        }

        // Voxel Raycast
        for (int z = 0; z < gridZ; z++) {
            for (int y = 0; y < gridY; y++) {
                for (int x = 0; x < gridX; x++) {
                    Voxel v = grid[GetIndex(x, y, z)];
                    if (v.active && v.exposedMask != 0 && IsPartVisible(v.partId)) {
                        BoundingBox box = { (Vector3){x, y, z}, (Vector3){x + 1, y + 1, z + 1} };
                        RayCollision col = GetRayCollisionBox(ray, box);
                        if (col.hit && col.distance > 0.01f && col.distance < closestDist) {
                            closestDist = col.distance;
                            hitX = x; hitY = y; hitZ = z;
                            hitNorm = col.normal;
                            blockHit = true;
                        }
                    }
                }
            }
        }

        if (!blockHit) {
            float tMin = 10000.0f;
            Vector3 cp = {0};
            if (hpState != 0) {
                if (hpState == 2 && ray.direction.x != 0) {
                    float t = (hpPos - ray.position.x) / ray.direction.x;
                    if (t > 0) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if (cp.y>=0 && cp.y<gridY && cp.z>=0 && cp.z<gridZ) { placeX=hpPos; placeY=(int)cp.y; placeZ=(int)cp.z; } }
                } else if (hpState == 1 && ray.direction.y != 0) {
                    float t = (hpPos - ray.position.y) / ray.direction.y;
                    if (t > 0) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if (cp.x>=0 && cp.x<gridX && cp.z>=0 && cp.z<gridZ) { placeX=(int)cp.x; placeY=hpPos; placeZ=(int)cp.z; } }
                } else if (hpState == 3 && ray.direction.z != 0) {
                    float t = (hpPos - ray.position.z) / ray.direction.z;
                    if (t > 0) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if (cp.x>=0 && cp.x<gridX && cp.y>=0 && cp.y<gridY) { placeX=(int)cp.x; placeY=(int)cp.y; placeZ=hpPos; } }
                }
            } else {
                if (ray.direction.y != 0) {
                    float t = (0 - ray.position.y) / ray.direction.y;
                    if (t > 0 && t < tMin) {
                        cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t));
                        if (cp.x >= 0 && cp.x < gridX && cp.z >= 0 && cp.z < gridZ) {
                            tMin = t; placeX = (int)cp.x; placeY = 0; placeZ = (int)cp.z;
                        }
                    }
                }
            }
        } else {
            placeX = hitX + (int)hitNorm.x;
            placeY = hitY + (int)hitNorm.y;
            placeZ = hitZ + (int)hitNorm.z;
        }

        if (!isPasting && isMouseLocked) {
            if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && blockHit) {
                grid[GetIndex(hitX, hitY, hitZ)].active = false;
                UpdateCulling();
            }

            if (currentTool == TOOL_PICKER && IsMouseButtonPressed(MOUSE_BUTTON_RIGHT) && blockHit) {
                hotbar[selColorIdx] = grid[GetIndex(hitX, hitY, hitZ)].color;
                currentTool = TOOL_BRUSH;
            } else if (currentTool == TOOL_BRUSH) {
                if (IsMouseButtonPressed(MOUSE_BUTTON_RIGHT) && InBounds(placeX, placeY, placeZ)) {
                    int idx = GetIndex(placeX, placeY, placeZ);
                    grid[idx].active = true;
                    grid[idx].color = hotbar[selColorIdx];
                    if (isCharacterMode) {
                        grid[idx].partId = (activePartFilter > 0) ? activePartFilter : (blockHit ? grid[GetIndex(hitX, hitY, hitZ)].partId : 1);
                    }
                    UpdateCulling();
                }
            } else {
                if (IsMouseButtonPressed(MOUSE_BUTTON_RIGHT) && (blockHit || InBounds(placeX, placeY, placeZ))) {
                    isDragging = true;
                    dragStart = blockHit ? (Vector3){hitX, hitY, hitZ} : (Vector3){placeX, placeY, placeZ};
                }
                if (IsMouseButtonReleased(MOUSE_BUTTON_RIGHT) && isDragging) {
                    isDragging = false;
                    if (currentTool == TOOL_SELECT) {
                        selStart = dragStart;
                        selEnd = blockHit ? (Vector3){hitX, hitY, hitZ} : (Vector3){placeX, placeY, placeZ};
                        showSelectPopup = true;
                        isMouseLocked = false;
                        EnableCursor();
                    } else {
                        ApplyTool((int)dragStart.x, (int)dragStart.y, (int)dragStart.z,
                                  blockHit ? hitX : placeX, blockHit ? hitY : placeY, blockHit ? hitZ : placeZ,
                                  currentTool, hotbar[selColorIdx]);
                    }
                }
            }
        }

        if (!isMouseLocked && !showInventory && !showSelectPopup && !showToolsPopup && !showSlot4Palette && !showExportPopup && !showSaveAsPopup && IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
            HandleTopHUDClicks();
        }

        // ==================== RENDER 3D SCENE ====================
        BeginDrawing();
        ClearBackground((Color){ 16, 20, 30, 255 });
        BeginMode3D(camera);

        DrawCubeWires((Vector3){gridX / 2.0f, gridY / 2.0f, gridZ / 2.0f}, gridX, gridY, gridZ, ColorAlpha(SKYBLUE, 0.22f));
        for (int x = 0; x <= gridX; x += 2) {
            DrawLine3D((Vector3){x, 0, 0}, (Vector3){x, 0, gridZ}, ColorAlpha(GRAY, 0.2f));
        }
        for (int z = 0; z <= gridZ; z += 2) {
            DrawLine3D((Vector3){0, 0, z}, (Vector3){gridX, 0, z}, ColorAlpha(GRAY, 0.2f));
        }

        for (int z = 0; z < gridZ; z++) {
            for (int y = 0; y < gridY; y++) {
                for (int x = 0; x < gridX; x++) {
                    Voxel v = grid[GetIndex(x, y, z)];
                    if (v.active && v.exposedMask != 0 && IsPartVisible(v.partId)) {
                        DrawVoxelShaded(x, y, z, v);
                    }
                }
            }
        }

        if (isPasting && clipboard) {
            for (int i = 0; i < clipCount; i++) {
                Vector3 gPos = { pastePos.x + clipboard[i].dx + 0.5f, pastePos.y + clipboard[i].dy + 0.5f, pastePos.z + clipboard[i].dz + 0.5f };
                DrawCube(gPos, 1.0f, 1.0f, 1.0f, ColorAlpha(clipboard[i].color, 0.65f));
            }
        }

        if (!isPasting) {
            if (isDragging) {
                int cX = blockHit ? hitX : placeX;
                int cY = blockHit ? hitY : placeY;
                int cZ = blockHit ? hitZ : placeZ;
                Vector3 center = { (dragStart.x + cX)/2.0f + 0.5f, (dragStart.y + cY)/2.0f + 0.5f, (dragStart.z + cZ)/2.0f + 0.5f };
                float wBox = fabs(dragStart.x - cX) + 1.0f;
                float hBox = fabs(dragStart.y - cY) + 1.0f;
                float lBox = fabs(dragStart.z - cZ) + 1.0f;
                DrawCubeWires(center, wBox, hBox, lBox, (currentTool == TOOL_SELECT) ? LIME : ORANGE);
            } else {
                if (blockHit) {
                    DrawCubeWires((Vector3){hitX + 0.5f, hitY + 0.5f, hitZ + 0.5f}, 1.03f, 1.03f, 1.03f, YELLOW);
                }
                if (InBounds(placeX, placeY, placeZ) && currentTool != TOOL_SELECT && currentTool != TOOL_PICKER && !blockHit) {
                    DrawCubeWires((Vector3){placeX + 0.5f, placeY + 0.5f, placeZ + 0.5f}, 1.0f, 1.0f, 1.0f, ColorAlpha(hotbar[selColorIdx], 0.75f));
                }
            }
        }

        rlDisableDepthTest();
        if (isCharacterMode && showJointsOverlay) {
            for (int j = 0; j < NUM_JOINTS; j++) {
                DrawSphere(charJoints[j].pos, 0.65f, GOLD);
                DrawSphereWires(charJoints[j].pos, 0.75f, 6, 6, ORANGE);
            }
        }

        if (hpState != 0) {
            if (hpState == 2) {
                for (int i = 0; i <= gridY; i += 2) DrawLine3D((Vector3){hpPos, i, 0}, (Vector3){hpPos, i, gridZ}, ColorAlpha(RED, 0.5f));
            } else if (hpState == 1) {
                for (int i = 0; i <= gridX; i += 2) DrawLine3D((Vector3){i, hpPos, 0}, (Vector3){i, hpPos, gridZ}, ColorAlpha(GREEN, 0.5f));
            } else if (hpState == 3) {
                for (int i = 0; i <= gridX; i += 2) DrawLine3D((Vector3){i, 0, hpPos}, (Vector3){i, gridY, hpPos}, ColorAlpha(BLUE, 0.5f));
            }
        }
        rlEnableDepthTest();
        EndMode3D();

        if (isCharacterMode && showJointsOverlay && !showInventory) {
            for (int j = 0; j < NUM_JOINTS; j++) {
                if (Vector3DotProduct(lookForward, Vector3Subtract(charJoints[j].pos, camera.position)) > 0) {
                    Vector2 sp = GetWorldToScreen(charJoints[j].pos, camera);
                    DrawText(charJoints[j].name, (int)sp.x + 8, (int)sp.y - 6, 11, GOLD);
                }
            }
        }

        // Top HUD rendered last so menus are never occluded
        if (!showInventory && appState == STATE_EDITOR) {
            DrawCharacterPartPanel(sw, sh);
            DrawBottomHotbar(sw, sh);
            DrawTopHUD(sw, sh, blockHit ? hitX : placeX, blockHit ? hitY : placeY, blockHit ? hitZ : placeZ);

            if (isMouseLocked) {
                DrawRectangle(sw/2 - 1, sh/2 - 8, 2, 16, WHITE);
                DrawRectangle(sw/2 - 8, sh/2 - 1, 16, 2, WHITE);
            }
        }

        if (showInventory) DrawInventory(sw, sh);
        DrawFPS(sw - 95, sh - 28);
        EndDrawing();
    }

    if (grid != NULL) free(grid);
    if (clipboard != NULL) free(clipboard);
    CloseWindow();
    return 0;
}
