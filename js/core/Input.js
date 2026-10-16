/**
 * Input Manager - Handles Keyboard, Mouse, and Touch interactions
 */
export class Input {
    constructor(canvas, container) {
        this.canvas = canvas;
        this.container = container;
        
        this.keys = {};
        this.justPressed = {};
        
        this.mouse = {
            screenX: 0,
            screenY: 0,
            worldX: 0,
            worldY: 0,
            isDown: false,
            justClicked: false
        };

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (!this.keys[key]) {
                this.justPressed[key] = true;
            }
            this.keys[key] = true;

            // Also keep standard cases
            this.keys[e.key] = true;

            // Prevent spacebar or arrows from scrolling the webpage
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            this.keys[e.key] = false;
        });

        const updateMousePos = (clientX, clientY) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.screenX = clientX - rect.left;
            this.mouse.screenY = clientY - rect.top;
        };

        this.container.addEventListener('mousemove', (e) => {
            updateMousePos(e.clientX, e.clientY);
        });

        this.container.addEventListener('mousedown', (e) => {
            updateMousePos(e.clientX, e.clientY);
            this.mouse.isDown = true;
            this.mouse.justClicked = true;
        });

        window.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });

        // Touch support for mobile / tablets
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
                this.mouse.isDown = true;
                this.mouse.justClicked = true;
            }
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.isDown = false;
        });
    }

    updateWorldMouse(camera) {
        this.mouse.worldX = this.mouse.screenX + camera.x;
        this.mouse.worldY = this.mouse.screenY + camera.y;
    }

    isDown(key) {
        return !!this.keys[key.toLowerCase()] || !!this.keys[key];
    }

    wasJustPressed(key) {
        const k = key.toLowerCase();
        if (this.justPressed[k] || this.justPressed[key]) {
            this.justPressed[k] = false;
            this.justPressed[key] = false;
            return true;
        }
        return false;
    }

    wasMouseClicked() {
        if (this.mouse.justClicked) {
            this.mouse.justClicked = false;
            return true;
        }
        return false;
    }

    /**
     * Clear one-frame press flags at end of frame
     */
    endFrame() {
        this.justPressed = {};
        this.mouse.justClicked = false;
    }

    getMovementVector() {
        let x = 0;
        let y = 0;

        if (this.isDown('ArrowUp') || this.isDown('w')) y -= 1;
        if (this.isDown('ArrowDown') || this.isDown('s')) y += 1;
        if (this.isDown('ArrowLeft') || this.isDown('a')) x -= 1;
        if (this.isDown('ArrowRight') || this.isDown('d')) x += 1;

        const len = Math.hypot(x, y);
        if (len > 0) {
            x /= len;
            y /= len;
        }

        return { x, y, isMoving: len > 0 };
    }
}
