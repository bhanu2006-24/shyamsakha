import { Entity } from './Entity.js';

export class Krishna extends Entity {
    constructor(x, y) {
        super(x, y, 17, '#0284c7', 360, 460, 'krishna');
        this.name = "Shree Krishna";
        this.isFlutePlaying = false;
        this.fluteTimer = 0;
        this.auraPhase = 0;
        this.isJumping = false;
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
            // Emit divine melody sparkle notes
            if (Math.random() < 0.25 && particles) {
                particles.createSparkle(
                    this.x + (Math.random() - 0.5) * 40,
                    this.y - 20 + (Math.random() - 0.5) * 30,
                    '#38bdf8'
                );
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
        ctx.ellipse(this.x, this.y + 3, (this.radius + 5) * shadowScale, (this.radius - 3) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Divine Radiance / Halo
        const glowRadius = this.radius + 8 + Math.sin(this.auraPhase) * 3;
        const grad = ctx.createRadialGradient(this.x, drawY, this.radius * 0.5, this.x, drawY, glowRadius + 6);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(0.7, 'rgba(250, 204, 21, 0.3)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, drawY, glowRadius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Krishna's Body (Shyama complexion - Deep divine blue)
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCaught ? '#64748b' : '#0369a1';
        ctx.fill();
        ctx.strokeStyle = '#facc15'; // Pitambara golden border
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Direction / Facing
        const angle = Math.atan2(this.dy, this.dx);

        // Mor Pankh (Peacock Feather on Head)
        const featherX = this.x - Math.cos(angle) * (this.radius - 2);
        const featherY = drawY - Math.sin(angle) * (this.radius - 2) - 4;

        // Peacock feather rings (Azure, Emerald, Gold)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(featherX, featherY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(featherX, featherY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(featherX, featherY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Golden Flute (Bansuri)
        if (this.isFlutePlaying || Math.abs(this.dx) < 0.2) {
            ctx.save();
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 4, drawY + 2);
            ctx.lineTo(this.x + 22, drawY + 12);
            ctx.stroke();

            // Flute jewel dots
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(this.x + 22, drawY + 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Musical note if playing flute
        if (this.isFlutePlaying) {
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 15px serif';
            ctx.textAlign = 'center';
            ctx.fillText("♫", this.x + 18, drawY - 14);
        }

        ctx.restore();
    }
}
