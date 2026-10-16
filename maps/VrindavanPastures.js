/**
 * Vrindavan Pastures Map (गोचारण लीला व कदम्ब कुंज)
 * Hand-crafted pastoral meadows, sacred Kadamba grove, delicious fruit trees, and flower bushes
 */
export class VrindavanPastures {
    constructor() {
        this.name = "Vrindavan Pastures";
        this.hindiName = "वृन्दावन गोचारण";
        this.width = 4000;
        this.height = 4000;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.riverWidth = 520;
        this.obstacles = [];
        this.riverWaveOffset = 0;
        this.swayTime = 0;
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
            radius: 42,
            visualRadius: 130,
            hasResource: null
        });

        // Balanced Nature Placement (Open pastures with beautiful groves)
        // 1. Fruit Orchards (Mango and Kadamba fruit groves to the North and West)
        const fruitTreeLocations = [
            { x: this.centerX - 350, y: this.centerY - 250, r: 65, res: 'fruit' },
            { x: this.centerX - 500, y: this.centerY - 350, r: 60, res: 'fruit' },
            { x: this.centerX - 220, y: this.centerY - 450, r: 68, res: 'fruit' },
            { x: this.centerX + 260, y: this.centerY - 320, r: 62, res: 'fruit' },
            { x: this.centerX + 420, y: this.centerY - 200, r: 65, res: 'fruit' },
            { x: this.centerX - 600, y: this.centerY + 180, r: 70, res: 'fruit' },
            { x: this.centerX - 420, y: this.centerY + 380, r: 64, res: 'fruit' },
            { x: this.centerX + 350, y: this.centerY + 320, r: 66, res: 'fruit' },
            { x: this.centerX + 520, y: this.centerY + 180, r: 60, res: 'fruit' }
        ];

        fruitTreeLocations.forEach(t => {
            this.obstacles.push({
                shape: 'circle',
                type: 'tree',
                x: t.x,
                y: t.y,
                radius: 28,
                visualRadius: t.r,
                hasResource: 'fruit',
                resourceRegenTimer: 0
            });
        });

        // 2. Flower Gardens (Lotus and Marigold bushes near Kadamba tree & river)
        const flowerBushLocations = [
            { x: this.centerX - 180, y: this.centerY - 120, r: 38 },
            { x: this.centerX + 180, y: this.centerY - 130, r: 38 },
            { x: this.centerX - 200, y: this.centerY + 160, r: 42 },
            { x: this.centerX + 210, y: this.centerY + 150, r: 40 },
            { x: this.width - this.riverWidth - 120, y: this.centerY - 280, r: 44 },
            { x: this.width - this.riverWidth - 100, y: this.centerY + 10, r: 42 },
            { x: this.width - this.riverWidth - 130, y: this.centerY + 350, r: 46 },
            { x: this.centerX - 350, y: this.centerY + 120, r: 38 },
            { x: this.centerX + 320, y: this.centerY - 100, r: 40 }
        ];

        flowerBushLocations.forEach(b => {
            this.obstacles.push({
                shape: 'circle',
                type: 'bush',
                x: b.x,
                y: b.y,
                radius: 18,
                visualRadius: b.r,
                hasResource: 'flower',
                resourceRegenTimer: 0
            });
        });

        // 3. Natural Rocks and Shade Groves scattered across wide pastures
        const natureCount = 65;
        for (let i = 0; i < natureCount; i++) {
            const rad = 32 + Math.random() * 32;
            const x = 200 + Math.random() * (this.width - this.riverWidth - 400);
            const y = 200 + Math.random() * (this.height - 400);

            // Keep central Kadamba hub and clearings open
            if (Math.hypot(x - this.centerX, y - this.centerY) > 420) {
                const isRock = Math.random() < 0.35;
                const isFruit = !isRock && Math.random() < 0.45;
                const isFlower = !isRock && !isFruit && Math.random() < 0.5;

                this.obstacles.push({
                    shape: 'circle',
                    type: isRock ? 'rock' : (isFlower ? 'bush' : 'tree'),
                    x: x,
                    y: y,
                    radius: isRock ? rad * 0.7 : 24,
                    visualRadius: rad,
                    hasResource: isFruit ? 'fruit' : (isFlower ? 'flower' : null),
                    resourceRegenTimer: 0
                });
            }
        }
    }

    update(dt) {
        this.riverWaveOffset += dt * 35;
        this.swayTime += dt * 2;

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
        // Lush Vrindavan Meadow
        ctx.fillStyle = '#86efac';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // Soft grassy texture grid
        ctx.strokeStyle = 'rgba(21, 128, 61, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const startX = Math.floor(camera.x / 140) * 140;
        const startY = Math.floor(camera.y / 140) * 140;
        for (let x = startX; x < camera.x + camera.width; x += 140) {
            ctx.moveTo(x, camera.y);
            ctx.lineTo(x, camera.y + camera.height);
        }
        for (let y = startY; y < camera.y + camera.height; y += 140) {
            ctx.moveTo(camera.x, y);
            ctx.lineTo(camera.x + camera.width, y);
        }
        ctx.stroke();

        // Central Kadamba Tree Platform Circle (Altar Platform)
        if (camera.isInView(this.centerX, this.centerY, 300)) {
            ctx.save();
            // Outer floral ring
            ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, 200, 0, Math.PI * 2);
            ctx.fill();

            // Inner sandstone seat
            ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, 140, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Vedic Lotus Motif in the center
            ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const px = this.centerX + Math.cos(angle) * 45;
                const py = this.centerY + Math.sin(angle) * 45;
                ctx.beginPath();
                ctx.arc(px, py, 18, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Yamuna River on the East border
        const riverX = this.width - this.riverWidth;
        if (camera.x + camera.width > riverX - 80) {
            // Golden Sandbank shoreline
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(riverX - 70, camera.y, 70, camera.height);

            // River Water
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(riverX, camera.y, this.riverWidth + 100, camera.height);

            // Water current waves
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.65)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let y = startY; y < camera.y + camera.height + 100; y += 70) {
                const wx = riverX + 25 + ((y * 1.5 + this.riverWaveOffset) % (this.riverWidth - 90));
                ctx.moveTo(wx, y);
                ctx.quadraticCurveTo(wx + 30, y - 8, wx + 60, y);
            }
            ctx.stroke();
        }
    }

    drawProps(ctx, camera) {
        // Draw Trunks, Rocks, Bushes, and Flower blossoms
        for (const obs of this.obstacles) {
            if (!camera.isInView(obs.x, obs.y, obs.visualRadius || obs.w)) continue;

            if (obs.type === 'tree' || obs.type === 'kadamba') {
                ctx.save();
                // Ground shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                ctx.beginPath();
                ctx.ellipse(obs.x + 4, obs.y + 6, obs.visualRadius * 0.75, obs.visualRadius * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();

                // Brown tree trunk
                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            } else if (obs.type === 'rock') {
                ctx.save();
                // Boulder shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.ellipse(obs.x + 3, obs.y + 4, obs.visualRadius, obs.visualRadius * 0.65, 0, 0, Math.PI * 2);
                ctx.fill();

                // Layered boulder
                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.arc(obs.x - obs.visualRadius * 0.25, obs.y - obs.visualRadius * 0.25, obs.visualRadius * 0.55, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (obs.type === 'bush') {
                ctx.save();
                // Bush shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.ellipse(obs.x + 2, obs.y + 3, obs.visualRadius, obs.visualRadius * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                // Lush green bush base
                ctx.fillStyle = '#4d7c0f';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#65a30d';
                ctx.beginPath();
                ctx.arc(obs.x - 3, obs.y - 4, obs.visualRadius * 0.75, 0, Math.PI * 2);
                ctx.fill();

                // GORGEOUS FLOWER BLOOMS (NO CONNECTING LINES - DISTINCT PATHS)
                if (obs.hasResource === 'flower') {
                    const flowerOffsets = [
                        { dx: -obs.visualRadius * 0.35, dy: -obs.visualRadius * 0.2 },
                        { dx: obs.visualRadius * 0.3, dy: -obs.visualRadius * 0.25 },
                        { dx: 0, dy: obs.visualRadius * 0.3 }
                    ];

                    flowerOffsets.forEach(pt => {
                        this.drawLotusFlower(ctx, obs.x + pt.dx, obs.y + pt.dy);
                    });
                }
                ctx.restore();
            }
        }
    }

    drawCanopy(ctx, camera, player) {
        // Draw Canopies with Transparency if Player or Krishna is nearby
        for (const obs of this.obstacles) {
            if ((obs.type === 'tree' || obs.type === 'kadamba') && camera.isInView(obs.x, obs.y, obs.visualRadius + 20)) {
                const vRad = obs.visualRadius;
                
                // If player is under or near this tree, fade the canopy so player is ALWAYS clearly visible!
                let isPlayerNear = false;
                if (player) {
                    const distToPlayer = Math.hypot(player.x - obs.x, player.y - obs.y);
                    if (distToPlayer < vRad + 30) {
                        isPlayerNear = true;
                    }
                }

                ctx.save();
                ctx.globalAlpha = isPlayerNear ? 0.35 : 0.94; // Soft see-through when player is inside!

                // Canopy leaf layers (Lush, round, scalloped green crown)
                const mainColor = obs.type === 'kadamba' ? '#14532d' : '#15803d';
                const lightColor = obs.type === 'kadamba' ? '#166534' : '#22c55e';

                // Main Canopy Base
                ctx.fillStyle = mainColor;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y - vRad * 0.25, vRad, 0, Math.PI * 2);
                ctx.fill();

                // Lighter top highlight puff
                ctx.fillStyle = lightColor;
                ctx.beginPath();
                ctx.arc(obs.x - vRad * 0.15, obs.y - vRad * 0.45, vRad * 0.65, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(obs.x + vRad * 0.25, obs.y - vRad * 0.25, vRad * 0.55, 0, Math.PI * 2);
                ctx.fill();

                // DELICIOUS RIPE VRINDAVAN FRUITS (MANGOES & APPLES)
                // Distinct illustrated fruits - NEVER connected lines!
                if (obs.hasResource === 'fruit') {
                    ctx.globalAlpha = 1.0; // Fruits always pop clearly!
                    const fruitPositions = [
                        { dx: -vRad * 0.4, dy: -vRad * 0.2 },
                        { dx: vRad * 0.35, dy: -vRad * 0.3 },
                        { dx: -vRad * 0.15, dy: vRad * 0.15 },
                        { dx: vRad * 0.4, dy: vRad * 0.2 }
                    ];

                    fruitPositions.forEach((fp, idx) => {
                        const sway = Math.sin(this.swayTime + idx) * 2;
                        this.drawRipeMango(ctx, obs.x + fp.dx, obs.y + fp.dy + sway);
                    });
                }

                ctx.restore();
            }
        }
    }

    /**
     * Beautiful Ripe Vrindavan Mango (रसीला आम)
     * Real teardrop mango shape, golden gradient, green leaf stem, shine dot
     */
    drawRipeMango(ctx, x, y) {
        ctx.save();

        // 1. Little brown wooden stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.quadraticCurveTo(x + 2, y - 13, x + 4, y - 15);
        ctx.stroke();

        // 2. Green Leaf on stem
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(x + 6, y - 13, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Golden Mango Fruit Body
        const grad = ctx.createRadialGradient(x - 2, y - 2, 2, x, y, 9);
        grad.addColorStop(0, '#fef08a'); // Highlight yellow
        grad.addColorStop(0.5, '#facc15'); // Rich gold
        grad.addColorStop(1, '#ea580c'); // Saffron orange blush
        ctx.fillStyle = grad;

        ctx.beginPath();
        // Plump curved mango silhouette
        ctx.moveTo(x, y - 8);
        ctx.bezierCurveTo(x + 8, y - 7, x + 10, y + 4, x + 2, y + 9);
        ctx.bezierCurveTo(x - 3, y + 10, x - 9, y + 4, x - 7, y - 3);
        ctx.bezierCurveTo(x - 6, y - 7, x - 3, y - 8, x, y - 8);
        ctx.closePath();
        ctx.fill();

        // Thin outline
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glossy Shine Glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(x - 3, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Beautiful Blooming Pink Lotus (कमल पुष्प)
     * Distinct petals radiating from golden pistil
     */
    drawLotusFlower(ctx, x, y) {
        ctx.save();

        // Green base leaf
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(x, y + 4, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5 Radiant Pink Petals (drawn individually with separate paths)
        ctx.fillStyle = '#f472b6';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * 5;
            const py = y + Math.sin(angle) * 5;
            ctx.beginPath();
            ctx.ellipse(px, py, 5, 3, angle, 0, Math.PI * 2);
            ctx.fill();
        }

        // Inner lighter pink petals
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Golden Pollen Pistil Center
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
