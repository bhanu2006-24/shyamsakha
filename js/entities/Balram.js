import { Entity } from './Entity.js';

export class Balram extends Entity {
    constructor(x, y) {
        super(x, y, 19, '#f8fafc', 340, 430, 'dao');
        this.name = "Dao Balaram";
        this.isSpiking = false;
        this.powerTimer = 0;
    }

    update(dt, obstacles, mapWidth, mapHeight, particles) {
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

    draw(ctx) {
        const drawY = this.y - this.z;

        ctx.save();

        // Ground shadow
        const shadowScale = Math.max(0.3, 1 - this.z / 350);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 3, (this.radius + 6) * shadowScale, (this.radius - 3) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Radiance Aura (Silver/Moon White)
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();

        // Balaram's Body (Silver-white complexion, Neelambara blue aura)
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCaught ? '#64748b' : '#f8fafc';
        ctx.fill();
        ctx.strokeStyle = '#2563eb'; // Royal Blue silk border
        ctx.lineWidth = 3;
        ctx.stroke();

        // Facing direction
        const angle = Math.atan2(this.dy, this.dx);
        ctx.beginPath();
        ctx.moveTo(this.x, drawY);
        ctx.lineTo(this.x + Math.cos(angle) * (this.radius + 6), drawY + Math.sin(angle) * (this.radius + 6));
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Blue Turban / Angavastra
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.arc(this.x - Math.cos(angle) * 4, drawY - Math.sin(angle) * 4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Kundala (Earring) gold dot
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(this.x, drawY - 7, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
