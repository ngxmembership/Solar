// Seven-sphere palette, shared by the 3D scene and the DOM diagram.
// Kept free of three.js imports so the page's first bundle never pulls in the 3D engine.

/** Index 0 is the outermost sphere (the Moon's gate, cool violet); the innermost, nearest Solar, is warm. */
export const SPHERE_COLORS = ['#c4a8f0', '#8f9cf0', '#8cc8f0', '#8fe3c8', '#ffd27a', '#ffb547', '#ff8f7a'] as const
