/**
 * HoliGame (होली उत्सव - Rangotsav Pichkari & Color Fight)
 * Playful Vrindavan color fight: Player & Sakhas vs Krishna & Dao Balram
 */
export class Projectile {
    constructor(x, y, targetX, targetY, speed, color, isBomb, team) {
        this.x = x;
        this.y = y;
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.hypot(dx, dy) || 1;

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.color = color;
        this.isBomb = isBomb;
        this.team = team;
        this.radius = isBomb ? 14 : 8;
        this.life = 1.8;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Trail glow
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(this.x - this.vx * 0.035, this.y - this.vy * 0.035, this.radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class HoliGame {
    constructor(game) {
        this.game = game;
        this.projectiles = [];
        this.isActive = false;
        this.shootCooldown = 0;
        this.sakhaShootCooldowns = [];
        this.playerSplashes = 0;
        this.krishnaSplashes = 0;
        this.balramSplashes = 0;
        this.maxSplashes = 3;
    }

    start() {
        this.isActive = true;
        this.projectiles = [];
        this.playerSplashes = 0;
        this.krishnaSplashes = 0;
        this.balramSplashes = 0;

        const p = this.game.player;
        const k = this.game.krishna;
        const b = this.game.balram;

        k.isCaught = false;
        b.isCaught = false;
        p.isCaught = false;

        // Position Krishna & Balram in clear pasture slightly ahead of player
        k.x = p.x + 220;
        k.y = p.y - 120;
        b.x = p.x - 220;
        b.y = p.y - 120;

        // Spread Sakhas around player
        this.sakhaShootCooldowns = [];
        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.x = p.x + ((idx % 4) - 1.5) * 80;
            s.y = p.y + 60 + Math.floor(idx / 4) * 60;
            this.sakhaShootCooldowns.push(Math.random() * 1.5);
        });

        this.game.ui.showToast("💦 Rangotsav has begun! Click or press Spacebar to shoot Pichkari colors! 🌈", 4500);
        this.game.sound.playSplash();
    }

    shoot(fromX, fromY, toX, toY, color = '#ec4899', isBomb = false, team = 'player') {
        const p = new Projectile(fromX, fromY, toX, toY, isBomb ? 560 : 820, color, isBomb, team);
        this.projectiles.push(p);
        this.game.sound.playSplash();
    }

    update(dt) {
        if (!this.isActive) return;

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakhas = this.game.sakhas;
        const obstacles = this.game.mapManager.getObstacles();
        const mapW = this.game.mapManager.getWidth();
        const mapH = this.game.mapManager.getHeight();

        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }

        // 1. Handle Player Shooting (Left Click OR Spacebar)
        const wantsShoot = this.game.input.wasMouseClicked() || this.game.input.wasJustPressed(' ');
        if (wantsShoot && this.shootCooldown <= 0 && !player.isCaught) {
            const mouse = this.game.input.mouse;
            let targetX = mouse.worldX;
            let targetY = mouse.worldY;

            // If triggered by Spacebar and mouse is zero/centered, shoot in player facing direction
            if (this.game.input.wasJustPressed(' ') && (!mouse.isDown && Math.hypot(targetX - player.x, targetY - player.y) < 10)) {
                targetX = player.x + (player.dx || 1) * 300;
                targetY = player.y + (player.dy || 0) * 300;
            }

            const playerColors = ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24'];
            const chosenColor = playerColors[Math.floor(Math.random() * playerColors.length)];
            this.shoot(player.x, player.y, targetX, targetY, chosenColor, false, 'player');
            this.shootCooldown = 0.28;
        }

        const activeTargets = [krishna, balram].filter(t => !t.isCaught);
        const activePursuers = [player, ...sakhas].filter(p => !p.isCaught);

        // 2. Krishna & Balram Movement AI (Playful weaving & dodging)
        for (const target of activeTargets) {
            let tx = 0;
            let ty = 0;

            // Flee from nearby pursuers
            for (const p of activePursuers) {
                const dx = target.x - p.x;
                const dy = target.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 400 && dist > 0) {
                    tx += (dx / dist) * (500 / dist);
                    ty += (dy / dist) * (500 / dist);
                }
            }

            // Playful circular wandering
            if (Math.random() < 0.04) {
                target.wanderAngle = (target.wanderAngle || 0) + (Math.random() - 0.5) * 1.8;
            }
            tx += Math.cos(target.wanderAngle || 0) * 0.8;
            ty += Math.sin(target.wanderAngle || 0) * 0.8;

            // Obstacle & water avoidance
            const avoid = target.getAvoidanceForce(obstacles, 120);
            tx += avoid.x * 3.5;
            ty += avoid.y * 3.5;

            const len = Math.hypot(tx, ty);
            if (len > 0) {
                tx /= len;
                ty /= len;
            }

            target.applyTerrain(obstacles);
            target.moveWithAnim(tx * target.currentSpeed * 0.9 * dt, ty * target.currentSpeed * 0.9 * dt, obstacles, mapW, mapH, dt);
        }

