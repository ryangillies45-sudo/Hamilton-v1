// Logical pixel canvas for the vertical (9:16) film. Rendered at 360x640 and
// scaled exactly 3x with nearest-neighbour to the 1080x1920 master, so every
// art pixel is a 3x3 block.
export const W = 360;
export const H = 640;
export const FPS = 30;
export const FRAMES = 2100; // exactly 70.0 s
export const SCALE = 3;

// TikTok interface areas to keep clear of important text (logical px):
// top bar, bottom caption/music area, right-hand action rail.
export const SAFE = {top: 50, bottom: 500, left: 20, right: 320};
