import { Volleyball } from '../entities/Volleyball.js';

/**
 * VolleyballGame (कन्दुक क्रीड़ा - Kanduka Kridha)
 * Gopa Volleyball on the Yamuna Sandbanks:
 * Team Sakha (Player + Sakhas) vs Team Krishna (Krishna, Balram + Sakhas)
 * 2-4 players per team, halved court speed, realistic reaction cadence,
 * and immediate point scoring upon ground touch!
 */
export class VolleyballGame {
    constructor(game) {
        this.game = game;
        this.ball = new Volleyball(0, 0);
        this.court = null;

        this.scorePlayer = 0;
        this.scoreKrishna = 0;
        this.winningScore = 7;
        this.rallyCount = 0;
        this.serverTeam = 'player'; // 'player' or 'krishna'

        this.touchCount = 0;
        this.lastSide = 'player';
        this.pointCooldown = 0;
        this.playerHitCooldown = 0;
        this.isActive = false;
        this.rallyActive = false; // Tracks active rally for immediate scoring

        // AI Reaction & Cadence Timers (creates realistic human-like misses & drops)
        this.aiReactionTimers = new Map();

        // UI refs
        this.scoreboardEl = document.getElementById('volleyballScoreboard');
        this.scorePlayerEl = document.getElementById('scorePlayer');
        this.scoreKrishnaEl = document.getElementById('scoreKrishna');
        this.rallyCountEl = document.getElementById('rallyCount');
    }

    start(court) {
        this.court = court;
        this.ball.courtBounds = court;
        this.scorePlayer = 0;
        this.scoreKrishna = 0;
        this.rallyCount = 0;
        this.serverTeam = 'player';
        this.isActive = true;
        this.rallyActive = false;
        this.touchCount = 0;
        this.pointCooldown = 1.0;
        this.playerHitCooldown = 0.5;

        if (this.scoreboardEl) this.scoreboardEl.classList.remove('hidden');
        this.updateScoreUI();

        // Position 3v3 / 4v4 teams on Yamuna sandbank court
        this.positionTeams();

        // Spawn ball for serve
        this.prepareServe();

        this.game.ui.showToast("🏐 Kanduka Kridha on Yamuna Sandbank has begun! First to 7 points wins!", 4500);
        this.game.sound.playCheer();
    }

    positionTeams() {
        const c = this.court;
        const p = this.game.player;
        const k = this.game.krishna;
        const d = this.game.balram;
        const sakhas = this.game.sakhas;

        // --- WEST SIDE (TEAM SAKHA: Player + 2-3 Sakhas) ---
        // Player: Center backcourt
        p.x = c.x + c.w * 0.18;
        p.y = c.y + c.h * 0.5;
        p.dx = 1; p.dy = 0;

        // Sakha 0 (Sudama/Subal): Front row top
        if (sakhas.length > 0) {
            sakhas[0].x = c.x + c.w * 0.35;
            sakhas[0].y = c.y + c.h * 0.28;
            sakhas[0].dx = 1; sakhas[0].dy = 0;
        }

        // Sakha 1 (Madhumangal): Front row bottom
        if (sakhas.length > 1) {
            sakhas[1].x = c.x + c.w * 0.35;
            sakhas[1].y = c.y + c.h * 0.72;
            sakhas[1].dx = 1; sakhas[1].dy = 0;
        }

        // --- EAST SIDE (TEAM KRISHNA: Krishna, Balram + 1-2 Sakhas) ---
        // Krishna: Front court agile setter/spiker
        k.x = c.x + c.w * 0.68;
        k.y = c.y + c.h * 0.42;
        k.dx = -1; k.dy = 0;

        // Dao Balram: Back court power spiker
        d.x = c.x + c.w * 0.82;
        d.y = c.y + c.h * 0.65;
        d.dx = -1; d.dy = 0;

        // Sakha 2 (Rishabh/Dama): East court back helper
        if (sakhas.length > 2) {
            sakhas[2].x = c.x + c.w * 0.82;
            sakhas[2].y = c.y + c.h * 0.28;
            sakhas[2].dx = -1; sakhas[2].dy = 0;
        }

        // Optional 4th player per side if enough Sakhas
        if (sakhas.length > 3) {
            // West back helper
            sakhas[3].x = c.x + c.w * 0.16;
            sakhas[3].y = c.y + c.h * 0.25;
            sakhas[3].dx = 1; sakhas[3].dy = 0;
        }
        if (sakhas.length > 4) {
            // East front helper
            sakhas[4].x = c.x + c.w * 0.68;
            sakhas[4].y = c.y + c.h * 0.72;
            sakhas[4].dx = -1; sakhas[4].dy = 0;
        }

        // Remaining Sakhas cheer along North and South sidelines
        const sidelinePositions = [
            { x: c.x + c.w * 0.2, y: c.y - 45, dx: 0, dy: 1 },
            { x: c.x + c.w * 0.8, y: c.y - 45, dx: 0, dy: 1 },
            { x: c.x + c.w * 0.5, y: c.y + c.h + 45, dx: 0, dy: -1 }
        ];
        for (let i = 5; i < sakhas.length; i++) {
            const sp = sidelinePositions[(i - 5) % sidelinePositions.length];
            sakhas[i].x = sp.x;
            sakhas[i].y = sp.y;
            sakhas[i].dx = sp.dx;
            sakhas[i].dy = sp.dy;
        }
    }

