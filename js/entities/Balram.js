import { Entity } from './Entity.js';
import { assetLoader } from '../core/AssetLoader.js';

export class Balram extends Entity {
    constructor(x, y) {
        super(x, y, 19, '#f8fafc', 340, 430, 'dao');
        this.name = "Dao Balaram";
        this.isSpiking = false;
        this.walkTimer = 0;
        this.isMoving = false;
        this.auraPhase = 0;
    }

    update(dt, obstacles, mapWidth, mapHeight, particles) {
        this.auraPhase += dt * 2.5;

        // Jump physics
        if (this.z > 0 || this.vz !== 0) {
            this.z += this.vz * dt;
            this.vz -= 980 * dt;
            if (this.z <= 0) {
                this.z = 0;
                this.vz = 0;
                this.isSpiking = false;
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

        // Moonlight / Silver Radiance Aura behind Balram
        const glowRadius = 38 + Math.sin(this.auraPhase) * 3;
        const grad = ctx.createRadialGradient(this.x, this.y - this.z - 44, 10, this.x, this.y - this.z - 44, glowRadius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(0.7, 'rgba(147, 197, 253, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.z - 44, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw character sprite sheet from assets/images/balram.png
        const drawn = assetLoader.drawCharacter(
            ctx,
            'balram',
            this.x,
            this.y,
            this.z,
            this.dx,
            this.dy,
            this.isMoving,
            this.walkTimer,
            76,
            92
        );

        if (!drawn) {
            super.draw(ctx);
        }

        // Holi splat overlay if caught
        if (this.isCaught) {
            ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.z - 44, 28, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
