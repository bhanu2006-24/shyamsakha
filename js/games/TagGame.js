/**
 * TagGame (पकड़ पकड़ाई - Pakad Pakdai)
 * Playful pastoral chase: Pursue Krishna & Dao Balaram across the sunlit pastures!
 */
export class TagGame {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.gameTime = 0;
        this.krishnaAi = { state: 'flee', timer: 3.0, stuckTimer: 0, lastX: 0, lastY: 0 };
        this.balramAi = { state: 'flee', timer: 2.5, stuckTimer: 0, lastX: 0, lastY: 0 };
    }

    start() {
        this.isActive = true;
        this.gameTime = 0;

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;

        // Position Krishna & Balram in clear pasture slightly ahead of the player
        krishna.x = player.x + 180;
        krishna.y = player.y - 120;
        krishna.isCaught = false;
        krishna.currentSpeed = 210; // Comfortable chase speed: player walks at 320, so player can easily catch up!

        balram.x = player.x - 180;
        balram.y = player.y - 120;
        balram.isCaught = false;
        balram.currentSpeed = 200;

        this.krishnaAi = { state: 'flee', timer: 2.5, stuckTimer: 0, lastX: krishna.x, lastY: krishna.y };
        this.balramAi = { state: 'flee', timer: 3.2, stuckTimer: 0, lastX: balram.x, lastY: balram.y };

        // Position Sakhas in a wide flanking semi-circle
        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.x = player.x + ((idx % 4) - 1.5) * 80;
            s.y = player.y + 70 + Math.floor(idx / 4) * 50;
            s.currentSpeed = 230;
        });

        this.game.ui.showToast("🏃‍♂️ Pakad Pakdai started! Sprint with Shift or run to tag Krishna & Dao Balram!", 4500);
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

        // 1. Check if player tags Krishna
        if (!krishna.isCaught && Math.hypot(player.x - krishna.x, player.y - krishna.y) < player.radius + krishna.radius + 14) {
            krishna.isCaught = true;
            this.game.particles.createPetals(krishna.x, krishna.y, '#38bdf8', 45);
            this.game.sound.playCheer();
            this.game.ui.showToast("Caught Shree Krishna! 🦚 Now catch Dao Balram!");
        }

        // 2. Check if player tags Balram
        if (!balram.isCaught && Math.hypot(player.x - balram.x, player.y - balram.y) < player.radius + balram.radius + 14) {
            balram.isCaught = true;
            this.game.particles.createPetals(balram.x, balram.y, '#f8fafc', 45);
            this.game.sound.playCheer();
            this.game.ui.showToast("Caught Dao Balram! 🌾 Splendid speed!");
        }

        // 3. Smart & Playful AI for Targets (Krishna & Dao Balram)
        this.updateTargetAi(krishna, this.krishnaAi, player, sakhas, obstacles, mapW, mapH, dt, 'krishna');
        this.updateTargetAi(balram, this.balramAi, player, sakhas, obstacles, mapW, mapH, dt, 'balram');

        // 4. Smart Flanking AI for Sakha Friends
        this.updateSakhasAi(sakhas, krishna, balram, obstacles, mapW, mapH, dt);

        // 5. Win condition
        if (krishna.isCaught && balram.isCaught) {
            this.isActive = false;
            this.game.sound.playCheer();
            this.game.endGame(true, `Splendid victory! You and the Sakhas caught both Krishna & Dao Balram in ${this.gameTime.toFixed(1)} seconds! 🌸`);
        }
    }

    updateTargetAi(target, ai, player, sakhas, obstacles, mapW, mapH, dt, type) {
        if (target.isCaught) return;

        ai.timer -= dt;

        // Anti-stuck watchdog: check if target has been blocked for > 0.35s
        const moveDist = Math.hypot(target.x - ai.lastX, target.y - ai.lastY);
        ai.lastX = target.x;
        ai.lastY = target.y;

        if (moveDist < 1.0) {
            ai.stuckTimer += dt;
        } else {
            ai.stuckTimer = 0;
        }

        // If stuck against obstacle, break out immediately with escape vector
        if (ai.stuckTimer > 0.35) {
            target.wanderAngle = (target.wanderAngle || 0) + Math.PI * 0.6;
            ai.stuckTimer = 0;
            ai.state = 'flee';
            ai.timer = 2.0;
        }

        const distToPlayer = Math.hypot(target.x - player.x, target.y - player.y);

        // State Transitions
        if (ai.timer <= 0) {
            if (ai.state === 'tease') {
                ai.state = 'flee';
                ai.timer = 2.5 + Math.random() * 2.0;
            } else if (distToPlayer > 180 && Math.random() < 0.65) {
                // Pause and tease, giving the player a great opportunity to catch up!
                ai.state = 'tease';
                ai.timer = 1.3 + Math.random() * 0.8;
                const quotes = type === 'krishna' 
                    ? ["Haha, catch me if you can, Sakha! 🦚", "You'll have to run faster! 🦚", "Look at Dao Dada run! 🦚"]
                    : ["Ho ho! Almost had me, little brother! 🌾", "Keep your stamina up! 🌾", "Splendid chase! 🌾"];
                this.game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)]);
                this.game.particles.createSparkle(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#facc15');
            } else {
                ai.state = 'flee';
                ai.timer = 2.0 + Math.random() * 1.5;
            }
        }

        // Behavior execution
        if (ai.state === 'tease') {
            // Stand playfully and face player, slow breathing
            const faceDx = player.x - target.x;
            const faceDy = player.y - target.y;
            const fDist = Math.hypot(faceDx, faceDy) || 1;
            target.dx = faceDx / fDist;
            target.dy = faceDy / fDist;
            // Gentle playful step
            target.moveWithAnim(target.dx * 20 * dt, target.dy * 20 * dt, obstacles, mapW, mapH, dt);
            return;
        }

        // State: 'flee' (Run playfully at moderate speed)
        let fx = 0;
        let fy = 0;

        // Flee primarily from player
        const pdx = target.x - player.x;
        const pdy = target.y - player.y;
        const pDist = Math.hypot(pdx, pdy) || 1;
        fx += (pdx / pDist) * 1.6;
        fy += (pdy / pDist) * 1.6;

        // Weaving curve so they don't run in rigid straight lines
        if (Math.random() < 0.05) {
            target.wanderAngle = (target.wanderAngle || 0) + (Math.random() - 0.5) * 1.2;
        }
        fx += Math.cos(target.wanderAngle || 0) * 0.7;
        fy += Math.sin(target.wanderAngle || 0) * 0.7;

        // Smooth obstacle gliding avoidance (tangent sliding)
        for (const obs of obstacles) {
            if (obs.shape === 'circle') {
                const odx = target.x - obs.x;
                const ody = target.y - obs.y;
                const oDist = Math.hypot(odx, ody);
                const safeZone = (obs.radius || 30) + target.radius + 65;

                if (oDist < safeZone && oDist > 0) {
                    const normX = odx / oDist;
                    const normY = ody / oDist;
                    // Two tangents: clockwise and counter-clockwise
                    const tan1X = -normY, tan1Y = normX;
                    const tan2X = normY, tan2Y = -normX;
                    // Pick tangent best aligned with desired flee heading
                    const dot1 = fx * tan1X + fy * tan1Y;
                    const dot2 = fx * tan2X + fy * tan2Y;
                    const bestTanX = dot1 >= dot2 ? tan1X : tan2X;
                    const bestTanY = dot1 >= dot2 ? tan1Y : tan2Y;

                    const pushFactor = Math.pow((safeZone - oDist) / safeZone, 2) * 4.5;
                    fx += (normX * 1.5 + bestTanX * 2.5) * pushFactor;
                    fy += (normY * 1.5 + bestTanY * 2.5) * pushFactor;
                }
            } else if (obs.type === 'river') {
                if (target.x > obs.x - 80) fx -= 5.0;
            }
        }

        // Repel from map borders (keep in playable meadow)
        if (target.x < 240) fx += 4.0;
        if (target.x > mapW - 750) fx -= 4.0;
        if (target.y < 240) fy += 4.0;
        if (target.y > mapH - 320) fy -= 4.0;

        const fLen = Math.hypot(fx, fy);
        if (fLen > 0) {
            fx /= fLen;
            fy /= fLen;
        }

        // Base speed: 205 px/s (player walks at 320, sprints at 528). Player CAN easily catch up!
        const baseSpeed = 205;
        target.applyTerrain(obstacles);
        target.moveWithAnim(fx * baseSpeed * target.terrainModifier * dt, fy * baseSpeed * target.terrainModifier * dt, obstacles, mapW, mapH, dt);
    }

    updateSakhasAi(sakhas, krishna, balram, obstacles, mapW, mapH, dt) {
        sakhas.forEach((s, idx) => {
            const activeTarget = (idx % 2 === 0 && !krishna.isCaught) ? krishna : (!balram.isCaught ? balram : krishna);
            if (!activeTarget || activeTarget.isCaught) return;

            const dx = activeTarget.x - s.x;
            const dy = activeTarget.y - s.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                // Flanking spread: spread across 80 degree arc to surround
                const spreadAngle = ((idx % 4) - 1.5) * 0.45;
                const cosA = Math.cos(spreadAngle);
                const sinA = Math.sin(spreadAngle);
                const fdx = (dx / dist) * cosA - (dy / dist) * sinA;
                const fdy = (dx / dist) * sinA + (dy / dist) * cosA;

                let sx = fdx;
                let sy = fdy;

                // Obstacle avoidance for Sakha
                for (const obs of obstacles) {
                    if (obs.shape === 'circle') {
                        const odx = s.x - obs.x;
                        const ody = s.y - obs.y;
                        const oDist = Math.hypot(odx, ody);
                        if (oDist < (obs.radius || 25) + s.radius + 35 && oDist > 0) {
                            sx += (odx / oDist) * 3.0;
                            sy += (ody / oDist) * 3.0;
                        }
                    }
                }

                const sLen = Math.hypot(sx, sy);
                if (sLen > 0) { sx /= sLen; sy /= sLen; }

                s.applyTerrain(obstacles);
                s.moveWithAnim(sx * s.currentSpeed * s.terrainModifier * dt, sy * s.currentSpeed * s.terrainModifier * dt, obstacles, mapW, mapH, dt);

                // If Sakha catches target, tag with cheer!
                if (dist < s.radius + activeTarget.radius + 8) {
                    activeTarget.isCaught = true;
                    this.game.particles.createPetals(activeTarget.x, activeTarget.y, activeTarget === krishna ? '#38bdf8' : '#f8fafc', 35);
                    this.game.sound.playCheer();
                    this.game.ui.showToast(`${s.name || 'Sudama'} cornered and tagged ${activeTarget === krishna ? 'Shree Krishna' : 'Dao Balram'}! 🌸`);
                }
            }
        });
    }
}
