# HyperTex3D Ultimate — Hyperbuild 4D Voxel, Joint Rig & `.hb` Character Studio

HyperTex3D Ultimate is a standalone WebGL 3D/4D voxel character, proportional skeletal joint rig, internal organ anatomy, and `.hb` structure studio engineered specifically for **Hyperbuild 4D**.

## Key Features for Hyperbuild 4D
- **`.hb` Structure Export & Import (`extension: .hb`)**:
  - Stores character **Head Size** (`[headSize, headSize, headSize]`, e.g. `16x16x16`, `8x8x8`, `12x12x12`, `24x24x24`, `32x32x32`).
  - Automatically computes and enforces **Proportional Body Scaling** from the Head Size (when Head is `16x16x16`, Full Torso is `16x24x8`, Upper/Lower Arms & Legs are `4x12x4`, and Total Character Grid is `32x64x32`).
  - Stores every active voxel's **XYZ coordinates** (`x, y, z`), **Hex & RGBA Color** (`color`, `rgba`), **Body/Organ Part ID** (`partId`), and **Joint Binding** (`joint` — the exact skeletal joint that voxel/part follows).
  - Seamless `.hb` **Import System**: Drag-and-drop or browse any `.hb` file to reconstruct the proportional character rig, head size, skeletal joint pivots, and every voxel's XYZ coordinate, color, and joint binding.
- **20 Articulated Body & 3D Internal Organ Segments**:
  - 11 Outer Body Segments (`Head`, `Upper_Torso`, `Lower_Torso`, `L_Upper_Arm`, `L_Lower_Arm`, `R_Upper_Arm`, `R_Lower_Arm`, `L_Upper_Leg`, `L_Lower_Leg`, `R_Upper_Leg`, `R_Lower_Leg`).
  - 9 Volumetric 3D Internal Organs (`Brain`, `Heart`, `Left_Lung`, `Right_Lung`, `Stomach`, `Liver`, `Intestines`, `Spine_Ribcage`, `Pelvis_Core`) with 4D X-Ray Shell & Organ Solo inspection modes.
- **10 Articulated Skeletal Joints**:
  - `neck_joint`, `waist_joint`, `l_shoulder_joint`, `l_elbow_joint`, `r_shoulder_joint`, `r_elbow_joint`, `l_hip_joint`, `l_knee_joint`, `r_hip_joint`, `r_knee_joint`.
