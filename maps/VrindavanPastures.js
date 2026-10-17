import { TreeRenderer } from './TreeRenderer.js';

/**
 * Vrindavan Pastures Map (गोचारण लीला व दिव्य वृन्दावन महाप्रांगण)
 * Epic 8000x8000 Grand Pastoral Expanse.
 * 100% Handcrafted Layout - ZERO Randomness for perfect deterministic gameplay.
 * Features:
 * - Central Sacred Glade with Ancient Kadamba & Divine Resting Asana
 * - Interactive One-Way Floral Wind Streams (पवन मार्ग) with speed boosts & petal flows
 * - 6 Grand Strategic Speed-Boost Flower Carpets (पुष्प वाटिकाएं)
 * - 8 Distinct Hardcoded Pastoral Regions with wide 200px+ galloping avenues
 * - Sacred Kamal Sarovar (Lotus Lake) with stepping stone crossings
 * - Sandy Yamuna shoreline with Tall Palm Tala Vana & sacred Ghats
 * - Govardhan Rocky Glades, Mango Orchards, and Banyan Sanctuaries
 */
export class VrindavanPastures {
    constructor() {
        this.name = "Vrindavan Pastures";
        this.hindiName = "वृन्दावन गोचारण";
        this.width = 8000;
        this.height = 8000;
        this.centerX = 4000;
        this.centerY = 4000;
        this.riverWidth = 800;
        this.obstacles = [];
        this.windStreams = [];
        this.riverWaveOffset = 0;
        this.swayTime = 0;
    }

