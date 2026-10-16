/**
 * Minimap - Real-time tactical radar and world map renderer
 */
export class Minimap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = 190;
        this.canvas.width = this.size;
        this.canvas.height = this.size;
    }

    draw(map, camera, player, krishna, balram, sakhas, cows, obstacles) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.size, this.size);

        const mapW = map ? map.width : 4500;
        const mapH = map ? map.height : 4500;
        const scale = this.size / Math.max(mapW, mapH);

        ctx.save();

        // 1. Base Map Background
        if (map && map.name === "Yamuna Sandbanks") {
            ctx.fillStyle = '#fef08a'; // Sand
        } else if (map && map.name === "Govardhan Foothills") {
            ctx.fillStyle = '#cbd5e1'; // Rocky ochre
        } else {
            ctx.fillStyle = 'rgba(74, 222, 128, 0.9)'; // Pastoral Green
        }
        ctx.fillRect(0, 0, this.size, this.size);

        // 2. Rivers / Waters
        if (obstacles) {
            for (const obs of obstacles) {
                if (obs.type === 'river') {
                    ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
                    ctx.fillRect(obs.x * scale, obs.y * scale, obs.w * scale, obs.h * scale);
                }
            }
        }

        // 3. Volleyball Court Boundary (if in Yamuna Beach)
        if (map && map.court) {
            const c = map.court;
            ctx.fillStyle = '#fde047';
            ctx.fillRect(c.x * scale, c.y * scale, c.w * scale, c.h * scale);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(c.x * scale, c.y * scale, c.w * scale, c.h * scale);

            // Net line
            ctx.strokeStyle = '#f472b6';
            ctx.beginPath();
            ctx.moveTo(c.netX * scale, c.y * scale);
            ctx.lineTo(c.netX * scale, (c.y + c.h) * scale);
            ctx.stroke();
        }

        // 4. Resources / Obstacles
        if (obstacles) {
            for (const obs of obstacles) {
                if (obs.shape === 'circle') {
                    if (obs.hasResource === 'flower') {
                        ctx.fillStyle = '#f472b6';
                    } else if (obs.hasResource === 'fruit') {
                        ctx.fillStyle = '#facc15';
                    } else if (obs.type === 'rock') {
                        ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
                    } else {
                        ctx.fillStyle = 'rgba(21, 128, 61, 0.45)';
                    }
                    ctx.beginPath();
                    ctx.arc(obs.x * scale, obs.y * scale, Math.max(1.5, (obs.visualRadius || 30) * scale), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // 5. Camera Viewport Box
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(camera.x * scale, camera.y * scale, camera.width * scale, camera.height * scale);

        // 6. Character Blips
        // Gau Mata (Cows - soft cream)
        ctx.fillStyle = '#fef3c7';
        for (const cow of cows) {
            ctx.beginPath();
            ctx.arc(cow.x * scale, cow.y * scale, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sakha Friends (Yellow)
        ctx.fillStyle = '#eab308';
        for (const s of sakhas) {
            if (!s.isCaught) {
                ctx.beginPath();
                ctx.arc(s.x * scale, s.y * scale, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Dau Balaram (Radiant Silver/White)
        if (balram && !balram.isCaught) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(balram.x * scale, balram.y * scale, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shree Krishna (Divine Cyan/Gold Pulse)
        if (krishna && !krishna.isCaught) {
            const pulse = 3.5 + Math.sin(Date.now() / 150) * 1.5;
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(krishna.x * scale, krishna.y * scale, pulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player (Red with white border)
        if (player) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(player.x * scale, player.y * scale, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }
}
