/**
 * HoliGame (होली उत्सव - Rangotsav Pichkari & Color Fight)
 * Playful, fair, and immersive Vrindavan color fight: Player & Sakhas vs Krishna & Dao Balram
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
        this.radius = isBomb ? 13 : 8;
        this.life = 1.9;
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
        this.playerSplashes = 0;
        this.krishnaSplashes = 0;
        this.balramSplashes = 0;
        this.maxSplashes = 3;
        this.playerIFrameTimer = 0; // Invulnerability frames so player doesn't get combo-spammed
        this.krishnaAi = { state: 'flee', timer: 2.5, stuckTimer: 0, lastX: 0, lastY: 0, bombCooldown: 2.0, telegraphTimer: 0 };
        this.balramAi = { state: 'flee', timer: 3.0, stuckTimer: 0, lastX: 0, lastY: 0, bombCooldown: 3.0, telegraphTimer: 0 };
        this.sakhaShootCooldowns = [];
    }

    start() {
        this.isActive = true;
        this.projectiles = [];
        this.playerSplashes = 0;
        this.krishnaSplashes = 0;
        this.balramSplashes = 0;
        this.playerIFrameTimer = 0;

        const p = this.game.player;
        const k = this.game.krishna;
        const b = this.game.balram;

        k.isCaught = false;
        b.isCaught = false;
        p.isCaught = false;

        // Position Krishna & Balram in clear pasture within player sight
        k.x = p.x + 190;
        k.y = p.y - 120;
        b.x = p.x - 190;
        b.y = p.y - 120;

        this.krishnaAi = { state: 'flee', timer: 2.0, stuckTimer: 0, lastX: k.x, lastY: k.y, bombCooldown: 2.5, telegraphTimer: 0 };
        this.balramAi = { state: 'flee', timer: 2.8, stuckTimer: 0, lastX: b.x, lastY: b.y, bombCooldown: 3.5, telegraphTimer: 0 };

        this.sakhaShootCooldowns = [];
        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.x = p.x + ((idx % 4) - 1.5) * 80;
            s.y = p.y + 70 + Math.floor(idx / 4) * 55;
            this.sakhaShootCooldowns.push(1.0 + Math.random() * 2.0);
        });

        this.updateHoliStatusUI();
        this.game.ui.showToast("💦 Rangotsav has begun! Aim with mouse and click or press Spacebar to shoot! 🌈", 4500);
        this.game.sound.playSplash();
    }

    updateHoliStatusUI() {
        const pHearts = '💖'.repeat(Math.max(0, this.maxSplashes - this.playerSplashes));
        const kHearts = '🦚'.repeat(Math.max(0, this.maxSplashes - this.krishnaSplashes));
        const bHearts = '🌾'.repeat(Math.max(0, this.maxSplashes - this.balramSplashes));
        this.game.ui.setPhase(`You [${pHearts || '❌'}] | Kanha [${kHearts || '✔'}] | Balram [${bHearts || '✔'}]`, "tag-playing");
    }

    shoot(fromX, fromY, toX, toY, color = '#ec4899', isBomb = false, team = 'player') {
        const p = new Projectile(fromX, fromY, toX, toY, isBomb ? 520 : 820, color, isBomb, team);
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

        if (this.shootCooldown > 0) this.shootCooldown -= dt;
        if (this.playerIFrameTimer > 0) this.playerIFrameTimer -= dt;

        // 1. Handle Player Shooting (Left Click OR Spacebar)
        const wantsShoot = this.game.input.wasMouseClicked() || this.game.input.wasJustPressed(' ');
        if (wantsShoot && this.shootCooldown <= 0 && !player.isCaught) {
            const mouse = this.game.input.mouse;
            let targetX = mouse.worldX;
            let targetY = mouse.worldY;

            // If triggered by Spacebar and mouse hasn't moved, aim in player's facing direction
            if (this.game.input.wasJustPressed(' ') && (!mouse.isDown && Math.hypot(targetX - player.x, targetY - player.y) < 10)) {
                targetX = player.x + (player.dx || 1) * 350;
                targetY = player.y + (player.dy || 0) * 350;
            }

            const colors = ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24'];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];
            this.shoot(player.x, player.y, targetX, targetY, chosenColor, false, 'player');
            this.shootCooldown = 0.28;
        }

        const activeTargets = [krishna, balram].filter(t => !t.isCaught);
        const activePursuers = [player, ...sakhas].filter(p => !p.isCaught);

        // 2. Playful & Fair Target AI (Krishna & Dao Balram)
        this.updateHoliTargetAi(krishna, this.krishnaAi, player, sakhas, obstacles, mapW, mapH, dt, 'krishna');
        this.updateHoliTargetAi(balram, this.balramAi, player, sakhas, obstacles, mapW, mapH, dt, 'balram');

        // 3. Sakhas Pichkari AI (Teammates support player)
        this.updateSakhasHoliAi(sakhas, activeTargets, obstacles, mapW, mapH, dt);

        // 4. Projectile Physics & Collisions (With Entities AND Tree Trunks)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt);

            let hit = false;

            // Check Tree Trunk Collisions (Cover behind trees works!)
            for (const obs of obstacles) {
                if (obs.shape === 'circle' && (obs.type === 'tree' || obs.type === 'kadamba')) {
                    if (Math.hypot(p.x - obs.x, p.y - obs.y) < (obs.radius || 28) + p.radius) {
                        this.game.particles.addSplat(p.x, p.y, p.radius * 2.2, p.color);
                        hit = true;
                        break;
                    }
                }
            }

            if (p.life <= 0) {
                hit = true;
            } else if (!hit && p.team === 'player') {
                // Player / Sakha shooting at Krishna / Balram
                for (const t of activeTargets) {
                    if (Math.hypot(p.x - t.x, p.y - t.y) < t.radius + p.radius) {
                        this.game.particles.createPetals(t.x, t.y, p.color, 40);
                        this.game.sound.playSplash();
                        hit = true;

                        if (t === krishna) {
                            this.krishnaSplashes++;
                            if (this.krishnaSplashes >= this.maxSplashes) {
                                krishna.isCaught = true;
                                this.game.sound.playCheer();
                                this.game.ui.showToast("🦚 Kanha is fully soaked in joyous Vrindavan colors!");
                            } else {
                                this.game.ui.showToast(`Splashed Krishna! (${this.krishnaSplashes}/${this.maxSplashes}) 🦚`);
                            }
                        } else if (t === balram) {
                            this.balramSplashes++;
                            if (this.balramSplashes >= this.maxSplashes) {
                                balram.isCaught = true;
                                this.game.sound.playCheer();
                                this.game.ui.showToast("🌾 Dao Balram is fully drenched in joyful colors!");
                            } else {
                                this.game.ui.showToast(`Splashed Dao Balram! (${this.balramSplashes}/${this.maxSplashes}) 🌾`);
                            }
                        }
                        this.updateHoliStatusUI();
                        break;
                    }
                }
            } else if (!hit && p.team === 'krishna') {
                // Team Krishna shooting at Player & Sakhas
                for (const s of activePursuers) {
                    if (Math.hypot(p.x - s.x, p.y - s.y) < s.radius + p.radius) {
                        this.game.particles.createPetals(s.x, s.y, p.color, 35);
                        this.game.sound.playSplash();
                        hit = true;

                        if (s === player && this.playerIFrameTimer <= 0) {
                            this.playerSplashes++;
                            this.playerIFrameTimer = 1.4; // 1.4s invulnerability so player can react!
                            if (this.playerSplashes >= this.maxSplashes) {
                                this.isActive = false;
                                this.updateHoliStatusUI();
                                this.game.endGame(false, "You got completely soaked by Krishna & Dao Balram's Gulal colors! 🌈");
                            } else {
                                this.game.ui.showToast(`Splashed by Gulal! (${this.playerSplashes}/${this.maxSplashes}) 💦`);
                            }
                            this.updateHoliStatusUI();
                        }
                        break;
                    }
                }
            }

            if (hit) {
                this.game.particles.addSplat(p.x, p.y, p.radius * 2.5, p.color);
                this.projectiles.splice(i, 1);
            }
        }

        // 5. Match Victory Check
        if (krishna.isCaught && balram.isCaught) {
            this.isActive = false;
            this.game.sound.playCheer();
            this.game.endGame(true, "Joyous Victory! All friends are drenched in divine Vrindavan Holi nectar! 🌺🌈");
        }
    }

    updateHoliTargetAi(target, ai, player, sakhas, obstacles, mapW, mapH, dt, type) {
        if (target.isCaught) return;

        ai.timer -= dt;
        ai.bombCooldown -= dt;

        // Anti-stuck watchdog
        const moveDist = Math.hypot(target.x - ai.lastX, target.y - ai.lastY);
        ai.lastX = target.x;
        ai.lastY = target.y;

        if (moveDist < 1.0) {
            ai.stuckTimer += dt;
        } else {
            ai.stuckTimer = 0;
        }

        if (ai.stuckTimer > 0.35) {
            target.wanderAngle = (target.wanderAngle || 0) + Math.PI * 0.7;
            ai.stuckTimer = 0;
            ai.state = 'flee';
            ai.timer = 2.0;
        }

        const distToPlayer = Math.hypot(target.x - player.x, target.y - player.y);

        // State Machine
        if (ai.timer <= 0) {
            if (ai.state === 'tease') {
                ai.state = 'flee';
                ai.timer = 2.5 + Math.random() * 1.5;
            } else if (distToPlayer > 180 && Math.random() < 0.6) {
                // Pause and tease, giving player a great opportunity to close in and shoot!
                ai.state = 'tease';
                ai.timer = 1.3 + Math.random() * 0.7;
                this.game.particles.createSparkle(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#facc15');
            } else {
                ai.state = 'flee';
                ai.timer = 2.0 + Math.random() * 1.5;
            }
        }

        // Shooting with Visual Telegraph (Fair and readable for player!)
        if (ai.bombCooldown <= 0 && distToPlayer < 650) {
            ai.telegraphTimer = 0.5; // 0.5s wind-up sparkle
            ai.bombCooldown = 3.2 + Math.random() * 1.2; // Fair interval, no spamming
        }

        if (ai.telegraphTimer > 0) {
            ai.telegraphTimer -= dt;
            this.game.particles.createSparkle(target.x, target.y - 15, type === 'krishna' ? '#38bdf8' : '#facc15');
            if (ai.telegraphTimer <= 0) {
                // Fire color bomb
                const color = type === 'krishna' ? '#38bdf8' : '#facc15';
                this.shoot(target.x, target.y, player.x, player.y, color, true, 'krishna');
            }
        }

        // Movement Execution
        if (ai.state === 'tease') {
            const faceDx = player.x - target.x;
            const faceDy = player.y - target.y;
            const fDist = Math.hypot(faceDx, faceDy) || 1;
            target.dx = faceDx / fDist;
            target.dy = faceDy / fDist;
            target.moveWithAnim(target.dx * 18 * dt, target.dy * 18 * dt, obstacles, mapW, mapH, dt);
            return;
        }

        // State: 'flee' (Smooth curve fleeing at 195 px/s - player at 320 px/s CAN easily catch up!)
        let fx = 0;
        let fy = 0;

        const pdx = target.x - player.x;
        const pdy = target.y - player.y;
        const pDist = Math.hypot(pdx, pdy) || 1;
        fx += (pdx / pDist) * 1.5;
        fy += (pdy / pDist) * 1.5;

        // Playful weaving angle
        if (Math.random() < 0.05) {
            target.wanderAngle = (target.wanderAngle || 0) + (Math.random() - 0.5) * 1.2;
        }
        fx += Math.cos(target.wanderAngle || 0) * 0.8;
        fy += Math.sin(target.wanderAngle || 0) * 0.8;

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
                    const tan1X = -normY, tan1Y = normX;
                    const tan2X = normY, tan2Y = -normX;
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

        // Repel from borders
        if (target.x < 240) fx += 4.0;
        if (target.x > mapW - 750) fx -= 4.0;
        if (target.y < 240) fy += 4.0;
        if (target.y > mapH - 320) fy -= 4.0;

        const fLen = Math.hypot(fx, fy);
        if (fLen > 0) {
            fx /= fLen;
            fy /= fLen;
        }

        const baseSpeed = 195; // Walkable & catchable!
        target.applyTerrain(obstacles);
        target.moveWithAnim(fx * baseSpeed * target.terrainModifier * dt, fy * baseSpeed * target.terrainModifier * dt, obstacles, mapW, mapH, dt);
    }

    updateSakhasHoliAi(sakhas, activeTargets, obstacles, mapW, mapH, dt) {
        if (activeTargets.length === 0) return;

        sakhas.forEach((s, idx) => {
            const preferredTarget = activeTargets[idx % activeTargets.length];
            const dx = preferredTarget.x - s.x;
            const dy = preferredTarget.y - s.y;
            const dist = Math.hypot(dx, dy);

            // Follow target at comfortable perimeter
            if (dist > 220) {
                let sx = dx / dist;
                let sy = dy / dist;

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
                s.moveWithAnim(sx * 190 * s.terrainModifier * dt, sy * 190 * s.terrainModifier * dt, obstacles, mapW, mapH, dt);
            }

            // Shoot Pichkari colors occasionally
            this.sakhaShootCooldowns[idx] -= dt;
            if (this.sakhaShootCooldowns[idx] <= 0 && dist < 480) {
                const colors = ['#a855f7', '#ec4899', '#10b981', '#3b82f6'];
                const color = colors[idx % colors.length];
                this.shoot(s.x, s.y, preferredTarget.x + (Math.random() - 0.5) * 40, preferredTarget.y + (Math.random() - 0.5) * 40, color, false, 'player');
                this.sakhaShootCooldowns[idx] = 2.4 + Math.random() * 1.8;
            }
        });
    }

    draw(ctx) {
        if (!this.isActive) return;

        // 1. Draw Projectiles
        for (const p of this.projectiles) {
            p.draw(ctx);
        }

        // 2. Draw Soft Lotus Crosshair at Mouse Position for Aiming
        const mouse = this.game.input.mouse;
        if (mouse) {
            ctx.save();
            ctx.translate(mouse.worldX, mouse.worldY);
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';
            ctx.lineWidth = 1.5;

            // Reticle outer ring
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.stroke();

            // 4 floral crosshair notches
            ctx.beginPath();
            ctx.moveTo(0, -18); ctx.lineTo(0, -9);
            ctx.moveTo(0, 18);  ctx.lineTo(0, 9);
            ctx.moveTo(-18, 0); ctx.lineTo(-9, 0);
            ctx.moveTo(18, 0);  ctx.lineTo(9, 0);
            ctx.stroke();

            ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // 3. Draw Player Invulnerability Flash Shield
        if (this.playerIFrameTimer > 0) {
            const p = this.game.player;
            ctx.save();
            ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + Math.sin(this.playerIFrameTimer * 18) * 0.35})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}