    init() {
        this.obstacles = [];
        const border = 80;

        // 1. Map Perimeter Boundaries
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: -border, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: this.height, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: 0, w: border, h: this.height, radius: 0 });

        // 2. Yamuna River on East Border (x: 7200 to 8000)
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

        // 3. Central Ancient Kadamba Tree (Northern Crown of the Central Glade)
        // Positioned safely North at (4000, 3600), leaving the Central Glade at (4000, 4000) wide open!
        this.obstacles.push({
            shape: 'circle',
            type: 'tree',
            treeType: 'kadamba',
            x: 4000,
            y: 3600,
            radius: 46,
            visualRadius: 150,
            hasResource: null
        });

        // 4. Grand Speed-Boost Flower Carpets (पुष्प वाटिकाएं - 100% Walkthrough, +35% Speed)
        const flowerCarpets = [
            { name: "Central Kadamba Flower Carpet", x: 4000, y: 3100, r: 135 },
            { name: "West Mango Orchard Flower Carpet", x: 2500, y: 4000, r: 140 },
            { name: "South Kamal Sarovar Shore Carpet", x: 4000, y: 5200, r: 140 },
            { name: "East Yamuna Sands Flower Carpet", x: 6600, y: 4000, r: 140 },
            { name: "North-West Nikunja Flower Carpet", x: 2400, y: 2400, r: 130 },
            { name: "South-West Govardhan Glade Carpet", x: 2500, y: 5600, r: 130 }
        ];

        flowerCarpets.forEach(c => {
            this.obstacles.push({
                shape: 'circle',
                type: 'flower_carpet',
                name: c.name,
                x: c.x,
                y: c.y,
                radius: c.r,
                visualRadius: c.r,
                hasResource: null
            });
        });

        // 5. Sacred Kamal Sarovar (Lotus Pond at 4000, 6100)
        this.obstacles.push({
            shape: 'circle',
            type: 'pond',
            x: 4000,
            y: 6100,
            radius: 170,
            visualRadius: 170,
            hasResource: 'lotus',
            resourceRegenTimer: 0
        });

        // 6. Interactive One-Way Floral Wind Streams (पवन मार्ग)
        // Specific grove corridors where sweet Vrindavan breeze carries flower petals and accelerates runners!
        this.windStreams = [
            {
                id: "north_zephyr",
                name: "Kadamba Zephyr Stream",
                hindi: "कदम्ब पावन समीर (उत्तर से दक्षिण)",
                x: 3860, y: 1600, w: 280, h: 1700,
                dirX: 0, dirY: 1, speedBoost: 220,
                color: "#fde047"
            },
            {
                id: "west_floral_rush",
                name: "Nikunja Floral Rush",
                hindi: "निकुंज पुष्प प्रवाह (पश्चिम से पूर्व)",
                x: 1800, y: 3860, w: 1800, h: 280,
                dirX: 1, dirY: 0, speedBoost: 220,
                color: "#f472b6"
            },
            {
                id: "yamuna_beach_gale",
                name: "Yamuna Sandbank Gale",
                hindi: "यमुना बालुका समीर (दक्षिण से उत्तर)",
                x: 6860, y: 2000, w: 280, h: 4200,
                dirX: 0, dirY: -1, speedBoost: 240,
                color: "#38bdf8"
            }
        ];

        // 7. 100% Handcrafted Tree Groves (ZERO RANDOMNESS!)
        // All coordinates spaced with minimum 220px to 320px corridors so no one ever gets stuck!
        const hardcodedTrees = [
            // NORTH: Kadamba Kusum Forest (कदम्ब कानन)
            { x: 3400, y: 1600, type: 'kadamba', r: 85, res: null },
            { x: 4000, y: 1300, type: 'kadamba', r: 90, res: null },
            { x: 4600, y: 1600, type: 'kadamba', r: 85, res: null },
            { x: 3300, y: 2200, type: 'kadamba', r: 80, res: null },
            { x: 4700, y: 2200, type: 'kadamba', r: 80, res: null },
            { x: 3400, y: 2750, type: 'kadamba', r: 80, res: null },
            { x: 4600, y: 2750, type: 'kadamba', r: 80, res: null },
            { x: 3700, y: 2000, type: 'kadamba', r: 75, res: null },
            { x: 4300, y: 2000, type: 'kadamba', r: 75, res: null },

            // WEST: Sweet Mango Orchards (रसीले आम की अमराई)
            { x: 1800, y: 3300, type: 'mango', r: 80, res: 'fruit' },
            { x: 2300, y: 3300, type: 'mango', r: 80, res: 'fruit' },
            { x: 2800, y: 3300, type: 'mango', r: 80, res: 'fruit' },
            { x: 3300, y: 3300, type: 'mango', r: 80, res: 'fruit' },

            { x: 1600, y: 4000, type: 'mango', r: 85, res: 'fruit' },
            { x: 2050, y: 4000, type: 'mango', r: 85, res: 'fruit' },
            { x: 2950, y: 4000, type: 'mango', r: 85, res: 'fruit' },

            { x: 1800, y: 4700, type: 'mango', r: 80, res: 'fruit' },
            { x: 2300, y: 4700, type: 'mango', r: 80, res: 'fruit' },
            { x: 2800, y: 4700, type: 'mango', r: 80, res: 'fruit' },
            { x: 3300, y: 4700, type: 'mango', r: 80, res: 'fruit' },

            // NORTH-WEST: Nikunja & Malati Groves (दिव्य निकुंज)
            { x: 1800, y: 1600, type: 'parijat', r: 70, res: 'flower' },
            { x: 2400, y: 1500, type: 'parijat', r: 75, res: 'flower' },
            { x: 2900, y: 1700, type: 'parijat', r: 70, res: 'flower' },
            { x: 1900, y: 2200, type: 'parijat', r: 70, res: 'flower' },
            { x: 2900, y: 2300, type: 'parijat', r: 70, res: 'flower' },
            { x: 1800, y: 2800, type: 'parijat', r: 75, res: 'flower' },
            { x: 2400, y: 2950, type: 'parijat', r: 75, res: 'flower' },
            { x: 2900, y: 2800, type: 'parijat', r: 70, res: 'flower' },

            // NORTH-EAST: Akshay Vat Banyan Sanctuary (अक्षय वट कुंज)
            { x: 5100, y: 1600, type: 'banyan', r: 105, res: null },
            { x: 5800, y: 1500, type: 'banyan', r: 110, res: null },
            { x: 6500, y: 1700, type: 'banyan', r: 105, res: null },
            { x: 5300, y: 2300, type: 'banyan', r: 100, res: null },
            { x: 6100, y: 2200, type: 'banyan', r: 105, res: null },
            { x: 5200, y: 3000, type: 'banyan', r: 100, res: null },
            { x: 5900, y: 2950, type: 'banyan', r: 105, res: null },
            { x: 6500, y: 2800, type: 'banyan', r: 100, res: null },

            // SOUTH-WEST: Govardhan Banyan & Hill Groves (गिरिराज कानन)
            { x: 1800, y: 5300, type: 'banyan', r: 105, res: null },
            { x: 2500, y: 5150, type: 'banyan', r: 100, res: null },
            { x: 3100, y: 5350, type: 'banyan', r: 100, res: null },
            { x: 1800, y: 6200, type: 'banyan', r: 105, res: null },
            { x: 2500, y: 6400, type: 'banyan', r: 105, res: null },
            { x: 3100, y: 6200, type: 'banyan', r: 100, res: null },

            // SOUTH: Kamal Sarovar Guardian Trees (सरोवर कुंज)
            { x: 3400, y: 5600, type: 'parijat', r: 70, res: 'flower' },
            { x: 4600, y: 5600, type: 'parijat', r: 70, res: 'flower' },
            { x: 3400, y: 6600, type: 'kadamba', r: 85, res: null },
            { x: 4600, y: 6600, type: 'kadamba', r: 85, res: null },

            // SOUTH-EAST: Pastures & Shade Trees (चारागाह उपवन)
            { x: 5200, y: 5200, type: 'mango', r: 80, res: 'fruit' },
            { x: 5800, y: 5100, type: 'kadamba', r: 85, res: null },
            { x: 6400, y: 5300, type: 'mango', r: 80, res: 'fruit' },
            { x: 5300, y: 6100, type: 'banyan', r: 100, res: null },
            { x: 6000, y: 6150, type: 'kadamba', r: 85, res: null },

            // EAST: Yamuna Sandbank Shore & Tall Palm Tala Vana (ताल वन)
            { x: 6850, y: 1500, type: 'palm', r: 52, res: 'fruit' },
            { x: 6850, y: 2200, type: 'palm', r: 54, res: 'fruit' },
            { x: 6850, y: 2900, type: 'palm', r: 52, res: 'fruit' },
            { x: 6850, y: 3600, type: 'palm', r: 54, res: 'fruit' },
            { x: 6850, y: 4400, type: 'palm', r: 52, res: 'fruit' },
            { x: 6850, y: 5200, type: 'palm', r: 54, res: 'fruit' },
            { x: 6850, y: 6000, type: 'palm', r: 52, res: 'fruit' },
            { x: 6850, y: 6700, type: 'palm', r: 54, res: 'fruit' }
        ];

        hardcodedTrees.forEach(t => {
            this.obstacles.push({
                shape: 'circle',
                type: 'tree',
                treeType: t.type,
                x: t.x,
                y: t.y,
                radius: 28, // Trunk collision radius
                visualRadius: t.r,
                hasResource: t.res,
                resourceRegenTimer: 0
            });
        });

        // 8. 100% Handcrafted Sacred Govardhan Boulders (Soft Collision, Hopping Speed Boost)
        const hardcodedRocks = [
            { x: 1900, y: 5750, r: 42 },
            { x: 2300, y: 5750, r: 45 },
            { x: 2800, y: 5750, r: 44 },
            { x: 2000, y: 6550, r: 45 },
            { x: 2700, y: 6550, r: 48 },
            { x: 3800, y: 6250, r: 38 }, // Stepping post near sarovar
            { x: 4200, y: 6250, r: 38 }, // Stepping post near sarovar
            { x: 7100, y: 2700, r: 45 }, // Kaliya Ghat landing boulder
            { x: 7100, y: 5300, r: 45 }  // Keshi Ghat landing boulder
        ];

        hardcodedRocks.forEach(rk => {
            this.obstacles.push({
                shape: 'circle',
                type: 'rock',
                x: rk.x,
                y: rk.y,
                radius: rk.r * 0.65,
                visualRadius: rk.r,
                hasResource: null
            });
        });

        // 9. 100% Handcrafted Fragrant Malati & Jasmine Flower Bushes (Soft Obstacles)
        const hardcodedBushes = [
            // Central Glade Outer Accents
            { x: 3600, y: 3750, r: 38 },
            { x: 4400, y: 3750, r: 38 },
            { x: 3550, y: 4350, r: 38 },
            { x: 4450, y: 4350, r: 38 },

            // North Kadamba Trails
            { x: 3700, y: 2600, r: 36 },
            { x: 4300, y: 2600, r: 36 },

            // West Mango Crossings
            { x: 2100, y: 3650, r: 38 },
            { x: 2700, y: 3650, r: 38 },
            { x: 2100, y: 4350, r: 38 },
            { x: 2700, y: 4350, r: 38 },

            // North-West Nikunja Shrubbery
            { x: 2100, y: 1900, r: 40 },
            { x: 2650, y: 1900, r: 40 },
            { x: 2100, y: 2600, r: 40 },
            { x: 2650, y: 2600, r: 40 },

            // South Lake Flower Shrubbery
            { x: 3700, y: 5450, r: 40 },
            { x: 4300, y: 5450, r: 40 },
            { x: 3700, y: 6450, r: 40 },
            { x: 4300, y: 6450, r: 40 },

            // East Yamuna Shoreline
            { x: 6700, y: 2400, r: 42 },
            { x: 6700, y: 3800, r: 42 },
            { x: 6700, y: 5000, r: 42 },
            { x: 6700, y: 6200, r: 42 }
        ];

        hardcodedBushes.forEach(b => {
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
    }

    update(dt) {
        this.riverWaveOffset += dt * 38;
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

    /**
     * Checks if an entity is inside any active One-Way Floral Wind Stream
     * Returns { inStream: true, fx, fy, boost } or null
     */
    getWindStreamEffect(x, y) {
        for (const ws of this.windStreams) {
            if (x >= ws.x && x <= ws.x + ws.w && y >= ws.y && y <= ws.y + ws.h) {
                return {
                    inStream: true,
                    name: ws.name,
                    hindi: ws.hindi,
                    fx: ws.dirX * ws.speedBoost,
                    fy: ws.dirY * ws.speedBoost
                };
            }
        }
        return null;
    }

    drawGround(ctx, camera) {
        // Lush Vrindavan Meadow Base across the grand 8000x8000 canvas
        ctx.fillStyle = '#86efac';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // Soft natural grass grid texture (140px intervals)
        ctx.strokeStyle = 'rgba(21, 128, 61, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const startX = Math.floor(camera.x / 140) * 140;
        const startY = Math.floor(camera.y / 140) * 140;
        for (let x = startX; x < camera.x + camera.width + 140; x += 140) {
            ctx.moveTo(x, camera.y);
            ctx.lineTo(x, camera.y + camera.height);
        }
        for (let y = startY; y < camera.y + camera.height + 140; y += 140) {
            ctx.moveTo(camera.x, y);
            ctx.lineTo(camera.x + camera.width, y);
        }
        ctx.stroke();

        // 1. One-Way Floral Wind Streams (पवन मार्ग) Ground Rendering
        for (const ws of this.windStreams) {
            if (camera.x + camera.width > ws.x && camera.x < ws.x + ws.w &&
                camera.y + camera.height > ws.y && camera.y < ws.y + ws.h) {
                ctx.save();
                // Breezy translucent lane aura
                ctx.fillStyle = 'rgba(254, 240, 138, 0.14)';
                ctx.fillRect(ws.x, ws.y, ws.w, ws.h);

                // Dashed border edges of the breeze stream
                ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
                ctx.lineWidth = 2;
                ctx.setLineDash([12, 10]);
                ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
                ctx.setLineDash([]);

                // Flowing stream arrows and petals
                ctx.fillStyle = ws.color;
                ctx.strokeStyle = ws.color;
                ctx.lineWidth = 2;
                const flowOffset = (this.swayTime * 65) % 80;

                if (ws.dirY !== 0) {
                    for (let cy = ws.y + flowOffset; cy < ws.y + ws.h; cy += 80) {
                        for (let cx = ws.x + 40; cx < ws.x + ws.w - 20; cx += 70) {
                            ctx.beginPath();
                            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                            ctx.fill();
                            // Direction pointer
                            ctx.beginPath();
                            ctx.moveTo(cx - 5, cy);
                            ctx.lineTo(cx, cy + (ws.dirY > 0 ? 8 : -8));
                            ctx.lineTo(cx + 5, cy);
                            ctx.stroke();
                        }
                    }
                } else if (ws.dirX !== 0) {
                    for (let cx = ws.x + flowOffset; cx < ws.x + ws.w; cx += 80) {
                        for (let cy = ws.y + 40; cy < ws.y + ws.h - 20; cy += 70) {
                            ctx.beginPath();
                            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                            ctx.fill();
                            // Direction pointer
                            ctx.beginPath();
                            ctx.moveTo(cx, cy - 5);
                            ctx.lineTo(cx + (ws.dirX > 0 ? 8 : -8), cy);
                            ctx.lineTo(cx, cy + 5);
                            ctx.stroke();
                        }
                    }
                }

                // Corridor Name Badge
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.beginPath();
                ctx.roundRect(ws.x + ws.w / 2 - 90, ws.y + 15, 180, 24, 12);
                ctx.fill();
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 11px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`💨 ${ws.hindi}`, ws.x + ws.w / 2, ws.y + 27);

                ctx.restore();
            }
        }

        // 2. Natural Shaded Ground Under Central Kadamba Tree (4000, 3600)
        const kadambaY = 3600;
        if (camera.isInView(this.centerX, kadambaY, 260)) {
            ctx.save();
            ctx.fillStyle = 'rgba(20, 83, 45, 0.12)';
            ctx.beginPath();
            ctx.ellipse(this.centerX, kadambaY + 14, 140, 80, 0, 0, Math.PI * 2);
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

        // 3. Open Sunlit Pastoral Glade (गोचारण महाप्रांगण at 4000, 4000)
        const clearingY = 4000;
        if (camera.isInView(this.centerX, clearingY, 360)) {
            ctx.save();
            const sunGlow = ctx.createRadialGradient(
                this.centerX, clearingY, 60,
                this.centerX, clearingY, 340
            );
            sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.24)');
            sunGlow.addColorStop(0.6, 'rgba(254, 240, 138, 0.08)');
            sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(this.centerX, clearingY, 340, 0, Math.PI * 2);
            ctx.fill();

            // Delicate wild flower specks scattered naturally on the grass
            const gladeFlowers = [
                { dx: -100, dy: -60, col: '#f472b6' },
                { dx: 95, dy: -55, col: '#facc15' },
                { dx: -160, dy: 50, col: '#ffffff' },
                { dx: 155, dy: 60, col: '#f472b6' },
                { dx: -70, dy: 140, col: '#facc15' },
                { dx: 75, dy: 135, col: '#ffffff' },
                { dx: -190, dy: 120, col: '#38bdf8' },
                { dx: 190, dy: 115, col: '#facc15' }
            ];
            for (const f of gladeFlowers) {
                ctx.fillStyle = f.col;
                ctx.beginPath();
                ctx.arc(this.centerX + f.dx, clearingY + f.dy, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Decorated Divine Resting Asana (Peetambari silk carpet, bolsters, and Makhan handi)
            TreeRenderer.drawDivineAsana(ctx, this.centerX, this.centerY + 40);

            ctx.restore();
        }

        // 4. Sacred Speed-Boost Flower Carpets (पुष्प वाटिका)
        for (const obs of this.obstacles) {
            if (obs.type === 'flower_carpet' && camera.isInView(obs.x, obs.y, obs.visualRadius + 50)) {
                ctx.save();
                const pulse = Math.sin(this.swayTime * 2.5) * 5;
                const vR = obs.visualRadius + pulse;

                // Glowing floral aura gradient
                const grad = ctx.createRadialGradient(obs.x, obs.y, 10, obs.x, obs.y, vR);
                grad.addColorStop(0, 'rgba(244, 114, 182, 0.45)');
                grad.addColorStop(0.65, 'rgba(251, 191, 36, 0.28)');
                grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, vR, 0, Math.PI * 2);
                ctx.fill();

                // Concentric floral dashed ring
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius * 0.75, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // Floating blossom petals
                ctx.fillStyle = '#f472b6';
                for (let a = 0; a < 8; a++) {
                    const ang = a * (Math.PI / 4) + this.swayTime * 0.6;
                    const px = obs.x + Math.cos(ang) * (obs.visualRadius * 0.52);
                    const py = obs.y + Math.sin(ang) * (obs.visualRadius * 0.52);
                    ctx.beginPath();
                    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Speed icon & label badge
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.beginPath();
                ctx.roundRect(obs.x - 75, obs.y - 11, 150, 22, 11);
                ctx.fill();

                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 11px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("🌸 पुष्प वाटिका (+Speed)", obs.x, obs.y);
                ctx.restore();
            }
        }

        // 5. Yamuna River on the East border (x: 7200 to 8000)
        const riverX = this.width - this.riverWidth;
        if (camera.x + camera.width > riverX - 100) {
            // Golden Sandbank shoreline
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(riverX - 80, camera.y, 80, camera.height);

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

            // Kaliya Ghat & Keshi Ghat stone banners
            const ghats = [
                { name: "Kaliya Ghat (कालिया दह)", y: 2700 },
                { name: "Keshi Ghat (केशी घाट)", y: 5300 }
            ];
            for (const g of ghats) {
                if (camera.isInView(riverX - 35, g.y, 100)) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                    ctx.beginPath();
                    ctx.roundRect(riverX - 120, g.y - 12, 115, 24, 12);
                    ctx.fill();
                    ctx.fillStyle = '#fef08a';
                    ctx.font = 'bold 11px Outfit, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`🌊 ${g.name}`, riverX - 62, g.y);
                    ctx.restore();
                }
            }
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
                const waterGrad = ctx.createRadialGradient(obs.x, obs.y, 10, obs.x, obs.y, obs.visualRadius - 8);
                waterGrad.addColorStop(0, '#60a5fa');
                waterGrad.addColorStop(0.7, '#2563eb');
                waterGrad.addColorStop(1, '#1d4ed8');
                ctx.fillStyle = waterGrad;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius - 8, 0, Math.PI * 2);
                ctx.fill();

                // Gentle water sheen
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(obs.x - 16, obs.y - 16, obs.visualRadius * 0.45, 0.9 * Math.PI, 1.4 * Math.PI);
                ctx.stroke();

                // Floating Lily pads and blooming Sacred Lotuses
                const pondLotuses = [
                    { dx: -45, dy: -28 },
                    { dx: 42, dy: -35 },
                    { dx: -35, dy: 45 },
                    { dx: 50, dy: 38 },
                    { dx: 5, dy: 10 },
                    { dx: -15, dy: -50 },
                    { dx: 25, dy: 55 }
                ];
                pondLotuses.forEach((lp, idx) => {
                    const hasBloom = obs.hasResource === 'lotus' || idx < 4;
                    TreeRenderer.drawLilyPadLotus(ctx, obs.x + lp.dx, obs.y + lp.dy, hasBloom);
                });

                ctx.restore();
            } else if (obs.type === 'rock') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.ellipse(obs.x + 3, obs.y + 4, obs.visualRadius, obs.visualRadius * 0.65, 0, 0, Math.PI * 2);
                ctx.fill();

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
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.ellipse(obs.x + 2, obs.y + 3, obs.visualRadius, obs.visualRadius * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#4d7c0f';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#65a30d';
                ctx.beginPath();
                ctx.arc(obs.x - 3, obs.y - 4, obs.visualRadius * 0.75, 0, Math.PI * 2);
                ctx.fill();

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
            if ((obs.type === 'tree' || obs.type === 'kadamba') && camera.isInView(obs.x, obs.y - obs.visualRadius * 0.75, obs.visualRadius + 40)) {
                const vRad = obs.visualRadius;
                const canopyY = obs.y - vRad * 0.75;

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

    /**
     * Sacred Parikrama Perimeter Loop (8000x8000)
     * Smoothly curves runners along outer perimeter tracks back into pastures.
     */
    getBoundaryFlowVector(x, y) {
        let bx = 0;
        let by = 0;
        const pad = 550;
        const riverEdge = this.width - this.riverWidth - 90;

        if (x < pad) {
            const factor = Math.pow((pad - x) / pad, 1.4);
            bx += factor * 5.2;
            by += (y < this.centerY ? 1 : -1) * factor * 3.4;
        } else if (x > riverEdge - pad) {
            const factor = Math.pow((x - (riverEdge - pad)) / pad, 1.4);
            bx -= factor * 5.2;
            by += (y < this.centerY ? 1 : -1) * factor * 3.4;
        }

        if (y < pad) {
            const factor = Math.pow((pad - y) / pad, 1.4);
            by += factor * 5.2;
            bx += (x < this.centerX ? 1 : -1) * factor * 3.4;
        } else if (y > this.height - pad) {
            const factor = Math.pow((y - (this.height - pad)) / pad, 1.4);
            by -= factor * 5.2;
            bx += (x < this.centerX ? 1 : -1) * factor * 3.4;
        }

        return { x: bx, y: by };
    }
}
