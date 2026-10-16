/**
 * TreeRenderer - Procedural Painter for Diverse, Lush, Sacred Braj Trees
 * Renders distinct species: Kadamba, Mango, Banyan, Parijat, and Palm trees
 * with organic cloud-cluster foliage, illustrated bark, and authentic blossoms
 */
export class TreeRenderer {
    /**
     * Draw the tree trunk, roots, and ground shadow (Props Layer)
     */
    static drawTrunk(ctx, obs) {
        const type = obs.treeType || (obs.type === 'kadamba' ? 'kadamba' : 'mango');
        const x = obs.x;
        const y = obs.y;
        const r = obs.radius || 26;
        const vRad = obs.visualRadius || 65;

        ctx.save();

        // 1. Soft Ground Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.beginPath();
        ctx.ellipse(x + 4, y + 6, vRad * 0.72, vRad * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();

        if (type === 'kadamba') {
            // Ancient Sacred Kadamba Trunk (Wide, twisted, mossy with spreading root flares)
            // Low stone chabutara / lotus platform at trunk base
            ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
            ctx.beginPath();
            ctx.ellipse(x, y + 4, r * 1.6, r * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Root flares spreading into turf
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.moveTo(x - r * 1.3, y + 10);
            ctx.quadraticCurveTo(x - r * 0.7, y, x - r * 0.45, y - r * 1.2);
            ctx.lineTo(x + r * 0.45, y - r * 1.2);
            ctx.quadraticCurveTo(x + r * 0.7, y, x + r * 1.3, y + 10);
            ctx.quadraticCurveTo(x, y + 14, x - r * 1.3, y + 10);
            ctx.fill();

            // Main Bark Body with warm golden-brown gradient
            const barkGrad = ctx.createLinearGradient(x - r, y, x + r, y);
            barkGrad.addColorStop(0, '#3f1d0b');
            barkGrad.addColorStop(0.35, '#78350f');
            barkGrad.addColorStop(0.7, '#92400e');
            barkGrad.addColorStop(1, '#451a03');
            ctx.fillStyle = barkGrad;

            ctx.beginPath();
            ctx.moveTo(x - r * 0.9, y + 6);
            ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.6, x - r * 0.4, y - r * 1.4);
            ctx.lineTo(x + r * 0.4, y - r * 1.4);
            ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.6, x + r * 0.9, y + 6);
            ctx.closePath();
            ctx.fill();

            // Woody bark grain ridges
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x - r * 0.2, y + 4);
            ctx.quadraticCurveTo(x - r * 0.1, y - r * 0.6, x - r * 0.15, y - r * 1.3);
            ctx.moveTo(x + r * 0.2, y + 3);
            ctx.quadraticCurveTo(x + r * 0.15, y - r * 0.5, x + r * 0.2, y - r * 1.3);
            ctx.stroke();

            // Fallen golden Kadamba petals around the base
            ctx.fillStyle = '#facc15';
            const petalCoords = [
                [-r * 1.4, 2], [r * 1.3, -4], [-r * 0.9, 14], [r * 1.1, 12],
                [-r * 0.3, 16], [r * 0.5, 15], [-r * 1.2, -8], [r * 1.5, 6]
            ];
            for (const [px, py] of petalCoords) {
                ctx.beginPath();
                ctx.arc(x + px, y + py, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'banyan') {
            // Massive ancient Banyan trunk with entwined multiple trunks & aerial prop roots
            ctx.fillStyle = '#3f1d0b';
            ctx.beginPath();
            ctx.moveTo(x - r * 1.4, y + 8);
            ctx.lineTo(x - r * 0.6, y - r * 1.3);
            ctx.lineTo(x + r * 0.6, y - r * 1.3);
            ctx.lineTo(x + r * 1.4, y + 8);
            ctx.closePath();
            ctx.fill();

            // Multi-trunk grooves
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - r * 0.3, y + 6);
            ctx.lineTo(x - r * 0.2, y - r * 1.2);
            ctx.moveTo(x + r * 0.3, y + 6);
            ctx.lineTo(x + r * 0.2, y - r * 1.2);
            ctx.stroke();

            // Aerial roots (Jataa) anchoring to the earth
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(x - vRad * 0.55, y - vRad * 0.4);
            ctx.quadraticCurveTo(x - vRad * 0.5, y - 5, x - vRad * 0.45, y + 8);
            ctx.moveTo(x + vRad * 0.55, y - vRad * 0.4);
            ctx.quadraticCurveTo(x + vRad * 0.5, y - 5, x + vRad * 0.45, y + 8);
            ctx.stroke();
        } else if (type === 'parijat') {
            // Slender, graceful flowering Parijat tree trunk
            ctx.fillStyle = '#57534e';
            ctx.beginPath();
            ctx.moveTo(x - r * 0.6, y + 6);
            ctx.quadraticCurveTo(x - r * 0.2, y - r * 0.7, x - r * 0.3, y - r * 1.5);
            ctx.lineTo(x + r * 0.3, y - r * 1.5);
            ctx.quadraticCurveTo(x + r * 0.4, y - r * 0.7, x + r * 0.6, y + 6);
            ctx.closePath();
            ctx.fill();

            // Scattered white star flowers around base
            ctx.fillStyle = '#f8fafc';
            const fallenFlowers = [[-22, 6], [24, 4], [-12, 14], [16, 12], [-30, -2], [28, -6]];
            for (const [fx, fy] of fallenFlowers) {
                ctx.beginPath();
                ctx.arc(x + fx, y + fy, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'palm') {
            // Slender ringed Tala palm trunk
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = r * 0.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y + 4);
            ctx.quadraticCurveTo(x + 6, y - vRad * 0.5, x + 3, y - vRad * 1.1);
            ctx.stroke();

            // Horizontal ring segments
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1.8;
            for (let segY = y; segY > y - vRad * 1.1; segY -= 12) {
                ctx.beginPath();
                ctx.moveTo(x - 5, segY);
                ctx.lineTo(x + 7, segY);
                ctx.stroke();
            }
        } else {
            // Sturdy Ripe Mango Tree Trunk
            const barkGrad = ctx.createLinearGradient(x - r, y, x + r, y);
            barkGrad.addColorStop(0, '#451a03');
            barkGrad.addColorStop(0.5, '#78350f');
            barkGrad.addColorStop(1, '#451a03');
            ctx.fillStyle = barkGrad;

            ctx.beginPath();
            ctx.moveTo(x - r * 0.8, y + 6);
            ctx.quadraticCurveTo(x - r * 0.4, y - r * 0.6, x - r * 0.4, y - r * 1.3);
            ctx.lineTo(x + r * 0.4, y - r * 1.3);
            ctx.quadraticCurveTo(x + r * 0.4, y - r * 0.6, x + r * 0.8, y + 6);
            ctx.closePath();
            ctx.fill();

            // Branching limbs
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = r * 0.4;
            ctx.beginPath();
            ctx.moveTo(x, y - r * 1.1);
            ctx.lineTo(x - r * 0.7, y - r * 1.6);
            ctx.moveTo(x, y - r * 1.1);
            ctx.lineTo(x + r * 0.7, y - r * 1.6);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw the elevated tree canopy foliage, fruits, and blossoms (Canopy Layer)
     */
    static drawCanopy(ctx, obs, isPlayerNear = false, swayTime = 0) {
        const type = obs.treeType || (obs.type === 'kadamba' ? 'kadamba' : 'mango');
        const x = obs.x;
        const vRad = obs.visualRadius || 65;
        // ELEVATED CANOPY: Center is raised ~0.75x above the ground trunk so player is NEVER obscured below!
        const cy = obs.y - vRad * 0.75;

        ctx.save();
        ctx.globalAlpha = isPlayerNear ? 0.45 : 0.96;

        if (type === 'kadamba') {
            // Majestic Kadamba: Multi-lobed lush emerald cloud crown
            this.drawCloudCrown(ctx, x, cy, vRad, '#064e3b', '#14532d', '#16a34a', '#4ade80');

            // Hanging Golden Kadamba Pom-Pom Blossoms (कदम्ब पुष्प)
            ctx.globalAlpha = 1.0;
            const flowerOffsets = [
                { dx: -vRad * 0.55, dy: -vRad * 0.1 },
                { dx: -vRad * 0.25, dy: vRad * 0.25 },
                { dx: vRad * 0.3, dy: vRad * 0.28 },
                { dx: vRad * 0.6, dy: -vRad * 0.05 },
                { dx: 0, dy: -vRad * 0.4 },
                { dx: -vRad * 0.4, dy: -vRad * 0.35 },
                { dx: vRad * 0.42, dy: -vRad * 0.3 }
            ];

            flowerOffsets.forEach((fo, idx) => {
                const sway = Math.sin(swayTime + idx * 1.2) * 2;
                this.drawKadambaPushpa(ctx, x + fo.dx, cy + fo.dy + sway, 11);
            });
        } else if (type === 'banyan') {
            // Massive spreading Banyan canopy
            this.drawCloudCrown(ctx, x, cy, vRad * 1.15, '#022c22', '#064e3b', '#15803d', '#22c55e');

            // Draped aerial roots swaying under canopy edges
            ctx.strokeStyle = 'rgba(120, 53, 15, 0.75)';
            ctx.lineWidth = 1.8;
            for (let i = -3; i <= 3; i++) {
                if (i === 0) continue;
                const rx = x + i * (vRad * 0.28);
                const ry = cy + vRad * 0.35;
                const sway = Math.sin(swayTime + i) * 3;
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.quadraticCurveTo(rx + sway, ry + 25, rx + sway * 1.5, ry + 45);
                ctx.stroke();
            }
        } else if (type === 'parijat') {
            // Delicate, flowering Parijat / Champa canopy
            this.drawCloudCrown(ctx, x, cy, vRad * 0.9, '#064e3b', '#0d9488', '#14b8a6', '#5eead4');

            // 5-Petal fragrant white star blossoms with coral centers
            ctx.globalAlpha = 1.0;
            const parijatOffsets = [
                { dx: -vRad * 0.35, dy: -vRad * 0.2 },
                { dx: vRad * 0.3, dy: -vRad * 0.25 },
                { dx: -vRad * 0.2, dy: vRad * 0.2 },
                { dx: vRad * 0.38, dy: vRad * 0.15 },
                { dx: 0, dy: -vRad * 0.35 }
            ];
            parijatOffsets.forEach((po) => {
                this.drawParijatFlower(ctx, x + po.dx, cy + po.dy);
            });
        } else if (type === 'palm') {
            // Slender Tala Palm: Radiating fronds
            ctx.globalAlpha = 1.0;
            const frondCount = 10;
            for (let i = 0; i < frondCount; i++) {
                const angle = (i * Math.PI * 2) / frondCount + Math.sin(swayTime + i) * 0.05;
                const fx = x + Math.cos(angle) * (vRad * 0.85);
                const fy = cy + Math.sin(angle) * (vRad * 0.85) * 0.7;

                ctx.strokeStyle = '#15803d';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(x, cy);
                ctx.quadraticCurveTo(x + Math.cos(angle) * vRad * 0.45, cy - 8, fx, fy);
                ctx.stroke();

                // Leaflets
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1.5;
                for (let t = 0.3; t <= 0.95; t += 0.15) {
                    const lx = x + (fx - x) * t;
                    const ly = cy + (fy - cy) * t;
                    ctx.beginPath();
                    ctx.moveTo(lx, ly);
                    ctx.lineTo(lx - Math.sin(angle) * 10, ly + Math.cos(angle) * 10);
                    ctx.stroke();
                }
            }

            // Coconut cluster at center
            ctx.fillStyle = '#78350f';
            for (const [cxo, cyo] of [[-5, -2], [5, -1], [0, 6]]) {
                ctx.beginPath();
                ctx.arc(x + cxo, cy + cyo, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Rich Mango Tree (आम्र वृक्ष): Deep green cloud lobes
            this.drawCloudCrown(ctx, x, cy, vRad, '#064e3b', '#14532d', '#15803d', '#22c55e');

            // Ripe Sweet Mangoes hanging on stems
            if (obs.hasResource === 'fruit') {
                ctx.globalAlpha = 1.0;
                const fruitPositions = [
                    { dx: -vRad * 0.4, dy: -vRad * 0.1 },
                    { dx: vRad * 0.38, dy: -vRad * 0.2 },
                    { dx: -vRad * 0.18, dy: vRad * 0.22 },
                    { dx: vRad * 0.35, dy: vRad * 0.26 }
                ];
                fruitPositions.forEach((fp, idx) => {
                    const sway = Math.sin(swayTime + idx) * 2;
                    this.drawRipeMango(ctx, x + fp.dx, cy + fp.dy + sway);
                });
            }
        }

        ctx.restore();
    }

    /**
     * Draw an organic multi-lobed cloud crown for trees
     */
    static drawCloudCrown(ctx, cx, cy, rad, shadowCol, mainCol, lightCol, highlightCol) {
        // Base Shadow Canopy (Underside volume)
        ctx.fillStyle = shadowCol;
        ctx.beginPath();
        ctx.arc(cx, cy + rad * 0.1, rad * 0.95, 0, Math.PI * 2);
        ctx.fill();

        // 6 Organic Surrounding Leaf Lobes
        const lobeCount = 6;
        for (let i = 0; i < lobeCount; i++) {
            const angle = (i * Math.PI * 2) / lobeCount;
            const lx = cx + Math.cos(angle) * (rad * 0.45);
            const ly = cy + Math.sin(angle) * (rad * 0.4);
            const lRad = rad * 0.52;

            ctx.fillStyle = mainCol;
            ctx.beginPath();
            ctx.arc(lx, ly, lRad, 0, Math.PI * 2);
            ctx.fill();
        }

        // Central Upper Leaf Mass
        ctx.fillStyle = lightCol;
        ctx.beginPath();
        ctx.arc(cx, cy - rad * 0.12, rad * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Sunlit Top Highlight Puffs
        ctx.fillStyle = highlightCol;
        ctx.beginPath();
        ctx.arc(cx - rad * 0.2, cy - rad * 0.32, rad * 0.38, 0, Math.PI * 2);
        ctx.arc(cx + rad * 0.22, cy - rad * 0.25, rad * 0.32, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Sacred Spherical Golden Kadamba Flower (कदम्ब पुष्प)
     */
    static drawKadambaPushpa(ctx, x, y, size = 11) {
        ctx.save();

        // Little green twig
        ctx.strokeStyle = '#4d7c0f';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.95);
        ctx.lineTo(x, y - size * 0.3);
        ctx.stroke();

        // Radiating stamen halo (tiny white/golden tips)
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 14; i++) {
            const ang = (i * Math.PI * 2) / 14;
            const sx = x + Math.cos(ang) * (size * 0.9);
            const sy = y + Math.sin(ang) * (size * 0.9);
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rich golden-orange central pom-pom body
        const grad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, size * 0.7);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#c2410c');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Illustrated Sweet Vrindavan Mango (रसीला आम)
     */
    static drawRipeMango(ctx, x, y) {
        ctx.save();

        // Stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y - 9);
        ctx.quadraticCurveTo(x + 2, y - 14, x + 4, y - 16);
        ctx.stroke();

        // Green Leaf
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(x + 6, y - 14, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Mango Body
        const grad = ctx.createRadialGradient(x - 2, y - 2, 2, x, y, 9);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#facc15');
        grad.addColorStop(1, '#ea580c');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.bezierCurveTo(x + 8, y - 7, x + 10, y + 4, x + 2, y + 9);
        ctx.bezierCurveTo(x - 3, y + 10, x - 9, y + 4, x - 7, y - 3);
        ctx.bezierCurveTo(x - 6, y - 7, x - 3, y - 8, x, y - 8);
        ctx.closePath();
        ctx.fill();

        // Gloss highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(x - 3, y - 2, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Fragrant 5-Petal Parijat Flower (हरसिंगार)
     */
    static drawParijatFlower(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#ffffff';

        // 5 white star petals
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * 5;
            const py = y + Math.sin(angle) * 5;
            ctx.beginPath();
            ctx.arc(px, py, 2.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Coral-orange vibrant center
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Blooming Pink Lotus (कमल पुष्प)
     */
    static drawLotusFlower(ctx, x, y) {
        ctx.save();

        // 5 Outer Pink Petals
        ctx.fillStyle = '#f472b6';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * 6;
            const py = y + Math.sin(angle) * 6;
            ctx.beginPath();
            ctx.arc(px, py, 4.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Inner Rose Petals
        ctx.fillStyle = '#fdf2f8';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const px = x + Math.cos(angle) * 3;
            const py = y + Math.sin(angle) * 3;
            ctx.beginPath();
            ctx.arc(px, py, 2.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Golden Pericarp Center
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
