/**
 * RaceGame (गोचारण दौड़ - Dhaavan Spardha / Sacred Footrace)
 * Fast-paced pastoral footrace through Vrindavan's sacred checkpoints:
 * Ancient Kadamba Tree -> Kamal Sarovar -> Flower Carpet -> Yamuna Shore -> Finish Arch!
 * Powered by dynamic second-by-second speed variation for dramatic, unpredictable races.
 */
export class RaceGame {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.countdown = 3.5;
        this.raceTime = 0;
        this.checkpoints = [];
        this.racers = [];
        this.finishedRacers = [];
        this.hudBannerEl = null;
    }

    start() {
        this.isActive = true;
        this.countdown = 3.5;
        this.raceTime = 0;
        this.finishedRacers = [];

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const subal = this.game.sakhas.find(s => s.name === "Subal") || this.game.sakhas[1];
        const sudama = this.game.sakhas.find(s => s.name === "Sudama") || this.game.sakhas[0];

        const startX = player.x;
        const startY = player.y;

        // Racers assemble side-by-side right where the race is started! No global teleport!
        player.isCaught = false;

        krishna.x = startX + 50;
        krishna.y = startY;
        krishna.isCaught = false;

        balram.x = startX + 100;
        balram.y = startY;
        balram.isCaught = false;

        if (subal) {
            subal.x = startX - 50;
            subal.y = startY;
            subal.isCaught = false;
        }

        if (sudama) {
            sudama.x = startX - 100;
            sudama.y = startY;
            sudama.isCaught = false;
        }

        // Available Vrindavan landmark waypoints in the 16000x16000 world
        const allLandmarks = [
            { name: "Ancient Kadamba Glade", hindi: "प्राचीन कदम्ब कुंज", x: 8000, y: 7600, icon: "🌳" },
            { name: "West Mango Orchards", hindi: "आम्र वाटिका", x: 4800, y: 8000, icon: "🥭" },
            { name: "Sacred Kamal Sarovar", hindi: "कमल सरोवर", x: 8000, y: 11600, icon: "🪷" },
            { name: "Yamuna Sandbank Shore", hindi: "यमुना बालुका तट", x: 13200, y: 7720, icon: "🌊" },
            { name: "North Kadamba Groves", hindi: "उत्तरी कदम्ब वन", x: 8000, y: 4200, icon: "🌸" },
            { name: "Govardhan Boulder Foothills", hindi: "गोवर्धन तलहटी", x: 4800, y: 11200, icon: "⛰️" },
            { name: "East Flower Carpet", hindi: "पुष्प वाटिका", x: 10800, y: 8000, icon: "🌼" }
        ];

        // Sort landmarks by distance from start position, select distinct scenic waypoints
        const sorted = allLandmarks
            .map(l => ({ ...l, dist: Math.hypot(l.x - startX, l.y - startY) }))
            .filter(l => l.dist > 350)
            .sort((a, b) => a.dist - b.dist);

        const cp1 = sorted[0] || { name: "Ancient Kadamba Tree", hindi: "प्राचीन कदम्ब", x: startX + 800, y: startY, icon: "🌳" };
        const cp2 = sorted[1] || { name: "Sacred Groves", hindi: "पवित्र कुंज", x: startX, y: startY + 800, icon: "🌸" };
        const cp3 = sorted[2] || { name: "Flower Meadows", hindi: "पुष्प वाटिका", x: startX - 800, y: startY, icon: "🌼" };

        this.checkpoints = [
            { id: 0, name: "Start Line", hindi: "प्रारंभ रेखा", x: startX, y: startY, radius: 95, icon: "🚩" },
            { id: 1, name: cp1.name, hindi: cp1.hindi, x: cp1.x, y: cp1.y, radius: 120, icon: cp1.icon },
            { id: 2, name: cp2.name, hindi: cp2.hindi, x: cp2.x, y: cp2.y, radius: 120, icon: cp2.icon },
            { id: 3, name: cp3.name, hindi: cp3.hindi, x: cp3.x, y: cp3.y, radius: 120, icon: cp3.icon },
            { id: 4, name: "Sacred Torana Finish Arch", hindi: "विजय तोरण (लक्ष्य)", x: startX + 40, y: startY + 40, radius: 100, icon: "🏁" }
        ];

        // Initialize competitors list
        this.racers = [
            { entity: player, name: "You (सखा)", icon: "🏃‍♂️", color: "#ef4444", cpIndex: 1, isPlayer: true, finishRank: null, progress: 0 },
            { entity: krishna, name: "Shree Krishna", icon: "🦚", color: "#38bdf8", cpIndex: 1, isPlayer: false, finishRank: null, progress: 0 },
            { entity: balram, name: "Dao Balaram", icon: "🌾", color: "#f8fafc", cpIndex: 1, isPlayer: false, finishRank: null, progress: 0 }
        ];

        if (subal) {
            this.racers.push({ entity: subal, name: "Subal", icon: "🌿", color: "#f59e0b", cpIndex: 1, isPlayer: false, finishRank: null, progress: 0 });
        }
        if (sudama) {
            this.racers.push({ entity: sudama, name: "Sudama", icon: "🌼", color: "#eab308", cpIndex: 1, isPlayer: false, finishRank: null, progress: 0 });
        }

        this.game.ui.showToast("🏁 Racers to the Starting Line! 3... 2... 1... Sprint with SHIFT!", 4000);
        this.game.sound.playFluteNote(523.25, 0.4);
    }

    update(dt) {
        if (!this.isActive) return;

        // 1. Countdown Phase (3-2-1 GO!)
        if (this.countdown > 0) {
            const prevSec = Math.ceil(this.countdown);
            this.countdown -= dt;
            const curSec = Math.ceil(this.countdown);

            if (curSec !== prevSec && curSec > 0) {
                this.game.sound.playFluteNote(440 + curSec * 80, 0.25);
            }

            if (this.countdown <= 0) {
                this.game.sound.playCheer();
                this.game.ui.showToast("🚀 DHAAAVAT! (GO!) Sprint across the checkpoints! 🌸", 3000);
            }
            return; // Can't move until countdown reaches 0!
        }

        this.raceTime += dt;
        const obstacles = this.game.mapManager.getObstacles();
        const mapW = this.game.mapManager.getWidth();
        const mapH = this.game.mapManager.getHeight();
        const curMap = this.game.mapManager.currentMap;

        // 2. Update Racers & Checkpoints
        for (const racer of this.racers) {
            if (racer.finishRank !== null) continue; // Already crossed finish line

            const targetCp = this.checkpoints[racer.cpIndex];
            if (!targetCp) continue;

            const distToCp = Math.hypot(racer.entity.x - targetCp.x, racer.entity.y - targetCp.y);

            // Compute race progress for live leaderboard
            racer.progress = racer.cpIndex * 1000 - distToCp;

            // Check if racer reached the current target checkpoint
            if (distToCp < targetCp.radius) {
                if (racer.cpIndex === this.checkpoints.length - 1) {
                    // REACHED THE FINISH ARCH!
                    racer.finishRank = this.finishedRacers.length + 1;
                    this.finishedRacers.push(racer);

                    if (racer.isPlayer) {
                        this.game.particles.createPetals(racer.entity.x, racer.entity.y, '#facc15', 50);
                        this.game.sound.playCheer();
                        const rankSuffix = racer.finishRank === 1 ? '1st (First Place! 🥇)' : (racer.finishRank === 2 ? '2nd (Runner Up! 🥈)' : `${racer.finishRank}th Place!`);
                        this.game.ui.showToast(`🏆 YOU FINISHED in ${rankSuffix}! Time: ${this.raceTime.toFixed(1)}s!`);
                        
                        // Trigger victory celebration
                        setTimeout(() => {
                            this.endRace();
                        }, 2200);
                    } else {
                        this.game.particles.createSparkle(racer.entity.x, racer.entity.y, racer.color, 30);
                        this.game.ui.showToast(`🏁 ${racer.name} has crossed the Finish Arch! (${racer.finishRank} Place)`);
                    }
                } else {
                    // Advance to next checkpoint
                    racer.cpIndex++;
                    if (racer.isPlayer) {
                        this.game.particles.createPetals(racer.entity.x, racer.entity.y, '#38bdf8', 25);
                        this.game.sound.playFluteNote(587.33, 0.25);
                        const nextCp = this.checkpoints[racer.cpIndex];
                        this.game.ui.showToast(`🚩 Checkpoint Cleared! Next: ${nextCp.icon} ${nextCp.name}`);
                    }
                }
            }

            // 3. AI Racers Navigation (Krishna, Balram, Subal, Sudama)
            if (!racer.isPlayer && racer.finishRank === null) {
                racer.entity.updateDynamicSpeed(dt);

                const dx = targetCp.x - racer.entity.x;
                const dy = targetCp.y - racer.entity.y;
                const dist = Math.hypot(dx, dy) || 1;

                let fx = dx / dist;
                let fy = dy / dist;

                // Intelligent Bidirectional Tangent Glide Obstacle Avoidance (with fast bounding-box skip!)
                for (let j = 0; j < obstacles.length; j++) {
                    const obs = obstacles[j];
                    if (obs.shape === 'circle' && obs.type !== 'flower_carpet') {
                        if (Math.abs(racer.entity.x - obs.x) > 170 || Math.abs(racer.entity.y - obs.y) > 170) continue;
                        const odx = racer.entity.x - obs.x;
                        const ody = racer.entity.y - obs.y;
                        const oDist = Math.hypot(odx, ody);
                        const safeZone = (obs.radius || 28) + racer.entity.radius + 45;

                        if (oDist < safeZone && oDist > 0) {
                            const push = Math.pow((safeZone - oDist) / safeZone, 1.8);
                            
                            // Radial push
                            fx += (odx / oDist) * push * 2.2;
                            fy += (ody / oDist) * push * 2.2;

                            // Tangent steer: effortlessly glide around the side that matches the target heading!
                            const t1x = -ody / oDist;
                            const t1y = odx / oDist;
                            const t2x = ody / oDist;
                            const t2y = -odx / oDist;
                            const dot1 = fx * t1x + fy * t1y;
                            const dot2 = fx * t2x + fy * t2y;
                            const bestTx = dot1 >= dot2 ? t1x : t2x;
                            const bestTy = dot1 >= dot2 ? t1y : t2y;

                            fx += bestTx * push * 4.2;
                            fy += bestTy * push * 4.2;
                        }
                    }
                }

                // Racer Anti-Stuck Watchdog (never get stuck against trees!)
                if (!racer.stuckTimer) racer.stuckTimer = 0;
                if (!racer.lastX) { racer.lastX = racer.entity.x; racer.lastY = racer.entity.y; }
                const movedDist = Math.hypot(racer.entity.x - racer.lastX, racer.entity.y - racer.lastY);
                racer.lastX = racer.entity.x;
                racer.lastY = racer.entity.y;

                if (movedDist < 0.8) {
                    racer.stuckTimer += dt;
                    if (racer.stuckTimer > 0.16) {
                        const dodgeAngle = (racer.entity.dodgeSide || 1) * Math.PI * 0.55;
                        const origFx = fx;
                        fx = origFx * Math.cos(dodgeAngle) - fy * Math.sin(dodgeAngle);
                        fy = origFx * Math.sin(dodgeAngle) + fy * Math.cos(dodgeAngle);
                        if (racer.stuckTimer > 0.5) {
                            racer.entity.dodgeSide = -(racer.entity.dodgeSide || 1);
                            racer.stuckTimer = 0;
                        }
                    }
                } else {
                    racer.stuckTimer = 0;
                }

                // Racer vs Racer Mutual Separation (no overlapping!)
                for (const other of this.racers) {
                    if (other === racer || other.finishRank !== null) continue;
                    const rdx = racer.entity.x - other.entity.x;
                    const rdy = racer.entity.y - other.entity.y;
                    const rDist = Math.hypot(rdx, rdy);
                    if (rDist < 48 && rDist > 0) {
                        const rPush = ((48 - rDist) / 48) * 2.8;
                        fx += (rdx / rDist) * rPush;
                        fy += (rdy / rDist) * rPush;
                    }
                }

                // One-Way Wind Stream Acceleration
                if (curMap && curMap.getWindStreamEffect) {
                    const ws = curMap.getWindStreamEffect(racer.entity.x, racer.entity.y);
                    if (ws) {
                        fx += (ws.fx / 220) * 1.5;
                        fy += (ws.fy / 220) * 1.5;
                    }
                }

                // Parikrama boundary flow
                if (curMap && curMap.getBoundaryFlowVector) {
                    const bFlow = curMap.getBoundaryFlowVector(racer.entity.x, racer.entity.y);
                    fx += bFlow.x;
                    fy += bFlow.y;
                }

                const fLen = Math.hypot(fx, fy);
                if (fLen > 0) { fx /= fLen; fy /= fLen; }

                racer.entity.applyTerrain(obstacles);
                const actualSpeed = racer.entity.currentSpeed * racer.entity.terrainModifier;
                racer.entity.moveWithAnim(fx * actualSpeed * dt, fy * actualSpeed * dt, obstacles, mapW, mapH, dt);
            }
        }
    }

    endRace() {
        this.isActive = false;
        const playerRacer = this.racers.find(r => r.isPlayer);
        const playerRank = playerRacer ? playerRacer.finishRank : 3;

        let title = "Sacred Footrace Concluded! 🏆";
        let message = "";
        let won = false;

        if (playerRank === 1) {
            won = true;
            title = "Golden Champion! (प्रथम स्थान) 🥇";
            message = `Glorious Victory! You outran Shree Krishna, Dao Balram, and swift Subal in ${this.raceTime.toFixed(1)} seconds! All the Sakhas shower you with fragrant lotus petals! 🌸🦚`;
        } else if (playerRank === 2) {
            won = true;
            title = "Sublime Runner-Up! (द्वितीय स्थान) 🥈";
            message = `A breathtaking finish! You ran shoulder-to-shoulder with Kanha across Vrindavan in ${this.raceTime.toFixed(1)} seconds! Krishna laughs warmly: 'Splendid sprint, Sakha!' 🦚`;
        } else {
            title = "Joyful Pastoral Race! (आनंदमयी दौड़) 🥉";
            message = `You completed the sacred Vrindavan circuit in ${this.raceTime.toFixed(1)} seconds! Subal and Sudama share cool Yamuna water with you: 'Nothing refreshes like running with Kanha!' 💧`;
        }

        this.game.endGame(won, message);
    }

    draw(ctx) {
        if (!this.isActive) return;

        // 1. Draw Checkpoints on Map (World coordinates)
        this.drawWorld(ctx);
    }

    drawWorld(ctx) {
        if (!this.isActive) return;

        this.checkpoints.forEach((cp, idx) => {
            if (idx === 0) return; // Skip start line representation

            const isNextForPlayer = this.racers[0] && this.racers[0].cpIndex === idx;
            const isFinish = idx === this.checkpoints.length - 1;

            ctx.save();
            const pulse = isNextForPlayer ? Math.sin(Date.now() * 0.006) * 6 : 0;
            const rad = cp.radius + pulse;

            // Ground glow ring
            const grad = ctx.createRadialGradient(cp.x, cp.y, 10, cp.x, cp.y, rad);
            if (isFinish) {
                grad.addColorStop(0, 'rgba(234, 179, 8, 0.45)');
                grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
                grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
            } else if (isNextForPlayer) {
                grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
                grad.addColorStop(0.7, 'rgba(250, 204, 21, 0.28)');
                grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            } else {
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, rad, 0, Math.PI * 2);
            ctx.fill();

            // Dashed Border
            ctx.strokeStyle = isFinish ? '#facc15' : (isNextForPlayer ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)');
            ctx.lineWidth = isNextForPlayer ? 3 : 1.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Torana Flag & Icon
            ctx.font = isFinish ? '28px serif' : '22px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cp.icon, cp.x, cp.y - 12);

            // Label Banner
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.fillStyle = isNextForPlayer ? '#facc15' : '#ffffff';
            ctx.fillText(cp.name, cp.x, cp.y + 14);

            ctx.restore();
        });
    }

    drawHud(ctx) {
        if (!this.isActive) return;
        this.drawScreenHud(ctx);
    }

    drawScreenHud(ctx) {
        const w = this.game.canvas.width;
        const h = this.game.canvas.height;

        ctx.save();

        // 1. Countdown Banner (3... 2... 1... GO!)
        if (this.countdown > 0) {
            const sec = Math.ceil(this.countdown);
            const scale = 1 + (this.countdown % 1) * 0.4;
            ctx.save();
            ctx.translate(w / 2, h / 2 - 40);
            ctx.scale(scale, scale);
            ctx.font = '900 64px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = sec > 1 ? '#facc15' : '#ef4444';
            ctx.fillText(sec > 0 ? sec : 'GO!', 0, 0);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeText(sec > 0 ? sec : 'GO!', 0, 0);
            ctx.restore();
        }

        // 2. Top-Center Standings & Checkpoint Bar
        const player = this.racers[0];
        const nextCp = this.checkpoints[player ? player.cpIndex : 1] || this.checkpoints[this.checkpoints.length - 1];

        // Sort racers by progress descending for live leaderboard
        const sorted = [...this.racers].sort((a, b) => {
            if (a.finishRank !== null && b.finishRank !== null) return a.finishRank - b.finishRank;
            if (a.finishRank !== null) return -1;
            if (b.finishRank !== null) return 1;
            return b.progress - a.progress;
        });

        const barW = Math.min(540, w - 40);
        const barH = 50;
        const barX = (w - barW) / 2;
        const barY = 82; // Comfortably spaced below top HUD tray

        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 12);
        ctx.fill();
        ctx.stroke();

        // Checkpoint & Timer on top row
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`🚩 Target: ${nextCp.icon} ${nextCp.name}`, barX + 16, barY + 8);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`⏱️ ${this.raceTime.toFixed(1)}s`, barX + barW - 16, barY + 8);

        // Live Standings on bottom row
        let standingsText = "";
        const rankMedals = ["🥇", "🥈", "🥉", "4th", "5th"];
        sorted.forEach((r, idx) => {
            const medal = rankMedals[idx] || `${idx + 1}`;
            standingsText += `${medal} ${r.name.split(' ')[0]}   `;
        });

        ctx.font = '12px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(standingsText, barX + barW / 2, barY + 28);

        // 3. Directional Pointer to Next Checkpoint (floating arrow around player)
        if (nextCp && player) {
            const pX = player.entity.x - this.game.camera.x;
            const pY = player.entity.y - this.game.camera.y;
            const dx = (nextCp.x - this.game.camera.x) - pX;
            const dy = (nextCp.y - this.game.camera.y) - pY;
            const dist = Math.hypot(dx, dy);

            if (dist > 80) {
                const angle = Math.atan2(dy, dx);
                const arrowDist = 55;
                const ax = pX + Math.cos(angle) * arrowDist;
                const ay = pY + Math.sin(angle) * arrowDist;

                ctx.save();
                ctx.translate(ax, ay);
                ctx.rotate(angle);
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.moveTo(14, 0);
                ctx.lineTo(-8, -8);
                ctx.lineTo(-4, 0);
                ctx.lineTo(-8, 8);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.restore();
    }
}
