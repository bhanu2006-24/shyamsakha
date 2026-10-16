/**
 * HoliGame (होली उत्सव - Pichkari & Color Fight)
 * Colorful water fights with Gulal puddles and projectile physics
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
        this.radius = isBomb ? 14 : 7;
        this.life = 1.6;
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
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(this.x - this.vx * 0.04, this.y - this.vy * 0.04, this.radius * 0.8, 0, Math.PI * 2);
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
    }

    start() {
        this.isActive = true;
        this.projectiles = [];
        this.game.krishna.isCaught = false;
        this.game.balram.isCaught = false;
        this.game.player.isCaught = false;
        this.game.sakhas.forEach(s => s.isCaught = false);

        this.game.ui.showToast("💦 Holi Pichkari Battle! Click to shoot colors!");
    }

    shoot(fromX, fromY, toX, toY, color = '#ec4899', isBomb = false, team = 'player') {
        const p = new Projectile(fromX, fromY, toX, toY, isBomb ? 550 : 850, color, isBomb, team);
        this.projectiles.push(p);
        this.game.sound.playSplash();
    }

    update(dt) {
        if (!this.isActive) return;

        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }

        // Handle Player Click Shoot
        if (this.game.input.wasMouseClicked() && this.shootCooldown <= 0) {
            const mouse = this.game.input.mouse;
            this.shoot(this.game.player.x, this.game.player.y, mouse.worldX, mouse.worldY, '#ec4899', false, 'player');
            this.shootCooldown = 0.3;
        }

        const targets = [this.game.krishna, this.game.balram].filter(t => !t.isCaught);
        const pursuers = [this.game.player, ...this.game.sakhas].filter(p => !p.isCaught);

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt);

            let hit = false;

            if (p.life <= 0) {
                hit = true;
            } else if (p.team === 'player') {
                for (const t of targets) {
                    if (Math.hypot(p.x - t.x, p.y - t.y) < t.radius + p.radius) {
                        t.isCaught = true;
                        this.game.particles.createPetals(t.x, t.y, p.color, 35);
                        hit = true;
                        break;
                    }
                }
            } else {
                for (const s of pursuers) {
                    if (Math.hypot(p.x - s.x, p.y - s.y) < s.radius + p.radius) {
                        s.isCaught = true;
                        this.game.particles.createPetals(s.x, s.y, p.color, 35);
                        hit = true;
                        if (s === this.game.player) {
                            this.isActive = false;
                            this.game.endGame(false, "You got fully soaked with joyful Holi colors! 🌈");
                        }
                        break;
                    }
                }
            }

            if (hit) {
                this.game.particles.addSplat(p.x, p.y, p.radius * 2.2, p.color);
                this.projectiles.splice(i, 1);
            }
        }

        // Krishna & Balram shooting back playfully
        for (const t of targets) {
            if (Math.random() < 0.015 && pursuers.length > 0) {
                const targetPursuer = pursuers[Math.floor(Math.random() * pursuers.length)];
                this.shoot(t.x, t.y, targetPursuer.x, targetPursuer.y, '#38bdf8', true, 'krishna');
            }
        }

        // Check if both targets are splashed
        if (this.game.krishna.isCaught && this.game.balram.isCaught) {
            this.isActive = false;
            this.game.endGame(true, "All friends are drenched in joyous Vrindavan Holi colors! 🌺");
        }
    }

    draw(ctx) {
        if (!this.isActive) return;
        for (const p of this.projectiles) {
            p.draw(ctx);
        }
    }
}
