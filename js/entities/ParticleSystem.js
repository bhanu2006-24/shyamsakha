/**
 * Particle System for dust, petals, sparkles, water ripples, and Holi splats
 */
export class Particle {
    constructor(x, y, color, type = 'dust') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        
        this.life = 1.0;
        this.decay = 1.2 + Math.random() * 1.8;
        this.radius = 2 + Math.random() * 3.5;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 45;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        if (type === 'petal') {
            this.decay = 0.6 + Math.random() * 0.8;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 4;
        }
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= this.decay * dt;
        
        if (this.type === 'dust') {
            this.radius *= 0.96;
        } else if (this.type === 'petal') {
            this.rotation += this.rotSpeed * dt;
            this.vy += 10 * dt; // gentle gravity
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);

        if (this.type === 'petal') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius + 3, this.radius, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'sparkle') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            // Star glint
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x - 4, this.y);
            ctx.lineTo(this.x + 4, this.y);
            ctx.moveTo(this.x, this.y - 4);
            ctx.lineTo(this.x, this.y + 4);
            ctx.stroke();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.splats = []; // Permanent / semi-permanent color splats
    }

    createDust(x, y, color = '#ffffff', count = 1) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, 'dust'));
        }
    }

    createPetals(x, y, color = '#f472b6', count = 12) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, 'petal'));
        }
    }

    createSparkle(x, y, color = '#facc15', count = 1) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, 'sparkle'));
        }
    }

    addSplat(x, y, radius, color) {
        this.splats.push({ x, y, r: radius, c: color });
        if (this.splats.length > 250) {
            this.splats.shift();
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        // Draw Ground Splats
        for (const s of this.splats) {
            if (camera.isInView(s.x, s.y, s.r)) {
                ctx.save();
                ctx.fillStyle = s.c;
                ctx.globalAlpha = 0.55;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(s.x + 2, s.y - 1, s.r * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw Air Particles
        for (const p of this.particles) {
            if (camera.isInView(p.x, p.y, p.radius + 10)) {
                p.draw(ctx);
            }
        }
    }

    clear() {
        this.particles = [];
        this.splats = [];
    }
}
