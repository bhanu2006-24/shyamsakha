import { TreeRenderer } from './TreeRenderer.js';

/**
 * Yamuna Sandbanks & Volleyball Arena Map (यमुना पुलिन व कन्दुक क्रीड़ांगन)
 */
export class YamunaBeach {
    constructor() {
        this.name = "Yamuna Sandbanks";
        this.hindiName = "यमुना पुलिन";
        this.width = 4000;
        this.height = 3600;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.obstacles = [];
        this.waterWaveOffset = 0;

        // Volleyball Court Coordinates
        this.court = {
            x: this.centerX - 450,
            y: this.centerY - 280,
            w: 900,
            h: 560,
            netX: this.centerX,
            playerSide: { minX: this.centerX - 450, maxX: this.centerX - 10 },
            krishnaSide: { minX: this.centerX + 10, maxX: this.centerX + 450 }
        };
    }

    init() {
        this.obstacles = [];
        const border = 60;

        // Boundaries
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: -border, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: this.height, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: 0, w: border, h: this.height, radius: 0 });

        // Yamuna River on East
        const riverWidth = 700;
        this.obstacles.push({
            shape: 'rect',
            type: 'river',
            x: this.width - riverWidth,
            y: 0,
            w: riverWidth + border,
            h: this.height,
            radius: 0,
            hasResource: 'water'
        });

        // Net Obstacle in Volleyball Court (Collides with players, ball can fly over!)
        this.obstacles.push({
            shape: 'rect',
            type: 'net',
            x: this.court.netX - 8,
            y: this.court.y,
            w: 16,
            h: this.court.h,
            radius: 0
        });

        // Decorative Kadamba & Palm trees along the sandbank borders
        for (let i = 0; i < 80; i++) {
            const rad = 35 + Math.random() * 40;
            const x = rad + 50 + Math.random() * (this.width - riverWidth - rad * 2 - 100);
            const y = rad + 50 + Math.random() * (this.height - rad * 2 - 100);

            // Keep volleyball court clear!
            const insideCourt = (
                x > this.court.x - 120 &&
                x < this.court.x + this.court.w + 120 &&
                y > this.court.y - 120 &&
                y < this.court.y + this.court.h + 120
            );

            if (!insideCourt) {
                const isTree = Math.random() > 0.5;
                this.obstacles.push({
                    shape: 'circle',
                    type: isTree ? 'tree' : 'bush',
                    treeType: isTree ? (Math.random() > 0.4 ? 'palm' : 'kadamba') : null,
                    x: x,
                    y: y,
                    radius: rad * 0.5,
                    visualRadius: rad,
                    hasResource: Math.random() > 0.6 ? 'fruit' : 'flower'
                });
            }
        }
    }

    update(dt) {
        this.waterWaveOffset += dt * 40;
    }

    drawGround(ctx, camera) {
        // Soft golden sandy beach ground
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // Sand ripples
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const startX = Math.floor(camera.x / 140) * 140;
        const startY = Math.floor(camera.y / 140) * 140;
        for (let y = startY; y < camera.y + camera.height; y += 70) {
            ctx.moveTo(camera.x, y);
            ctx.bezierCurveTo(camera.x + 200, y - 8, camera.x + 400, y + 8, camera.x + camera.width, y);
        }
        ctx.stroke();

        // DRAW VOLLEYBALL / KANDUKA COURT
        const c = this.court;
        if (camera.isInView(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 + 50)) {
            ctx.save();
            // Court Sand Bed
            ctx.fillStyle = '#fde047';
            ctx.fillRect(c.x, c.y, c.w, c.h);

            // Court Outer Boundary Lines (Crisp White Lime Marks)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(c.x, c.y, c.w, c.h);

            // Center Net Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.setLineDash([8, 8]);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(c.netX, c.y);
            ctx.lineTo(c.netX, c.y + c.h);
            ctx.stroke();
            ctx.setLineDash([]);

            // Attack / 3-meter lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(c.netX - 150, c.y);
            ctx.lineTo(c.netX - 150, c.y + c.h);
            ctx.moveTo(c.netX + 150, c.y);
            ctx.lineTo(c.netX + 150, c.y + c.h);
            ctx.stroke();

            // Court Side Labels
            ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
            ctx.font = 'bold 20px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.fillText("SAKHA TEAM (YOU)", c.x + c.w * 0.25, c.y + c.h * 0.5);
            ctx.fillText("KRISHNA & BALRAM", c.x + c.w * 0.75, c.y + c.h * 0.5);

            ctx.restore();
        }

        // River on East
        const riverX = this.width - 700;
        if (camera.x + camera.width > riverX) {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(riverX, camera.y, 800, camera.height);

            // Waves
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let y = startY; y < camera.y + camera.height + 100; y += 70) {
                const wx = riverX + 25 + ((y * 1.6 + this.waterWaveOffset) % 550);
                ctx.moveTo(wx, y);
                ctx.quadraticCurveTo(wx + 30, y - 10, wx + 60, y);
            }
            ctx.stroke();
        }
    }

    drawProps(ctx, camera) {
        // Draw Net Poles & Flower Garland Net in the Court
        const c = this.court;
        if (camera.isInView(c.netX, c.y + c.h / 2, c.h / 2 + 50)) {
            ctx.save();

            // Net Top & Bottom Ropes
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(c.netX, c.y);
            ctx.lineTo(c.netX, c.y + c.h);
            ctx.stroke();

            // Flower garland mesh across the net (Marigolds & Lotuses)
            ctx.lineWidth = 1.5;
            for (let y = c.y + 10; y < c.y + c.h; y += 22) {
                ctx.fillStyle = (y % 44 === 0) ? '#facc15' : '#f472b6';
                ctx.beginPath();
                ctx.arc(c.netX, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Net Posts (Bamboo Poles at ends)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(c.netX - 6, c.y - 12, 12, 20);
            ctx.fillRect(c.netX - 6, c.y + c.h - 8, 12, 20);

            // Pole flags (Peacock Blue & Gold flags)
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.moveTo(c.netX + 6, c.y - 10);
            ctx.lineTo(c.netX + 24, c.y - 5);
            ctx.lineTo(c.netX + 6, c.y);
            ctx.fill();

            ctx.restore();
        }

        // Draw surrounding Trees and Bushes
        for (const obs of this.obstacles) {
            if (obs.type === 'net' || obs.type === 'wall' || obs.type === 'river') continue;
            if (!camera.isInView(obs.x, obs.y, obs.visualRadius)) continue;

            if (obs.type === 'tree') {
                TreeRenderer.drawTrunk(ctx, obs);
            } else if (obs.type === 'bush') {
                ctx.save();
                ctx.fillStyle = '#65a30d';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();
                if (obs.hasResource === 'flower') {
                    TreeRenderer.drawLotusFlower(ctx, obs.x, obs.y);
                }
                ctx.restore();
            }
        }
    }

    drawCanopy(ctx, camera, player = null) {
        for (const obs of this.obstacles) {
            if (obs.type === 'tree' && camera.isInView(obs.x, obs.y - obs.visualRadius * 0.75, obs.visualRadius + 20)) {
                const canopyY = obs.y - obs.visualRadius * 0.75;
                let isPlayerNear = false;
                if (player) {
                    const distToCanopy = Math.hypot(player.x - obs.x, player.y - canopyY);
                    if (distToCanopy < obs.visualRadius * 0.85) {
                        isPlayerNear = true;
                    }
                }
                TreeRenderer.drawCanopy(ctx, obs, isPlayerNear, this.waterWaveOffset * 0.05);
            }
        }
    }
}
