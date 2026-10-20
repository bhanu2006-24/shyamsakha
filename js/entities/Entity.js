/**
 * Base Entity Class
 */
export class Entity {
    constructor(x, y, radius, color, minSpeed = 200, maxSpeed = 300, type = 'entity') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.baseSpeed = (minSpeed + maxSpeed) / 2;
        this.currentSpeed = this.baseSpeed;
        this.targetStrideSpeed = this.currentSpeed;
        this.cadenceTimer = 0.4 + Math.random() * 0.6; // Changes pace every ~0.8-1.4s
        this.surgeTimer = 0;
        this.surgeMultiplier = 1.0;
        this.type = type;
        
        this.dx = 0;
        this.dy = 1;
        this.wanderAngle = Math.random() * Math.PI * 2;
        
        this.isCaught = false;
        this.shootCooldown = 0;
        this.terrainModifier = 1.0;
        
        // Z-axis for jumps or bounces
        this.z = 0;
        this.vz = 0;
    }

    /**
     * Dynamic Second-by-Second Speed Fluctuation
     * Stride cadence smoothly varies speed every second so chases remain lively,
     * high-stakes, and unpredictable without feeling mechanical or robotic.
     */
    updateDynamicSpeed(dt) {
        if (this.surgeTimer > 0) {
            this.surgeTimer -= dt;
            if (this.surgeTimer <= 0) {
                this.surgeMultiplier = 1.0;
            }
        }

        this.cadenceTimer -= dt;
        if (this.cadenceTimer <= 0) {
            this.cadenceTimer = 0.8 + Math.random() * 0.6; // New stride pace every ~1 second
            
            // Random stride speed between min and max
            this.targetStrideSpeed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);

            // 15% chance of an agile sudden sprint surge
            const roll = Math.random();
            if (roll < 0.15) {
                this.surgeMultiplier = 1.18;
                this.surgeTimer = 0.75;
            } else if (roll < 0.25) {
                // 10% chance of a brief breath/tight turn cadence dip
                this.surgeMultiplier = 0.88;
                this.surgeTimer = 0.6;
            } else {
                this.surgeMultiplier = 1.0;
            }
        }

        // Smooth continuous lerp towards current target speed
        const target = this.targetStrideSpeed * this.surgeMultiplier;
        this.currentSpeed += (target - this.currentSpeed) * Math.min(1.0, dt * 3.8);
    }

    updateSpeed() {
        this.updateDynamicSpeed(0.016);
    }

    applyTerrain(obstacles) {
        this.terrainModifier = 1.0;
        if (this.isCaught) return;
        
        for (const obs of obstacles) {
            if (obs.type === 'flower_carpet') {
                const dist = Math.hypot(this.x - obs.x, this.y - obs.y);
                if (dist < (obs.radius || 110)) {
                    this.terrainModifier = 1.35; // +35% Speed boost on sacred flower carpets!
                    break;
                }
            } else if (obs.type === 'bush' && Math.hypot(this.x - obs.x, this.y - obs.y) < obs.visualRadius) {
                this.terrainModifier = 0.65; // Slow in thick bushes
                break;
            } else if (obs.type === 'rock' && Math.hypot(this.x - obs.x, this.y - obs.y) < obs.visualRadius) {
                this.terrainModifier = 1.15; // Speed boost hopping rocks
                break;
            } else if (obs.type === 'sand' && Math.hypot(this.x - obs.x, this.y - obs.y) < obs.radius) {
                this.terrainModifier = 0.9;
                break;
            }
        }
    }

    move(dx, dy, obstacles, mapWidth, mapHeight) {
        if (isNaN(dx) || isNaN(dy)) return;
        if (dx !== 0 || dy !== 0) {
            const mag = Math.hypot(dx, dy);
            if (mag > 0) {
                this.dx = dx / mag;
                this.dy = dy / mag;
            }
        }

        // Fast Bounding-Box Pre-Filter: Only check obstacles within 180px (sub-nanosecond, zero lag!)
        const checkRange = 180;
        const targetX = this.x + dx;
        const targetY = this.y + dy;

        // X movement with collision checking
        this.x += dx;
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            if (obs.shape === 'rect' || (Math.abs(this.x - obs.x) < checkRange && Math.abs(this.y - obs.y) < checkRange)) {
                if (this.checkCollision(obs)) {
                    this.x -= dx;
                    break;
                }
            }
        }

        // Y movement with collision checking
        this.y += dy;
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            if (obs.shape === 'rect' || (Math.abs(this.x - obs.x) < checkRange && Math.abs(this.y - obs.y) < checkRange)) {
                if (this.checkCollision(obs)) {
                    this.y -= dy;
                    break;
                }
            }
        }

        // Clamp inside map boundaries
        this.x = Math.max(this.radius, Math.min(this.x, mapWidth - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, mapHeight - this.radius));
    }

    moveWithAnim(dx, dy, obstacles, mapWidth, mapHeight, dt) {
        const startX = this.x;
        const startY = this.y;
        this.move(dx, dy, obstacles, mapWidth, mapHeight);
        const actualMoved = Math.hypot(this.x - startX, this.y - startY);

        if (actualMoved > 0.08) {
            this.isMoving = true;
            this.walkTimer = (this.walkTimer || 0) + dt;
        } else {
            this.isMoving = false;
            this.walkTimer = 0;
        }
    }

    checkCollision(obs) {
        if (obs.shape === 'rect') {
            const testX = Math.max(obs.x, Math.min(this.x, obs.x + obs.w));
            const testY = Math.max(obs.y, Math.min(this.y, obs.y + obs.h));
            return Math.hypot(this.x - testX, this.y - testY) <= this.radius;
        } else if (obs.shape === 'circle') {
            // Bushes, flower carpets, and small rocks don't block movement completely (soft obstacles)
            if (obs.type === 'bush' || obs.type === 'rock' || obs.type === 'lotus' || obs.type === 'flower_carpet') return false;
            return Math.hypot(this.x - obs.x, this.y - obs.y) < (this.radius + obs.radius);
        }
        return false;
    }

    getAvoidanceForce(obstacles, lookAhead = 140) {
        let steerX = 0;
        let steerY = 0;
        let count = 0;
        const boxCheck = lookAhead + 80;

        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            if (obs.shape === 'circle' && obs.type !== 'flower_carpet') {
                // Fast bounding-box skip: only evaluate obstacles physically nearby
                if (Math.abs(this.x - obs.x) > boxCheck || Math.abs(this.y - obs.y) > boxCheck) continue;

                const dx = this.x - obs.x;
                const dy = this.y - obs.y;
                const dist = Math.hypot(dx, dy);
                const isSoft = (obs.type === 'bush' || obs.type === 'rock');
                const safeDist = obs.radius + this.radius + (isSoft ? lookAhead * 0.35 : lookAhead);

                if (dist < safeDist && dist > 0) {
                    let force = Math.pow((safeDist - dist) / safeDist, 1.8);
                    if (isSoft) force *= 0.25;

                    // 1. Radial push away from obstacle center
                    const pushX = (dx / dist) * force * 1.8;
                    const pushY = (dy / dist) * force * 1.8;

                    // 2. Intelligent Bidirectional Tangent Glide
                    // Steers smoothly around the closest side matching travel direction
                    const t1x = -dy / dist;
                    const t1y = dx / dist;
                    const t2x = dy / dist;
                    const t2y = -dx / dist;
                    const dot1 = (this.dx || 0) * t1x + (this.dy || 0) * t1y;
                    const dot2 = (this.dx || 0) * t2x + (this.dy || 0) * t2y;
                    const bestTx = dot1 >= dot2 ? t1x : t2x;
                    const bestTy = dot1 >= dot2 ? t1y : t2y;

                    const tangentStrength = isSoft ? 0.4 : 2.4;
                    const tangentX = bestTx * force * tangentStrength;
                    const tangentY = bestTy * force * tangentStrength;

                    steerX += pushX + tangentX;
                    steerY += pushY + tangentY;
                    count++;
                }
            }
        }

        if (count > 0) {
            steerX /= count;
            steerY /= count;
        }
        return { x: steerX, y: steerY };
    }

    draw(ctx) {
        // Base placeholder draw
        ctx.save();
        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 2, this.radius + 2, (this.radius - 2) * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.z - 12, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Head/Face indicator
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.z - 22, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
