/**
 * EnvironmentRenderer - Central Procedural JS Asset Engine for Vrindavan
 * Houses procedural assets created purely in JS:
 * - 5 Distinct Sacred Trees (Kadamba, Mango, Banyan, Parijat, Tala Palm)
 * - 4 Sacred Vedic Flowers (Parijat, Malati/Jasmine, Kamal/Lotus, Champak)
 * - 3 Pastoral Grasses (Durva Meadow Grass, Yamuna Sand Reeds, Clover Sprigs)
 * - 4 Braj Fruits (Golden Mango, Coconut, Jamun Berries, Wild Ber)
 * - Environmental Props (Sand Ripples, River Waves, Stepping Stones, Petal Carpets)
 */
export class EnvironmentRenderer {
    // ==========================================
    // 1. FLOWER RENDERERS (4 Types)
    // ==========================================

    /**
     * Draw Parijat Flower (हरसिंगार - Night-blooming starry white bloom with coral-orange center)
     */
    static drawParijatFlower(ctx, x, y, size = 10, angle = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // 5 Crisp white petals
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.ellipse(0, -size * 0.7, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Vibrant Coral-Orange Corolla Center
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
        ctx.fill();

        // Tiny golden pollen center
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Malati / Jasmine Flower (मालती / चमेली - Fragrant pure white 5-pointed star bloom)
     */
    static drawMalatiFlower(ctx, x, y, size = 9, angle = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = '#f8fafc';

        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(size * 0.3, -size * 0.5, 0, -size);
            ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, 0, 0);
            ctx.fill();
            ctx.restore();
        }

        // Delicate green-yellow calyx center
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Sacred Lotus (कमल - Blooming pink petals on lily pad)
     */
    static drawLotus(ctx, x, y, radius = 22, openFactor = 1.0) {
        ctx.save();
        ctx.translate(x, y);

        // Lily Pad below lotus
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(2, 6, radius * 1.35, radius * 0.85, 0, 0.25, Math.PI * 2 - 0.25);
        ctx.lineTo(2, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radiating leaf veins
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0.5; a < Math.PI * 2; a += 0.8) {
            ctx.moveTo(2, 6);
            ctx.lineTo(2 + Math.cos(a) * radius * 1.2, 6 + Math.sin(a) * radius * 0.7);
        }
        ctx.stroke();

        // Outer Layer Petals (Deep Pink)
        ctx.fillStyle = '#ec4899';
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 8);
            ctx.beginPath();
            ctx.ellipse(0, -radius * 0.75, radius * 0.32, radius * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Inner Layer Petals (Soft Rose-Pink)
        ctx.fillStyle = '#f472b6';
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 6 + 0.35);
            ctx.beginPath();
            ctx.ellipse(0, -radius * 0.5, radius * 0.26, radius * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Innermost Petals (Pure Divine Blush White)
        ctx.fillStyle = '#fdf2f8';
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5 + 0.2);
            ctx.beginPath();
            ctx.ellipse(0, -radius * 0.3, radius * 0.2, radius * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Golden Pericarp Center with Stamens
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ca8a04';
        for (let i = 0; i < 6; i++) {
            const pa = (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.arc(Math.cos(pa) * radius * 0.16, Math.sin(pa) * radius * 0.16, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw Champak Flower (चम्पक - Slender golden fragrant petals)
     */
    static drawChampakFlower(ctx, x, y, size = 11, angle = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = '#facc15';

        // Long graceful recurving petals
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 6);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(size * 0.25, -size * 0.6, 0, -size * 1.1);
            ctx.quadraticCurveTo(-size * 0.25, -size * 0.6, 0, 0);
            ctx.fill();
            ctx.restore();
        }

        // Warm amber-orange core
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ==========================================
    // 2. FRUIT RENDERERS (4 Types)
    // ==========================================

    /**
     * Draw Ripe Mango (रसीला आम - Golden-amber mango with rosy blush and stem)
     */
    static drawMangoFruit(ctx, x, y, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Little green stem
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.quadraticCurveTo(-4, -18, -6, -22);
        ctx.stroke();

        // Fresh green leaf
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(-4, -18, 5, 2.5, -0.6, 0, Math.PI * 2);
        ctx.fill();

        // Golden Mango body with radial gradient blush
        const grad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 14);
        grad.addColorStop(0, '#fef08a'); // soft cream yellow highlight
        grad.addColorStop(0.45, '#facc15'); // vibrant golden yellow
        grad.addColorStop(0.85, '#f97316'); // ripe orange
        grad.addColorStop(1, '#ef4444'); // sweet rosy blush tip
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.bezierCurveTo(9, -10, 13, 0, 10, 8);
        ctx.bezierCurveTo(7, 14, 2, 16, -1, 15);
        ctx.bezierCurveTo(-5, 14, -10, 8, -10, 0);
        ctx.bezierCurveTo(-10, -8, -5, -12, 0, -12);
        ctx.closePath();
        ctx.fill();

        // Soft sunny highlight curve
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-3, -2, 6, -1.2, 0.5);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw Coconut / Shrifal (श्रीफल - Palm coconut)
     */
    static drawCoconut(ctx, x, y, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Husk
        const grad = ctx.createRadialGradient(-2, -3, 2, 0, 0, 11);
        grad.addColorStop(0, '#84cc16');
        grad.addColorStop(0.65, '#65a30d');
        grad.addColorStop(1, '#3f6212');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Coconut eye markings
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(-2, -4, 1.2, 0, Math.PI * 2);
        ctx.arc(2, -4, 1.2, 0, Math.PI * 2);
        ctx.arc(0, -2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Jamun Berries (जामुन - Royal violet-purple sweet berries)
     */
    static drawJamunBerries(ctx, x, y, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Twin berries on stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-4, -4);
        ctx.moveTo(0, -12);
        ctx.lineTo(4, -4);
        ctx.stroke();

        // Berry 1 (Left)
        const g1 = ctx.createRadialGradient(-5, -3, 1, -4, 0, 7);
        g1.addColorStop(0, '#a855f7');
        g1.addColorStop(0.7, '#581c87');
        g1.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.ellipse(-5, 0, 5, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Berry 2 (Right)
        const g2 = ctx.createRadialGradient(3, -2, 1, 4, 1, 7);
        g2.addColorStop(0, '#c084fc');
        g2.addColorStop(0.7, '#581c87');
        g2.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.ellipse(4, 1, 5.5, 7.5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Wild Ber (बेर - Braj wild pasture plums)
     */
    static drawBerFruit(ctx, x, y, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(0.85, '#dc2626');
        grad.addColorStop(1, '#991b1b');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Tiny top stem
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(1, -9);
        ctx.stroke();

        ctx.restore();
    }

    // ==========================================
    // 3. GRASS RENDERERS (3 Types)
    // ==========================================

    /**
     * Draw Durva Meadow Grass (दूर्वा तृण - Fresh tender emerald tufts swaying in the breeze)
     */
    static drawDurvaGrassTuft(ctx, x, y, sway = 0, size = 14) {
        ctx.save();
        ctx.translate(x, y);

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';

        // 3-5 arching blades
        const blades = [
            { dx: -7, dy: -size * 0.9, cx: -9 + sway * 3, cy: -size * 0.4 },
            { dx: -3, dy: -size * 1.15, cx: -4 + sway * 3, cy: -size * 0.6 },
            { dx: 1, dy: -size * 1.25, cx: 1 + sway * 3, cy: -size * 0.7 },
            { dx: 5, dy: -size * 1.05, cx: 6 + sway * 3, cy: -size * 0.5 },
            { dx: 9, dy: -size * 0.8, cx: 10 + sway * 3, cy: -size * 0.3 }
        ];

        for (const b of blades) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(b.cx, b.cy, b.dx + sway * 4, b.dy);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw Yamuna Sand Reeds (सरकंडा तृण - Tall golden-amber reeds along sandy beach)
     */
    static drawSandReeds(ctx, x, y, sway = 0, height = 28) {
        ctx.save();
        ctx.translate(x, y);

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';

        // Tall reed stems
        for (let i = -1; i <= 1; i++) {
            const sx = i * 6;
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.quadraticCurveTo(sx + sway * 5, -height * 0.5, sx + i * 3 + sway * 9, -height);
            ctx.stroke();

            // Feathery plume on top
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.ellipse(sx + i * 3 + sway * 9, -height - 4, 3, 7, (sway * 0.3) + i * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw Clover & Wildflower Sprig (पुष्प दूर्वा - Tender clover leaves with micro-buds)
     */
    static drawCloverWildflower(ctx, x, y, sway = 0, size = 12) {
        ctx.save();
        ctx.translate(x, y);

        // Trifoliate Clover Leaves
        ctx.fillStyle = '#4ade80';
        for (let a = 0; a < 3; a++) {
            const ang = (a * Math.PI * 2) / 3 - Math.PI / 2;
            const lx = Math.cos(ang) * size * 0.5;
            const ly = Math.sin(ang) * size * 0.5;
            ctx.beginPath();
            ctx.ellipse(lx, ly, size * 0.35, size * 0.25, ang, 0, Math.PI * 2);
            ctx.fill();
        }

        // Little cyan/pink wild bud in center
        ctx.fillStyle = (Math.floor(x + y) % 2 === 0) ? '#38bdf8' : '#f472b6';
        ctx.beginPath();
        ctx.arc(0, -size * 0.2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ==========================================
    // 4. TREE RENDERERS (5 Types)
    // Trunks & Canopies with rich organic shaders
    // ==========================================

    /**
     * Render Tree Trunk (Ground Props Layer)
     */
    static drawTreeTrunk(ctx, obs, swayTime = 0) {
        const type = obs.treeType || 'kadamba';
        const x = obs.x;
        const y = obs.y;
        const r = obs.radius || 28;
        const vRad = obs.visualRadius || 80;

        ctx.save();

        // Ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 6, vRad * 0.75, vRad * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();

        switch (type) {
            case 'kadamba':
                this.renderKadambaTrunk(ctx, x, y, r);
                break;
            case 'mango':
                this.renderMangoTrunk(ctx, x, y, r);
                break;
            case 'banyan':
                this.renderBanyanTrunk(ctx, x, y, r);
                break;
            case 'parijat':
                this.renderParijatTrunk(ctx, x, y, r);
                break;
            case 'palm':
                this.renderPalmTrunk(ctx, x, y, r, swayTime);
                break;
            default:
                this.renderKadambaTrunk(ctx, x, y, r);
                break;
        }

        ctx.restore();
    }

    /**
     * Render Tree Canopy (Overhead Canopy Layer)
     */
    static drawTreeCanopy(ctx, obs, swayTime = 0, player = null) {
        const type = obs.treeType || 'kadamba';
        const x = obs.x;
        const y = obs.y;
        const vRad = obs.visualRadius || 80;

        // Proximity transparency when player stands beneath canopy
        let alpha = 1.0;
        if (player) {
            const dist = Math.hypot(player.x - x, player.y - y);
            if (dist < vRad * 0.95) {
                alpha = Math.max(0.38, dist / (vRad * 0.95));
            }
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        switch (type) {
            case 'kadamba':
                this.renderKadambaCanopy(ctx, x, y, vRad, swayTime);
                break;
            case 'mango':
                this.renderMangoCanopy(ctx, x, y, vRad, swayTime);
                break;
            case 'banyan':
                this.renderBanyanCanopy(ctx, x, y, vRad, swayTime);
                break;
            case 'parijat':
                this.renderParijatCanopy(ctx, x, y, vRad, swayTime);
                break;
            case 'palm':
                this.renderPalmCanopy(ctx, x, y, vRad, swayTime);
                break;
            default:
                this.renderKadambaCanopy(ctx, x, y, vRad, swayTime);
                break;
        }

        ctx.restore();
    }

    // --- Kadamba Tree Details ---
    static renderKadambaTrunk(ctx, x, y, r) {
        // Platform at base
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y + 4, r * 1.5, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gnarled root flares
        const barkGrad = ctx.createLinearGradient(x - r, y, x + r, y);
        barkGrad.addColorStop(0, '#3f1d0b');
        barkGrad.addColorStop(0.4, '#78350f');
        barkGrad.addColorStop(0.7, '#92400e');
        barkGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = barkGrad;

        ctx.beginPath();
        ctx.moveTo(x - r * 1.1, y + 8);
        ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.4, x - r * 0.35, y - r * 1.3);
        ctx.lineTo(x + r * 0.35, y - r * 1.3);
        ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.4, x + r * 1.1, y + 8);
        ctx.closePath();
        ctx.fill();
    }

    static renderKadambaCanopy(ctx, x, y, vRad, swayTime) {
        const sway = Math.sin(swayTime * 1.8 + x * 0.01) * 3;
        const cy = y - vRad * 0.65;

        // Base Foliage Layer
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(x + sway, cy, vRad, 0, Math.PI * 2);
        ctx.fill();

        // Tiered Emerald Foliage Clouds
        const clouds = [
            { dx: -vRad * 0.35, dy: -vRad * 0.3, r: vRad * 0.58, col: '#15803d' },
            { dx: vRad * 0.35, dy: -vRad * 0.28, r: vRad * 0.56, col: '#16a34a' },
            { dx: 0, dy: -vRad * 0.48, r: vRad * 0.54, col: '#22c55e' },
            { dx: -vRad * 0.25, dy: vRad * 0.2, r: vRad * 0.52, col: '#15803d' },
            { dx: vRad * 0.25, dy: vRad * 0.22, r: vRad * 0.52, col: '#16a34a' },
            { dx: 0, dy: 0, r: vRad * 0.45, col: '#4ade80' }
        ];

        for (const c of clouds) {
            ctx.fillStyle = c.col;
            ctx.beginPath();
            ctx.arc(x + c.dx + sway * 0.8, cy + c.dy, c.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Golden Spherical Kadamba Blossoms (कदम्ब के स्वर्ण पुष्प)
        const blossoms = [
            { dx: -vRad * 0.55, dy: -vRad * 0.25 },
            { dx: -vRad * 0.2, dy: -vRad * 0.65 },
            { dx: vRad * 0.35, dy: -vRad * 0.55 },
            { dx: vRad * 0.55, dy: -vRad * 0.15 },
            { dx: -vRad * 0.35, dy: vRad * 0.25 },
            { dx: vRad * 0.2, dy: vRad * 0.35 },
            { dx: 0, dy: -vRad * 0.15 }
        ];

        for (const b of blossoms) {
            const bx = x + b.dx + sway;
            const by = cy + b.dy;

            // Blossom glow
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
            ctx.fill();

            // Tiny blossom spikes
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1;
            for (let a = 0; a < Math.PI * 2; a += 0.8) {
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(a) * 9, by + Math.sin(a) * 9);
                ctx.stroke();
            }
        }
    }

    // --- Mango Tree Details ---
    static renderMangoTrunk(ctx, x, y, r) {
        ctx.fillStyle = '#291809';
        ctx.beginPath();
        ctx.moveTo(x - r * 0.9, y + 6);
        ctx.quadraticCurveTo(x - r * 0.3, y - r * 0.5, x - r * 0.25, y - r * 1.2);
        ctx.lineTo(x + r * 0.25, y - r * 1.2);
        ctx.quadraticCurveTo(x + r * 0.3, y - r * 0.5, x + r * 0.9, y + 6);
        ctx.closePath();
        ctx.fill();
    }

    static renderMangoCanopy(ctx, x, y, vRad, swayTime) {
        const sway = Math.sin(swayTime * 1.5 + x * 0.02) * 2.5;
        const cy = y - vRad * 0.6;

        // Broad Sprawling Foliage
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(x + sway, cy, vRad * 1.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(x - vRad * 0.35 + sway, cy - vRad * 0.2, vRad * 0.62, 0, Math.PI * 2);
        ctx.arc(x + vRad * 0.35 + sway, cy - vRad * 0.2, vRad * 0.62, 0, Math.PI * 2);
        ctx.arc(x + sway, cy - vRad * 0.35, vRad * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x - vRad * 0.2 + sway, cy + vRad * 0.15, vRad * 0.5, 0, Math.PI * 2);
        ctx.arc(x + vRad * 0.2 + sway, cy + vRad * 0.15, vRad * 0.5, 0, Math.PI * 2);
        ctx.arc(x + sway, cy, vRad * 0.48, 0, Math.PI * 2);
        ctx.fill();

        // Hanging Ripe Golden Mangoes (रसीले आम)
        const mangoSpots = [
            { dx: -vRad * 0.55, dy: -vRad * 0.1 },
            { dx: -vRad * 0.25, dy: -vRad * 0.45 },
            { dx: vRad * 0.3, dy: -vRad * 0.4 },
            { dx: vRad * 0.6, dy: -vRad * 0.05 },
            { dx: -vRad * 0.35, dy: vRad * 0.25 },
            { dx: vRad * 0.25, dy: vRad * 0.3 },
            { dx: 0, dy: 0 }
        ];

        for (const m of mangoSpots) {
            this.drawMangoFruit(ctx, x + m.dx + sway, cy + m.dy, 0.75);
        }
    }

    // --- Banyan Tree Details (Akshay Vat) ---
    static renderBanyanTrunk(ctx, x, y, r) {
        // Multi-columnar trunk & roots
        ctx.fillStyle = '#3f1d0b';
        ctx.beginPath();
        ctx.moveTo(x - r * 1.4, y + 10);
        ctx.quadraticCurveTo(x - r * 0.7, y, x - r * 0.5, y - r * 1.5);
        ctx.lineTo(x + r * 0.5, y - r * 1.5);
        ctx.quadraticCurveTo(x + r * 0.7, y, x + r * 1.4, y + 10);
        ctx.closePath();
        ctx.fill();

        // Hanging prop roots touching ground
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - r * 1.1, y - r * 0.8);
        ctx.lineTo(x - r * 1.25, y + 8);
        ctx.moveTo(x + r * 1.1, y - r * 0.8);
        ctx.lineTo(x + r * 1.25, y + 8);
        ctx.moveTo(x - r * 0.4, y - r * 1.0);
        ctx.lineTo(x - r * 0.3, y + 6);
        ctx.stroke();
    }

    static renderBanyanCanopy(ctx, x, y, vRad, swayTime) {
        const cy = y - vRad * 0.7;

        // Immense ancient spreading canopy
        ctx.fillStyle = '#022c22';
        ctx.beginPath();
        ctx.arc(x, cy, vRad * 1.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.arc(x - vRad * 0.45, cy - vRad * 0.15, vRad * 0.7, 0, Math.PI * 2);
        ctx.arc(x + vRad * 0.45, cy - vRad * 0.15, vRad * 0.7, 0, Math.PI * 2);
        ctx.arc(x, cy - vRad * 0.4, vRad * 0.68, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(x - vRad * 0.25, cy + vRad * 0.15, vRad * 0.55, 0, Math.PI * 2);
        ctx.arc(x + vRad * 0.25, cy + vRad * 0.15, vRad * 0.55, 0, Math.PI * 2);
        ctx.arc(x, cy, vRad * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // Aerial roots hanging from branches (जटाएं)
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = -3; i <= 3; i++) {
            if (i === 0) continue;
            const rx = x + i * (vRad * 0.28);
            ctx.moveTo(rx, cy + vRad * 0.1);
            ctx.quadraticCurveTo(rx + 4, cy + vRad * 0.45, rx, cy + vRad * 0.75);
        }
        ctx.stroke();
    }

    // --- Parijat Tree Details ---
    static renderParijatTrunk(ctx, x, y, r) {
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(x - r * 0.75, y + 4);
        ctx.quadraticCurveTo(x - r * 0.2, y - r * 0.5, x - r * 0.2, y - r * 1.2);
        ctx.lineTo(x + r * 0.2, y - r * 1.2);
        ctx.quadraticCurveTo(x + r * 0.2, y - r * 0.5, x + r * 0.75, y + 4);
        ctx.closePath();
        ctx.fill();
    }

    static renderParijatCanopy(ctx, x, y, vRad, swayTime) {
        const sway = Math.sin(swayTime * 2.0 + x * 0.03) * 3;
        const cy = y - vRad * 0.6;

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(x + sway, cy, vRad * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x - vRad * 0.25 + sway, cy - vRad * 0.2, vRad * 0.5, 0, Math.PI * 2);
        ctx.arc(x + vRad * 0.25 + sway, cy - vRad * 0.2, vRad * 0.5, 0, Math.PI * 2);
        ctx.arc(x + sway, cy + vRad * 0.15, vRad * 0.48, 0, Math.PI * 2);
        ctx.fill();

        // Starry white-orange Parijat blossoms
        const flowerSpots = [
            { dx: -vRad * 0.45, dy: -vRad * 0.25 },
            { dx: -vRad * 0.15, dy: -vRad * 0.5 },
            { dx: vRad * 0.25, dy: -vRad * 0.45 },
            { dx: vRad * 0.45, dy: -vRad * 0.1 },
            { dx: -vRad * 0.3, dy: vRad * 0.25 },
            { dx: vRad * 0.2, dy: vRad * 0.3 },
            { dx: 0, dy: -vRad * 0.1 }
        ];

        for (const fs of flowerSpots) {
            this.drawParijatFlower(ctx, x + fs.dx + sway, cy + fs.dy, 7.5, sway * 0.1);
        }
    }

    // --- Tala Palm Tree Details ---
    static renderPalmTrunk(ctx, x, y, r, swayTime) {
        const sway = Math.sin(swayTime * 1.4 + x * 0.02) * 5;

        // Slender tall trunk with segmentation rings
        const barkGrad = ctx.createLinearGradient(x - r * 0.4, y, x + r * 0.4, y);
        barkGrad.addColorStop(0, '#59321f');
        barkGrad.addColorStop(0.5, '#8b5a2b');
        barkGrad.addColorStop(1, '#3b1e0f');
        ctx.fillStyle = barkGrad;

        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y + 4);
        ctx.quadraticCurveTo(x - r * 0.2 + sway * 0.3, y - 60, x - r * 0.25 + sway, y - 120);
        ctx.lineTo(x + r * 0.25 + sway, y - 120);
        ctx.quadraticCurveTo(x + r * 0.2 + sway * 0.3, y - 60, x + r * 0.5, y + 4);
        ctx.closePath();
        ctx.fill();

        // Segment rings
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.lineWidth = 1.5;
        for (let segY = y; segY > y - 110; segY -= 14) {
            const frac = (y - segY) / 120;
            const sx = x + sway * frac;
            ctx.beginPath();
            ctx.ellipse(sx, segY, r * 0.35, 2, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    static renderPalmCanopy(ctx, x, y, vRad, swayTime) {
        const sway = Math.sin(swayTime * 1.4 + x * 0.02) * 5;
        const topX = x + sway;
        const topY = y - 120;

        ctx.save();
        ctx.translate(topX, topY);

        // Hanging Coconuts in trunk crown
        this.drawCoconut(ctx, -5, -4, 0.85);
        this.drawCoconut(ctx, 5, -3, 0.85);
        this.drawCoconut(ctx, 0, 4, 0.85);

        // Radiating Fan Palm Fronds
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        const frondAngles = [
            -Math.PI * 0.85, -Math.PI * 0.65, -Math.PI * 0.5, -Math.PI * 0.35, -Math.PI * 0.15,
            Math.PI * 0.1, -Math.PI * 0.95
        ];

        for (const ang of frondAngles) {
            ctx.save();
            ctx.rotate(ang + (sway * 0.02));

            // Central stalk
            ctx.strokeStyle = '#ca8a04';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(vRad * 0.5, -vRad * 0.2, vRad * 0.9, 0);
            ctx.stroke();

            // Leaf pinnae
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(vRad * 0.45, -vRad * 0.4, vRad * 0.9, 0);
            ctx.quadraticCurveTo(vRad * 0.45, vRad * 0.2, 0, 0);
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }

    // ==========================================
    // 5. BOULDER & ROCK RENDERERS
    // Natural Braj & Govardhan Shila / River Stones
    // ==========================================

    /**
     * Draw Organic Sacred Boulder / Stone (NOT a geometric sphere!)
     * Styled with multi-faceted silhouette, sunlight top planes, shadow crevice lines, and grounding.
     */
    static drawRock(ctx, obs) {
        const x = obs.x;
        const y = obs.y;
        const r = obs.visualRadius || 42;
        const isSandbank = x >= 12700;

        ctx.save();
        ctx.translate(x, y);

        // 1. Soft Ground Ambient Occlusion Shadow
        ctx.fillStyle = isSandbank ? 'rgba(120, 53, 15, 0.28)' : 'rgba(15, 23, 42, 0.26)';
        ctx.beginPath();
        ctx.ellipse(3, r * 0.45, r * 1.15, r * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Multi-faceted Organic Boulder Silhouette (Asymmetrical rounded polygon)
        // Deterministic offset based on coordinates so each boulder has unique natural contours
        const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const var1 = ((seed - Math.floor(seed)) - 0.5) * 0.15;
        const var2 = (((seed * 1.3) - Math.floor(seed * 1.3)) - 0.5) * 0.15;

        // Base Boulder Body
        const baseGrad = ctx.createLinearGradient(-r * 0.4, -r * 0.8, r * 0.3, r * 0.7);
        if (isSandbank) {
            // Warm Sandbank River Stone (Yamuna Beach Shila)
            baseGrad.addColorStop(0, '#d6d3d1');
            baseGrad.addColorStop(0.35, '#a8a29e');
            baseGrad.addColorStop(0.75, '#78716c');
            baseGrad.addColorStop(1, '#57534e');
        } else {
            // Govardhan Ochre-Slate Shila
            baseGrad.addColorStop(0, '#cbd5e1');
            baseGrad.addColorStop(0.2, '#94a3b8');
            baseGrad.addColorStop(0.55, '#64748b');
            baseGrad.addColorStop(0.85, '#475569');
            baseGrad.addColorStop(1, '#334155');
        }

        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        // Flattened bottom resting on earth, organic angled top facets
        ctx.moveTo(-r * 0.95, r * 0.35);
        ctx.quadraticCurveTo(-r * (1.05 + var1), -r * 0.2, -r * 0.75, -r * (0.65 + var2));
        ctx.quadraticCurveTo(-r * 0.35, -r * (0.95 - var1), 0, -r * 0.85);
        ctx.quadraticCurveTo(r * 0.5, -r * (0.9 + var2), r * (0.85 + var1), -r * 0.45);
        ctx.quadraticCurveTo(r * 1.05, r * 0.1, r * 0.9, r * 0.4);
        ctx.quadraticCurveTo(r * 0.4, r * 0.65, 0, r * 0.62);
        ctx.quadraticCurveTo(-r * 0.5, r * 0.65, -r * 0.95, r * 0.35);
        ctx.closePath();
        ctx.fill();

        // 3. Sunlight Top Highlight Facet
        const sunGrad = ctx.createLinearGradient(-r * 0.5, -r * 0.9, r * 0.3, -r * 0.2);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
        sunGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * (0.55 + var2));
        ctx.quadraticCurveTo(-r * 0.3, -r * 0.88, 0, -r * 0.82);
        ctx.quadraticCurveTo(r * 0.45, -r * 0.85, r * 0.75, -r * 0.4);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.25, -r * 0.1, -r * 0.35);
        ctx.closePath();
        ctx.fill();

        // 4. Subtle Rock Crevice & Striation Lines
        ctx.strokeStyle = isSandbank ? 'rgba(68, 64, 60, 0.45)' : 'rgba(30, 41, 59, 0.5)';
        ctx.lineWidth = Math.max(1.2, r * 0.035);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.1);
        ctx.quadraticCurveTo(-r * 0.1, -r * 0.05, r * 0.4, -r * 0.25);
        ctx.moveTo(-r * 0.2, r * 0.15);
        ctx.quadraticCurveTo(r * 0.15, r * 0.22, r * 0.6, r * 0.1);
        ctx.stroke();

        // 5. Moss or Sand Dust Accumulation at the Base
        if (isSandbank) {
            // Golden sand dust along bottom curve
            ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
            ctx.beginPath();
            ctx.ellipse(0, r * 0.48, r * 0.85, r * 0.18, 0, 0, Math.PI);
            ctx.fill();
        } else {
            // Sacred Green Moss patch on shaded side
            ctx.fillStyle = 'rgba(22, 101, 52, 0.45)';
            ctx.beginPath();
            ctx.ellipse(-r * 0.35, r * 0.35, r * 0.4, r * 0.18, -0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 6. Crisp Natural Silhouette Outline
        ctx.strokeStyle = isSandbank ? '#44403c' : '#1e293b';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.restore();
    }
}

