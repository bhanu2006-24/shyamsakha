/**
 * Smooth 2D Camera with bounds clamping and screen shake
 */
export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 800;
        this.height = 600;
        this.smoothing = 0.1;
        this.target = null;
        
        // Screen shake
        this.shakeTimer = 0;
        this.shakeMagnitude = 0;
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    setTarget(target) {
        this.target = target;
    }

    shake(magnitude = 8, duration = 0.25) {
        this.shakeMagnitude = magnitude;
        this.shakeTimer = duration;
    }

    update(dt, mapWidth, mapHeight) {
        if (this.target) {
            const targetX = this.target.x - this.width / 2;
            const targetY = this.target.y - this.height / 2;
            
            this.x += (targetX - this.x) * this.smoothing;
            this.y += (targetY - this.y) * this.smoothing;
        }

        if (isNaN(this.x)) this.x = 0;
        if (isNaN(this.y)) this.y = 0;

        // Clamp inside map boundaries
        this.x = Math.max(0, Math.min(this.x, Math.max(0, mapWidth - this.width)));
        this.y = Math.max(0, Math.min(this.y, Math.max(0, mapHeight - this.height)));

        // Apply shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const currentMag = this.shakeMagnitude * (this.shakeTimer / 0.25);
            this.x += (Math.random() - 0.5) * currentMag * 2;
            this.y += (Math.random() - 0.5) * currentMag * 2;
        }
    }

    isInView(x, y, radius = 50) {
        return (
            x + radius >= this.x &&
            x - radius <= this.x + this.width &&
            y + radius >= this.y &&
            y - radius <= this.y + this.height
        );
    }
}
