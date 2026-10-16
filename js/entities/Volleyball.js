/**
 * Volleyball (Kanduka) - Ball Entity with Realistic 3D Arc Physics on 2D Plane
 */
export class Volleyball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.z = 0; // Altitude above ground
        
        this.vx = 0;
        this.vy = 0;
        this.vz = 0; // Vertical upward velocity
        
        this.radius = 12;
        this.gravity = 650;
        this.restitution = 0.65; // Bounciness
        this.drag = 0.985;
        
        this.lastHitter = null;
        this.lastHitTeam = null; // 'player' or 'krishna'
        this.inAir = false;
        this.isSpike = false;
        this.spin = 0;
        this.spinSpeed = 0;

        this.courtBounds = null; // Defined by volleyball court
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.z = 10;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.inAir = false;
        this.isSpike = false;
        this.lastHitter = null;
        this.lastHitTeam = null;
    }

    /**
     * Hit or bump the ball
     */
    hit(hitter, targetX, targetY, power = 380, isSpike = false, soundMgr = null) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy) || 1;

        this.isSpike = isSpike;
        this.lastHitter = hitter;
        this.lastHitTeam = (hitter.type === 'player' || hitter.type === 'sakha') ? 'player' : 'krishna';

        // Calculate horizontal velocities
        const speed = isSpike ? power * 1.5 : power;
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;

        // Vertical arc impulse
        this.vz = isSpike ? 180 : 420;
        this.inAir = true;
        this.spinSpeed = (Math.random() - 0.5) * 15;

        if (soundMgr) {
            soundMgr.playBallHit(isSpike);
        }
    }

    /**
     * Serve ball towards the opposing side
     */
    serve(server, targetX, targetY, soundMgr = null) {
        this.hit(server, targetX, targetY, 400, false, soundMgr);
        this.vz = 480; // High looping serve
    }

    update(dt, soundMgr = null, particles = null) {
        // Horizontal movement
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Apply air resistance
        this.vx *= Math.pow(this.drag, dt * 60);
        this.vy *= Math.pow(this.drag, dt * 60);

        // Vertical physics (Altitude)
        if (this.z > 0 || this.vz !== 0) {
            this.vz -= this.gravity * dt;
            this.z += this.vz * dt;
            this.inAir = true;

            // Rotation
            this.spin += this.spinSpeed * dt;

            // Spike smoke / motion streak
            if (this.isSpike && this.z > 15 && Math.random() < 0.6 && particles) {
                particles.createSparkle(this.x, this.y - this.z, '#facc15');
            }

            // Ground Bounce
            if (this.z <= 0) {
                this.z = 0;
                if (Math.abs(this.vz) > 80) {
                    this.vz = -this.vz * this.restitution;
                    this.vx *= 0.8;
                    this.vy *= 0.8;
                    if (soundMgr) soundMgr.playBallBounce();
                    if (particles) particles.createDust(this.x, this.y, '#fef08a');
                } else {
                    this.vz = 0;
                    this.vx *= 0.6;
                    this.vy *= 0.6;
                    this.inAir = false;
                    this.isSpike = false;
                }
            }
        }
    }

    draw(ctx) {
        const drawY = this.y - this.z;

        ctx.save();

        // 1. Dynamic Ground Shadow (directly at x, y)
        // As the ball rises, the shadow spreads larger and becomes more translucent
        const shadowScale = Math.max(0.4, 1 + this.z / 180);
        const shadowAlpha = Math.max(0.08, 0.35 - (this.z / 600));

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * shadowScale, (this.radius * 0.65) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Trajectory guide dotted line if high up
        if (this.z > 25) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.setLineDash([3, 4]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, drawY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 3. Volleyball Ball (at x, drawY)
        ctx.translate(this.x, drawY);
        ctx.rotate(this.spin);

        // Base Ball
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Traditional Volleyball Curving Panels (Vrindavan Colors: Gold, Azure Blue, Crimson)
        // Panel 1: Saffron Gold
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 0.66);
        ctx.lineTo(0, 0);
        ctx.fill();

        // Panel 2: Krishna Azure Blue
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 0.66, Math.PI * 1.33);
        ctx.lineTo(0, 0);
        ctx.fill();

        // Panel 3: Lotus White / Cream
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 1.33, Math.PI * 2);
        ctx.lineTo(0, 0);
        ctx.fill();

        // Ball Seams
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, 0, this.radius * 0.7, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.radius * 0.3, 0, this.radius * 0.7, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();

        // Highlight shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-3, -3, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
