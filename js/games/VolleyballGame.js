import { Volleyball } from '../entities/Volleyball.js';

/**
 * VolleyballGame (कन्दुक क्रीड़ा - Kanduka Kridha)
 * Gopa Volleyball by the Yamuna Sandbanks: Player & Sakhas vs Krishna & Balram
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
        this.serverTeam = 'player'; // or 'krishna'

        this.touchCount = 0;
        this.lastSide = 'player'; // which side touched the ball last
        this.pointCooldown = 0;
        this.isActive = false;

        // UI refs
        this.scoreboardEl = document.getElementById('volleyballScoreboard');
        this.scorePlayerEl = document.getElementById('scorePlayer');
        this.scoreKrishnaEl = document.getElementById('scoreKrishna');
        this.rallyCountEl = document.getElementById('rallyCount');
    }

    start(court) {
        this.court = court;
        this.scorePlayer = 0;
        this.scoreKrishna = 0;
        this.rallyCount = 0;
        this.serverTeam = 'player';
        this.isActive = true;
        this.touchCount = 0;
        this.pointCooldown = 1.0;

        if (this.scoreboardEl) this.scoreboardEl.classList.remove('hidden');
        this.updateScoreUI();

        // Position players on their respective court sides
        this.positionTeams();

        // Spawn ball for serve
        this.prepareServe();

        this.game.ui.showToast("🏐 Kanduka Kridha (Volleyball) has begun! First to 7 points wins!");
        this.game.sound.playCheer();
    }

    positionTeams() {
        const c = this.court;
        const p = this.game.player;
        const k = this.game.krishna;
        const d = this.game.balram;

        // Player & Sakha on West side
        p.x = c.x + c.w * 0.2;
        p.y = c.y + c.h * 0.5;
        p.dx = 1; p.dy = 0;

        if (this.game.sakhas.length > 0) {
            const s = this.game.sakhas[0];
            s.x = c.x + c.w * 0.35;
            s.y = c.y + c.h * 0.3;
            s.dx = 1; s.dy = 0;
        }

        // Krishna & Balram on East side
        k.x = c.x + c.w * 0.75;
        k.y = c.y + c.h * 0.4;
        k.dx = -1; k.dy = 0;

        d.x = c.x + c.w * 0.82;
        d.y = c.y + c.h * 0.65;
        d.dx = -1; d.dy = 0;
    }

    prepareServe() {
        const c = this.court;
        if (this.serverTeam === 'player') {
            this.ball.reset(this.game.player.x + 20, this.game.player.y);
            this.ball.serve(this.game.player, c.x + c.w * 0.75, c.y + c.h * 0.5, this.game.sound);
        } else {
            this.ball.reset(this.game.krishna.x - 20, this.game.krishna.y);
            this.ball.serve(this.game.krishna, c.x + c.w * 0.25, c.y + c.h * 0.5, this.game.sound);
        }
        this.touchCount = 1;
        this.lastSide = this.serverTeam;
    }

    update(dt) {
        if (!this.isActive) return;

        if (this.pointCooldown > 0) {
            this.pointCooldown -= dt;
            return;
        }

        const c = this.court;
        const ball = this.ball;
        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakha = this.game.sakhas[0];

        // Update ball physics
        ball.update(dt, this.game.sound, this.game.particles);

        // 1. Check Player hit / bump
        const distToPlayer = Math.hypot(player.x - ball.x, player.y - ball.y);
        const ballHitHeight = ball.z <= 60; // reachable in air

        if (distToPlayer < player.radius + ball.radius + 20 && ballHitHeight) {
            // Player bumps or spikes
            const isSpike = player.z > 15 || this.game.input.isDown('Shift');
            
            // Aim towards opponent's court
            const targetX = c.x + c.w * (0.65 + Math.random() * 0.25);
            const targetY = c.y + c.h * (0.2 + Math.random() * 0.6);

            ball.hit(player, targetX, targetY, isSpike ? 520 : 380, isSpike, this.game.sound);
            if (isSpike) this.game.camera.shake(6, 0.2);

            this.handleHit('player');
        }

        // 2. AI Sakha Teammate (West side helper)
        if (sakha) {
            this.updateTeammateAI(sakha, ball, c, dt);
        }

        // 3. Krishna & Balram AI (East side opponents)
        this.updateOpponentAI(krishna, balram, ball, c, dt);

        // 4. Check Ball Ground Landing / Scoring
        if (ball.z === 0 && !ball.inAir) {
            this.checkPoint(ball, c);
        }
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

    updateTeammateAI(sakha, ball, c, dt) {
        // Move towards ball if it's on player's side and coming down
        const isBallOnOurSide = ball.x < c.netX;
        if (isBallOnOurSide && ball.z < 180) {
            const dx = ball.x - sakha.x;
            const dy = ball.y - sakha.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 25) {
                sakha.move((dx / dist) * sakha.currentSpeed * 0.85 * dt, (dy / dist) * sakha.currentSpeed * 0.85 * dt, [], this.game.mapManager.getWidth(), this.game.mapManager.getHeight());
            } else if (ball.z <= 50 && ball.lastHitter !== sakha) {
                // Pass ball to opponent court or to player
                const targetX = c.x + c.w * 0.75;
                const targetY = c.y + c.h * 0.5;
                ball.hit(sakha, targetX, targetY, 360, false, this.game.sound);
                this.handleHit('player');
            }
        }
    }

    updateOpponentAI(krishna, balram, ball, c, dt) {
        const isBallOnTheirSide = ball.x > c.netX;

        // Choose who receives: whichever is closer to landing spot
        const distK = Math.hypot(krishna.x - ball.x, krishna.y - ball.y);
        const distB = Math.hypot(balram.x - ball.x, balram.y - ball.y);
        const receiver = distK < distB ? krishna : balram;
        const partner = receiver === krishna ? balram : krishna;

        if (isBallOnTheirSide) {
            const dx = ball.x - receiver.x;
            const dy = ball.y - receiver.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 25) {
                receiver.move((dx / dist) * receiver.currentSpeed * 0.9 * dt, (dy / dist) * receiver.currentSpeed * 0.9 * dt, [], this.game.mapManager.getWidth(), this.game.mapManager.getHeight());
            } else if (ball.z <= 60 && ball.lastHitter !== receiver) {
                // Krishna or Balram hit!
                const isSpike = (receiver === balram && Math.random() < 0.6) || (receiver === krishna && Math.random() < 0.4);
                if (isSpike) {
                    receiver.vz = 350; // Jump spike!
                }

                // Aim back at player's court
                const targetX = c.x + c.w * (0.15 + Math.random() * 0.25);
                const targetY = c.y + c.h * (0.2 + Math.random() * 0.6);

                ball.hit(receiver, targetX, targetY, isSpike ? 520 : 380, isSpike, this.game.sound);
                this.handleHit('krishna');

                if (isSpike) {
                    this.game.particles.createSparkle(ball.x, ball.y, '#facc15');
                    this.game.camera.shake(5, 0.2);
                }
            }
        }
    }

    checkPoint(ball, c) {
        const insideCourtX = ball.x >= c.x && ball.x <= c.x + c.w;
        const insideCourtY = ball.y >= c.y && ball.y <= c.y + c.h;

        let winner = null;

        if (!insideCourtX || !insideCourtY) {
            // Ball is out! Point goes to the team that didn't hit it out
            winner = (ball.lastHitTeam === 'player') ? 'krishna' : 'player';
            this.game.ui.showToast(`Ball Out! Point to ${winner === 'player' ? 'Sakha Team' : 'Krishna & Dao'}!`);
        } else {
            // Ball landed inside court!
            if (ball.x < c.netX) {
                // Landed on player side
                winner = 'krishna';
                this.game.ui.showToast("Point to Krishna & Dao Balram! 🦚");
            } else {
                // Landed on Krishna side
                winner = 'player';
                this.game.ui.showToast("Point to Sakha Team! Wonderful shot! 🌸");
            }
        }

        if (winner === 'player') {
            this.scorePlayer++;
            this.serverTeam = 'player';
            this.game.particles.createPetals(ball.x, ball.y, '#f472b6', 20);
        } else {
            this.scoreKrishna++;
            this.serverTeam = 'krishna';
            this.game.particles.createPetals(ball.x, ball.y, '#38bdf8', 20);
        }

        this.updateScoreUI();
        this.rallyCount = 0;
        this.pointCooldown = 2.0;

        // Check Match Win
        if (this.scorePlayer >= this.winningScore) {
            this.endMatch(true);
        } else if (this.scoreKrishna >= this.winningScore) {
            this.endMatch(false);
        } else {
            setTimeout(() => {
                if (this.isActive) this.prepareServe();
            }, 1800);
        }
    }

    updateScoreUI() {
        if (this.scorePlayerEl) this.scorePlayerEl.innerText = this.scorePlayer;
        if (this.scoreKrishnaEl) this.scoreKrishnaEl.innerText = this.scoreKrishna;
        if (this.rallyCountEl) this.rallyCountEl.innerText = this.rallyCount;
    }

    endMatch(playerWon) {
        this.isActive = false;
        if (this.scoreboardEl) this.scoreboardEl.classList.add('hidden');

        if (playerWon) {
            this.game.ui.showDialogue(
                "Krishna",
                "What an exhilarating match, my dear Sakha! You and Sudama played with boundless joy!",
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
            this.game.endGame(false, "Krishna & Dao Balram won the volleyball match! Keep practicing!");
        }
    }

    draw(ctx) {
        if (this.isActive) {
            this.ball.draw(ctx);
        }
    }
}