    prepareServe() {
        const c = this.court;
        this.playerHitCooldown = 0.6;
        this.rallyActive = true;

        if (this.serverTeam === 'player') {
            this.ball.reset(this.game.player.x + 20, this.game.player.y);
            this.ball.serve(this.game.player, c.x + c.w * 0.72, c.y + c.h * 0.5, this.game.sound);
        } else {
            this.ball.reset(this.game.krishna.x - 20, this.game.krishna.y);
            this.ball.serve(this.game.krishna, c.x + c.w * 0.28, c.y + c.h * 0.5, this.game.sound);
        }
        this.touchCount = 1;
        this.lastSide = this.serverTeam;
    }

    update(dt) {
        if (!this.isActive) return;

        if (this.playerHitCooldown > 0) {
            this.playerHitCooldown -= dt;
        }

        if (this.pointCooldown > 0) {
            this.pointCooldown -= dt;
            return;
        }

        const c = this.court;
        const ball = this.ball;
        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakhas = this.game.sakhas;

        // 1. Constrain player speed inside court (Half speed so one player cannot cover whole court!)
        const isPlayerInCourt = player.x >= c.x - 30 && player.x <= c.x + c.w + 30 &&
                                player.y >= c.y - 30 && player.y <= c.y + c.h + 30;
        if (isPlayerInCourt) {
            player.currentSpeed = Math.min(155, player.baseSpeed * 0.5);
        }

        // 2. Update ball physics
        ball.update(dt, this.game.sound, this.game.particles);

        // 3. IMMEDIATE GROUND SCORING FIX:
        // As soon as ball touches ground (ball.z <= 0), count the point immediately!
        // No waiting for multiple bounces or rolling to a standstill!
        if (this.rallyActive && ball.z <= 0) {
            this.rallyActive = false;
            this.checkPoint(ball, c);
            return;
        }

        // 4. Check Player Hit / Bump / Spike
        const distToPlayer = Math.hypot(player.x - ball.x, player.y - ball.y);
        const ballHitHeight = ball.z <= 65; // reachable in air

        if (this.rallyActive && this.playerHitCooldown <= 0 && distToPlayer < player.radius + ball.radius + 24 && ballHitHeight) {
            this.playerHitCooldown = 0.42;
            const isSpike = player.z > 12 || this.game.input.isDown('Shift');

            // Aim towards opponent's court with realistic variation
            const targetX = c.x + c.w * (0.62 + Math.random() * 0.3);
            const targetY = c.y + c.h * (0.18 + Math.random() * 0.64);

            ball.hit(player, targetX, targetY, isSpike ? 500 : 360, isSpike, this.game.sound);
            if (isSpike) this.game.camera.shake(6, 0.2);

            this.handleHit('player');
        }

        // 5. West Teammates AI (Sakhas on Player's Side)
        const westSakhas = [sakhas[0], sakhas[1], sakhas[3]].filter(Boolean);
        for (const ws of westSakhas) {
            this.updateTeammateAI(ws, ball, c, dt);
        }

        // 6. East Opponents AI (Krishna, Dao Balram + Sakhas)
        const eastTeammates = [sakhas[2], sakhas[4]].filter(Boolean);
        this.updateOpponentAI(krishna, balram, eastTeammates, ball, c, dt);
    }

