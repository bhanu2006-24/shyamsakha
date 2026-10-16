/**
 * Minimap - Real-time tactical radar and world map renderer with 100% boundary accuracy
 */
export class Minimap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = 175;
        this.canvas.width = this.size;
        this.canvas.height = this.size;
    }

    draw(map, camera, player, krishna, balram, sakhas, cows, obstacles) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.size, this.size);

        const mapW = map ? map.width : 4000;
        const mapH = map ? map.height : 4000;

        const scaleX = this.size / mapW;
        const scaleY = this.size / mapH;

        ctx.save();

        // 1. Full Base Map Background (Edge-to-Edge)
        if (map && map.name === "Yamuna Sandbanks") {
            ctx.fillStyle = '#fef08a'; // Sand
        } else if (map && map.name === "Govardhan Foothills") {
            ctx.fillStyle = '#cbd5e1'; // Rocky ochre
        } else {
            ctx.fillStyle = '#4ade80'; // Lush pastoral green
        }
        ctx.fillRect(0, 0, this.size, this.size);

        // 2. Rivers / Waters (Edge-to-Edge)
        if (obstacles) {
            for (const obs of obstacles) {
                if (obs.type === 'river') {
                    ctx.fillStyle = 'rgba(37, 99, 235, 0.95)';
                    const rx = obs.x * scaleX;
                    const ry = obs.y * scaleY;
                    const rw = obs.w * scaleX;
                    const rh = obs.h * scaleY;
                    ctx.fillRect(rx, ry, rw, rh);
                } else if (obs.type === 'pond') {
                    ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
                    const px = obs.x * scaleX;
                    const py = obs.y * scaleY;
                    const pr = Math.max(3, (obs.visualRadius || 40) * scaleX);
                    ctx.beginPath();
                    ctx.arc(px, py, pr, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // 3. Volleyball Court Boundary (if in Yamuna Beach)
        if (map && map.court) {
            const c = map.court;
            const cx = c.x * scaleX;
            const cy = c.y * scaleY;
            const cw = c.w * scaleX;
            const ch = c.h * scaleY;
            ctx.fillStyle = '#fde047';
            ctx.fillRect(cx, cy, cw, ch);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, cw, ch);

            // Net line
            ctx.strokeStyle = '#f472b6';
            ctx.beginPath();
            ctx.moveTo(c.netX * scaleX, cy);
            ctx.lineTo(c.netX * scaleX, cy + ch);
            ctx.stroke();
        }

        // 4. Resources / Obstacles
        if (obstacles) {
            for (const obs of obstacles) {
                if (obs.shape === 'circle' && obs.type !== 'pond') {
                    const ox = obs.x * scaleX;
                    const oy = obs.y * scaleY;
                    const or = Math.max(1.8, (obs.visualRadius || 30) * scaleX);

                    if (obs.hasResource === 'flower') {
                        ctx.fillStyle = '#f472b6';
                    } else if (obs.hasResource === 'lotus') {
                        ctx.fillStyle = '#38bdf8';
                    } else if (obs.hasResource === 'fruit') {
                        ctx.fillStyle = '#facc15';
                    } else if (obs.type === 'rock') {
                        ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
                    } else {
                        ctx.fillStyle = 'rgba(21, 128, 61, 0.4)';
                    }
                    ctx.beginPath();
                    ctx.arc(ox, oy, or, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // 5. Camera Viewport Box (Clamped inside bounds)
        if (camera) {
            const camX = Math.max(0, Math.min(mapW, camera.x)) * scaleX;
            const camY = Math.max(0, Math.min(mapH, camera.y)) * scaleY;
            const camW = Math.min(this.size, camera.width * scaleX);
            const camH = Math.min(this.size, camera.height * scaleY);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(camX, camY, camW, camH);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(camX, camY, camW, camH);
        }

        // Helper function: clamp blip to safe visible boundary (minimum 12px from edge)
        // Since border-radius is 16px, any point at >= 12px from both edges is safely inside the curved border!
        const clampSafe = (rawX, rawY, pad = 12) => {
            return {
                x: Math.max(pad, Math.min(this.size - pad, rawX)),
                y: Math.max(pad, Math.min(this.size - pad, rawY))
            };
        };

        // 6. Character Blips
        // Gau Mata (Cows - soft cream)
        if (cows) {
            ctx.fillStyle = '#fef3c7';
            for (const cow of cows) {
                const pt = clampSafe(cow.x * scaleX, cow.y * scaleY, 6);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Sakha Friends (Soft amber dots)
        if (sakhas) {
            ctx.fillStyle = '#fbbf24';
            for (const s of sakhas) {
                if (!s.isCaught) {
                    const pt = clampSafe(s.x * scaleX, s.y * scaleY, 8);
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Dao Balaram (Radiant Silver/White Beacon with blue aura)
        if (balram && !balram.isCaught) {
            const pt = clampSafe(balram.x * scaleX, balram.y * scaleY, 12);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Shree Krishna (Divine Glowing Cyan Beacon with pulsing aura)
        if (krishna && !krishna.isCaught) {
            const pt = clampSafe(krishna.x * scaleX, krishna.y * scaleY, 12);
            const pulse = (Date.now() % 1200) / 1200;

            ctx.fillStyle = `rgba(56, 189, 248, ${0.45 * (1 - pulse)})`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4 + pulse * 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        // 7. PLAYER (Highlighted Golden Beacon with pulsing ping & direction pointer)
        // ALWAYS visible, clamped safely inside map margins so corners never clip it!
        if (player) {
            const pt = clampSafe(player.x * scaleX, player.y * scaleY, 12);
            const px = pt.x;
            const py = pt.y;

            // Animated Sonar Radar Ping
            const pTime = (Date.now() % 1000) / 1000;
            ctx.strokeStyle = `rgba(234, 88, 12, ${1 - pTime})`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(px, py, 4 + pTime * 8, 0, Math.PI * 2);
            ctx.stroke();

            // Vibrant Golden Player Core
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Direction arrow pointing in movement/facing direction
            const dirX = player.dx || 0;
            const dirY = player.dy || 1;
            const dirLen = Math.hypot(dirX, dirY);
            if (dirLen > 0.01) {
                const normX = dirX / dirLen;
                const normY = dirY / dirLen;
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.moveTo(px + normX * 8, py + normY * 8);
                ctx.lineTo(px - normY * 3, py + normX * 3);
                ctx.lineTo(px + normY * 3, py - normX * 3);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
