import { TreeRenderer } from './TreeRenderer.js';

/**
 * Govardhan Foothills Map (गोवर्धन तलहटी व गिरिराज परिक्रमा)
 */
export class GovardhanFoothills {
    constructor() {
        this.name = "Govardhan Foothills";
        this.hindiName = "गोवर्धन तलहटी";
        this.width = 4200;
        this.height = 4200;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.obstacles = [];
        this.streamOffset = 0;
    }

    init() {
        this.obstacles = [];
        const border = 60;

        // Boundaries
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: -border, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: this.height, w: this.width + border * 2, h: border, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: -border, y: 0, w: border, h: this.height, radius: 0 });
        this.obstacles.push({ shape: 'rect', type: 'wall', x: this.width, y: 0, w: border, h: this.height, radius: 0 });

        // Sacred Spring Rivulet (Manasi Ganga stream)
        this.obstacles.push({
            shape: 'rect',
            type: 'river',
            x: this.centerX - 120,
            y: 0,
            w: 240,
            h: this.height,
            radius: 0,
            hasResource: 'water'
        });

        // Sacred Govardhan Boulders & Rocks
        const rockCount = 180;
        for (let i = 0; i < rockCount; i++) {
            const rad = 25 + Math.random() * 55;
            const x = rad + 100 + Math.random() * (this.width - rad * 2 - 200);
            const y = rad + 100 + Math.random() * (this.height - rad * 2 - 200);

            // Avoid blocking stream bridge
            if (Math.abs(x - this.centerX) > 180) {
                const isTree = Math.random() <= 0.4;
                const treePool = ['kadamba', 'mango', 'banyan', 'parijat'];
                this.obstacles.push({
                    shape: 'circle',
                    type: isTree ? 'tree' : 'rock',
                    treeType: isTree ? treePool[Math.floor(Math.random() * treePool.length)] : null,
                    x: x,
                    y: y,
                    radius: rad * 0.65,
                    visualRadius: rad,
                    hasResource: Math.random() > 0.5 ? 'flower' : null
                });
            }
        }
    }

    update(dt) {
        this.streamOffset += dt * 30;
    }

    drawGround(ctx, camera) {
        // Rocky mountain meadow palette (Ochre, Sand, Sage Green)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

        // Rocky ground contour lines
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = Math.floor(camera.y / 150) * 150; y < camera.y + camera.height + 150; y += 75) {
            ctx.moveTo(camera.x, y);
            ctx.quadraticCurveTo(camera.x + camera.width / 2, y + 20, camera.x + camera.width, y);
        }
        ctx.stroke();

        // Sacred Spring Rivulet in Center
        const sX = this.centerX - 120;
        if (camera.isInView(this.centerX, camera.y + camera.height / 2, 200)) {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(sX, camera.y, 240, camera.height);

            // Stepping Stones across the stream
            for (let y = 0; y < this.height; y += 400) {
                if (camera.isInView(this.centerX, y, 100)) {
                    ctx.fillStyle = '#64748b';
                    ctx.beginPath();
                    ctx.ellipse(this.centerX, y, 45, 25, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#94a3b8';
                    ctx.beginPath();
                    ctx.ellipse(this.centerX - 4, y - 4, 35, 18, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    drawProps(ctx, camera) {
        for (const obs of this.obstacles) {
            if (!camera.isInView(obs.x, obs.y, obs.visualRadius || obs.w)) continue;

            if (obs.type === 'rock') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.beginPath();
                ctx.arc(obs.x + 5, obs.y + 5, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                // Multi-tone Govardhan Boulder
                ctx.fillStyle = '#78716c';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.visualRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#a8a29e';
                ctx.beginPath();
                ctx.arc(obs.x - obs.visualRadius * 0.25, obs.y - obs.visualRadius * 0.25, obs.visualRadius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (obs.type === 'tree') {
                TreeRenderer.drawTrunk(ctx, obs);
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
                TreeRenderer.drawCanopy(ctx, obs, isPlayerNear, this.streamOffset * 0.05);
            }
        }
    }
}
