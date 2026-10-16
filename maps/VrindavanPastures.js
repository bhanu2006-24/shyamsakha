import { TreeRenderer } from './TreeRenderer.js';

/**
 * Vrindavan Pastures Map (गोचारण लीला व दिव्य कदम्ब कुंज)
 * Hand-crafted pastoral meadows, varied sacred groves (Kadamba, Mango, Banyan, Parijat, Palm),
 * and a sunlit open pastoral clearing where Krishna, Balram, and the Sakhas gather in crystal clarity.
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

        // 1. Grand Ancient Kadamba Tree (Majestic Hub Landmark to the North of the gathering)
        // Positioned at (centerX, centerY - 170) so characters gather OUTSIDE in the sunlit clearing south of it!
        this.obstacles.push({
            shape: 'circle',
            type: 'tree',
            treeType: 'kadamba',
            x: this.centerX,
            y: this.centerY - 170,
            radius: 46,
            visualRadius: 140,
            hasResource: null
        });

        // 2. Diverse Curated Sacred Groves (Mango, Banyan, Parijat, Palm)
        const curatedGroves = [
            // Sweet Mango Orchards (West & Northwest)
            { x: this.centerX - 360, y: this.centerY - 270, r: 75, treeType: 'mango', res: 'fruit' },
            { x: this.centerX - 520, y: this.centerY - 380, r: 80, treeType: 'mango', res: 'fruit' },
            { x: this.centerX - 460, y: this.centerY + 340, r: 75, treeType: 'mango', res: 'fruit' },
            { x: this.centerX + 480, y: this.centerY - 240, r: 75, treeType: 'mango', res: 'fruit' },
            { x: this.centerX - 240, y: this.centerY - 450, r: 70, treeType: 'mango', res: 'fruit' },

            // Sacred Banyan Trees (Great spreading roots & holy shade to the sides)
            { x: this.centerX - 460, y: this.centerY + 60, r: 105, treeType: 'banyan', res: null },
            { x: this.centerX + 460, y: this.centerY + 160, r: 100, treeType: 'banyan', res: null },
            { x: this.centerX + 320, y: this.centerY - 420, r: 95, treeType: 'banyan', res: null },

            // Fragrant Flowering Parijat Trees (Light jade canopy & star blossoms)
            { x: this.centerX - 270, y: this.centerY - 200, r: 60, treeType: 'parijat', res: 'flower' },
            { x: this.centerX + 270, y: this.centerY - 190, r: 60, treeType: 'parijat', res: 'flower' },
            { x: this.centerX - 300, y: this.centerY + 240, r: 62, treeType: 'parijat', res: 'flower' },
            { x: this.centerX + 320, y: this.centerY + 280, r: 65, treeType: 'parijat', res: 'flower' },

            // Tall Slender Palm Trees (Near Yamuna sandbanks and eastern border)
            { x: this.width - this.riverWidth - 90, y: this.centerY - 360, r: 48, treeType: 'palm', res: 'fruit' },
            { x: this.width - this.riverWidth - 80, y: this.centerY - 90, r: 50, treeType: 'palm', res: 'fruit' },
            { x: this.width - this.riverWidth - 95, y: this.centerY + 240, r: 48, treeType: 'palm', res: 'fruit' },
            { x: this.width - this.riverWidth - 75, y: this.centerY + 450, r: 50, treeType: 'palm', res: 'fruit' }
        ];

        curatedGroves.forEach(t => {
            this.obstacles.push({
                shape: 'circle',
                type: 'tree',
                treeType: t.treeType,
                x: t.x,
                y: t.y,
                radius: 28,
                visualRadius: t.r,
                hasResource: t.res,
                resourceRegenTimer: 0
            });
        });

        // 3. Sacred Kamal Sarovar (Lotus Pond with blooming lotuses & lily pads in the water)
        this.obstacles.push({
            shape: 'circle',
            type: 'pond',
            x: this.centerX - 310,
            y: this.centerY + 160,
            radius: 54,
            visualRadius: 80,
            hasResource: 'lotus',
            resourceRegenTimer: 0
        });

        // 4. Flower Bushes (Fragrant wild Jasmine / Malati / Parijat bush blossoms)
        const flowerBushLocations = [
            { x: this.centerX - 240, y: this.centerY + 10, r: 36 },
            { x: this.centerX + 240, y: this.centerY + 15, r: 36 },
            { x: this.centerX - 210, y: this.centerY + 240, r: 38 },
            { x: this.centerX + 210, y: this.centerY + 200, r: 38 },
            { x: this.width - this.riverWidth - 130, y: this.centerY - 220, r: 42 },
            { x: this.width - this.riverWidth - 110, y: this.centerY + 70, r: 40 },
            { x: this.width - this.riverWidth - 140, y: this.centerY + 340, r: 44 }
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

        // 5. Natural Rocks & Varied Trees scattered across outer pastures
        const natureCount = 65;
        const treeTypesPool = ['mango', 'banyan', 'parijat', 'palm', 'kadamba'];
        for (let i = 0; i < natureCount; i++) {
            const rad = 42 + Math.random() * 36;
            const x = 200 + Math.random() * (this.width - this.riverWidth - 400);
            const y = 200 + Math.random() * (this.height - 400);

            // Keep the central pastoral clearing (radius 340px) completely open and sunlit!
            if (Math.hypot(x - this.centerX, y - (this.centerY + 50)) > 340) {
                const isRock = Math.random() < 0.28;
                const isBush = !isRock && Math.random() < 0.38;
                const chosenTreeType = treeTypesPool[Math.floor(Math.random() * treeTypesPool.length)];

                this.obstacles.push({
                    shape: 'circle',
                    type: isRock ? 'rock' : (isBush ? 'bush' : 'tree'),
                    treeType: isRock || isBush ? null : chosenTreeType,
                    x: x,
                    y: y,
                    radius: isRock ? rad * 0.65 : (isBush ? 18 : 28),
                    visualRadius: rad,
                    hasResource: isRock ? null : (isBush ? 'flower' : (chosenTreeType === 'mango' ? 'fruit' : (chosenTreeType === 'parijat' ? 'flower' : null))),
                    resourceRegenTimer: 0
                });
            }
        }
    }

    update(dt) {
        this.riverWaveOffset += dt * 35;
        this.swayTime += dt * 2.2;

        // Resource regeneration
        for (const obs of this.obstacles) {
            if (!obs.hasResource && obs.resourceRegenTimer > 0) {
                obs.resourceRegenTimer -= dt;
                if (obs.resourceRegenTimer <= 0) {
                    if (obs.type === 'bush') obs.hasResource = 'flower';
                    if (obs.type === 'pond') obs.hasResource = 'lotus';
                    if (obs.type === 'tree' && obs.treeType === 'mango') obs.hasResource = 'fruit';
                    if (obs.type === 'tree' && obs.treeType === 'parijat') obs.hasResource = 'flower';
                }
            }
        }
    }

    drawGround(ctx, camera) {
        // Lush Vrindavan Meadow Base
        ctx.fillStyle = '#86efac';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // Soft natural grass grid texture
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

        // 1. Natural Shaded Ground Under Central Kadamba Tree
        const kadambaY = this.centerY - 170;
        if (camera.isInView(this.centerX, kadambaY, 260)) {
            ctx.save();
            // Soft organic ground shade (NOT a harsh yellow ring)
            ctx.fillStyle = 'rgba(20, 83, 45, 0.12)';
            ctx.beginPath();
            ctx.ellipse(this.centerX, kadambaY + 12, 130, 75, 0, 0, Math.PI * 2);
            ctx.fill();

            // Scattered golden Kadamba blossoms on the shaded turf
            ctx.fillStyle = '#facc15';
            const blossomPetals = [
                [-65, 10], [55, -5], [-40, -25], [45, 20],
                [-80, 25], [75, 15], [-20, 35], [25, -30],
                [-95, -10], [90, -15], [0, 42]
            ];
            for (const [bx, by] of blossomPetals) {
                ctx.beginPath();
                ctx.arc(this.centerX + bx, kadambaY + by, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // 2. Open Sunlit Pastoral Glade (गोचारण प्रांगण - Where Krishna, Balram, and Sakhas gather)
        const clearingY = this.centerY + 50;
        if (camera.isInView(this.centerX, clearingY, 320)) {
            ctx.save();
            // Warm golden sunlight aura over the clearing
            const sunGlow = ctx.createRadialGradient(
                this.centerX, clearingY, 40,
                this.centerX, clearingY, 240
            );
            sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
            sunGlow.addColorStop(0.6, 'rgba(254, 240, 138, 0.08)');
            sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(this.centerX, clearingY, 240, 0, Math.PI * 2);
            ctx.fill();

            // Delicate wild flower specks scattered naturally on the grass
            const gladeFlowers = [
                { dx: -70, dy: -40, col: '#f472b6' },
                { dx: 65, dy: -35, col: '#facc15' },
                { dx: -120, dy: 30, col: '#ffffff' },
                { dx: 115, dy: 40, col: '#f472b6' },
                { dx: -50, dy: 110, col: '#facc15' },
                { dx: 55, dy: 105, col: '#ffffff' },
                { dx: -140, dy: 90, col: '#38bdf8' },
                { dx: 140, dy: 85, col: '#facc15' }
            ];
            for (const f of gladeFlowers) {
                ctx.fillStyle = f.col;
                ctx.beginPath();
                ctx.arc(this.centerX + f.dx, clearingY + f.dy, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. Decorated Divine Resting Asana (Peetambari silk carpet, bolsters, and Makhan handi)
            TreeRenderer.drawDivineAsana(ctx, this.centerX, this.centerY + 40);

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
        // Draw Trunks, Roots, Rocks, Bushes, Lotus Pond, and Flower blossoms
        for (const obs of this.obstacles) {
            if (!camera.isInView(obs.x, obs.y, obs.visualRadius || obs.w)) continue;

            if (obs.type === 'tree' || obs.type === 'kadamba') {
                TreeRenderer.drawTrunk(ctx, obs);
            } else if (obs.type === 'pond') {
                ctx.save();
                // Pebble bank border
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                // Clear sacred lotus pond water
                const waterGrad = ctx.createRadialGradient(obs.x, obs.y, 10, obs.x, obs.y, obs.visualRadius - 6);
                waterGrad.addColorStop(0, '#60a5fa');
                waterGrad.addColorStop(0.7, '#2563eb');
                waterGrad.addColorStop(1, '#1d4ed8');
                ctx.fillStyle = waterGrad;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius - 6, 0, Math.PI * 2);
                ctx.fill();

                // Gentle water sheen
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(obs.x - 12, obs.y - 12, obs.visualRadius * 0.45, 0.9 * Math.PI, 1.4 * Math.PI);
                ctx.stroke();

                // Floating Lily pads and blooming Sacred Lotuses
                const pondLotuses = [
                    { dx: -24, dy: -14 },
                    { dx: 22, dy: -18 },
                    { dx: -18, dy: 24 },
                    { dx: 26, dy: 20 },
                    { dx: 2, dy: 6 }
                ];
                pondLotuses.forEach((lp, idx) => {
                    const hasBloom = obs.hasResource === 'lotus' || idx < 3;
                    TreeRenderer.drawLilyPadLotus(ctx, obs.x + lp.dx, obs.y + lp.dy, hasBloom);
                });

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

                // Fragrant Wild Forest Jasmine / Malati Blossoms on bushes
                if (obs.hasResource === 'flower') {
                    const flowerOffsets = [
                        { dx: -obs.visualRadius * 0.35, dy: -obs.visualRadius * 0.2 },
                        { dx: obs.visualRadius * 0.3, dy: -obs.visualRadius * 0.25 },
                        { dx: 0, dy: obs.visualRadius * 0.3 }
                    ];

                    flowerOffsets.forEach(pt => {
                        TreeRenderer.drawForestBlossoms(ctx, obs.x + pt.dx, obs.y + pt.dy);
                    });
                }
                ctx.restore();
            }
        }
    }

    drawCanopy(ctx, camera, player = null) {
        // Draw Elevated Tree Canopies with organic cloud foliage, fruits, and blossoms
        for (const obs of this.obstacles) {
            if ((obs.type === 'tree' || obs.type === 'kadamba') && camera.isInView(obs.x, obs.y - obs.visualRadius * 0.75, obs.visualRadius + 30)) {
                const vRad = obs.visualRadius;
                const canopyY = obs.y - vRad * 0.75;

                // Only fade if the player is actually walking directly under the elevated canopy crown!
                let isPlayerNear = false;
                if (player) {
                    const distToCanopyCenter = Math.hypot(player.x - obs.x, player.y - canopyY);
                    if (distToCanopyCenter < vRad * 0.85) {
                        isPlayerNear = true;
                    }
                }

                TreeRenderer.drawCanopy(ctx, obs, isPlayerNear, this.swayTime);
            }
        }
    }
}
