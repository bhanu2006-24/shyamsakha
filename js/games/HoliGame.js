import { checkLineOfSight } from '../entities/ParticleSystem.js';

/**
 * HoliGame (होली उत्सव - Rangotsav Pichkari & Color Fight)
 * Grand Vrindavan Color Battle: Agile, powerful Krishna & Dao Balram vs Player & Sakhas
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
        ctx.globalAlpha = 0.5;
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
        this.maxSplashes = 5; // 5 soak points for divine targets!
        this.playerMaxSplashes = 4;
        this.playerIFrameTimer = 0;
        this.krishnaAi = { state: 'flee', timer: 2.5, stuckTimer: 0, lastX: 0, lastY: 0, bombCooldown: 2.2, telegraphTimer: 0 };
        this.balramAi = { state: 'flee', timer: 3.0, stuckTimer: 0, lastX: 0, lastY: 0, bombCooldown: 2.8, telegraphTimer: 0 };
        this.sakhaShootCooldowns = [];
        this.krishnaSakhaHits = 0;
        this.balramSakhaHits = 0;
    }

    start() {
        this.isActive = true;
        this.projectiles = [];
        this.playerSplashes = 0;
        this.krishnaSplashes = 0;
        this.balramSplashes = 0;
        this.krishnaSakhaHits = 0;
        this.balramSakhaHits = 0;
        this.playerIFrameTimer = 0;

        const p = this.game.player;
        const k = this.game.krishna;
        const b = this.game.balram;
        const map = this.game.mapManager.currentMap;
        const cx = map.centerX;
        const cy = map.centerY;

        k.isCaught = false;
        b.isCaught = false;
        p.isCaught = false;

        // Organic Start: Characters play from wherever they currently are in Vrindavan!
        k.currentSpeed = 350; // Divine agile speed!
        b.currentSpeed = 330;

        this.krishnaAi = { state: 'flee', timer: 2.5, stuckTimer: 0, lastX: k.x, lastY: k.y, bombCooldown: 2.2, telegraphTimer: 0 };
        this.balramAi = { state: 'flee', timer: 3.0, stuckTimer: 0, lastX: b.x, lastY: b.y, bombCooldown: 2.8, telegraphTimer: 0 };

        this.sakhaShootCooldowns = [];
        this.game.sakhas.forEach((s) => {
            s.isCaught = false;
            this.sakhaShootCooldowns.push(1.5 + Math.random() * 2.0);
            s.currentSpeed = 260;
        });

        this.updateHoliStatusUI();
        this.game.ui.showToast("💦 Rangotsav has begun! Kanha & Dao Balram took the high ground! Aim and shoot! 🌈", 5000);
        this.game.sound.playSplash();
    }

    updateHoliStatusUI() {
        const pHearts = '💖'.repeat(Math.max(0, this.playerMaxSplashes - this.playerSplashes));
        const kHearts = '🦚'.repeat(Math.max(0, this.maxSplashes - this.krishnaSplashes));
        const bHearts = '🌾'.repeat(Math.max(0, this.maxSplashes - this.balramSplashes));
        this.game.ui.setPhase(`You [${pHearts || '❌'}] | Kanha [${kHearts || '✔'}] | Balram [${bHearts || '✔'}]`, "tag-playing");
    }

    shoot(fromX, fromY, toX, toY, color = '#ec4899', isBomb = false, team = 'player') {
        const p = new Projectile(fromX, fromY, toX, toY, isBomb ? 600 : 850, color, isBomb, team);
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

            if (this.game.input.wasJustPressed(' ') && (!mouse.isDown && Math.hypot(targetX - player.x, targetY - player.y) < 10)) {
                targetX = player.x + (player.dx || 1) * 350;
                targetY = player.y + (player.dy || 0) * 350;
            }

            const colors = ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24'];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];
            this.shoot(player.x, player.y, targetX, targetY, chosenColor, false, 'player');
            this.shootCooldown = 0.26;
        }

        const activeTargets = [krishna, balram].filter(t => !t.isCaught);
        const activePursuers = [player, ...sakhas].filter(p => !p.isCaught);

        // 2. Playful & Agile Target AI (Krishna & Dao Balram)
        this.updateHoliTargetAi(krishna, this.krishnaAi, player, sakhas, obstacles, mapW, mapH, dt, 'krishna');
        this.updateHoliTargetAi(balram, this.balramAi, player, sakhas, obstacles, mapW, mapH, dt, 'balram');

        // 3. Sakhas Pichkari AI (Support team)
        this.updateSakhasHoliAi(sakhas, activeTargets, obstacles, mapW, mapH, dt);

        // 4. Projectile Physics & Collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt);

            let hit = false;

            // Tree Trunk Collisions (Cover behind trees with fast bounding-box skip!)
            for (let j = 0; j < obstacles.length; j++) {
                const obs = obstacles[j];
                if (obs.shape === 'circle' && (obs.type === 'tree' || obs.type === 'kadamba')) {
                    if (Math.abs(p.x - obs.x) > 120 || Math.abs(p.y - obs.y) > 120) continue;
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
                for (const t of activeTargets) {
                    if (Math.hypot(p.x - t.x, p.y - t.y) < t.radius + p.radius) {
                        this.game.particles.createPetals(t.x, t.y, p.color, 45);
                        this.game.sound.playSplash();
                        hit = true;

                        if (t === krishna) {
                            this.krishnaSplashes++;
                            if (this.krishnaSplashes >= this.maxSplashes) {
                                krishna.isCaught = true;
                                this.game.sound.playCheer();
                                this.game.ui.showToast("🦚 Kanha is fully drenched in joyous Vrindavan colors!");
                            } else {
                                this.game.ui.showToast(`Direct hit on Krishna! (${this.krishnaSplashes}/${this.maxSplashes}) 🦚`);
                            }
                        } else if (t === balram) {
                            this.balramSplashes++;
                            if (this.balramSplashes >= this.maxSplashes) {
                                balram.isCaught = true;
                                this.game.sound.playCheer();
                                this.game.ui.showToast("🌾 Dao Balram is fully drenched in joyful colors!");
                            } else {
                                this.game.ui.showToast(`Direct hit on Dao Balram! (${this.balramSplashes}/${this.maxSplashes}) 🌾`);
                            }
                        }
                        this.updateHoliStatusUI();
                        break;
                    }
                }
            } else if (!hit && p.team === 'krishna') {
                for (const s of activePursuers) {
                    if (Math.hypot(p.x - s.x, p.y - s.y) < s.radius + p.radius) {
                        this.game.particles.createPetals(s.x, s.y, p.color, 35);
                        this.game.sound.playSplash();
                        hit = true;

                        if (s === player && this.playerIFrameTimer <= 0) {
                            this.playerSplashes++;
                            this.playerIFrameTimer = 1.4; // 1.4s invulnerability so player can dodge!
                            if (this.playerSplashes >= this.playerMaxSplashes) {
                                this.isActive = false;
                                this.updateHoliStatusUI();
                                this.game.endGame(false, "You got completely soaked by Krishna & Dao Balram's Gulal colors! 🌈");
                            } else {
                                this.game.ui.showToast(`Splashed by Gulal! (${this.playerSplashes}/${this.playerMaxSplashes}) 💦`);
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
                ai.timer = 3.0 + Math.random() * 2.0;
            } else if (distToPlayer > 220 && Math.random() < 0.6) {
                // Pause and tease, giving player a window to shoot!
                ai.state = 'tease';
                ai.timer = 1.2 + Math.random() * 0.6;
                this.game.particles.createSparkle(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#facc15');
            } else {
                ai.state = 'flee';
                ai.timer = 2.5 + Math.random() * 2.0;
            }
        }

        // Powerful Shooting with Telegraph
        if (ai.bombCooldown <= 0 && distToPlayer < 700) {
            ai.telegraphTimer = 0.45;
            ai.bombCooldown = 2.8 + Math.random() * 1.0;
        }

        if (ai.telegraphTimer > 0) {
            ai.telegraphTimer -= dt;
            this.game.particles.createSparkle(target.x, target.y - 15, type === 'krishna' ? '#38bdf8' : '#facc15');
            if (ai.telegraphTimer <= 0) {
                const color = type === 'krishna' ? '#38bdf8' : '#facc15';
                // Krishna occasionally fires Tri-Gulal wave!
                if (type === 'krishna' && Math.random() < 0.35) {
                    this.shoot(target.x, target.y, player.x, player.y, color, true, 'krishna');
                    this.shoot(target.x, target.y, player.x - 60, player.y - 40, '#a855f7', false, 'krishna');
                    this.shoot(target.x, target.y, player.x + 60, player.y + 40, '#ec4899', false, 'krishna');
                } else {
                    this.shoot(target.x, target.y, player.x, player.y, color, true, 'krishna');
                }
            }
        }

        // Movement Execution
        if (ai.state === 'tease') {
            const faceDx = player.x - target.x;
            const faceDy = player.y - target.y;
            const fDist = Math.hypot(faceDx, faceDy) || 1;
            target.dx = faceDx / fDist;
            target.dy = faceDy / fDist;
            target.moveWithAnim(target.dx * 20 * dt, target.dy * 20 * dt, obstacles, mapW, mapH, dt);
            return;
        }

        // 1. Divine Border Escape Vault & Massive Speed Boost
        if (ai.escapeCooldown > 0) ai.escapeCooldown -= dt;
        if (ai.borderBoostTimer > 0) ai.borderBoostTimer -= dt;
        if (ai.smokeCooldown > 0) ai.smokeCooldown -= dt;

        const curMap = this.game.mapManager.currentMap;
        const cx = curMap ? curMap.centerX : mapW / 2;
        const cy = curMap ? curMap.centerY : mapH / 2;

        const isNearBorder = (target.x < 550 || target.x > mapW - 1050 || target.y < 550 || target.y > mapH - 550);
        const isCornered = isNearBorder && (distToPlayer < 260 || ai.stuckTimer > 0.16);

        if (isCornered && (ai.escapeCooldown || 0) <= 0) {
            target.vz = 580; // Massive leap high above obstacles!
            target.z = 5;
            ai.borderBoostTimer = 2.4;
            ai.escapeCooldown = 5.5;
            ai.stuckTimer = 0;

            this.game.particles.createSmokescreen(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#fde047', 150, 4.0);
            this.game.sound.playFluteNote(type === 'krishna' ? 783.99 : 523.25, 0.4);
            this.game.particles.createSparkle(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#facc15', 35);

            if (type === 'krishna') {
                this.game.ui.showToast("🦚 Kanha kicks up a Godhuli Gulal whirlwind and vaults high over the groves back into the pastures!");
            } else {
                this.game.ui.showToast("🌾 Dao Balram strikes the earth, raising a dust whirlwind and surging back to the glades!");
            }
        }

        // 2. Sneak Godhuli Dust Smokescreen during open-field battles
        if (distToPlayer < 140 && (ai.smokeCooldown || 0) <= 0) {
            ai.smokeCooldown = 12.0 + Math.random() * 4.0;
            this.game.particles.createSmokescreen(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#fde047', 135, 3.5);
            const quotes = type === 'krishna'
                ? ["Haha! Blinded in the sacred Godhuli cloud! 🦚💨", "Can you find Kanha in the colors? 🦚"]
                : ["Stay alert in the Rangotsav mist! 🌾💨", "Swift as the summer wind! 🌾"];
            this.game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)], 3000);
        }

        // Agile Fleeing
        let fx = 0;
        let fy = 0;

        if (ai.borderBoostTimer > 0) {
            const toCx = cx - target.x;
            const toCy = cy - target.y;
            const cLen = Math.hypot(toCx, toCy) || 1;
            fx = toCx / cLen;
            fy = toCy / cLen;
        } else {
            const pdx = target.x - player.x;
            const pdy = target.y - player.y;
            const pDist = Math.hypot(pdx, pdy) || 1;
            fx += (pdx / pDist) * 1.8;
            fy += (pdy / pDist) * 1.8;

            if (Math.random() < 0.05) {
                target.wanderAngle = (target.wanderAngle || 0) + (Math.random() - 0.5) * 1.2;
            }
            fx += Math.cos(target.wanderAngle || 0) * 0.8;
            fy += Math.sin(target.wanderAngle || 0) * 0.8;

            // Smooth obstacle gliding with fast bounding-box filter
            for (let j = 0; j < obstacles.length; j++) {
                const obs = obstacles[j];
                if (obs.shape === 'circle') {
                    if (Math.abs(target.x - obs.x) > 180 || Math.abs(target.y - obs.y) > 180) continue;
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

                        const pushFactor = Math.pow((safeZone - oDist) / safeZone, 2) * 5.0;
                        fx += (normX * 1.5 + bestTanX * 2.8) * pushFactor;
                        fy += (normY * 1.5 + bestTanY * 2.8) * pushFactor;
                    }
                } else if (obs.type === 'river') {
                    if (target.x > obs.x - 80) fx -= 6.0;
                }
            }

            // Smooth Sacred Parikrama loop around borders (zero edge sticking!)
            if (curMap && curMap.getBoundaryFlowVector) {
                const bFlow = curMap.getBoundaryFlowVector(target.x, target.y);
                fx += bFlow.x;
                fy += bFlow.y;
            } else {
                if (target.x < 240) fx += 4.5;
                if (target.x > mapW - 750) fx -= 4.5;
                if (target.y < 240) fy += 4.5;
                if (target.y > mapH - 320) fy -= 4.5;
            }
        }

        const fLen = Math.hypot(fx, fy);
        if (fLen > 0) {
            fx /= fLen;
            fy /= fLen;
        }

        // Dynamic Second-by-Second Speed (Unpredictable, lively stride cadences!)
        target.updateDynamicSpeed(dt);
        target.applyTerrain(obstacles);
        const boostMult = ai.borderBoostTimer > 0 ? 2.15 : 1.0;
        const actualSpeed = target.currentSpeed * target.terrainModifier * boostMult;
        target.moveWithAnim(fx * actualSpeed * dt, fy * actualSpeed * dt, obstacles, mapW, mapH, dt);
    }

    updateSakhasHoliAi(sakhas, activeTargets, obstacles, mapW, mapH, dt) {
        if (activeTargets.length === 0) return;

        sakhas.forEach((s, idx) => {
            s.updateDynamicSpeed(dt);
            const preferredTarget = activeTargets[idx % activeTargets.length];

            // 1. Check if Sakha is caught inside an active Godhuli dust cloud
            if (this.game.particles.isPointInsideSmoke(s.x, s.y)) {
                s.blindedTimer = 2.2;
            }

            if (s.blindedTimer > 0) {
                s.blindedTimer -= dt;
                s.wanderAngle = (s.wanderAngle || 0) + (Math.random() - 0.5) * 1.8;
                s.applyTerrain(obstacles);
                s.moveWithAnim(Math.cos(s.wanderAngle) * 35 * dt, Math.sin(s.wanderAngle) * 35 * dt, obstacles, mapW, mapH, dt);
                return; // Blinded by dust! Cannot track or aim!
            }

            // 2. Line of sight check (blocked by trees, bushes, and dust clouds)
            const canSee = checkLineOfSight(s.x, s.y, preferredTarget.x, preferredTarget.y, obstacles, this.game.particles, 580);

            let destX = preferredTarget.x;
            let destY = preferredTarget.y;

            if (canSee) {
                s.lastSeenX = preferredTarget.x;
                s.lastSeenY = preferredTarget.y;
            } else {
                destX = s.lastSeenX || preferredTarget.x;
                destY = s.lastSeenY || preferredTarget.y;
            }

            const dx = destX - s.x;
            const dy = destY - s.y;
            const dist = Math.hypot(dx, dy);

            // Follow target at comfortable perimeter
            if (dist > 250) {
                let sx = dx / dist;
                let sy = dy / dist;

                for (let k = 0; k < obstacles.length; k++) {
                    const obs = obstacles[k];
                    if (obs.shape === 'circle' && obs.type !== 'flower_carpet') {
                        if (Math.abs(s.x - obs.x) > 160 || Math.abs(s.y - obs.y) > 160) continue;
                        const odx = s.x - obs.x;
                        const ody = s.y - obs.y;
                        const oDist = Math.hypot(odx, ody);
                        if (oDist < (obs.radius || 25) + s.radius + 35 && oDist > 0) {
                            sx += (odx / oDist) * 3.0;
                            sy += (ody / oDist) * 3.0;
                        }
                    }
                }

                // Mutual Sakha separation force (prevents clumping / stacking!)
                for (let j = 0; j < sakhas.length; j++) {
                    if (j === idx) continue;
                    const other = sakhas[j];
                    const osdx = s.x - other.x;
                    const osdy = s.y - other.y;
                    const osDist = Math.hypot(osdx, osdy);
                    if (osDist < 54 && osDist > 0) {
                        const push = ((54 - osDist) / 54) * 2.8;
                        sx += (osdx / osDist) * push;
                        sy += (osdy / osDist) * push;
                    }
                }

                const sLen = Math.hypot(sx, sy);
                if (sLen > 0) { sx /= sLen; sy /= sLen; }
                s.applyTerrain(obstacles);
                const sSpeed = s.currentSpeed * 0.72;
                s.moveWithAnim(sx * sSpeed * s.terrainModifier * dt, sy * sSpeed * s.terrainModifier * dt, obstacles, mapW, mapH, dt);
            }

            // Shoot Pichkari colors ONLY if Sakha has clear line of sight! (No psychic wall-hacking!)
            this.sakhaShootCooldowns[idx] -= dt;
            if (canSee && this.sakhaShootCooldowns[idx] <= 0 && dist < 500) {
                const colors = ['#a855f7', '#ec4899', '#10b981', '#3b82f6'];
                const color = colors[idx % colors.length];
                this.shoot(s.x, s.y, preferredTarget.x + (Math.random() - 0.5) * 50, preferredTarget.y + (Math.random() - 0.5) * 50, color, false, 'player');
                this.sakhaShootCooldowns[idx] = 2.8 + Math.random() * 2.0;
            }
        });
    }

    draw(ctx) {
        if (!this.isActive) return;

        // 1. Draw Projectiles
        for (const p of this.projectiles) {
            p.draw(ctx);
        }

        // 2. Aiming Crosshair
        const mouse = this.game.input.mouse;
        if (mouse) {
            ctx.save();
            ctx.translate(mouse.worldX, mouse.worldY);
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.stroke();

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

        // 3. Player Invulnerability Flash Shield
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