        // 3. Krishna & Balram Shooting AI (Throwing Gulal color bombs back!)
        for (const target of activeTargets) {
            if (Math.random() < 0.035 && activePursuers.length > 0) {
                const targetPursuer = activePursuers[Math.floor(Math.random() * activePursuers.length)];
                const color = target === krishna ? '#38bdf8' : '#facc15';
                this.shoot(target.x, target.y, targetPursuer.x, targetPursuer.y, color, true, 'krishna');
            }
        }

        // 4. Sakha Friends AI (Running after Krishna/Balram & shooting Pichkari colors)
        sakhas.forEach((s, idx) => {
            if (s.isCaught || activeTargets.length === 0) return;

            const preferredTarget = activeTargets[idx % activeTargets.length];
            const dx = preferredTarget.x - s.x;
            const dy = preferredTarget.y - s.y;
            const dist = Math.hypot(dx, dy);

            // Move towards target
            if (dist > 180) {
                const avoid = s.getAvoidanceForce(obstacles, 90);
                let sx = (dx / dist) + avoid.x * 2.0;
                let sy = (dy / dist) + avoid.y * 2.0;
                const sLen = Math.hypot(sx, sy);
                if (sLen > 0) { sx /= sLen; sy /= sLen; }
                s.moveWithAnim(sx * s.currentSpeed * 0.8 * dt, sy * s.currentSpeed * 0.8 * dt, obstacles, mapW, mapH, dt);
            }

            // Shoot Pichkari when in range
            this.sakhaShootCooldowns[idx] = (this.sakhaShootCooldowns[idx] || 0) - dt;
            if (this.sakhaShootCooldowns[idx] <= 0 && dist < 500) {
                const sakhaColors = ['#a855f7', '#ec4899', '#10b981', '#3b82f6'];
                const sColor = sakhaColors[idx % sakhaColors.length];
                this.shoot(s.x, s.y, preferredTarget.x + (Math.random() - 0.5) * 40, preferredTarget.y + (Math.random() - 0.5) * 40, sColor, false, 'player');
                this.sakhaShootCooldowns[idx] = 1.8 + Math.random() * 1.5;
            }
        });

        // 5. Update Projectiles & Check Collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt);

            let hit = false;

            if (p.life <= 0) {
                hit = true;
            } else if (p.team === 'player') {
                for (const t of activeTargets) {
                    if (Math.hypot(p.x - t.x, p.y - t.y) < t.radius + p.radius) {
                        this.game.particles.createPetals(t.x, t.y, p.color, 35);
                        this.game.sound.playSplash();
                        hit = true;

                        if (t === krishna) {
                            this.krishnaSplashes++;
                            if (this.krishnaSplashes >= this.maxSplashes) {
                                krishna.isCaught = true;
                                this.game.sound.playCheer();
                                this.game.ui.showToast("🦚 Shree Krishna is completely drenched in vibrant colors!");
                            } else {
                                this.game.ui.showToast(`Splashed Krishna! (${this.krishnaSplashes}/${this.maxSplashes}) 🦚`);
                            }
                        } else if (t === balram) {
                            this.balramSplashes++;
                            if (this.balramSplashes >= this.maxSplashes) {
                                balram.isCaught = true;
                                this.game.sound.playCheer();
                                this.game.ui.showToast("🌾 Dao Balram is completely drenched in joyful colors!");
                            } else {
                                this.game.ui.showToast(`Splashed Dao Balram! (${this.balramSplashes}/${this.maxSplashes}) 🌾`);
                            }
                        }
                        break;
                    }
                }
            } else {
                // Team Krishna shooting at Player & Sakhas
                for (const s of activePursuers) {
                    if (Math.hypot(p.x - s.x, p.y - s.y) < s.radius + p.radius) {
                        this.game.particles.createPetals(s.x, s.y, p.color, 35);
                        this.game.sound.playSplash();
                        hit = true;

                        if (s === player) {
                            this.playerSplashes++;
                            if (this.playerSplashes >= this.maxSplashes) {
                                this.isActive = false;
                                this.game.endGame(false, "You got completely soaked by Krishna & Dao Balram's Gulal colors! 🌈");
                            } else {
                                this.game.ui.showToast(`Krishna splashed you! (${this.playerSplashes}/${this.maxSplashes}) 💦`);
                            }
                        }
                        break;
                    }
                }
            }

            if (hit) {
                this.game.particles.addSplat(p.x, p.y, p.radius * 2.4, p.color);
                this.projectiles.splice(i, 1);
            }
        }

        // 6. Check Match Victory
        if (krishna.isCaught && balram.isCaught) {
            this.isActive = false;
            this.game.sound.playCheer();
            this.game.endGame(true, "All friends are soaked in divine Vrindavan Holi bliss! 🌺🌈");
        }
    }

    draw(ctx) {
        if (!this.isActive) return;
        for (const p of this.projectiles) {
            p.draw(ctx);
        }
    }
}
