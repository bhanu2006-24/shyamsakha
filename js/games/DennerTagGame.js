import { checkLineOfSight } from '../entities/ParticleSystem.js';

/**
 * DennerTagGame (दाम देना / पकड़ा-पकड़ी - Dām Denā)
 * Traditional Vedic Tag Pastime:
 * - One participant is the active "Denner" (दामी)
 * - The Denner freezes and counts 10 to 1 while everyone else scatters across Vrindavan!
 * - Once the count finishes, the Denner chases and tags ANYONE (Player, Sakha, Krishna, Balram)
 * - The tagged friend becomes the new Denner and counts 10, continuing the joyful cycle!
 * - Organic start: Everyone plays from wherever they currently stand in the pastures!
 */
export class DennerTagGame {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.gameTime = 0;
        this.state = 'countdown'; // 'countdown', 'chase'
        this.countdownTimer = 10.0;
        this.currentDenner = null; // Entity instance (Player, Krishna, Balram, or Sakha)
        this.tagCount = 0;
        this.lastTaggedTime = 0;
        this.participants = [];
        this.escapeeAi = new Map(); // Evasion state per entity
    }

    start() {
        this.isActive = true;
        this.gameTime = 0;
        this.tagCount = 0;

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakhas = this.game.sakhas;

        // All characters in the world participate!
        this.participants = [player, krishna, balram, ...sakhas];

        // ORGANIC START: Sakhas play from wherever they were standing!
        // No rigid teleporting!
        for (const p of this.participants) {
            p.isCaught = false;
        }

        // Pick initial Denner (Start with Subal or a Sakha)
        const initialCandidates = sakhas.length > 0 ? sakhas : [krishna];
        this.currentDenner = initialCandidates[Math.floor(Math.random() * initialCandidates.length)];

        this.startCountdown();
        this.game.sound.playCheer();
    }

    startCountdown() {
        this.state = 'countdown';
        this.countdownTimer = 10.0;

        const dennerName = this.getParticipantName(this.currentDenner);
        this.game.ui.showToast(`🎯 ${dennerName} को दाम मिला! 10 तक गिनती गिनेगा, सब भागो! (10s Countdown!)`, 4500);

        if (this.currentDenner === this.game.player) {
            this.game.ui.showToast("👀 YOU ARE THE DENNER! Count to 10 while everyone scatters!", 4000);
        }
    }

    getParticipantName(entity) {
        if (!entity) return "सखा";
        if (entity === this.game.player) return "आप (You)";
        if (entity === this.game.krishna) return "श्री कृष्ण (Shree Krishna)";
        if (entity === this.game.balram) return "दाऊ बलराम (Dao Balram)";
        return entity.name || "सखा";
    }

    update(dt) {
        if (!this.isActive) return;
        this.gameTime += dt;

        const obstacles = this.game.mapManager.getObstacles();
        const mapW = this.game.mapManager.getWidth();
        const mapH = this.game.mapManager.getHeight();
        const denner = this.currentDenner;

        // --- PHASE 1: COUNTDOWN (गिनती) ---
        if (this.state === 'countdown') {
            const oldSec = Math.ceil(this.countdownTimer);
            this.countdownTimer -= dt;
            const newSec = Math.ceil(this.countdownTimer);

            // Audio / visual tick each second
            if (newSec !== oldSec && newSec > 0) {
                if (this.game.sound) this.game.sound.playFluteNote(350 + newSec * 25, 0.1);
            }

            // Denner stands still with eyes covered
            if (denner) {
                denner.isMoving = false;
                denner.walkTimer = 0;
            }

            // All other participants scatter away in all directions!
            for (const p of this.participants) {
                if (p === denner) continue;
                this.updateFleeingParticipant(p, denner, obstacles, mapW, mapH, dt);
            }

            // Countdown finished: Chase begins!
            if (this.countdownTimer <= 0) {
                this.state = 'chase';
                const dennerName = this.getParticipantName(denner);
                this.game.ui.showToast(`🏃‍♂️ दाम शुरू! ${dennerName} आ रहा है पकड़ने! (Dām Shuru - The Chase Begins!)`, 4000);
                if (this.game.sound) this.game.sound.playCheer();
            }
            return;
        }

        // --- PHASE 2: THE CHASE (पकड़ा-पकड़ी) ---
        if (this.state === 'chase') {
            // 1. If PLAYER is the Denner:
            if (denner === this.game.player) {
                // Check if player tags any other participant
                for (const target of this.participants) {
                    if (target === this.game.player) continue;

                    const dist = Math.hypot(this.game.player.x - target.x, this.game.player.y - target.y);
                    if (dist < this.game.player.radius + target.radius + 28 && (target.z || 0) < 65) {
                        this.tagParticipant(target);
                        return;
                    }
                }

                // AI participants flee from player
                for (const p of this.participants) {
                    if (p === this.game.player) continue;
                    this.updateFleeingParticipant(p, this.game.player, obstacles, mapW, mapH, dt);
                }

            // 2. If AI is the Denner:
            } else {
                // Denner chases the closest participant!
                let closestTarget = null;
                let minDist = Infinity;

                for (const target of this.participants) {
                    if (target === denner) continue;
                    const d = Math.hypot(denner.x - target.x, denner.y - target.y);
                    if (d < minDist) {
                        minDist = d;
                        closestTarget = target;
                    }
                }

                if (closestTarget) {
                    // Check tag touch
                    if (minDist < denner.radius + closestTarget.radius + 28 && (closestTarget.z || 0) < 65) {
                        this.tagParticipant(closestTarget);
                        return;
                    }

                    // Move Denner towards target with obstacle steering
                    this.updateDennerAi(denner, closestTarget, obstacles, mapW, mapH, dt);
                }

                // Other participants flee from the Denner
                for (const p of this.participants) {
                    if (p === denner) continue;
                    if (p === this.game.player) continue; // Player controls own movement
                    this.updateFleeingParticipant(p, denner, obstacles, mapW, mapH, dt);
                }
            }
        }
    }

    /**
     * Handover Dām when someone is tagged
     */
    tagParticipant(newDenner) {
        const oldDennerName = this.getParticipantName(this.currentDenner);
        const newDennerName = this.getParticipantName(newDenner);

        this.tagCount++;
        this.game.particles.createPetals(newDenner.x, newDenner.y, '#f472b6', 45);
        this.game.particles.createSparkle(newDenner.x, newDenner.y - 25, '#fde047', 25);
        this.game.sound.playCheer();

        this.currentDenner = newDenner;
        this.startCountdown();
    }

    /**
     * AI Denner pursuit with dynamic speed and avoidance
     */
    updateDennerAi(denner, target, obstacles, mapW, mapH, dt) {
        const dx = target.x - denner.x;
        const dy = target.y - denner.y;
        const dist = Math.hypot(dx, dy) || 1;

        let sx = dx / dist;
        let sy = dy / dist;

        // Steer around obstacles
        if (denner.getAvoidanceForce) {
            const avoid = denner.getAvoidanceForce(obstacles, 60);
            sx += avoid.x * 2.2;
            sy += avoid.y * 2.2;
        }

        const sLen = Math.hypot(sx, sy) || 1;
        sx /= sLen;
        sy /= sLen;

        const speed = (denner.currentSpeed || 280) * 1.05;
        denner.applyTerrain(obstacles);
        denner.moveWithAnim(sx * speed * denner.terrainModifier * dt, sy * speed * denner.terrainModifier * dt, obstacles, mapW, mapH, dt);
    }

    /**
     * AI participants fleeing smartly from the Denner
     */
    updateFleeingParticipant(p, denner, obstacles, mapW, mapH, dt) {
        if (!denner) return;

        const fdx = p.x - denner.x;
        const fdy = p.y - denner.y;
        const dist = Math.hypot(fdx, fdy) || 1;

        let sx = fdx / dist;
        let sy = fdy / dist;

        // Mutual participant separation so they scatter in diverse directions
        for (const other of this.participants) {
            if (other === p || other === denner) continue;
            const odx = p.x - other.x;
            const ody = p.y - other.y;
            const odist = Math.hypot(odx, ody);
            if (odist < 90 && odist > 0) {
                sx += (odx / odist) * 1.8;
                sy += (ody / odist) * 1.8;
            }
        }

        // Steer around obstacles
        if (p.getAvoidanceForce) {
            const avoid = p.getAvoidanceForce(obstacles, 65);
            sx += avoid.x * 2.5;
            sy += avoid.y * 2.5;
        }

        // Keep inside pastures
        if (p.x < 500) sx += 2.0;
        if (p.x > mapW - 1700) sx -= 2.0;
        if (p.y < 500) sy += 2.0;
        if (p.y > mapH - 500) sy -= 2.0;

        const sLen = Math.hypot(sx, sy) || 1;
        sx /= sLen;
        sy /= sLen;

        const speed = p.currentSpeed || 270;
        p.applyTerrain(obstacles);
        p.moveWithAnim(sx * speed * p.terrainModifier * dt, sy * speed * p.terrainModifier * dt, obstacles, mapW, mapH, dt);
    }

    draw(ctx) {
        if (!this.isActive || !this.currentDenner) return;

        const d = this.currentDenner;
        const drawY = d.y - (d.z || 0);

        ctx.save();

        // 1. Glowing Radiant Ring under Denner's feet
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(d.x, d.y, (d.radius || 18) + 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Floating Denner Title & Countdown Badge above head
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.state === 'countdown') {
            const countNum = Math.ceil(this.countdownTimer);

            // Pulsing countdown circle
            ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
            ctx.beginPath();
            ctx.arc(d.x, drawY - 55, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 16px Outfit, sans-serif';
            ctx.fillText(`${countNum}`, d.x, drawY - 54);

            // "दामी गिनती कर रहा है"
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.beginPath();
            ctx.roundRect(d.x - 70, drawY - 86, 140, 22, 11);
            ctx.fill();

            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.fillText("🎯 दामी (Counting 10)", d.x, drawY - 75);

        } else {
            // Chase mode: Glowing "दामी (DENNER)" badge
            ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
            ctx.beginPath();
            ctx.roundRect(d.x - 55, drawY - 60, 110, 24, 12);
            ctx.fill();

            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.fillText("🏃‍♂️ दामी (DENNER)", d.x, drawY - 48);
        }

        ctx.restore();
    }
}
