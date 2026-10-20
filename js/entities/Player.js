import { Entity } from './Entity.js';
import { assetLoader } from '../core/AssetLoader.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 18, '#ef4444', 280, 360, 'player');
        this.stamina = 100;
        this.maxStamina = 100;
        this.isSprinting = false;
        this.isSpiking = false;
        this.spikeCooldown = 0;
        this.name = "Sakha (You)";
        this.walkTimer = 0;
        this.isMoving = false;
    }

    update(dt, input, obstacles, mapWidth, mapHeight, particles) {
        this.updateDynamicSpeed(dt);

        if (this.spikeCooldown > 0) {
            this.spikeCooldown -= dt;
        }

        // Jump physics if airborne
        if (this.z > 0 || this.vz !== 0) {
            this.z += this.vz * dt;
            this.vz -= 980 * dt; // gravity
            if (this.z <= 0) {
                this.z = 0;
                this.vz = 0;
                this.isSpiking = false;
            }
        }

        if (this.isCaught) {
            this.isMoving = false;
            return;
        }

        const move = input.getMovementVector();
        let speedMult = 1.0;

        // Sprinting with Shift
        if (input.isDown('Shift') && this.stamina > 0 && move.isMoving) {
            this.stamina = Math.max(0, this.stamina - dt * 38);
            speedMult = 1.62;
            this.isSprinting = true;
            if (Math.random() < 0.35 && particles) {
                particles.createDust(this.x, this.y + 4, '#e2e8f0');
            }
        } else {
            this.stamina = Math.min(this.maxStamina, this.stamina + dt * 18);
            this.isSprinting = false;
        }

        // Jump / Spike action
        if (input.wasJustPressed(' ') && this.z === 0) {
            this.vz = 420; // Jump up!
            this.isSpiking = true;
        }

        this.isMoving = move.isMoving;
        if (move.isMoving) {
            this.walkTimer += dt * (this.isSprinting ? 1.6 : 1.0);
            this.applyTerrain(obstacles);

            // Extra floral sparkle when running over flower carpets
            if (this.terrainModifier > 1.2 && particles && Math.random() < 0.4) {
                particles.createPetals(this.x, this.y + 2, '#f472b6', 2);
            }

            const speed = this.currentSpeed * speedMult * this.terrainModifier;
            this.move(move.x * speed * dt, move.y * speed * dt, obstacles, mapWidth, mapHeight);

            if (Math.random() < 0.25 && particles) {
                particles.createDust(this.x, this.y + 4, '#86efac');
            }
        } else {
            this.walkTimer = 0;
        }

        // One-Way Floral Wind Stream Acceleration (पवन मार्ग)
        if (window.game && window.game.mapManager && window.game.mapManager.currentMap) {
            const curMap = window.game.mapManager.currentMap;
            if (curMap.getWindStreamEffect) {
                const ws = curMap.getWindStreamEffect(this.x, this.y);
                if (ws) {
                    this.move(ws.fx * dt, ws.fy * dt, obstacles, mapWidth, mapHeight);
                    if (particles && Math.random() < 0.35) {
                        particles.createPetals(this.x, this.y, '#facc15', 1);
                    }
                }
            }
        }
    }

    draw(ctx) {
        // Draw using user-provided sprite from assets/images/sakha.png
        const drawn = assetLoader.drawCharacter(
            ctx,
            'player',
            this.x,
            this.y,
            this.z,
            this.dx,
            this.dy,
            this.isMoving,
            this.walkTimer,
            72,
            88
        );

        if (!drawn) {
            // Procedural fallback if image is still loading
            super.draw(ctx);
        }

        // Spike / Jump Banner Indicator
        if (this.z > 15) {
            ctx.save();
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText("⚡ SPIKE!", this.x, this.y - this.z - 85);
            ctx.restore();
        }

        // Holi splat tint if caught
        if (this.isCaught) {
            ctx.save();
            ctx.fillStyle = 'rgba(236, 72, 153, 0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.z - 40, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
