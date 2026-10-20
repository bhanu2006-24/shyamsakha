import { TreeRenderer } from './TreeRenderer.js';
import { EnvironmentRenderer } from '../js/assets/EnvironmentRenderer.js';
import { VRINDAVAN_PASTURES_DATA } from './vrindavan_pastures_data.js';

/**
 * Vrindavan Pastures Map (गोचारण लीला व दिव्य वृन्दावन महाप्रांगण)
 * Grand 16,000 x 16,000 Hardcoded Vedic Expanse.
 * 100% Deterministic Handcrafted Layout - ZERO Randomness.
 * Features:
 * - Central Sacred Glade at (8000, 8000) with Ancient Kadamba & Divine Resting Asana
 * - Yamuna Sandbanks with Kanduka Kridha (Volleyball) Court at (13200, 7720)
 * - Flowing Sacred Yamuna River on East Border (x: 14400 to 16000)
 * - 4 Strategic One-Way Floral Wind Streams (पवन मार्ग) with speed boosts
 * - 10 Grand Speed-Boost Flower Carpets (पुष्प वाटिकाएं)
 * - Sacred Kamal Sarovar (Lotus Lake) at (8000, 12000)
 * - Govardhan Boulder Groves, Sweet Mango Orchards, Parijat Nikunjas, and Tall Tala Palm Groves
 */
export class VrindavanPastures {
    constructor() {
        const data = VRINDAVAN_PASTURES_DATA;
        this.name = data.name || "Vrindavan Pastures";
        this.hindiName = data.hindiName || "वृन्दावन गोचारण";
        this.width = data.width || 16000;
        this.height = data.height || 16000;
        this.centerX = data.centerX || 8000;
        this.centerY = data.centerY || 8000;
        this.riverWidth = data.riverWidth || 1600;
        this.court = data.court || {
            x: 13200,
            y: 7720,
            w: 900,
            h: 560,
            netX: 13650,
            playerSide: { minX: 13200, maxX: 13640 },
            krishnaSide: { minX: 13660, maxX: 14100 }
        };
        this.obstacles = [];
        this.windStreams = data.windStreams || [];
        this.riverWaveOffset = 0;
        this.swayTime = 0;
    }

