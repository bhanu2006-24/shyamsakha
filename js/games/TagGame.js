import { checkLineOfSight } from '../entities/ParticleSystem.js';

/**
 * TagGame (पकड़ पकड़ाई - Pakad Pakdai)
 * Grand Pastoral Chase: Pursue the divine, agile Krishna & Dao Balaram across Vrindavan!
 */
export class TagGame {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.gameTime = 0;
        this.krishnaAi = { state: 'flee', timer: 3.0, stuckTimer: 0, lastX: 0, lastY: 0, borderBoostTimer: 0, escapeCooldown: 0, smokeCooldown: 8.0 };
        this.balramAi = { state: 'flee', timer: 2.5, stuckTimer: 0, lastX: 0, lastY: 0, borderBoostTimer: 0, escapeCooldown: 0, smokeCooldown: 10.0 };
    }

    start() {
        this.isActive = true;
        this.gameTime = 0;
        this.tagGraceTimer = 3.5; // 3.5 second immunity grace period so Krishna & Balram can scatter!

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const obstacles = this.game.mapManager.getObstacles();

        // 1. Organic Head-Start Scatter: Krishna and Balram immediately surge into the groves!
        // Krishna vaults North-West into the Kadamba groves
        krishna.x = player.x - 280;
        krishna.y = player.y - 200;
        krishna.vz = 420;
        krishna.z = 25;
        krishna.isCaught = false;
        krishna.currentSpeed = 390;

        // Balram charges North-East into the pastures
        balram.x = player.x + 280;
        balram.y = player.y - 180;
        balram.vz = 360;
        balram.z = 20;
        balram.isCaught = false;
        balram.currentSpeed = 370;

        // Visual and audio scatter effects
        this.game.particles.createSparkle(krishna.x, krishna.y, '#38bdf8', 35);
        this.game.particles.createDust(balram.x, balram.y, '#facc15', 30);
        this.game.particles.createSmokescreen(player.x, player.y - 40, '#fef08a', 120, 2.8);

        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.currentSpeed = 260;
        });

        this.krishnaAi = { state: 'flee', timer: 3.5, stuckTimer: 0, lastX: krishna.x, lastY: krishna.y };
        this.balramAi = { state: 'flee', timer: 3.5, stuckTimer: 0, lastX: balram.x, lastY: balram.y };

        this.game.ui.showToast("🏃‍♂️ 3... 2... 1... Kanha & Dao Balram took off! Sprint with SHIFT to chase them! (Follow 🦚 & 🌾)", 4500);
        this.game.sound.playCheer();
    }

    update(dt) {
        if (!this.isActive) return;
        this.gameTime += dt;

        if (this.tagGraceTimer > 0) {
            this.tagGraceTimer -= dt;
        }

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakhas = this.game.sakhas;
        const obstacles = this.game.mapManager.getObstacles();
        const mapW = this.game.mapManager.getWidth();
        const mapH = this.game.mapManager.getHeight();

        // Tags only register AFTER the head-start grace period expires!
        if (this.tagGraceTimer <= 0) {
            // 1. Check if PLAYER tags Krishna (Only the player's tag wins!)
            const kDist = Math.hypot(player.x - krishna.x, player.y - krishna.y);
            if (!krishna.isCaught && kDist < player.radius + krishna.radius + 26 && (krishna.z || 0) < 60) {
                krishna.isCaught = true;
                this.game.particles.createPetals(krishna.x, krishna.y, '#38bdf8', 55);
                this.game.sound.playCheer();
                this.game.ui.showToast("🌟 YOU tagged Shree Krishna! 🦚 Now sprint to catch Dao Balram!", 4000);
            }

            // 2. Check if PLAYER tags Dao Balram
            const bDist = Math.hypot(player.x - balram.x, player.y - balram.y);
            if (!balram.isCaught && bDist < player.radius + balram.radius + 26 && (balram.z || 0) < 60) {
                balram.isCaught = true;
                this.game.particles.createPetals(balram.x, balram.y, '#f8fafc', 55);
                this.game.sound.playCheer();
                this.game.ui.showToast("🌟 YOU tagged Dao Balram! Mighty sprint! 🌾", 4000);
            }
        }

        // 3. Smart & Agile AI for Targets (Krishna & Dao Balram)
        this.updateTargetAi(krishna, this.krishnaAi, player, sakhas, obstacles, mapW, mapH, dt, 'krishna');
        this.updateTargetAi(balram, this.balramAi, player, sakhas, obstacles, mapW, mapH, dt, 'balram');

        // 4. Smart Flanking AI for Sakha Friends (Sakhas corral & distract, but do not steal your kill)
        this.updateSakhasAi(sakhas, krishna, balram, obstacles, mapW, mapH, dt);

        // 5. Win condition
        if (krishna.isCaught && balram.isCaught) {
            this.isActive = false;
            this.game.sound.playCheer();
            this.game.endGame(true, `Glorious Victory! You caught both Shree Krishna & Dao Balram in ${this.gameTime.toFixed(1)} seconds! 🌸`);
        }
    }

    updateTargetAi(target, ai, player, sakhas, obstacles, mapW, mapH, dt, type) {
        if (target.isCaught) return;

        ai.timer -= dt;
        if (ai.escapeCooldown > 0) ai.escapeCooldown -= dt;
        if (ai.borderBoostTimer > 0) ai.borderBoostTimer -= dt;
        if (ai.smokeCooldown > 0) ai.smokeCooldown -= dt;
        if (target.evasionCooldown > 0) target.evasionCooldown -= dt;

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
        const curMap = this.game.mapManager.currentMap;
        const cx = curMap ? curMap.centerX : mapW / 2;
        const cy = curMap ? curMap.centerY : mapH / 2;

        // 1. Divine Border Escape Vault & Massive Speed Boost (User request!)
        // If cornered or stuck near any map border, Krishna or Balram perform a massive acrobatic vault
        // high in the air and surge with 2.2x speed directly back into the open pastures!
        const isNearBorder = (target.x < 550 || target.x > mapW - 1050 || target.y < 550 || target.y > mapH - 550);
        const isCornered = isNearBorder && (distToPlayer < 260 || ai.stuckTimer > 0.16);

        if (isCornered && (ai.escapeCooldown || 0) <= 0) {
            target.vz = 580; // Massive leap high above obstacles and pursuers!
            target.z = 5;
            ai.borderBoostTimer = 2.4; // 2.4s of supercharged surge!
            ai.escapeCooldown = 5.5;
            ai.stuckTimer = 0;

            // Drop a billowing Godhuli Smokescreen right at the vault point
            this.game.particles.createSmokescreen(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#fde047', 150, 4.0);
            this.game.sound.playFluteNote(type === 'krishna' ? 783.99 : 523.25, 0.4);
            this.game.particles.createSparkle(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#facc15', 35);

            if (type === 'krishna') {
                this.game.ui.showToast("🦚 Kanha kicks up a Godhuli dust screen and vaults high over the groves back into the pastures!");
            } else {
                this.game.ui.showToast("🌾 Dao Balram strikes the earth, raising a dust whirlwind and surging back to the glades!");
            }
        }

        // 2. Sneak Godhuli Dust Smokescreen during open-field chases
        if (distToPlayer < 140 && (ai.smokeCooldown || 0) <= 0) {
            ai.smokeCooldown = 12.0 + Math.random() * 4.0;
            this.game.particles.createSmokescreen(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#fde047', 135, 3.5);
            const quotes = type === 'krishna' 
                ? ["Haha! Can you catch Me in the Godhuli dust? 🦚💨", "Lost sight of Kanha in the sacred dust! 🦚"]
                : ["Keep your eyes open, little brother! 🌾💨", "Swift as the summer wind! 🌾"];
            this.game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)], 3000);
        }

        // State Machine
        if (ai.timer <= 0) {
            if (ai.state === 'tease') {
                ai.state = 'flee';
                ai.timer = 3.0 + Math.random() * 2.0;
            } else if (distToPlayer > 240 && Math.random() < 0.6) {
                // Pause and tease, giving the player a prime chance to catch up!
                ai.state = 'tease';
                ai.timer = 1.4 + Math.random() * 0.8;
                const quotes = type === 'krishna' 
                    ? ["Haha! Catch me if you can, Sakha! 🦚", "You'll have to sprint with Shift! 🦚", "Look at Dao Dada run! 🦚"]
                    : ["Ho ho! Sprint faster, little brother! 🌾", "Keep your stamina up! 🌾", "Glorious chase! 🌾"];
                this.game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)]);
                this.game.particles.createSparkle(target.x, target.y, type === 'krishna' ? '#38bdf8' : '#facc15');
            } else {
                ai.state = 'flee';
                ai.timer = 2.5 + Math.random() * 2.0;
            }
        }

        // Tease state: Face player playfully
        if (ai.state === 'tease') {
            const faceDx = player.x - target.x;
            const faceDy = player.y - target.y;
            const fDist = Math.hypot(faceDx, faceDy) || 1;
            target.dx = faceDx / fDist;
            target.dy = faceDy / fDist;
            target.moveWithAnim(target.dx * 25 * dt, target.dy * 25 * dt, obstacles, mapW, mapH, dt);
            return;
        }

        // Flee state: Agile curved running
        let fx = 0;
        let fy = 0;

        // If in Divine Border Boost, surge directly towards the central open pastures!
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

            // Dynamic weaving angle
            if (Math.random() < 0.05) {
                target.wanderAngle = (target.wanderAngle || 0) + (Math.random() - 0.5) * 1.2;
            }
            fx += Math.cos(target.wanderAngle || 0) * 0.8;
            fy += Math.sin(target.wanderAngle || 0) * 0.8;

            // Tangent glide obstacle avoidance (Zero sticking!)
            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
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

    updateSakhasAi(sakhas, krishna, balram, obstacles, mapW, mapH, dt) {
        sakhas.forEach((s, idx) => {
            const activeTarget = (idx % 2 === 0 && !krishna.isCaught) ? krishna : (!balram.isCaught ? balram : krishna);
            if (!activeTarget || activeTarget.isCaught) return;

            s.updateDynamicSpeed(dt);

            // 1. Check if Sakha is caught inside an active Godhuli dust cloud
            if (this.game.particles.isPointInsideSmoke(s.x, s.y)) {
                s.blindedTimer = 2.2;
            }

            if (s.blindedTimer > 0) {
                s.blindedTimer -= dt;
                s.wanderAngle = (s.wanderAngle || 0) + (Math.random() - 0.5) * 1.8;
                s.applyTerrain(obstacles);
                s.moveWithAnim(Math.cos(s.wanderAngle) * 35 * dt, Math.sin(s.wanderAngle) * 35 * dt, obstacles, mapW, mapH, dt);
                return; // Blinded by Godhuli dust! Cannot track!
            }

            // 2. Realistic Line of Sight check (blocked by trees, bushes, and dust clouds)
            const canSee = checkLineOfSight(s.x, s.y, activeTarget.x, activeTarget.y, obstacles, this.game.particles, 600);

            if (canSee) {
                if (s.aiState === 'searching') {
                    if (Math.random() < 0.15) {
                        this.game.ui.showToast(`👀 ${s.name}: "There is Kanha! Sprinting by the Kadamba grove!" 🦚`, 2500);
                    }
                }
                s.aiState = 'pursuing';
                s.lastSeenX = activeTarget.x;
                s.lastSeenY = activeTarget.y;
            } else {
                // Target broke line-of-sight!
                if (s.aiState === 'pursuing') {
                    s.aiState = 'investigating_last_seen';
                }
            }

            // Determine tracking target based on perception state
            let destX = activeTarget.x;
            let destY = activeTarget.y;

            if (s.aiState === 'investigating_last_seen') {
                destX = s.lastSeenX || activeTarget.x;
                destY = s.lastSeenY || activeTarget.y;
                const dLastSeen = Math.hypot(s.x - destX, s.y - destY);
                if (dLastSeen < 45) {
                    // Arrived at last seen spot and target is gone!
                    s.aiState = 'searching';
                    s.searchTimer = 2.8 + Math.random() * 1.5;
                    s.searchAngle = Math.random() * Math.PI * 2;
                    if (Math.random() < 0.25) {
                        this.game.ui.showToast(`❓ ${s.name} looks around: "Kanha vanished into the grove! Where did He sneak off to?" 🦚`, 3000);
                    }
                }
            } else if (s.aiState === 'searching') {
                s.searchTimer = (s.searchTimer || 0) - dt;
                s.searchAngle = (s.searchAngle || 0) + dt * 2.8;
                s.applyTerrain(obstacles);
                s.moveWithAnim(Math.cos(s.searchAngle) * 35 * dt, Math.sin(s.searchAngle) * 35 * dt, obstacles, mapW, mapH, dt);
                if (s.searchTimer <= 0) {
                    s.aiState = 'wander';
                    s.lastSeenX = null;
                    s.lastSeenY = null;
                }
                return;
            }

            const dx = destX - s.x;
            const dy = destY - s.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                // Flanking spread arc
                const spreadAngle = ((idx % 4) - 1.5) * 0.45;
                const cosA = Math.cos(spreadAngle);
                const sinA = Math.sin(spreadAngle);
                const fdx = (dx / dist) * cosA - (dy / dist) * sinA;
                const fdy = (dx / dist) * sinA + (dy / dist) * cosA;

                let sx = fdx;
                let sy = fdy;

                for (let i = 0; i < obstacles.length; i++) {
                    const obs = obstacles[i];
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
                        const push = ((54 - osDist) / 54) * 3.2;
                        sx += (osdx / osDist) * push;
                        sy += (osdy / osDist) * push;
                    }
                }

                const sLen = Math.hypot(sx, sy);
                if (sLen > 0) { sx /= sLen; sy /= sLen; }

                s.applyTerrain(obstacles);
                s.moveWithAnim(sx * s.currentSpeed * s.terrainModifier * dt, sy * s.currentSpeed * s.terrainModifier * dt, obstacles, mapW, mapH, dt);

                // When Sakha reaches target: Krishna & Balram do an acrobatic Divine Evasion Leap (with cooldown)!
                // Sakha does NOT prematurely end the game!
                if (canSee && dist < s.radius + activeTarget.radius + 18) {
                    if ((activeTarget.evasionCooldown || 0) <= 0) {
                        activeTarget.vz = 340; // Leap into air over Sakha!
                        activeTarget.evasionCooldown = 3.8;
                        this.game.particles.createSparkle(activeTarget.x, activeTarget.y, activeTarget === krishna ? '#38bdf8' : '#facc15');
                        if (Math.random() < 0.25) {
                            const quotes = activeTarget === krishna
                                ? [`Aha ${s.name || 'Sudama'}! Almost had me! 🦚`, "You'll have to leap higher, Sakha! 🦚"]
                                : [`Ho ho, nice try ${s.name || 'Subal'}! 🌾`, "Catch me if you can! 🌾"];
                            this.game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)], 2500);
                        }
                    }
                    s.moveWithAnim(-fdx * 30, -fdy * 30, obstacles, mapW, mapH, dt);
                }
            }
        });
    }
}
