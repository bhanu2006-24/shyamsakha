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

        const map = this.game.mapManager.currentMap;
        const cx = map.centerX;
        const cy = map.centerY;
        const riverEdge = map.width - map.riverWidth;

        // Sacred Checkpoints across Vrindavan pastures
        this.checkpoints = [
            { id: 0, name: "Start Line", hindi: "प्रारंभ रेखा", x: cx, y: cy + 180, radius: 85, icon: "🚩" },
            { id: 1, name: "Ancient Kadamba Tree", hindi: "प्राचीन कदम्ब वृक्ष", x: cx, y: cy - 230, radius: 95, icon: "🌳" },
            { id: 2, name: "Kamal Sarovar Lily Pond", hindi: "कमल सरोवर", x: cx - 420, y: cy + 200, radius: 95, icon: "🪷" },
            { id: 3, name: "Kadamba Kusum Flower Carpet", hindi: "पुष्प वाटिका", x: cx + 340, y: cy - 320, radius: 95, icon: "🌸" },
            { id: 4, name: "Yamuna Sandbank Shore", hindi: "यमुना तट", x: riverEdge - 180, y: cy + 140, radius: 95, icon: "🌊" },
            { id: 5, name: "Sacred Torana Finish Arch", hindi: "विजय तोरण (लक्ष्य)", x: cx, y: cy + 60, radius: 80, icon: "🏁" }
        ];

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const subal = this.game.sakhas.find(s => s.name === "Subal") || this.game.sakhas[1];
        const sudama = this.game.sakhas.find(s => s.name === "Sudama") || this.game.sakhas[0];

        // Line up side-by-side at Start Line
        player.x = cx - 90;
        player.y = cy + 180;
        player.isCaught = false;

        krishna.x = cx - 30;
        krishna.y = cy + 180;
        krishna.isCaught = false;

        balram.x = cx + 30;
        balram.y = cy + 180;
        balram.isCaught = false;

        if (subal) {
            subal.x = cx + 80;
            subal.y = cy + 180;
            subal.isCaught = false;
        }

        if (sudama) {
            sudama.x = cx + 130;
            sudama.y = cy + 180;
            sudama.isCaught = false;
        }

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

                // Tangent glide obstacle avoidance
                for (const obs of obstacles) {
                    if (obs.shape === 'circle') {
                        const odx = racer.entity.x - obs.x;
                        const ody = racer.entity.y - obs.y;
                        const oDist = Math.hypot(odx, ody);
                        const safeZone = (obs.radius || 25) + racer.entity.radius + 38;

                        if (oDist < safeZone && oDist > 0) {
                            const push = Math.pow((safeZone - oDist) / safeZone, 2) * 4.0;
                            fx += (odx / oDist) * push;
                            fy += (ody / oDist) * push;
                        }
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
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 6;
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
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 18;
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
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 10;
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
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 6;
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
