/**
 * AssetLoader - Preloads and caches character sprite sheets and textures
 */
export class AssetLoader {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.isLoaded = false;
    }

    loadAll(onProgress = null) {
        const imagePaths = {
            krishna: 'assets/images/krishna.png',
            balram: 'assets/images/balram.png',
            player: 'assets/images/sakha.png',
            sakha1: 'assets/images/sakha 1.png',
            sakha2: 'assets/images/sakha 2.png',
            sakha3: 'assets/images/sakha 3.png',
            sakha4: 'assets/images/sakha 4.png',
            sakha5: 'assets/images/sakha 5.png',
            sakha6: 'assets/images/sakha 6.png',
            sakha7: 'assets/images/sakha 7.png',
            sakha8: 'assets/images/sakha 8.png'
        };

        const keys = Object.keys(imagePaths);
        this.totalCount = keys.length;

        return new Promise((resolve) => {
            let loaded = 0;
            keys.forEach((key) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    loaded++;
                    this.loadedCount = loaded;
                    if (onProgress) onProgress(loaded, this.totalCount);
                    if (loaded >= this.totalCount) {
                        this.isLoaded = true;
                        resolve(this.images);
                    }
                };
                img.onerror = () => {
                    console.warn(`Failed to load sprite: ${imagePaths[key]}, will use procedural fallback`);
                    loaded++;
                    if (loaded >= this.totalCount) {
                        this.isLoaded = true;
                        resolve(this.images);
                    }
                };
                img.src = encodeURI(imagePaths[key]);
            });
        });
    }

    getImage(key) {
        return this.images[key] || null;
    }

    /**
     * Helper to render a character from a 2048x2048 2x2 sprite sheet:
     * - Top-Left     (0, 0, 1024, 1024):      Facing DOWN / FRONT
     * - Top-Right    (1024, 0, 1024, 1024):   Facing UP / BACK
     * - Bottom-Left  (0, 1024, 1024, 1024):   Facing LEFT
     * - Bottom-Right (1024, 1024, 1024, 1024): Facing RIGHT
     */
    drawCharacter(ctx, imgKey, x, y, z = 0, dx = 0, dy = 1, isMoving = false, walkTimer = 0, drawWidth = 72, drawHeight = 88) {
        const img = this.getImage(imgKey);
        if (!img) return false;

        // Determine Quadrant based on facing direction
        let sx = 0;
        let sy = 0;
        const sw = 1024;
        const sh = 1024;

        if (!isMoving) {
            // Idle / Resting pose: always face FRONT (Top-Left quadrant)
            sx = 0;
            sy = 0;
        } else if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                // Facing LEFT -> Bottom-Left quadrant
                sx = 0;
                sy = 1024;
            } else {
                // Facing RIGHT -> Bottom-Right quadrant
                sx = 1024;
                sy = 1024;
            }
        } else {
            if (dy < 0) {
                // Facing UP (Back view) -> Top-Right quadrant
                sx = 1024;
                sy = 0;
            } else {
                // Facing DOWN (Front view) -> Top-Left quadrant
                sx = 0;
                sy = 0;
            }
        }

        ctx.save();

        // 1. Ground Shadow (Always stays on the ground at x, y)
        const shadowScale = Math.max(0.3, 1 - z / 300);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(x, y, 18 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Character Position with Z-height and walking bob
        const walkBob = isMoving ? Math.sin(walkTimer * 12) * 2.5 : 0;
        const walkTilt = isMoving ? Math.sin(walkTimer * 6) * 0.04 : 0;

        // Feet touch ground at (x, y - z)
        ctx.translate(x, y - z - drawHeight * 0.46 + walkBob);
        ctx.rotate(walkTilt);

        // Draw character sprite
        ctx.drawImage(
            img,
            sx, sy, sw, sh,
            -drawWidth / 2, -drawHeight / 2,
            drawWidth, drawHeight
        );

        ctx.restore();
        return true;
    }
}

export const assetLoader = new AssetLoader();
