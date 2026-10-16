import { Entity } from './Entity.js';

export class GauMata extends Entity {
    constructor(x, y, color = '#fffdd0') {
        super(x, y, 22, color, 15, 35, 'cow');
        this.chewTimer = 0;
        this.bellTimer = Math.random() * 5;
        this.isListeningToFlute = false;
        this.name = "Gau Mata";
    }

    update(dt, obstacles, mapWidth, mapHeight, krishna) {
        this.chewTimer += dt * 3;
        this.bellTimer -= dt;

        // If Krishna is playing flute nearby, cow gently turns and listens
        if (krishna && krishna.isFlutePlaying) {
            const dx = krishna.x - this.x;
            const dy = krishna.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 1200) {
                this.isListeningToFlute = true;
                this.dx = dx / dist;
                this.dy = dy / dist;
                // Move slowly towards the divine melody
                this.move(this.dx * 18 * dt, this.dy * 18 * dt, obstacles, mapWidth, mapHeight);
                return;
            }
        }

        this.isListeningToFlute = false;

        // Peaceful wandering
        if (Math.random() < 0.015) {
            this.wanderAngle += (Math.random() - 0.5) * 1.5;
        }

        let cx = Math.cos(this.wanderAngle);
        let cy = Math.sin(this.wanderAngle);

        const avoid = this.getAvoidanceForce(obstacles, 110);
        cx += avoid.x * 2.8;
        cy += avoid.y * 2.8;

        // Strong water avoidance: Sacred cows never enter pond water or river
        for (const obs of obstacles) {
            if (obs.type === 'pond') {
                const dx = this.x - obs.x;
                const dy = this.y - obs.y;
                const dist = Math.hypot(dx, dy);
                const safeDist = (obs.radius || 72) + this.radius + 30;
                if (dist < safeDist && dist > 0) {
                    const pushFactor = Math.pow((safeDist - dist) / safeDist, 2) * 6.0;
                    cx += (dx / dist) * pushFactor;
                    cy += (dy / dist) * pushFactor;
                }
            } else if (obs.type === 'river') {
                if (this.x > obs.x - 45) {
                    cx -= 5.0; // Repel westwards away from Yamuna water edge
                }
            }
        }

        const cLen = Math.hypot(cx, cy);
        if (cLen > 0) {
            cx /= cLen;
            cy /= cLen;
        }

        this.move(cx * this.currentSpeed * dt, cy * this.currentSpeed * dt, obstacles, mapWidth, mapHeight);
    }

    draw(ctx) {
        const angle = Math.atan2(this.dy, this.dx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.ellipse(2, 6, this.radius + 7, this.radius + 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius + 5, this.radius - 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Surya Ketu Nadi (Prominent Hump on the back)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(-6, 0, 9, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gentle shading for the sacred hump
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.beginPath();
        ctx.ellipse(-8, 0, 7, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dewlap (soft neck fold)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.beginPath();
        ctx.ellipse(8, 0, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cow Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.radius + 3, 0, 10, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout / Muzzle (with chewing motion)
        const chewOffset = Math.sin(this.chewTimer) * 0.8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.arc(this.radius + 9 + chewOffset, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Long gentle hanging ears
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.radius, -8, 8, 3, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.radius, 8, 8, 3, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Sweeping Curved Horns (Ivory)
        ctx.fillStyle = '#f1f5f9';
        // Left horn
        ctx.beginPath();
        ctx.moveTo(this.radius - 2, -5);
        ctx.quadraticCurveTo(this.radius - 8, -16, this.radius - 2, -20);
        ctx.lineTo(this.radius + 2, -5);
        ctx.fill();

        // Right horn
        ctx.beginPath();
        ctx.moveTo(this.radius - 2, 5);
        ctx.quadraticCurveTo(this.radius - 8, 16, this.radius - 2, 20);
        ctx.lineTo(this.radius + 2, 5);
        ctx.fill();

        // Brass neck bell
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(this.radius + 3, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Peaceful aura if listening to flute
        if (this.isListeningToFlute) {
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}
