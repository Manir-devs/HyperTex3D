#include "hypertex.h"
#include "raymath.h"
#include "rlgl.h" 
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <stdio.h> // FIXED: Added stdio.h for sprintf

RayCollision GetCustomRayCollisionPlane(Ray ray, Vector3 planePos, Vector3 planeNormal) {
    RayCollision result = {0}; 
    float denom = Vector3DotProduct(ray.direction, planeNormal);
    if (fabs(denom) > 0.000001f) {
        float t = Vector3DotProduct(Vector3Subtract(planePos, ray.position), planeNormal) / denom;
        if (t >= 0) { 
            result.hit = true; result.distance = t; 
            result.point = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); 
            result.normal = planeNormal; 
        }
    }
    return result;
}

int main(void) {
    const int w = 1280, h = 720;
    SetConfigFlags(FLAG_MSAA_4X_HINT); InitWindow(w, h, "HyperTex3D - Import & Export Engine"); SetTargetFPS(60);
    Camera3D camera = { 0 }; camera.up = (Vector3){ 0.0f, 1.0f, 0.0f }; camera.fovy = 60.0f; camera.projection = CAMERA_PERSPECTIVE;
    bool isDragging = false; Vector3 dragStart = {0,0,0};

    while (!WindowShouldClose()) {

        if (IsFileDropped()) {
            FilePathList droppedFiles = LoadDroppedFiles();
            if (droppedFiles.count > 0 && IsFileExtension(droppedFiles.paths[0], ".png")) {
                if (importImage.data != NULL) { UnloadImage(importImage); }
                if (importTexture.id != 0) { UnloadTexture(importTexture); }
                importImage = LoadImage(droppedFiles.paths[0]);
                if (importImage.data != NULL) {
                    importTexture = LoadTextureFromImage(importImage);
                    importSelectRec = (Rectangle){0, 0, importImage.width, importImage.height};
                    sprintf(cropX, "0"); sprintf(cropY, "0"); 
                    sprintf(cropW, "%d", importImage.width); sprintf(cropH, "%d", importImage.height);
                    appState = STATE_IMPORT_2D;
                    isMouseLocked = false; EnableCursor();
                }
            }
            UnloadDroppedFiles(droppedFiles);
        }

        if (appState == STATE_STARTUP) {
            if (IsKeyPressed(KEY_UP) && gridSize < 128) gridSize += 8;
            if (IsKeyPressed(KEY_DOWN) && gridSize > 8) gridSize -= 8;
            if (IsKeyPressed(KEY_ENTER)) {
                InitEngine(gridSize);
                camera.position = (Vector3){ gridSize/2.0f, gridSize/2.0f, gridSize*1.2f };
                cameraAngle.x = -PI/2.0f; cameraAngle.y = 0.0f;
                appState = STATE_EDITOR; isMouseLocked = true; DisableCursor();
            }
            BeginDrawing(); DrawStartupUI(w, h); EndDrawing(); continue;
        }

        if (appState == STATE_IMPORT_PATH) {
            HandlePopupInputs();
            BeginDrawing(); DrawImportPathPopup(w, h); EndDrawing(); continue;
        }

        if (appState == STATE_IMPORT_2D) {
            HandleImport2DInput();
            if (IsKeyPressed(KEY_ESCAPE)) {
                appState = STATE_EDITOR; isMouseLocked = true; DisableCursor();
            } else if (IsKeyPressed(KEY_ENTER)) {
                CreateClipboardFromImage();
                appState = STATE_EDITOR; isPasting = true; pasteMode = 0; 
                pastePos = (Vector3){gridSize/2, gridSize/2, gridSize/2};
                isMouseLocked = false; EnableCursor();
            }
            BeginDrawing(); DrawImport2DScreen(w, h); EndDrawing(); continue;
        }

        if (showSelectPopup) { BeginDrawing(); DrawSelectPopup(w, h); EndDrawing(); continue; }
        if (showToolsPopup) { BeginDrawing(); DrawToolsPopup(w, h); EndDrawing(); continue; }
        if (showExportPopup) { HandlePopupInputs(); BeginDrawing(); DrawExportPopup(w, h); EndDrawing(); continue; }

        if (IsKeyPressed(KEY_Q) && !showInventory) { 
            isMouseLocked = !isMouseLocked; 
            if (isMouseLocked) { DisableCursor(); } else { EnableCursor(); }
        }
        
        if (IsKeyPressed(KEY_E)) {
            showInventory = !showInventory;
            if (showInventory) { 
                isMouseLocked = false; EnableCursor(); hexBoxActive = false; 
            } else { 
                isMouseLocked = true; DisableCursor(); 
                if(currentTool == TOOL_PICKER) { currentTool = TOOL_BRUSH; }
            }
        }
        if (showInventory) { HandleInventoryInput(); }

        if (IsKeyPressed(KEY_ONE)) { showToolsPopup = true; isMouseLocked = false; EnableCursor(); } 
        if (IsKeyPressed(KEY_TWO)) { 
            hpState = (hpState + 1) % 4; 
            if (hpState==1) hpPos = fmax(0, fmin((int)camera.position.y, gridSize - 1));
            if (hpState==2) hpPos = fmax(0, fmin((int)camera.position.x, gridSize - 1));
            if (hpState==3) hpPos = fmax(0, fmin((int)camera.position.z, gridSize - 1));
        } 
        if (IsKeyPressed(KEY_THREE)) { selColorIdx = 2; currentTool = TOOL_BRUSH; } 
        for (int i = 3; i < 9; i++) { if (IsKeyPressed(KEY_ONE + i)) { selColorIdx = i; currentTool = TOOL_BRUSH; } }
        if (IsKeyPressed(KEY_ZERO)) { selColorIdx = 9; currentTool = TOOL_BRUSH; }

        if (IsKeyDown(KEY_LEFT_CONTROL) && IsKeyPressed(KEY_V) && clipboard != NULL) {
            isPasting = true; pasteMode = 0; pastePos = (Vector3){gridSize/2, gridSize/2, gridSize/2};
            isMouseLocked = false; EnableCursor(); 
        }

        int hitX = -1, hitY = -1, hitZ = -1, placeX = -1, placeY = -1, placeZ = -1;
        bool blockHit = false; Vector3 lookForward = {0};

        if (!isMouseLocked && !showInventory && !showToolsPopup) {
            if (IsMouseButtonDown(MOUSE_BUTTON_RIGHT)) {
                Vector2 md = GetMouseDelta(); 
                cameraAngle.x += md.x * 0.003f; cameraAngle.y -= md.y * 0.003f;
                if (cameraAngle.y > 1.5f) { cameraAngle.y = 1.5f; }
                if (cameraAngle.y < -1.5f) { cameraAngle.y = -1.5f; }
            }
        }

        if ((isMouseLocked || IsMouseButtonDown(MOUSE_BUTTON_RIGHT)) && !showInventory && !showToolsPopup) {
            if (isMouseLocked) {
                Vector2 md = GetMouseDelta(); 
                cameraAngle.x += md.x * 0.003f; cameraAngle.y -= md.y * 0.003f;
                if (cameraAngle.y > 1.5f) { cameraAngle.y = 1.5f; }
                if (cameraAngle.y < -1.5f) { cameraAngle.y = -1.5f; }
            }
            lookForward.x = cos(cameraAngle.y) * cos(cameraAngle.x); lookForward.y = sin(cameraAngle.y); lookForward.z = cos(cameraAngle.y) * sin(cameraAngle.x);
            Vector3 moveForward = Vector3Normalize((Vector3){ cos(cameraAngle.x), 0.0f, sin(cameraAngle.x) }); 
            Vector3 moveRight = { -moveForward.z, 0.0f, moveForward.x };

            float dt = GetFrameTime() * 10.0f * moveSpeed;
            if (IsKeyDown(KEY_W)) camera.position = Vector3Add(camera.position, Vector3Scale(moveForward, dt));
            if (IsKeyDown(KEY_S)) camera.position = Vector3Subtract(camera.position, Vector3Scale(moveForward, dt));
            if (IsKeyDown(KEY_D)) camera.position = Vector3Add(camera.position, Vector3Scale(moveRight, dt));
            if (IsKeyDown(KEY_A)) camera.position = Vector3Subtract(camera.position, Vector3Scale(moveRight, dt));
            if (IsKeyDown(KEY_SPACE)) camera.position.y += dt;
            if (IsKeyDown(KEY_LEFT_SHIFT)) camera.position.y -= dt;
        } else {
            lookForward.x = cos(cameraAngle.y) * cos(cameraAngle.x); lookForward.y = sin(cameraAngle.y); lookForward.z = cos(cameraAngle.y) * sin(cameraAngle.x);
        }
        camera.target = Vector3Add(camera.position, lookForward);

        Ray ray = isMouseLocked ? (Ray){camera.position, lookForward} : GetMouseRay(GetMousePosition(), camera);
        float closestDist = 1000.0f; Vector3 hitNorm = {0};

        if (!isMouseLocked && !showInventory && !showToolsPopup) {
            if (isPasting) {
                Vector3 cPos = { pastePos.x + clipSize.x/2.0f, pastePos.y + clipSize.y/2.0f, pastePos.z + clipSize.z/2.0f };
                BoundingBox boxX = { (Vector3){cPos.x, cPos.y-0.5f, cPos.z-0.5f}, (Vector3){cPos.x+4, cPos.y+0.5f, cPos.z+0.5f} };
                BoundingBox boxY = { (Vector3){cPos.x-0.5f, cPos.y, cPos.z-0.5f}, (Vector3){cPos.x+0.5f, cPos.y+4, cPos.z+0.5f} };
                BoundingBox boxZ = { (Vector3){cPos.x-0.5f, cPos.y-0.5f, cPos.z}, (Vector3){cPos.x+0.5f, cPos.y+0.5f, cPos.z+4} };

                int hover = 0;
                if (GetRayCollisionBox(ray, boxX).hit) { hover = 1; }
                else if (GetRayCollisionBox(ray, boxY).hit) { hover = 2; }
                else if (GetRayCollisionBox(ray, boxZ).hit) { hover = 3; }

                if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) { activeGizmo = hover; }
                if (IsMouseButtonReleased(MOUSE_BUTTON_LEFT)) { activeGizmo = 0; }

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
                    if (pasteMode == 0) { pasteMode = 1; } 
                    else { CommitPaste(); isPasting = false; isMouseLocked = true; DisableCursor(); } 
                }
                if (pasteMode == 1 && (IsKeyPressed(KEY_LEFT) || IsKeyPressed(KEY_RIGHT))) { RotateClipboardY(); }
            }
            
            if (hpState != 0) {
                Vector3 hPos = { gridSize/2.0f, hpState==1?hpPos:gridSize/2.0f, gridSize/2.0f };
                if (hpState==2) { hPos.x = hpPos; }
                if (hpState==3) { hPos.z = hpPos; }
                
                BoundingBox hpBox = { (Vector3){hPos.x-1, hPos.y-1, hPos.z-1}, (Vector3){hPos.x+1, hPos.y+1, hPos.z+1} };
                if (hpState==1) { hpBox.max.y += 3; } if (hpState==2) { hpBox.max.x += 3; } if (hpState==3) { hpBox.max.z += 3; }

                if (GetRayCollisionBox(ray, hpBox).hit && IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) { activeGizmo = hpState; }
                if (IsMouseButtonReleased(MOUSE_BUTTON_LEFT)) { activeGizmo = 0; }

                if (activeGizmo != 0) {
                    Vector3 pNorm = (hpState==1) ? (Vector3){1,0,0} : (Vector3){0,1,0};
                    RayCollision coll = GetCustomRayCollisionPlane(ray, hPos, pNorm);
                    if (coll.hit) {
                        if (hpState==1) hpPos = fmax(0, fmin(round(coll.point.y), gridSize-1));
                        if (hpState==2) hpPos = fmax(0, fmin(round(coll.point.x), gridSize-1));
                        if (hpState==3) hpPos = fmax(0, fmin(round(coll.point.z), gridSize-1));
                    }
                }
            }
        }

        for (int x=0; x<gridSize; x++) {
            for (int y=0; y<gridSize; y++) {
                for (int z=0; z<gridSize; z++) {
                    if (grid[GetIndex(x,y,z)].active && grid[GetIndex(x,y,z)].exposed) {
                        BoundingBox box = { (Vector3){x, y, z}, (Vector3){x+1, y+1, z+1} };
                        RayCollision col = GetRayCollisionBox(ray, box);
                        if (col.hit && col.distance > 0.01f && col.distance < closestDist) {
                            closestDist = col.distance; hitX = x; hitY = y; hitZ = z; hitNorm = col.normal; blockHit = true;
                        }
                    }
                }
            }
        }

        if (!blockHit) {
            float tMin = 1000.0f; Vector3 cp = {0};
            if (hpState != 0) {
                if (hpState == 2 && ray.direction.x != 0) { 
                    float t = (hpPos - ray.position.x) / ray.direction.x; 
                    if (t > 0) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if (cp.y>=0 && cp.y<=gridSize && cp.z>=0 && cp.z<=gridSize) { placeX=hpPos; placeY=(int)cp.y; placeZ=(int)cp.z; } } 
                }
                else if (hpState == 1 && ray.direction.y != 0) { 
                    float t = (hpPos - ray.position.y) / ray.direction.y; 
                    if (t > 0) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if (cp.x>=0 && cp.x<=gridSize && cp.z>=0 && cp.z<=gridSize) { placeX=(int)cp.x; placeY=hpPos; placeZ=(int)cp.z; } } 
                }
                else if (hpState == 3 && ray.direction.z != 0) { 
                    float t = (hpPos - ray.position.z) / ray.direction.z; 
                    if (t > 0) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if (cp.x>=0 && cp.x<=gridSize && cp.y>=0 && cp.y<=gridSize) { placeX=(int)cp.x; placeY=(int)cp.y; placeZ=hpPos; } } 
                }
            } else {
                if (ray.direction.x != 0) { 
                    float t = (0 - ray.position.x) / ray.direction.x; 
                    if (t>0 && t<tMin) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if(cp.y>=0&&cp.y<=gridSize&&cp.z>=0&&cp.z<=gridSize) { tMin=t; placeX=0; placeY=(int)cp.y; placeZ=(int)cp.z; } } 
                    t = (gridSize - ray.position.x) / ray.direction.x; 
                    if (t>0 && t<tMin) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if(cp.y>=0&&cp.y<=gridSize&&cp.z>=0&&cp.z<=gridSize) { tMin=t; placeX=gridSize-1; placeY=(int)cp.y; placeZ=(int)cp.z; } }
                }
                if (ray.direction.y != 0) { 
                    float t = (0 - ray.position.y) / ray.direction.y; 
                    if (t>0 && t<tMin) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if(cp.x>=0&&cp.x<=gridSize&&cp.z>=0&&cp.z<=gridSize) { tMin=t; placeX=(int)cp.x; placeY=0; placeZ=(int)cp.z; } } 
                    t = (gridSize - ray.position.y) / ray.direction.y; 
                    if (t>0 && t<tMin) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if(cp.x>=0&&cp.x<=gridSize&&cp.z>=0&&cp.z<=gridSize) { tMin=t; placeX=(int)cp.x; placeY=gridSize-1; placeZ=(int)cp.z; } }
                }
                if (ray.direction.z != 0) { 
                    float t = (0 - ray.position.z) / ray.direction.z; 
                    if (t>0 && t<tMin) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if(cp.x>=0&&cp.x<=gridSize&&cp.y>=0&&cp.y<=gridSize) { tMin=t; placeX=(int)cp.x; placeY=(int)cp.y; placeZ=0; } } 
                    t = (gridSize - ray.position.z) / ray.direction.z; 
                    if (t>0 && t<tMin) { cp = Vector3Add(ray.position, Vector3Scale(ray.direction, t)); if(cp.x>=0&&cp.x<=gridSize&&cp.y>=0&&cp.y<=gridSize) { tMin=t; placeX=(int)cp.x; placeY=(int)cp.y; placeZ=gridSize-1; } }
                }
            }
        } else { placeX = hitX + (int)hitNorm.x; placeY = hitY + (int)hitNorm.y; placeZ = hitZ + (int)hitNorm.z; }

        if (!isPasting && isMouseLocked) {
            if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && blockHit) { 
                grid[GetIndex(hitX,hitY,hitZ)].active = false; UpdateCulling(); 
            }
            
            if (currentTool == TOOL_PICKER && IsMouseButtonPressed(MOUSE_BUTTON_RIGHT) && blockHit) {
                hotbar[selColorIdx] = grid[GetIndex(hitX,hitY,hitZ)].color; currentTool = TOOL_BRUSH;
            } else if (currentTool == TOOL_BRUSH) {
                if (IsMouseButtonPressed(MOUSE_BUTTON_RIGHT) && InBounds(placeX,placeY,placeZ)) { 
                    grid[GetIndex(placeX,placeY,placeZ)].active = true; grid[GetIndex(placeX,placeY,placeZ)].color = hotbar[selColorIdx]; UpdateCulling(); 
                }
            } else {
                if (IsMouseButtonPressed(MOUSE_BUTTON_RIGHT) && (blockHit || InBounds(placeX,placeY,placeZ))) { 
                    isDragging = true; dragStart = blockHit ? (Vector3){hitX, hitY, hitZ} : (Vector3){placeX, placeY, placeZ}; 
                }
                if (IsMouseButtonReleased(MOUSE_BUTTON_RIGHT) && isDragging) {
                    isDragging = false; 
                    if (currentTool == TOOL_SELECT) { 
                        selStart = dragStart; selEnd = blockHit ? (Vector3){hitX, hitY, hitZ} : (Vector3){placeX, placeY, placeZ}; 
                        showSelectPopup = true; isMouseLocked = false; EnableCursor(); 
                    } else { 
                        ApplyTool((int)dragStart.x, (int)dragStart.y, (int)dragStart.z, blockHit ? hitX : placeX, blockHit ? hitY : placeY, blockHit ? hitZ : placeZ, currentTool, hotbar[selColorIdx]); 
                    }
                }
            }
        }

        if (!isMouseLocked && !showInventory && !showSelectPopup && !showToolsPopup && !showExportPopup && appState != STATE_IMPORT_2D && IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
            HandleTopHUDClicks();
        }

        BeginDrawing(); ClearBackground((Color){ 20, 24, 34, 255 }); BeginMode3D(camera);
            
            DrawCubeWires((Vector3){gridSize/2.0f, gridSize/2.0f, gridSize/2.0f}, gridSize, gridSize, gridSize, ColorAlpha(GRAY, 0.2f));

            for (int x=0; x<gridSize; x++) {
                for (int y=0; y<gridSize; y++) {
                    for (int z=0; z<gridSize; z++) {
                        if (grid[GetIndex(x,y,z)].active && grid[GetIndex(x,y,z)].exposed) {
                            if (grid[GetIndex(x,y,z)].color.a == 0) { 
                                DrawCubeWires((Vector3){ x+0.5f, y+0.5f, z+0.5f }, 1.0f, 1.0f, 1.0f, Fade(RED, 0.4f));
                                DrawCube((Vector3){ x+0.5f, y+0.5f, z+0.5f }, 0.9f, 0.9f, 0.9f, Fade(RED, 0.1f));
                            } else {
                                DrawCube((Vector3){ x+0.5f, y+0.5f, z+0.5f }, 1.0f, 1.0f, 1.0f, grid[GetIndex(x,y,z)].color);
                                DrawCubeWires((Vector3){ x+0.5f, y+0.5f, z+0.5f }, 1.0f, 1.0f, 1.0f, ColorAlpha(BLACK, 0.4f));
                            }
                        }
                    }
                }
            }

            if (isPasting && clipboard) {
                for (int i = 0; i < clipCount; i++) {
                    Vector3 gPos = { pastePos.x + clipboard[i].dx + 0.5f, pastePos.y + clipboard[i].dy + 0.5f, pastePos.z + clipboard[i].dz + 0.5f };
                    DrawCube(gPos, 1.0f, 1.0f, 1.0f, ColorAlpha(clipboard[i].color, 0.6f));
                }
            }

            if (!isPasting) {
                if (isDragging) {
                    int cX = blockHit ? hitX : placeX; int cY = blockHit ? hitY : placeY; int cZ = blockHit ? hitZ : placeZ;
                    Vector3 center = { (dragStart.x + cX)/2.0f + 0.5f, (dragStart.y + cY)/2.0f + 0.5f, (dragStart.z + cZ)/2.0f + 0.5f };
                    float wBox = fabs(dragStart.x - cX) + 1.0f; float hBox = fabs(dragStart.y - cY) + 1.0f; float lBox = fabs(dragStart.z - cZ) + 1.0f;
                    DrawCubeWires(center, wBox, hBox, lBox, (currentTool == TOOL_SELECT) ? LIME : ORANGE);
                } else {
                    if (blockHit) { DrawCubeWires((Vector3){hitX+0.5f, hitY+0.5f, hitZ+0.5f}, 1.02f, 1.02f, 1.02f, BLACK); }
                    if (InBounds(placeX, placeY, placeZ) && currentTool != TOOL_SELECT && currentTool != TOOL_PICKER && !blockHit) {
                        DrawCubeWires((Vector3){placeX+0.5f, placeY+0.5f, placeZ+0.5f}, 1.0f, 1.0f, 1.0f, ColorAlpha(hotbar[selColorIdx], 0.7f));
                    }
                }
            } else if (isMouseLocked && currentTool == TOOL_PICKER && blockHit) { DrawCubeWires((Vector3){hitX+0.5f, hitY+0.5f, hitZ+0.5f}, 1.1f, 1.1f, 1.1f, YELLOW); }
            
            rlDisableDepthTest();
            if (hpState != 0) {
                if (hpState == 2) {
                    for(int i=0; i<=gridSize; i++) { DrawLine3D((Vector3){hpPos, i, 0}, (Vector3){hpPos, i, gridSize}, WHITE); DrawLine3D((Vector3){hpPos, 0, i}, (Vector3){hpPos, gridSize, i}, WHITE); }
                    DrawCylinderEx((Vector3){hpPos, gridSize/2.0f, gridSize/2.0f}, (Vector3){hpPos+3, gridSize/2.0f, gridSize/2.0f}, 0.2f, 0.2f, 8, RED); 
                }
                if (hpState == 1) {
                    for(int i=0; i<=gridSize; i++) { DrawLine3D((Vector3){i, hpPos, 0}, (Vector3){i, hpPos, gridSize}, WHITE); DrawLine3D((Vector3){0, hpPos, i}, (Vector3){gridSize, hpPos, i}, WHITE); }
                    DrawCylinderEx((Vector3){gridSize/2.0f, hpPos, gridSize/2.0f}, (Vector3){gridSize/2.0f, hpPos+3, gridSize/2.0f}, 0.2f, 0.2f, 8, GREEN); 
                }
                if (hpState == 3) {
                    for(int i=0; i<=gridSize; i++) { DrawLine3D((Vector3){i, 0, hpPos}, (Vector3){i, gridSize, hpPos}, WHITE); DrawLine3D((Vector3){0, i, hpPos}, (Vector3){gridSize, i, hpPos}, WHITE); }
                    DrawCylinderEx((Vector3){gridSize/2.0f, gridSize/2.0f, hpPos}, (Vector3){gridSize/2.0f, gridSize/2.0f, hpPos+3}, 0.2f, 0.2f, 8, BLUE); 
                }
            }
            if (isPasting && clipboard) {
                Vector3 cPos = { pastePos.x + clipSize.x/2.0f, pastePos.y + clipSize.y/2.0f, pastePos.z + clipSize.z/2.0f };
                if (pasteMode == 0) { 
                    DrawCylinderEx(cPos, (Vector3){cPos.x+4, cPos.y, cPos.z}, 0.1f, 0.1f, 8, RED); DrawCylinderEx((Vector3){cPos.x+4, cPos.y, cPos.z}, (Vector3){cPos.x+5, cPos.y, cPos.z}, 0.4f, 0.0f, 8, RED);
                    DrawCylinderEx(cPos, (Vector3){cPos.x, cPos.y+4, cPos.z}, 0.1f, 0.1f, 8, GREEN); DrawCylinderEx((Vector3){cPos.x, cPos.y+4, cPos.z}, (Vector3){cPos.x, cPos.y+5, cPos.z}, 0.4f, 0.0f, 8, GREEN);
                    DrawCylinderEx(cPos, (Vector3){cPos.x, cPos.y, cPos.z+4}, 0.1f, 0.1f, 8, BLUE); DrawCylinderEx((Vector3){cPos.x, cPos.y, cPos.z+4}, (Vector3){cPos.x, cPos.y, cPos.z+5}, 0.4f, 0.0f, 8, BLUE);
                } else { DrawCircle3D(cPos, 3.0f, (Vector3){0,1,0}, 90.0f, ORANGE); }
            }
            rlEnableDepthTest();
        EndMode3D();

        int step = (gridSize > 32) ? 5 : 2;
        for (int i = 0; i <= gridSize; i += step) {
            if (i == 0) continue;
            if (Vector3DotProduct(lookForward, Vector3Subtract((Vector3){i,0,0}, camera.position)) > 0) { Vector2 p = GetWorldToScreen((Vector3){i,0,0}, camera); DrawText(TextFormat("%d", i), p.x, p.y, 10, RED); }
            if (Vector3DotProduct(lookForward, Vector3Subtract((Vector3){0,i,0}, camera.position)) > 0) { Vector2 p = GetWorldToScreen((Vector3){0,i,0}, camera); DrawText(TextFormat("%d", i), p.x, p.y, 10, GREEN); }
            if (Vector3DotProduct(lookForward, Vector3Subtract((Vector3){0,0,i}, camera.position)) > 0) { Vector2 p = GetWorldToScreen((Vector3){0,0,i}, camera); DrawText(TextFormat("%d", i), p.x, p.y, 10, SKYBLUE); }
        }

        if (!showInventory && appState == STATE_EDITOR && !showSelectPopup && !showToolsPopup && !showExportPopup) {
            DrawTopHUD(w, h, (hitY != -1) ? hitX : placeX, (hitY != -1) ? hitY : placeY, (hitY != -1) ? hitZ : placeZ);
            if (isPasting) { DrawText(pasteMode == 0 ? "PASTING: Drag Arrows to Move | ENTER to Rotate" : "ROTATING: Left/Right Arrows | ENTER to Confirm", w/2 - 250, h/2 + 30, 20, YELLOW); }
            if (isMouseLocked) { DrawRectangle(w/2 - 2, h/2 - 10, 4, 20, (currentTool==TOOL_SELECT)?LIME:WHITE); DrawRectangle(w/2 - 10, h/2 - 2, 20, 4, (currentTool==TOOL_SELECT)?LIME:WHITE); }
            
            int sX = (w / 2) - 250; 
            DrawRectangle(sX - 10, h - 45, 520, 35, ColorAlpha(BLACK, 0.7f));
            for (int i=0; i<10; i++) {
                Rectangle rect = { sX + (i*50), h - 40, 40, 25 };
                if (i == 0) { DrawRectangleRec(rect, DARKGRAY); DrawText("OPT", rect.x+10, rect.y+8, 10, WHITE); } 
                else if (i == 1) { DrawRectangleRec(rect, (hpState>0) ? DARKGREEN : MAROON); DrawText("HLP", rect.x+10, rect.y+8, 10, WHITE); } 
                else if (i == 2) { DrawRectangleRec(rect, DARKGRAY); DrawText("BAR", rect.x+10, rect.y+8, 10, WHITE); if (selColorIdx==2) { DrawRectangleLinesEx(rect, 2, YELLOW); } } 
                else { DrawRectangleRec(rect, hotbar[i]); if (selColorIdx == i) { DrawRectangleLinesEx(rect, 2, WHITE); } }
                DrawText(TextFormat("%d", (i==9)?0:i+1), rect.x+15, rect.y-15, 10, WHITE);
            }
        }
        if (showInventory) { DrawInventory(w, h); }
        DrawFPS(w - 100, h - 30); 
        EndDrawing();
    }
    if (grid != NULL) { free(grid); }
    if (clipboard != NULL) { free(clipboard); }
    CloseWindow(); 
    return 0;
}