    handleHit(team) {
        if (this.lastSide !== team) {
            this.rallyCount++;
            this.touchCount = 1;
            this.lastSide = team;
            this.updateScoreUI();
        } else {
            this.touchCount++;
        }
    }

    /**
     * West Teammate AI: Cooperative positioning, setting up high passes for the player, and yielding when player takes the shot
     */
    updateTeammateAI(sakha, ball, c, dt) {
        const isBallOnOurSide = ball.x < c.netX;
        const player = this.game.player;
        const playerDistToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
        const playerIsTakingIt = playerDistToBall < 110 && isBallOnOurSide && ball.z < 180;

        let reaction = this.aiReactionTimers.get(sakha) || { timer: 0, targetX: sakha.x, targetY: sakha.y, speed: 125, role: 'setter' };
        reaction.timer -= dt;

        if (reaction.timer <= 0) {
            reaction.timer = 0.2 + Math.random() * 0.18; // Natural reaction cadence
            reaction.speed = 115 + Math.random() * 40; // Halved court speed

            if (isBallOnOurSide && ball.z < 220) {
                if (playerIsTakingIt) {
                    // Back off and give the player room to strike!
                    const backOffDir = sakha.y < player.y ? -1 : 1;
                    reaction.targetX = c.x + c.w * 0.32;
                    reaction.targetY = Math.max(c.y + 40, Math.min(c.y + c.h - 40, sakha.y + backOffDir * 60));
                } else {
                    // Move to receive the ball
                    reaction.targetX = ball.x + (Math.random() - 0.5) * 15;
                    reaction.targetY = ball.y + (Math.random() - 0.5) * 15;
                }
            } else {
                // Return to home zone (front court setter vs back court receiver)
                reaction.targetX = sakha.homeX || (c.x + c.w * 0.3);
                reaction.targetY = sakha.homeY || (c.y + c.h * 0.5);
            }
        }
        this.aiReactionTimers.set(sakha, reaction);

        const dx = reaction.targetX - sakha.x;
        const dy = reaction.targetY - sakha.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 16) {
            sakha.moveWithAnim((dx / dist) * reaction.speed * dt, (dy / dist) * reaction.speed * dt, [], this.game.mapManager.getWidth(), this.game.mapManager.getHeight(), dt);
        }

