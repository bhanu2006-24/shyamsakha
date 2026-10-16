/**
 * Particle System for dust, petals, sparkles, water ripples, Holi splats,
 * and Divine Godhuli Smokescreens (धूलि मेघ) for stealth, escapes, and blind spots.
 */

export function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

/**
 * Line-of-sight perception check:
 * Returns false if target is beyond sight distance, behind tree crowns/bushes,
 * or occluded by a Godhuli dust smokescreen.
 */
export function checkLineOfSight(x1, y1, x2, y2, obstacles, particleSystem, maxDist = 620) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    if (dist > maxDist) return false;

    // 1. Check if line of sight crosses an active Godhuli smokescreen
    if (particleSystem && particleSystem.doesRayCrossSmoke(x1, y1, x2, y2)) {
        return false;
    }

    // 2. Check if thick tree trunks/canopy occlude the view
    for (const obs of obstacles) {
        if (obs.shape === 'circle' && obs.type === 'tree') {
            const blockRadius = obs.visualRadius * 0.62;
            const d = distToSegment(obs.x, obs.y, x1, y1, x2, y2);
            if (d < blockRadius) {
                return false; // Vision blocked by dense pastoral tree grove!
            }
        }
    }

    return true;
}

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
        } else if (type === 'smoke_puff') {
            this.decay = 0.35 + Math.random() * 0.45;
            this.radius = 16 + Math.random() * 22;
            this.growth = 14 + Math.random() * 18;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 1.2;
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
        } else if (this.type === 'smoke_puff') {
            this.radius += this.growth * dt;
            this.rotation += this.rotSpeed * dt;
            this.vx *= 0.94;
            this.vy *= 0.94;
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
        } else if (this.type === 'smoke_puff') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
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
        this.smokescreens = []; // Active Godhuli smokescreens for sneak gameplay
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

    createSmokescreen(x, y, color = '#fde047', radius = 145, duration = 3.6) {
        this.smokescreens.push({
            x: x,
            y: y,
            radius: radius,
            maxRadius: radius,
            life: duration,
            maxLife: duration,
            color: color,
            spin: Math.random() * Math.PI * 2
        });

        // Spawn billowing puffy clouds
        const puffColor = color === '#38bdf8' ? 'rgba(56, 189, 248, 0.28)' : 'rgba(253, 224, 71, 0.32)';
        for (let i = 0; i < 22; i++) {
            const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
            const dist = Math.random() * (radius * 0.7);
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            this.particles.push(new Particle(px, py, puffColor, 'smoke_puff'));
        }
    }

    isPointInsideSmoke(x, y) {
        for (const smoke of this.smokescreens) {
            if (Math.hypot(x - smoke.x, y - smoke.y) < smoke.radius) {
                return true;
            }
        }
        return false;
    }

    doesRayCrossSmoke(x1, y1, x2, y2) {
        for (const smoke of this.smokescreens) {
            const d = distToSegment(smoke.x, smoke.y, x1, y1, x2, y2);
            if (d < smoke.radius * 0.95) {
                return true;
            }
        }
        return false;
    }

    addSplat(x, y, radius, color) {
        this.splats.push({ x, y, r: radius, c: color });
        if (this.splats.length > 250) {
            this.splats.shift();
        }
    }

    update(dt) {
        // Update regular particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update active smokescreens
        for (let i = this.smokescreens.length - 1; i >= 0; i--) {
            const s = this.smokescreens[i];
            s.life -= dt;
            s.spin += dt * 0.4;
            s.radius = Math.min(s.maxRadius * 1.15, s.radius + dt * 10);

            if (s.life <= 0) {
                this.smokescreens.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        // 1. Draw Ground Splats
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

        // 2. Draw Billowing Godhuli Dust Smokescreens
        for (const smoke of this.smokescreens) {
            if (camera.isInView(smoke.x, smoke.y, smoke.radius + 30)) {
                ctx.save();
                const lifeAlpha = Math.min(1.0, smoke.life / (smoke.maxLife * 0.35));
                ctx.globalAlpha = lifeAlpha * 0.65;

                const grad = ctx.createRadialGradient(smoke.x, smoke.y, 10, smoke.x, smoke.y, smoke.radius);
                grad.addColorStop(0, smoke.color);
                grad.addColorStop(0.65, smoke.color);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2);
                ctx.fill();

                // Swirling dust rings inside cloud
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([12, 10]);
                ctx.save();
                ctx.translate(smoke.x, smoke.y);
                ctx.rotate(smoke.spin);
                ctx.beginPath();
                ctx.arc(0, 0, smoke.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                ctx.restore();
            }
        }

        // 3. Draw Air Particles (Dust, Petals, Sparkles, Smoke Puffs)
        for (const p of this.particles) {
            if (camera.isInView(p.x, p.y, p.radius + 10)) {
                p.draw(ctx);
            }
        }
    }

    clear() {
        this.particles = [];
        this.splats = [];
        this.smokescreens = [];
    }
}
