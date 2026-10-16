import { Entity } from './Entity.js';
import { assetLoader } from '../core/AssetLoader.js';

export class Krishna extends Entity {
    constructor(x, y) {
        super(x, y, 18, '#0284c7', 360, 460, 'krishna');
        this.name = "Shree Krishna";
        this.isFlutePlaying = false;
        this.fluteTimer = 0;
        this.auraPhase = 0;
        this.isJumping = false;
        this.walkTimer = 0;
        this.isMoving = false;
    }

    playFlute(duration = 3.5) {
        this.isFlutePlaying = true;
        this.fluteTimer = duration;
    }

    update(dt, obstacles, mapWidth, mapHeight, particles) {
        this.auraPhase += dt * 3;

        // Jump physics
        if (this.z > 0 || this.vz !== 0) {
            this.z += this.vz * dt;
            this.vz -= 980 * dt;
            if (this.z <= 0) {
                this.z = 0;
                this.vz = 0;
                this.isJumping = false;
            }
        }

        if (this.fluteTimer > 0) {
            this.fluteTimer -= dt;
            if (this.fluteTimer <= 0) {
                this.isFlutePlaying = false;
            }
            if (Math.random() < 0.25 && particles) {
                particles.createSparkle(
                    this.x + (Math.random() - 0.5) * 40,
                    this.y - 40 + (Math.random() - 0.5) * 30,
                    '#38bdf8'
                );
            }
        }
    }

    moveWithAnim(dx, dy, obstacles, mapWidth, mapHeight, dt) {
        this.isMoving = (dx !== 0 || dy !== 0);
        if (this.isMoving) {
            this.walkTimer += dt;
        }
        this.move(dx, dy, obstacles, mapWidth, mapHeight);
    }

    draw(ctx) {
        ctx.save();

        // Divine Radiance / Halo behind Krishna
        const glowRadius = 38 + Math.sin(this.auraPhase) * 4;
        const grad = ctx.createRadialGradient(this.x, this.y - this.z - 42, 10, this.x, this.y - this.z - 42, glowRadius);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(0.65, 'rgba(250, 204, 21, 0.25)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.z - 42, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw character sprite sheet from assets/images/krishna.png
        const drawn = assetLoader.drawCharacter(
            ctx,
            'krishna',
            this.x,
            this.y,
            this.z,
            this.dx,
            this.dy,
            this.isMoving,
            this.walkTimer,
            74,
            90
        );

        if (!drawn) {
            super.draw(ctx);
        }

        // Flute Musical Note Effect
        if (this.isFlutePlaying) {
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 16px serif';
            ctx.textAlign = 'center';
            ctx.fillText("♫", this.x + 22, this.y - this.z - 75);
        }

        // Holi splat overlay if caught
        if (this.isCaught) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.z - 42, 28, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
