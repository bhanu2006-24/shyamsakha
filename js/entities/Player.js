import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 18, '#ef4444', 320, 420, 'player');
        this.stamina = 100;
        this.maxStamina = 100;
        this.isSprinting = false;
        this.isSpiking = false;
        this.spikeCooldown = 0;
        this.name = "Sakha (You)";
    }

    update(dt, input, obstacles, mapWidth, mapHeight, particles) {
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

        if (this.isCaught) return;

        const move = input.getMovementVector();
        let speedMult = 1.0;

        // Sprinting with Shift
        if (input.isDown('Shift') && this.stamina > 0 && move.isMoving) {
            this.stamina = Math.max(0, this.stamina - dt * 38);
            speedMult = 1.65;
            this.isSprinting = true;
            if (Math.random() < 0.35 && particles) {
                particles.createDust(this.x, this.y + this.radius, '#e2e8f0');
            }
        } else {
            this.stamina = Math.min(this.maxStamina, this.stamina + dt * 18);
            this.isSprinting = false;
        }

        // Jump / Spike action
        if (input.wasJustPressed(' ') && this.z === 0) {
            this.vz = 400; // Jump up!
            this.isSpiking = true;
        }

        if (move.isMoving) {
            this.applyTerrain(obstacles);
            const speed = this.currentSpeed * speedMult * this.terrainModifier;
            this.move(move.x * speed * dt, move.y * speed * dt, obstacles, mapWidth, mapHeight);

            if (Math.random() < 0.25 && particles) {
                particles.createDust(this.x, this.y + this.radius, '#86efac');
            }
        }
    }

    draw(ctx) {
        const drawY = this.y - this.z;

        ctx.save();

        // Shadow on the ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        const shadowScale = Math.max(0.4, 1 - this.z / 300);
        ctx.ellipse(this.x, this.y + 4, (this.radius + 4) * shadowScale, (this.radius - 4) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aura glow
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();

        // Player Body (Cowherd Attire)
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCaught ? '#64748b' : '#f97316'; // Saffron Orange
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Direction Indicator
        const angle = Math.atan2(this.dy, this.dx);
        ctx.beginPath();
        ctx.moveTo(this.x, drawY);
        ctx.lineTo(this.x + Math.cos(angle) * (this.radius + 5), drawY + Math.sin(angle) * (this.radius + 5));
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cowherd Headband / Angavastra
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(this.x, drawY - 2, 7, 0, Math.PI * 2);
        ctx.fill();

        // Jump / Spike indicator
        if (this.z > 10) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("⚡ SPIKE!", this.x, drawY - this.radius - 8);
        }

        ctx.restore();
    }
}
