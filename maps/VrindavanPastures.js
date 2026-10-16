/**
 * Vrindavan Pastures Map (गोचारण लीला व कदम्ब कुंज)
 */
export class VrindavanPastures {
    constructor() {
        this.name = "Vrindavan Pastures";
        this.hindiName = "वृन्दावन गोचारण";
        this.width = 4500;
        this.height = 4500;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.riverWidth = 520;
        this.obstacles = [];
        this.riverWaveOffset = 0;
    }

    init() {
        this.obstacles = [];
        const border = 60;

        // Boundaries
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: -border, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: this.height, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: 0, w: border, h: this.height, radius: 0 });

        // Yamuna River on East Border
        this.obstacles.push({
            shape: 'rect',
            type: 'river',
            x: this.width - this.riverWidth,
            y: 0,
            w: this.riverWidth + border,
            h: this.height,
            radius: 0,
            hasResource: 'water'
        });

        // Giant Sacred Kadamba Tree at Center (Hub)
        this.obstacles.push({
            shape: 'circle',
            type: 'kadamba',
            x: this.centerX,
            y: this.centerY,
            radius: 46, // Trunk collision radius
            visualRadius: 180, // Canopy visual radius
            hasResource: null
        });

        // Nature Obstacles (Fruit Trees, Flowering Bushes, Shady Rocks)
        const count = 280;
        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            let type = rand < 0.45 ? 'tree' : (rand < 0.75 ? 'bush' : 'rock');
            const rad = 30 + Math.random() * 45;

            const x = rad + 80 + Math.random() * (this.width - this.riverWidth - rad * 2 - 120);
            const y = rad + 80 + Math.random() * (this.height - rad * 2 - 120);

            // Keep clearing around the central Kadamba tree
            if (Math.hypot(x - this.centerX, y - this.centerY) > 340) {
                const obs = {
                    shape: 'circle',
                    type: type,
                    x: x,
                    y: y,
                    radius: type === 'tree' ? rad * 0.5 : rad * 0.7,
                    visualRadius: rad,
                    hasResource: type === 'bush' && Math.random() > 0.3 ? 'flower' : (type === 'tree' && Math.random() > 0.4 ? 'fruit' : null),
                    resourceRegenTimer: 0
                };
                this.obstacles.push(obs);
            }
        }
    }

    update(dt) {
        this.riverWaveOffset += dt * 35;

        // Resource regeneration
        for (const obs of this.obstacles) {
            if (!obs.hasResource && obs.resourceRegenTimer > 0) {
                obs.resourceRegenTimer -= dt;
                if (obs.resourceRegenTimer <= 0) {
                    if (obs.type === 'bush') obs.hasResource = 'flower';
                    if (obs.type === 'tree') obs.hasResource = 'fruit';
                }
            }
        }
    }

    drawGround(ctx, camera) {
        // Lush green pasture background
        ctx.fillStyle = '#86efac';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // Ground grid / pasture grass tufts
        ctx.strokeStyle = 'rgba(21, 128, 61, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const startX = Math.floor(camera.x / 120) * 120;
        const startY = Math.floor(camera.y / 120) * 120;
        for (let x = startX; x < camera.x + camera.width; x += 120) {
            ctx.moveTo(x, camera.y);
            ctx.lineTo(x, camera.y + camera.height);
        }
        for (let y = startY; y < camera.y + camera.height; y += 120) {
            ctx.moveTo(camera.x, y);
            ctx.lineTo(camera.x + camera.width, y);
        }
        ctx.stroke();

        // Central Kadamba Tree Platform Circle
        if (camera.isInView(this.centerX, this.centerY, 360)) {
            ctx.save();
            ctx.fillStyle = 'rgba(254, 240, 138, 0.35)'; // Sand sitting ring
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, 260, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(202, 138, 4, 0.4)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }

        // Yamuna River on the right side
        const riverX = this.width - this.riverWidth;
        if (camera.x + camera.width > riverX) {
            // River Sandbank strip
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(riverX - 60, camera.y, 60, camera.height);

            // Water Body
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(riverX, camera.y, this.riverWidth + 100, camera.height);

            // Gentle animated wave currents
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let y = startY; y < camera.y + camera.height + 100; y += 80) {
                const wx = riverX + 30 + ((y * 1.5 + this.riverWaveOffset) % (this.riverWidth - 80));
                ctx.moveTo(wx, y);
                ctx.quadraticCurveTo(wx + 30, y - 10, wx + 60, y);
            }
            ctx.stroke();
        }
    }

    drawProps(ctx, camera) {
        // Ground Layer Props: Trunks, Rocks, Bushes, Fallen Flowers
        for (const obs of this.obstacles) {
            if (!camera.isInView(obs.x, obs.y, obs.visualRadius || obs.w)) continue;

            if (obs.type === 'tree' || obs.type === 'kadamba') {
                // Trunk & Shadow
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(obs.x + 6, obs.y + 6, obs.visualRadius * 0.9, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (obs.type === 'rock') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(obs.x + 4, obs.y + 4, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(obs.x - obs.visualRadius * 0.25, obs.y - obs.visualRadius * 0.25, obs.visualRadius * 0.55, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (obs.type === 'bush') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.arc(obs.x + 2, obs.y + 2, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#65a30d';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                // Flower blooms
                if (obs.hasResource === 'flower') {
                    ctx.fillStyle = '#f472b6';
                    ctx.beginPath();
                    ctx.arc(obs.x + obs.visualRadius * 0.3, obs.y - obs.visualRadius * 0.3, 6, 0, Math.PI * 2);
                    ctx.arc(obs.x - obs.visualRadius * 0.35, obs.y + obs.visualRadius * 0.2, 5.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    }

    drawCanopy(ctx, camera) {
        // Canopy layer: Tree leaves rendered over entities
        for (const obs of this.obstacles) {
            if ((obs.type === 'tree' || obs.type === 'kadamba') && camera.isInView(obs.x, obs.y, obs.visualRadius)) {
                const vRad = obs.visualRadius;
                ctx.save();
                ctx.fillStyle = obs.type === 'kadamba' ? '#14532d' : '#166534';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y - vRad * 0.2, vRad, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = obs.type === 'kadamba' ? '#166534' : '#15803d';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y + vRad * 0.15, vRad * 0.8, 0, Math.PI * 2);
                ctx.fill();

                // Fruits on fruit trees
                if (obs.hasResource === 'fruit') {
                    ctx.fillStyle = '#facc15';
                    ctx.beginPath();
                    ctx.arc(obs.x - vRad * 0.35, obs.y - vRad * 0.25, 7, 0, Math.PI * 2);
                    ctx.arc(obs.x + vRad * 0.3, obs.y + vRad * 0.3, 6.5, 0, Math.PI * 2);
                    ctx.arc(obs.x + vRad * 0.45, obs.y - vRad * 0.1, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    }
}
