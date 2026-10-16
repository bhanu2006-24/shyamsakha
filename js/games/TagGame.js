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

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const map = this.game.mapManager.currentMap;
        const cx = map.centerX;
        const cy = map.centerY;

        // Player & Sakhas start at the central gathering meadow
        player.x = cx;
        player.y = cy + 140;

        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.x = player.x + ((idx % 4) - 1.5) * 80;
            s.y = player.y + 60 + Math.floor(idx / 4) * 45;
            s.currentSpeed = 260;
        });

        // Krishna & Dao Balram get a grand head start in scenic groves!
        krishna.x = cx + 380;
        krishna.y = cy - 280;
        krishna.isCaught = false;
        krishna.currentSpeed = 380; // Divine agile speed!

        balram.x = cx - 420;
        balram.y = cy - 220;
        balram.isCaught = false;
        balram.currentSpeed = 360; // Powerful stride!

        this.krishnaAi = { state: 'flee', timer: 3.0, stuckTimer: 0, lastX: krishna.x, lastY: krishna.y };
        this.balramAi = { state: 'flee', timer: 3.5, stuckTimer: 0, lastX: balram.x, lastY: balram.y };

        this.game.ui.showToast("🏃‍♂️ Kanha & Dao Balram took off into the groves! Sprint with Shift and follow the pointers (🦚, 🌾)!", 5000);
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

        // 1. Check if PLAYER tags Krishna (Only the player's tag wins!)
        if (!krishna.isCaught && Math.hypot(player.x - krishna.x, player.y - krishna.y) < player.radius + krishna.radius + 16) {
            krishna.isCaught = true;
            this.game.particles.createPetals(krishna.x, krishna.y, '#38bdf8', 55);
            this.game.sound.playCheer();
            this.game.ui.showToast("🌟 YOU tagged Shree Krishna! 🦚 Now sprint to catch Dao Balram!");
        }

        // 2. Check if PLAYER tags Dao Balram
        if (!balram.isCaught && Math.hypot(player.x - balram.x, player.y - balram.y) < player.radius + balram.radius + 16) {
            balram.isCaught = true;
            this.game.particles.createPetals(balram.x, balram.y, '#f8fafc', 55);
            this.game.sound.playCheer();
            this.game.ui.showToast("🌟 YOU tagged Dao Balram! Mighty sprint! 🌾");
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
        const isNearBorder = (target.x < 360 || target.x > mapW - 780 || target.y < 360 || target.y > mapH - 360);
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

                // When Sakha reaches target: Krishna & Balram do an acrobatic Divine Evasion Leap!
                // Sakha does NOT prematurely end the game!
                if (canSee && dist < s.radius + activeTarget.radius + 18) {
                    activeTarget.vz = 340; // Leap into air over Sakha!
                    this.game.particles.createSparkle(activeTarget.x, activeTarget.y, activeTarget === krishna ? '#38bdf8' : '#facc15');
                    s.moveWithAnim(-fdx * 25, -fdy * 25, obstacles, mapW, mapH, dt);

                    if (Math.random() < 0.15) {
                        const quotes = activeTarget === krishna
                            ? [`Aha ${s.name || 'Sudama'}! Almost had me! 🦚`, "You'll have to leap higher, Sakha! 🦚"]
                            : [`Ho ho, nice try ${s.name || 'Subal'}! 🌾`, "Catch me if you can! 🌾"];
                        this.game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)]);
                    }
                }
            }
        });
    }
}