    init() {
        this.obstacles = [];
        const border = 100;
        const data = VRINDAVAN_PASTURES_DATA;

        // 1. Map Perimeter Boundaries
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: -border, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: this.height, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: 0, w: border, h: this.height, radius: 0 });

        // 2. Yamuna River on East Border (x: 14400 to 16000)
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

        // 3. Volleyball Net Barrier (Collides with players, ball flies right over!)
        this.obstacles.push({
            shape: 'rect',
            type: 'net',
            x: this.court.netX - 8,
            y: this.court.y,
            w: 16,
            h: this.court.h,
            radius: 0
        });

        // 4. Central Ancient Kadamba Tree
        if (data.centralKadamba) {
            this.obstacles.push({
                shape: 'circle',
                type: 'tree',
                treeType: data.centralKadamba.treeType || 'kadamba',
                x: data.centralKadamba.x,
                y: data.centralKadamba.y,
                radius: data.centralKadamba.radius || 52,
                visualRadius: data.centralKadamba.visualRadius || 160,
                hasResource: null
            });
        }

        // 5. Grand Speed-Boost Flower Carpets (पुष्प वाटिकाएं - Walkthrough, +35% Speed)
        if (data.flowerCarpets) {
            data.flowerCarpets.forEach(c => {
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
        }

        // 6. Sacred Kamal Sarovar (Lotus Pond at 8000, 12000)
        if (data.sarovar) {
            this.obstacles.push({
                shape: 'circle',
                type: 'pond',
                x: data.sarovar.x,
                y: data.sarovar.y,
                radius: data.sarovar.radius || 340,
                visualRadius: data.sarovar.visualRadius || 340,
                hasResource: 'lotus',
                resourceRegenTimer: 0
            });
        }

        // 7. Handcrafted Trees across Vrindavan (ZERO RANDOMNESS!)
        if (data.trees) {
            data.trees.forEach(t => {
                this.obstacles.push({
                    shape: 'circle',
                    type: 'tree',
                    treeType: t.type,
                    x: t.x,
                    y: t.y,
                    radius: 30, // Trunk collision radius
                    visualRadius: t.r,
                    hasResource: t.res,
                    resourceRegenTimer: 0
                });
            });
        }

        // 8. Handcrafted Govardhan Rocks & Stepping Boulders
        if (data.rocks) {
            data.rocks.forEach(rk => {
                this.obstacles.push({
                    shape: 'circle',
                    type: 'rock',
                    x: rk.x,
                    y: rk.y,
                    radius: rk.r * 0.7,
                    visualRadius: rk.r,
                    hasResource: null
                });
            });
        }

        // 9. Handcrafted Fragrant Malati & Jasmine Flower Bushes
        if (data.bushes) {
            data.bushes.forEach(b => {
                this.obstacles.push({
                    shape: 'circle',
                    type: 'bush',
                    x: b.x,
                    y: b.y,
                    radius: b.r * 0.55,
                    visualRadius: b.r,
                    hasResource: b.res || 'flower',
                    resourceRegenTimer: 0
                });
            });
        }

        // 10. High-Performance Spatial Grid (Buckets obstacles into 600px cells for instantaneous rendering & 60fps physics)
        this.gridCellSize = 600;
        this.spatialGrid = new Map();
        for (let i = 0; i < this.obstacles.length; i++) {
            this.addToSpatialGrid(this.obstacles[i]);
        }
    }

    addToSpatialGrid(obs) {
        const cs = this.gridCellSize;
        const rad = obs.visualRadius || obs.radius || Math.max(obs.w || 0, obs.h || 0) || 60;
        const minC = Math.max(0, Math.floor((obs.x - rad) / cs));
        const maxC = Math.min(Math.floor(this.width / cs), Math.floor((obs.x + (obs.w || rad)) / cs));
        const minR = Math.max(0, Math.floor((obs.y - rad) / cs));
        const maxR = Math.min(Math.floor(this.height / cs), Math.floor((obs.y + (obs.h || rad)) / cs));

        for (let c = minC; c <= maxC; c++) {
            for (let r = minR; r <= maxR; r++) {
                const key = `${c},${r}`;
                let list = this.spatialGrid.get(key);
                if (!list) {
                    list = [];
                    this.spatialGrid.set(key, list);
                }
                list.push(obs);
            }
        }
    }

    getVisibleObstacles(camera) {
        const cs = this.gridCellSize;
        const pad = 240;
        const minC = Math.max(0, Math.floor((camera.x - pad) / cs));
        const maxC = Math.min(Math.floor(this.width / cs), Math.floor((camera.x + camera.width + pad) / cs));
        const minR = Math.max(0, Math.floor((camera.y - pad) / cs));
        const maxR = Math.min(Math.floor(this.height / cs), Math.floor((camera.y + camera.height + pad) / cs));

        const visible = [];
        const seen = new Set();
        for (let c = minC; c <= maxC; c++) {
            for (let r = minR; r <= maxR; r++) {
                const list = this.spatialGrid.get(`${c},${r}`);
                if (list) {
                    for (let i = 0; i < list.length; i++) {
                        const obs = list[i];
                        if (!seen.has(obs)) {
                            seen.add(obs);
                            visible.push(obs);
                        }
                    }
                }
            }
        }
        return visible;
    }

    getNearbyObstacles(x, y, radius = 240) {
        const cs = this.gridCellSize;
        const minC = Math.max(0, Math.floor((x - radius) / cs));
        const maxC = Math.min(Math.floor(this.width / cs), Math.floor((x + radius) / cs));
        const minR = Math.max(0, Math.floor((y - radius) / cs));
        const maxR = Math.min(Math.floor(this.height / cs), Math.floor((y + radius) / cs));

        const nearby = [];
        const seen = new Set();
        for (let c = minC; c <= maxC; c++) {
            for (let r = minR; r <= maxR; r++) {
                const list = this.spatialGrid.get(`${c},${r}`);
                if (list) {
                    for (let i = 0; i < list.length; i++) {
                        const obs = list[i];
                        if (!seen.has(obs)) {
                            seen.add(obs);
                            nearby.push(obs);
                        }
                    }
                }
            }
        }
        return nearby;
    }

    update(dt) {
        this.swayTime += dt;
        this.riverWaveOffset += dt * 45;

        // Resource regeneration
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (obs.resourceRegenTimer > 0) {
                obs.resourceRegenTimer -= dt;
            }
        }
    }

    drawGround(ctx, camera) {
        const startY = Math.floor(camera.y / 70) * 70;
        const sway = Math.sin(this.swayTime * 2.0) * 0.5;

        // 1. Base Pastoral Vrindavan Turf (Lush, vibrant emerald green pasture)
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // 2. Interactive Floral Wind Streams (पवन मार्ग)
        for (const ws of this.windStreams) {
            if (camera.isInView(ws.x + ws.w / 2, ws.y + ws.h / 2, Math.max(ws.w, ws.h) / 2 + 50)) {
                ctx.save();
                ctx.fillStyle = ws.color + '18';
                ctx.fillRect(ws.x, ws.y, ws.w, ws.h);

                ctx.strokeStyle = ws.color + '55';
                ctx.lineWidth = 2;
                ctx.setLineDash([16, 12]);
                ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
                ctx.setLineDash([]);

                // Flowing breeze streaks & petals
                const isVertical = ws.h > ws.w;
                const flowOffset = (this.swayTime * 140) % (isVertical ? ws.h : ws.w);

                ctx.fillStyle = ws.color;
                ctx.strokeStyle = ws.color + '88';
                ctx.lineWidth = 1.8;

                for (let i = 0; i < 7; i++) {
                    if (isVertical) {
                        const py = ws.dirY > 0 ? ws.y + (flowOffset + i * (ws.h / 7)) % ws.h : ws.y + ws.h - ((flowOffset + i * (ws.h / 7)) % ws.h);
                        const px = ws.x + 35 + (i * 37) % (ws.w - 70);
                        ctx.beginPath();
                        ctx.moveTo(px, py - 18 * ws.dirY);
                        ctx.lineTo(px, py + 18 * ws.dirY);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(px, py, 3, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        const px = ws.dirX > 0 ? ws.x + (flowOffset + i * (ws.w / 7)) % ws.w : ws.x + ws.w - ((flowOffset + i * (ws.w / 7)) % ws.w);
                        const py = ws.y + 35 + (i * 37) % (ws.h - 70);
                        ctx.beginPath();
                        ctx.moveTo(px - 18 * ws.dirX, py);
                        ctx.lineTo(px + 18 * ws.dirX, py);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(px, py, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Stream Name Tag
                ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
                ctx.beginPath();
                ctx.roundRect(ws.x + ws.w / 2 - 110, ws.y + ws.h / 2 - 13, 220, 26, 13);
                ctx.fill();

                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 11px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`💨 ${ws.hindi}`, ws.x + ws.w / 2, ws.y + ws.h / 2);

                ctx.restore();
            }
        }

        // 4. Central Sacred Glade at (8000, 8000)
        if (camera.isInView(this.centerX, this.centerY, 450)) {
            ctx.save();
            const sunGlow = ctx.createRadialGradient(
                this.centerX, this.centerY, 80,
                this.centerX, this.centerY, 420
            );
            sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
            sunGlow.addColorStop(0.65, 'rgba(254, 240, 138, 0.08)');
            sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, 420, 0, Math.PI * 2);
            ctx.fill();

            // Decorated Divine Resting Asana
            TreeRenderer.drawDivineAsana(ctx, this.centerX, this.centerY + 40);

            ctx.restore();
        }

        // 5. Grand Speed-Boost Flower Carpets (पुष्प वाटिकाएं)
        for (const obs of this.obstacles) {
            if (obs.type === 'flower_carpet' && camera.isInView(obs.x, obs.y, obs.visualRadius + 60)) {
                ctx.save();
                const pulse = Math.sin(this.swayTime * 2.5) * 6;
                const vR = obs.visualRadius + pulse;

                const grad = ctx.createRadialGradient(obs.x, obs.y, 10, obs.x, obs.y, vR);
                grad.addColorStop(0, 'rgba(244, 114, 182, 0.48)');
                grad.addColorStop(0.65, 'rgba(251, 191, 36, 0.28)');
                grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, vR, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius * 0.75, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // Floating petals
                for (let a = 0; a < 8; a++) {
                    const ang = a * (Math.PI / 4) + this.swayTime * 0.6;
                    const px = obs.x + Math.cos(ang) * (obs.visualRadius * 0.52);
                    const py = obs.y + Math.sin(ang) * (obs.visualRadius * 0.52);
                    EnvironmentRenderer.drawParijatFlower(ctx, px, py, 6, ang);
                }

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

        // 6. Yamuna Sandbank Shoreline (x: 12800 to 14400)
        const sandStartX = 12800;
        const riverStartX = this.width - this.riverWidth; // 14400

        if (camera.x + camera.width > sandStartX) {
            // Golden sandbank expanse
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sandStartX, camera.y, riverStartX - sandStartX, camera.height);

            // Sand ripples
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let y = startY; y < camera.y + camera.height + 100; y += 70) {
                ctx.moveTo(sandStartX, y);
                ctx.bezierCurveTo(sandStartX + 500, y - 8, sandStartX + 1000, y + 8, riverStartX, y);
            }
            ctx.stroke();

            // Sand reeds along shoreline
            for (let ry = startY; ry < camera.y + camera.height + 140; ry += 140) {
                EnvironmentRenderer.drawSandReeds(ctx, riverStartX - 35, ry, sway, 26);
            }
        }

        // 7. OFFICIAL VOLLEYBALL / KANDUKA COURT (Located by the Yamuna Sandbank at 13200, 7720)
        const c = this.court;
        if (camera.isInView(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 + 80)) {
            ctx.save();
            // Court Sand Bed
            ctx.fillStyle = '#fde047';
            ctx.fillRect(c.x, c.y, c.w, c.h);

            // Court Outer Boundary Lines (Crisp White Lime Marks)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.strokeRect(c.x, c.y, c.w, c.h);

            // Center Net Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.setLineDash([10, 8]);
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(c.netX, c.y);
            ctx.lineTo(c.netX, c.y + c.h);
            ctx.stroke();
            ctx.setLineDash([]);

            // Attack / 3-meter lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(c.netX - 160, c.y);
            ctx.lineTo(c.netX - 160, c.y + c.h);
            ctx.moveTo(c.netX + 160, c.y);
            ctx.lineTo(c.netX + 160, c.y + c.h);
            ctx.stroke();

            // Court Side Labels
            ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
            ctx.font = 'bold 22px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.fillText("SAKHA TEAM (YOU)", c.x + c.w * 0.25, c.y + c.h * 0.5);
            ctx.fillText("KRISHNA & BALRAM", c.x + c.w * 0.75, c.y + c.h * 0.5);

            ctx.restore();
        }

        // 8. Sacred Yamuna River Waters (x: 14400 to 16000)
        if (camera.x + camera.width > riverStartX) {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(riverStartX, camera.y, this.riverWidth + 100, camera.height);

            // Water wave currents
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            for (let y = startY; y < camera.y + camera.height + 100; y += 75) {
                const wx = riverStartX + 30 + ((y * 1.5 + this.riverWaveOffset) % (this.riverWidth - 100));
                ctx.moveTo(wx, y);
                ctx.quadraticCurveTo(wx + 35, y - 9, wx + 70, y);
            }
            ctx.stroke();

            // Sacred Ghat Banners
            const ghats = [
                { name: "Kaliya Ghat (कालिया दह)", y: 5400 },
                { name: "Keshi Ghat (केशी घाट)", y: 10600 }
            ];
            for (const g of ghats) {
                if (camera.isInView(riverStartX - 40, g.y, 120)) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
                    ctx.beginPath();
                    ctx.roundRect(riverStartX - 130, g.y - 13, 125, 26, 13);
                    ctx.fill();
                    ctx.fillStyle = '#fef08a';
                    ctx.font = 'bold 11px Outfit, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`🌊 ${g.name}`, riverStartX - 68, g.y);
                    ctx.restore();
                }
            }
        }
    }

    drawProps(ctx, camera) {
        // Draw Net Poles & Flower Garland Net in the Volleyball Court
        const c = this.court;
        if (camera.isInView(c.netX, c.y + c.h / 2, c.h / 2 + 60)) {
            ctx.save();
            // Wooden Poles
            ctx.fillStyle = '#78350f';
            ctx.fillRect(c.netX - 6, c.y - 20, 12, 24);
            ctx.fillRect(c.netX - 6, c.y + c.h - 4, 12, 24);

            // Flower Garland Net (Marigold, Parijat & Tulasi braided net)
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(c.netX, c.y);
            ctx.lineTo(c.netX, c.y + c.h);
            ctx.stroke();

            // Floral Garland Net Beads
            for (let ny = c.y + 12; ny < c.y + c.h; ny += 22) {
                ctx.fillStyle = (Math.floor(ny / 22) % 2 === 0) ? '#f97316' : '#fef08a';
                ctx.beginPath();
                ctx.arc(c.netX, ny, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // Sacred Yamuna Jal Shrine & Kalash Urns (Located in the clearing at cx + 340, cy + 90)
        const shrineX = this.centerX + 340;
        const shrineY = this.centerY + 90;
        if (camera.isInView(shrineX, shrineY, 90)) {
            ctx.save();
            // Stone marble platform
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.roundRect(shrineX - 44, shrineY - 18, 88, 36, 8);
            ctx.fill();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Water ripple glow
            const wPulse = Math.sin(this.swayTime * 3) * 3;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.beginPath();
            ctx.ellipse(shrineX, shrineY + 4, 32 + wPulse, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // 3 Earthen Clay Kalash Pots with Mango Leaves
            const potOffsets = [-24, 0, 24];
            for (const po of potOffsets) {
                const px = shrineX + po;
                const py = shrineY - 2;
                // Terracotta Pot
                ctx.fillStyle = '#ea580c';
                ctx.beginPath();
                ctx.arc(px, py, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#c2410c';
                ctx.beginPath();
                ctx.arc(px, py + 3, 7, 0, Math.PI);
                ctx.fill();
                // Golden neck rim
                ctx.fillStyle = '#facc15';
                ctx.fillRect(px - 5, py - 11, 10, 4);
                // Mango leaves on top
                ctx.fillStyle = '#16a34a';
                ctx.beginPath();
                ctx.moveTo(px, py - 11);
                ctx.lineTo(px - 6, py - 16);
                ctx.lineTo(px, py - 14);
                ctx.lineTo(px + 6, py - 16);
                ctx.closePath();
                ctx.fill();
            }

            // Text Label
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 10px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("🏺 शीतल यमुना जल", shrineX, shrineY + 30);
            ctx.restore();
        }

        // Draw Trunks, Rocks, Bushes, and Kamal Sarovar (ONLY visible obstacles in camera view!)
        const visibleObstacles = this.getVisibleObstacles(camera);
        for (let i = 0; i < visibleObstacles.length; i++) {
            const obs = visibleObstacles[i];

            if (obs.type === 'tree') {
                EnvironmentRenderer.drawTreeTrunk(ctx, obs, this.swayTime);
            } else if (obs.type === 'pond') {
                // Sacred Kamal Sarovar
                ctx.save();
                // Pebble bank border
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                // Clear Turquoise-Blue Sarovar Water
                const waterGrad = ctx.createRadialGradient(obs.x, obs.y, 40, obs.x, obs.y, obs.visualRadius - 15);
                waterGrad.addColorStop(0, '#06b6d4');
                waterGrad.addColorStop(0.7, '#0284c7');
                waterGrad.addColorStop(1, '#0369a1');
                ctx.fillStyle = waterGrad;
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius - 14, 0, Math.PI * 2);
                ctx.fill();

                // Blooming Lotuses & Lily Pads
                const lilyPads = [
                    { dx: -120, dy: -60 }, { dx: 110, dy: -80 },
                    { dx: -80, dy: 90 }, { dx: 95, dy: 85 },
                    { dx: 0, dy: -130 }, { dx: -140, dy: 10 },
                    { dx: 140, dy: -10 }, { dx: 0, dy: 120 }
                ];
                for (let j = 0; j < lilyPads.length; j++) {
                    const lp = lilyPads[j];
                    EnvironmentRenderer.drawLotus(ctx, obs.x + lp.dx, obs.y + lp.dy, 22, 1.0);
                }

                // Title Banner
                ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                ctx.beginPath();
                ctx.roundRect(obs.x - 110, obs.y - 14, 220, 28, 14);
                ctx.fill();
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 12px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("🪷 कमल सरोवर (Kamal Sarovar)", obs.x, obs.y);

                ctx.restore();

            } else if (obs.type === 'rock') {
                // Organic Sacred Boulder / Braj Shila
                EnvironmentRenderer.drawRock(ctx, obs);

            } else if (obs.type === 'bush') {
                // Fragrant Jasmine/Malati Bush
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
                ctx.beginPath();
                ctx.ellipse(obs.x + 3, obs.y + 4, obs.visualRadius * 0.85, obs.visualRadius * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(obs.x - obs.visualRadius * 0.25, obs.y - obs.visualRadius * 0.2, obs.visualRadius * 0.55, 0, Math.PI * 2);
                ctx.arc(obs.x + obs.visualRadius * 0.25, obs.y - obs.visualRadius * 0.2, obs.visualRadius * 0.55, 0, Math.PI * 2);
                ctx.fill();

                // Sweet starry blossoms on bush
                const petals = [
                    { dx: -12, dy: -8 }, { dx: 14, dy: -6 },
                    { dx: -4, dy: 10 }, { dx: 10, dy: 12 }, { dx: 0, dy: -14 }
                ];
                for (let k = 0; k < petals.length; k++) {
                    const p = petals[k];
                    EnvironmentRenderer.drawMalatiFlower(ctx, obs.x + p.dx, obs.y + p.dy, 6, 0);
                }

                ctx.restore();
            }
        }
    }

    drawCanopy(ctx, camera, player = null) {
        // Draw tree canopies with proximity transparency (ONLY visible trees!)
        const visibleObstacles = this.getVisibleObstacles(camera);
        for (let i = 0; i < visibleObstacles.length; i++) {
            const obs = visibleObstacles[i];
            if (obs.type === 'tree') {
                EnvironmentRenderer.drawTreeCanopy(ctx, obs, this.swayTime, player);
            }
        }
    }
}
