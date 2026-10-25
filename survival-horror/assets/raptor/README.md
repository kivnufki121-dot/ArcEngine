# Animated PBR Velociraptor integration

Source: https://sketchfab.com/3d-models/pbr-velociraptor-animated-8f1744af7b0847a2aabe3df90be802f0

Author: Ferocious Industries
License listed on Sketchfab: Creative Commons Attribution (CC BY). Verify the license included with the downloaded archive and retain author attribution.

The model's binary file is **not included** in this repository yet. Sketchfab/Fab requires a download flow which is not available to the automated build. Do not claim it is bundled.

Expected filename: `survival-horror/assets/raptor/velociraptor.glb`

The game now tries to load that local GLB at startup, uses its animation groups (idle/walk/attack when named accordingly), and retains the existing procedural raptor if it is absent. A Babylon glTF loader is fetched from the official Babylon CDN only when a local model exists; thus an offline machine will require bundling the loader.

Integration status: loader code added; actual asset download, animation naming, axis orientation, scale, visual QA, and game browser testing remain pending.
