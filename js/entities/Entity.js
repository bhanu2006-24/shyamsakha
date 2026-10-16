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
        this.currentSpeed = (minSpeed + maxSpeed) / 2;
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

    updateSpeed() {
        this.currentSpeed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
    }

    applyTerrain(obstacles) {
        this.terrainModifier = 1.0;
        if (this.isCaught) return;
        
        for (const obs of obstacles) {
            if (obs.type === 'bush' && Math.hypot(this.x - obs.x, this.y - obs.y) < obs.visualRadius) {
                this.terrainModifier = 0.55; // Slow in thick bushes
                break;
            } else if (obs.type === 'rock' && Math.hypot(this.x - obs.x, this.y - obs.y) < obs.visualRadius) {
                this.terrainModifier = 1.2; // Speed boost hopping rocks
                break;
            } else if (obs.type === 'sand' && Math.hypot(this.x - obs.x, this.y - obs.y) < obs.radius) {
                this.terrainModifier = 0.9;
                break;
            }
        }
    }

    move(dx, dy, obstacles, mapWidth, mapHeight) {
        if (dx !== 0 || dy !== 0) {
            const mag = Math.hypot(dx, dy);
            this.dx = dx / mag;
            this.dy = dy / mag;
        }

        // X movement with collision checking
        this.x += dx;
        for (const obs of obstacles) {
            if (this.checkCollision(obs)) {
                this.x -= dx;
                break;
            }
        }

        // Y movement with collision checking
        this.y += dy;
        for (const obs of obstacles) {
            if (this.checkCollision(obs)) {
                this.y -= dy;
                break;
            }
        }

        // Clamp inside map boundaries
        this.x = Math.max(this.radius, Math.min(this.x, mapWidth - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, mapHeight - this.radius));
    }

    checkCollision(obs) {
        if (obs.shape === 'rect') {
            const testX = Math.max(obs.x, Math.min(this.x, obs.x + obs.w));
            const testY = Math.max(obs.y, Math.min(this.y, obs.y + obs.h));
            return Math.hypot(this.x - testX, this.y - testY) <= this.radius;
        } else if (obs.shape === 'circle') {
            // Bushes and small rocks don't block movement completely (soft obstacles)
            if (obs.type === 'bush' || obs.type === 'rock' || obs.type === 'lotus') return false;
            return Math.hypot(this.x - obs.x, this.y - obs.y) < (this.radius + obs.radius);
        }
        return false;
    }

    getAvoidanceForce(obstacles, lookAhead = 120) {
        let steerX = 0;
        let steerY = 0;
        let count = 0;

        for (const obs of obstacles) {
            if (obs.shape === 'circle') {
                const dx = this.x - obs.x;
                const dy = this.y - obs.y;
                const dist = Math.hypot(dx, dy);
                const isSoft = (obs.type === 'bush' || obs.type === 'rock');
                const safeDist = obs.radius + this.radius + (isSoft ? lookAhead / 2 : lookAhead);

                if (dist < safeDist && dist > 0) {
                    let force = Math.pow((safeDist - dist) / safeDist, 2);
                    if (isSoft) force *= 0.2;

                    const pushX = (dx / dist) * force;
                    const pushY = (dy / dist) * force;
                    const tangentX = (-dy / dist) * force * (isSoft ? 0.2 : 0.8);
                    const tangentY = (dx / dist) * force * (isSoft ? 0.2 : 0.8);

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
