/**
 * TagGame (पकड़ पकड़ाई - Pakad Pakdai)
 * Fast-paced pastoral chase: Pursue Krishna & Dao Balaram across Vrindavan!
 */
export class TagGame {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.gameTime = 0;
    }

    start() {
        this.isActive = true;
        this.gameTime = 0;

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;

        // Position Krishna & Balram in clear sight ahead of the player
        krishna.x = player.x + 200;
        krishna.y = player.y - 140;
        krishna.isCaught = false;

        balram.x = player.x - 200;
        balram.y = player.y - 140;
        balram.isCaught = false;

        // Position Sakhas flanked behind the player
        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.x = player.x + ((idx % 4) - 1.5) * 70;
            s.y = player.y + 70 + Math.floor(idx / 4) * 60;
        });

        this.game.ui.showToast("🏃‍♂️ Pakad Pakdai started! Sprint (Shift) and chase down Krishna & Dao Balram!", 4500);
        this.game.sound.playCheer();
    }

    update(dt) {
        if (!this.isActive) return;
        this.gameTime += dt;

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakhas = this.game.sakhas;
        const obstacles = this.game.mapManager.getObstacles();
        const mapW = this.game.mapManager.getWidth();
        const mapH = this.game.mapManager.getHeight();

        const targets = [krishna, balram].filter(t => !t.isCaught);
        const pursuers = [player, ...sakhas].filter(p => !p.isCaught);

        // 1. Check if player tags Krishna
        if (!krishna.isCaught && Math.hypot(player.x - krishna.x, player.y - krishna.y) < player.radius + krishna.radius + 12) {
            krishna.isCaught = true;
            this.game.particles.createPetals(krishna.x, krishna.y, '#38bdf8', 40);
            this.game.sound.playCheer();
            this.game.ui.showToast("You caught Shree Krishna! 🦚 Now catch Dao Balram!");
        }

        // 2. Check if player tags Balram
        if (!balram.isCaught && Math.hypot(player.x - balram.x, player.y - balram.y) < player.radius + balram.radius + 12) {
            balram.isCaught = true;
            this.game.particles.createPetals(balram.x, balram.y, '#f8fafc', 40);
            this.game.sound.playCheer();
            this.game.ui.showToast("You caught Dao Balram! 🌾 Splendid speed!");
        }

        // 3. AI Fleeing for active targets (Krishna & Balram)
        for (const target of targets) {
            let tx = 0;
            let ty = 0;

            for (const p of pursuers) {
                const dx = target.x - p.x;
                const dy = target.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 900 && dist > 0) {
                    const weight = 1200 / (dist + 1);
                    tx += (dx / dist) * weight;
                    ty += (dy / dist) * weight;
                }
            }

            // Gentle curve wandering so they run through the meadows naturally
            if (Math.random() < 0.03) {
                target.wanderAngle = (target.wanderAngle || 0) + (Math.random() - 0.5);
            }
            tx += Math.cos(target.wanderAngle || 0) * 0.5;
            ty += Math.sin(target.wanderAngle || 0) * 0.5;

            // Avoid pond and obstacles
            const avoid = target.getAvoidanceForce(obstacles, 140);
            tx += avoid.x * 4.2;
            ty += avoid.y * 4.2;

            // Keep within map boundaries
            if (target.x < 200) tx += 3.0;
            if (target.x > mapW - 700) tx -= 3.0;
            if (target.y < 200) ty += 3.0;
            if (target.y > mapH - 300) ty -= 3.0;

            const len = Math.hypot(tx, ty);
            if (len > 0) {
                tx /= len;
                ty /= len;
            }

            const speedMod = target.isSlowed ? 0.7 : 1.0;
            target.applyTerrain(obstacles);
            target.moveWithAnim(tx * target.currentSpeed * speedMod * target.terrainModifier * dt, ty * target.currentSpeed * speedMod * target.terrainModifier * dt, obstacles, mapW, mapH, dt);
        }

        // 4. AI Chasing for Sakhas (Flanking Krishna and Balram)
        sakhas.forEach((s, idx) => {
            if (targets.length === 0) return;

            // Split Sakhas: Even indices pursue Krishna, odd pursue Balram
            const preferredTarget = (idx % 2 === 0 && !krishna.isCaught) ? krishna : (!balram.isCaught ? balram : krishna);
            if (!preferredTarget || preferredTarget.isCaught) return;

            const dx = preferredTarget.x - s.x;
            const dy = preferredTarget.y - s.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                // Flanking angle offset so they surround the target instead of a single line
                const flankAngle = ((idx % 4) - 1.5) * 0.5;
                const cosF = Math.cos(flankAngle);
                const sinF = Math.sin(flankAngle);
                const fdx = (dx / dist) * cosF - (dy / dist) * sinF;
                const fdy = (dx / dist) * sinF + (dy / dist) * cosF;

                const avoid = s.getAvoidanceForce(obstacles, 100);
                let ax = fdx + avoid.x * 2.5;
                let ay = fdy + avoid.y * 2.5;
                const aLen = Math.hypot(ax, ay);
                if (aLen > 0) { ax /= aLen; ay /= aLen; }

                s.applyTerrain(obstacles);
                s.moveWithAnim(ax * s.currentSpeed * 0.92 * s.terrainModifier * dt, ay * s.currentSpeed * 0.92 * s.terrainModifier * dt, obstacles, mapW, mapH, dt);

                // If Sakha corners Krishna or Balram, tag or slow down
                if (dist < s.radius + preferredTarget.radius + 8) {
                    preferredTarget.isSlowed = true;
                    this.game.particles.createSparkle(preferredTarget.x, preferredTarget.y, '#facc15');
                    if (Math.random() < 0.15 && !preferredTarget.isCaught) {
                        this.game.ui.showToast(`${s.name || 'Sudama'} cornered ${preferredTarget === krishna ? 'Krishna' : 'Dao Balram'}! Catch him now!`);
                    }
                }
            }
        });

        // 5. Win condition
        if (krishna.isCaught && balram.isCaught) {
            this.isActive = false;
            this.game.sound.playCheer();
            this.game.endGame(true, `Splendid! You and the Sakhas caught both Krishna & Dao Balram in ${this.gameTime.toFixed(1)} seconds! 🌸`);
        }
    }
}