        // Cooperative Hit / Pass
        const ballDist = Math.hypot(ball.x - sakha.x, ball.y - sakha.y);
        if (this.rallyActive && isBallOnOurSide && ballDist < sakha.radius + ball.radius + 24 && ball.z <= 60 && ball.lastHitter !== sakha && !playerIsTakingIt) {
            // If 1st touch on player's side: Set it up high near the net for the player!
            if (this.touchCount === 1) {
                const setTargetX = c.x + c.w * 0.38;
                const setTargetY = player.y;
                ball.hit(sakha, setTargetX, setTargetY, 320, false, this.game.sound);
                this.game.ui.showToast(`🏐 ${sakha.name} sets it high! Sprint and Jump Spike with Shift+Space!`, 2500);
            } else {
                // 2nd/3rd touch: Bump or spike over the net
                const isSpike = Math.random() < 0.35 && sakha.x > c.x + c.w * 0.28;
                if (isSpike) sakha.vz = 340;

                const targetX = c.x + c.w * (0.65 + Math.random() * 0.25);
                const targetY = c.y + c.h * (0.18 + Math.random() * 0.64);
                ball.hit(sakha, targetX, targetY, isSpike ? 470 : 350, isSpike, this.game.sound);
            }
            this.handleHit('player');
        }
    }

    /**
     * East Opponent AI: Krishna & Dao Balram distinct play styles & team strategies
     */
    updateOpponentAI(krishna, balram, eastSakhas, ball, c, dt) {
        const isBallOnTheirSide = ball.x > c.netX;
        const allOpponents = [krishna, balram, ...eastSakhas];

        // Pick most qualified defender based on trajectory and proximity
        let primaryDefender = krishna;
        let minDist = Infinity;
        for (const opp of allOpponents) {
            const d = Math.hypot(opp.x - ball.x, opp.y - ball.y);
            if (d < minDist) {
                minDist = d;
                primaryDefender = opp;
            }
        }

        for (const opp of allOpponents) {
            const isPrimary = opp === primaryDefender;
            let reaction = this.aiReactionTimers.get(opp) || { timer: 0, targetX: opp.x, targetY: opp.y, speed: 135 };
            reaction.timer -= dt;

            if (reaction.timer <= 0) {
                // Character-specific cadence: Krishna reacts quickest, Balram deliberate, Sakhas varied
                const cadence = (opp === krishna) ? 0.12 + Math.random() * 0.12 : (opp === balram) ? 0.18 + Math.random() * 0.15 : 0.22 + Math.random() * 0.2;
                reaction.timer = cadence;

                // Court speed (halved): Krishna agile (155), Balram steady (145), Sakhas (120)
                reaction.speed = (opp === krishna) ? 155 : (opp === balram) ? 142 : 120;

                if (isBallOnTheirSide && isPrimary && ball.z < 230) {
                    reaction.targetX = ball.x + (Math.random() - 0.5) * 16;
                    reaction.targetY = ball.y + (Math.random() - 0.5) * 16;
                } else {
                    // Tactical spread across East Court
                    if (opp === krishna) {
                        // Krishna covers front court & net attacks
                        reaction.targetX = c.x + c.w * 0.68;
                        reaction.targetY = ball.y > c.y + c.h * 0.5 ? c.y + c.h * 0.35 : c.y + c.h * 0.65;
                    } else if (opp === balram) {
                        // Dao Balram anchors back-center for power spikes
                        reaction.targetX = c.x + c.w * 0.82;
                        reaction.targetY = c.y + c.h * 0.5;
                    } else {
                        reaction.targetX = opp.homeX || (c.x + c.w * 0.78);
                        reaction.targetY = opp.homeY || (c.y + c.h * 0.5);
                    }
                }
            }
            this.aiReactionTimers.set(opp, reaction);

            const dx = reaction.targetX - opp.x;
            const dy = reaction.targetY - opp.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 16) {
                opp.moveWithAnim((dx / dist) * reaction.speed * dt, (dy / dist) * reaction.speed * dt, [], this.game.mapManager.getWidth(), this.game.mapManager.getHeight(), dt);
            }

            // Hit / Play the ball
            const ballDist = Math.hypot(ball.x - opp.x, ball.y - opp.y);
            if (this.rallyActive && isBallOnTheirSide && ballDist < opp.radius + ball.radius + 24 && ball.z <= 62 && ball.lastHitter !== opp) {
                // 1. KRISHNA SPECIALTY: Playful Setter or Graceful Acrobatic Spike
                if (opp === krishna) {
                    const willSpike = (this.touchCount >= 2 || Math.random() < 0.45);
                    if (willSpike) {
                        opp.vz = 410; // Graceful celestial leap!
                        const targetX = c.x + c.w * (0.08 + Math.random() * 0.32);
                        const targetY = c.y + c.h * (0.15 + Math.random() * 0.7);
                        ball.hit(opp, targetX, targetY, 490, true, this.game.sound);
                        this.game.particles.createSparkle(opp.x, opp.y - 20, '#38bdf8', 25);
                    } else {
                        // Gentle divine set up for Dao Balram!
                        const setTargetX = c.x + c.w * 0.78;
                        const setTargetY = balram.y;
                        ball.hit(opp, setTargetX, setTargetY, 330, false, this.game.sound);
                        this.game.particles.createSparkle(ball.x, ball.y, '#fef08a', 15);
                    }
                // 2. DAO BALRAM SPECIALTY: Mighty Power Spike
                } else if (opp === balram) {
                    const willPowerSpike = Math.random() < 0.7;
                    if (willPowerSpike) {
                        opp.vz = 480; // Mighty leap!
                        const targetX = c.x + c.w * (0.12 + Math.random() * 0.28);
                        const targetY = c.y + c.h * (0.18 + Math.random() * 0.64);
                        ball.hit(opp, targetX, targetY, 530, true, this.game.sound);
                        this.game.camera.shake(6, 0.22);
                        this.game.particles.createDust(opp.x, opp.y, '#facc15', 30);
                    } else {
                        const targetX = c.x + c.w * (0.15 + Math.random() * 0.25);
                        const targetY = c.y + c.h * (0.2 + Math.random() * 0.6);
                        ball.hit(opp, targetX, targetY, 360, false, this.game.sound);
                    }
                // 3. EAST SAKHA DEFENSE
                } else {
                    const targetX = c.x + c.w * (0.18 + Math.random() * 0.25);
                    const targetY = c.y + c.h * (0.2 + Math.random() * 0.6);
                    ball.hit(opp, targetX, targetY, 350, false, this.game.sound);
                }

                this.handleHit('krishna');
            }
        }
    }

    /**
     * Count Point immediately upon ground landing
     */
    checkPoint(ball, c) {
        const insideCourtX = ball.x >= c.x && ball.x <= c.x + c.w;
        const insideCourtY = ball.y >= c.y && ball.y <= c.y + c.h;

        let winner = null;

        if (!insideCourtX || !insideCourtY) {
            // Ball is out! Point goes to other team
            winner = (ball.lastHitTeam === 'player') ? 'krishna' : 'player';
            this.game.ui.showToast(`Ball Out! Point to ${winner === 'player' ? 'Sakha Team' : 'Krishna & Dao'}! 🏐`);
        } else {
            // Ball landed inside court on the sand!
            if (ball.x < c.netX) {
                winner = 'krishna';
                this.game.ui.showToast("Point to Krishna & Dao Balram! 🦚");
            } else {
                winner = 'player';
                this.game.ui.showToast("Point to Sakha Team! Splendid shot! 🌸");
            }
        }

        if (winner === 'player') {
            this.scorePlayer++;
            this.serverTeam = 'player';
            this.game.particles.createPetals(ball.x, ball.y, '#f472b6', 22);
        } else {
            this.scoreKrishna++;
            this.serverTeam = 'krishna';
            this.game.particles.createPetals(ball.x, ball.y, '#38bdf8', 22);
        }

        this.updateScoreUI();
        this.rallyCount = 0;
        this.pointCooldown = 1.8;

        // Check Match Win
        if (this.scorePlayer >= this.winningScore) {
            this.endMatch(true);
        } else if (this.scoreKrishna >= this.winningScore) {
            this.endMatch(false);
        } else {
            setTimeout(() => {
                if (this.isActive) this.prepareServe();
            }, 1600);
        }
    }

    updateScoreUI() {
        if (this.scorePlayerEl) this.scorePlayerEl.innerText = this.scorePlayer;
        if (this.scoreKrishnaEl) this.scoreKrishnaEl.innerText = this.scoreKrishna;
        if (this.rallyCountEl) this.rallyCountEl.innerText = this.rallyCount;
    }

    endMatch(playerWon) {
        this.isActive = false;
        this.rallyActive = false;
        if (this.scoreboardEl) this.scoreboardEl.classList.add('hidden');

        if (playerWon) {
            this.game.ui.showDialogue(
                "Krishna",
                "What an exhilarating match on the Yamuna Sandbanks! You and the Sakhas played with boundless joy!",
                "🦚",
                "text-blue-400"
            );
            this.game.sound.playCheer();
            this.game.endGame(true, "Kanduka Kridha Champion! You won the volleyball match!");
        } else {
            this.game.ui.showDialogue(
                "Dao Balaram",
                "Haha! That was a splendid rally! Come, let us drink cool Yamuna Jal and rest under the Kadamba tree.",
                "🌾",
                "text-yellow-400"
            );
            this.game.endGame(false, "Krishna & Dao Balram won the match! Wonderful pastimes!");
        }
    }

    draw(ctx) {
        if (this.isActive) {
            this.ball.draw(ctx);
        }
    }
}
