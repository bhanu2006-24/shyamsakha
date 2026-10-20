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
     * AI Denner pursuit: Tailored by character personality (Krishna anticipation, Balram power charge, Subal sprint bursts)
     */
    updateDennerAi(denner, target, obstacles, mapW, mapH, dt) {
        const isKrishna = (denner === this.game.krishna);
        const isBalram = (denner === this.game.balram);

        // 1. Target prediction: Krishna and agile chasers anticipate where target is heading
        let aimX = target.x;
        let aimY = target.y;
        if (isKrishna || denner.name === "Subal") {
            aimX += (target.dx || 0) * 85;
            aimY += (target.dy || 0) * 85;
        }

        const dx = aimX - denner.x;
        const dy = aimY - denner.y;
        const dist = Math.hypot(dx, dy) || 1;

        let sx = dx / dist;
        let sy = dy / dist;

        // Steer around obstacles
        if (denner.getAvoidanceForce) {
            const avoid = denner.getAvoidanceForce(obstacles, 65);
            sx += avoid.x * 2.4;
            sy += avoid.y * 2.4;
        }

        // Special divine chaser abilities:
        if (isKrishna) {
            // Krishna acrobatic leap over obstacles when closing in
            if (dist < 180 && (denner.z || 0) <= 0 && Math.random() < 0.04) {
                denner.vz = 360;
                this.game.particles.createSparkle(denner.x, denner.y - 20, '#38bdf8', 15);
            }
        } else if (isBalram) {
            // Dao Balram steady earth-shaking momentum
            if (Math.random() < 0.08) {
                this.game.particles.createDust(denner.x, denner.y, '#facc15', 6);
            }
        }

        const sLen = Math.hypot(sx, sy) || 1;
        sx /= sLen;
        sy /= sLen;

        // Speed tailored to identity
        let baseSpeed = 280;
        if (isKrishna) baseSpeed = 365;
        else if (isBalram) baseSpeed = 345;
        else if (denner.name === "Subal") baseSpeed = 330;
        else if (denner.name === "Madhumangal") baseSpeed = 265;

        denner.applyTerrain(obstacles);
        denner.moveWithAnim(sx * baseSpeed * denner.terrainModifier * dt, sy * baseSpeed * denner.terrainModifier * dt, obstacles, mapW, mapH, dt);
    }

    /**
     * AI participants fleeing smartly from the Denner:
     * - Breaks line-of-sight behind tree trunks & bushes
     * - Panic sprints when Denner is within 180px
     * - Peeks and playfully taunts when safe (> 320px)
     */
    updateFleeingParticipant(p, denner, obstacles, mapW, mapH, dt) {
        if (!denner) return;

        const fdx = p.x - denner.x;
        const fdy = p.y - denner.y;
        const dist = Math.hypot(fdx, fdy) || 1;

        // Safe Distance: Peek & Taunt State
        if (dist > 340) {
            // Face the Denner playfully
            p.dx = -fdx / dist;
            p.dy = -fdy / dist;
            p.isMoving = false;
            p.walkTimer = 0;
            return;
        }

        let sx = fdx / dist;
        let sy = fdy / dist;

        // Tactical Tree Cover: If within medium range (140-300px), weave to put trees between self and Denner
        if (dist > 140 && dist < 320) {
            let bestCoverTree = null;
            let bestCoverScore = -Infinity;

            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
                if (obs.type === 'tree' && Math.abs(obs.x - p.x) < 220 && Math.abs(obs.y - p.y) < 220) {
                    const toObsX = obs.x - p.x;
                    const toObsY = obs.y - p.y;
                    const obsDist = Math.hypot(toObsX, toObsY);
                    if (obsDist > 25 && obsDist < 180) {
                        // Check if tree is roughly opposite the Denner
                        const dot = (toObsX * sx + toObsY * sy) / obsDist;
                        if (dot > 0.4 && dot > bestCoverScore) {
                            bestCoverScore = dot;
                            bestCoverTree = obs;
                        }
                    }
                }
            }

            if (bestCoverTree) {
                // Steer towards back side of the tree
                const toTreeX = bestCoverTree.x - p.x;
                const toTreeY = bestCoverTree.y - p.y;
                const tDist = Math.hypot(toTreeX, toTreeY) || 1;
                sx += (toTreeX / tDist) * 1.5;
                sy += (toTreeY / tDist) * 1.5;
            }
        }

        // Mutual participant separation so friends don't clump in the same direction
        for (let i = 0; i < this.participants.length; i++) {
            const other = this.participants[i];
            if (other === p || other === denner) continue;
            const odx = p.x - other.x;
            const ody = p.y - other.y;
            const odist = Math.hypot(odx, ody);
            if (odist < 95 && odist > 0) {
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
        if (p.x < 550) sx += 2.2;
        if (p.x > mapW - 1700) sx -= 2.2;
        if (p.y < 550) sy += 2.2;
        if (p.y > mapH - 550) sy -= 2.2;

        const sLen = Math.hypot(sx, sy) || 1;
        sx /= sLen;
        sy /= sLen;

        // Panic sprint burst when Denner is within 180px
        const isPanic = dist < 180;
        let speed = (p.currentSpeed || 270) * (isPanic ? 1.25 : 1.0);
        if (p === this.game.krishna) speed = 360;
        else if (p === this.game.balram) speed = 340;

        p.applyTerrain(obstacles);
        p.moveWithAnim(sx * speed * p.terrainModifier * dt, sy * speed * p.terrainModifier * dt, obstacles, mapW, mapH, dt);
    }

    draw(ctx) {
        if (!this.isActive || !this.currentDenner) return;

        const d = this.currentDenner;
        const drawY = d.y - (d.z || 0);

        ctx.save();

        // 1. On-Screen Highlighting & Badges for All Active Participants
        for (const p of this.participants) {
            if (p === d) continue; // Denner is highlighted with special big badge below

            const pDrawY = p.y - (p.z || 0);
            let pIcon = '🌿';
            let pColor = '#34d399';

            if (p === this.game.player) {
                pIcon = '🏃‍♂️';
                pColor = '#f59e0b';
            } else if (p === this.game.krishna) {
                pIcon = '🦚';
                pColor = '#38bdf8';
            } else if (p === this.game.balram) {
                pIcon = '🌾';
                pColor = '#f8fafc';
            } else if (p.name) {
                const sIcons = { Sudama: '🌼', Subal: '🌿', Madhumangal: '🥭', Dama: '🌸', Rishabh: '🍀' };
                pIcon = sIcons[p.name] || '🌿';
            }

            const pName = this.getParticipantName(p).replace(/\s*\(.*\)/, '');

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Ground ring under feet
            ctx.strokeStyle = pColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.radius || 18) + 6, 0, Math.PI * 2);
            ctx.stroke();

            // Overhead floating name badge
            ctx.globalAlpha = 0.88;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
            ctx.beginPath();
            ctx.roundRect(p.x - 45, pDrawY - 48, 90, 18, 9);
            ctx.fill();

            ctx.strokeStyle = pColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Outfit, sans-serif';
            ctx.fillText(`${pIcon} ${pName}`, p.x, pDrawY - 39);
            ctx.restore();
        }

        // 2. High-Visibility Denner Highlighting (Ring & Floating Badge)
        const dennerName = this.getParticipantName(d).replace(/\s*\(.*\)/, '');

        // Glowing Radiant Ring under Denner's feet (Pulsing fiery red/amber)
        const pulse = (Date.now() % 1000) / 1000;
        ctx.strokeStyle = this.state === 'countdown' ? '#facc15' : '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(d.x, d.y, (d.radius || 18) + 12 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Floating Denner Title & Countdown Badge above head
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.state === 'countdown') {
            const countNum = Math.ceil(this.countdownTimer);

            // Pulsing countdown circle
            ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
            ctx.beginPath();
            ctx.arc(d.x, drawY - 58, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 17px Outfit, sans-serif';
            ctx.fillText(`${countNum}`, d.x, drawY - 57);

            // Denner counting tag
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(d.x - 75, drawY - 92, 150, 24, 12);
            ctx.fill();

            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.fillText(`🎯 ${dennerName} (10s Count)`, d.x, drawY - 80);

        } else {
            // Chase mode: Glowing "🎯 DENNER: [Name]" badge
            ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
            ctx.beginPath();
            ctx.roundRect(d.x - 70, drawY - 62, 140, 26, 13);
            ctx.fill();

            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.fillText(`🎯 DENNER: ${dennerName}`, d.x, drawY - 49);
        }

        ctx.restore();
    }
}
