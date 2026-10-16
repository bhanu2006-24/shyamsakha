import { Entity } from './Entity.js';
import { assetLoader } from '../core/AssetLoader.js';

export const SAKHA_PRESETS = [
    { 
        name: "Sudama", 
        spriteKey: "sakha1", 
        color: "#eab308", 
        border: "#ca8a04", 
        minSpeed: 260, 
        maxSpeed: 335,
        dialogue: "Krishna, let's share some sweet snacks under the Kadamba tree! Nothing matches the joy of Your friendship.",
        questType: null
    },
    { 
        name: "Subal", 
        spriteKey: "sakha2", 
        color: "#f59e0b", 
        border: "#d97706", 
        minSpeed: 285, 
        maxSpeed: 365,
        dialogue: "Catch me if you can! I know every secret pathway in Vrindavan. Do you dare challenge me to a Footrace?",
        questType: 'race_challenge'
    },
    { 
        name: "Madhumangal", 
        spriteKey: "sakha3", 
        color: "#ec4899", 
        border: "#db2777", 
        minSpeed: 240, 
        maxSpeed: 315,
        dialogue: "If we win this ball game, Mother Yashoda promised us fresh laddoos! Kanha is hungry too, let's bring Him sweet mangoes!",
        questType: 'mango_task'
    },
    { 
        name: "Rishabh", 
        spriteKey: "sakha4", 
        color: "#10b981", 
        border: "#059669", 
        minSpeed: 265, 
        maxSpeed: 340,
        dialogue: "Let's pass the ball high into the air, over the Kadamba branches!",
        questType: null
    },
    { 
        name: "Vishal", 
        spriteKey: "sakha5", 
        color: "#8b5cf6", 
        border: "#7c3aed", 
        minSpeed: 255, 
        maxSpeed: 330,
        dialogue: "Playing by the Yamuna with Krishna makes every day a divine celebration.",
        questType: null
    },
    { 
        name: "Dama", 
        spriteKey: "sakha6", 
        color: "#06b6d4", 
        border: "#0891b2", 
        minSpeed: 270, 
        maxSpeed: 345,
        dialogue: "Dao Dada is on our team, nobody can beat His power spike!",
        questType: null
    },
    { 
        name: "Vasant", 
        spriteKey: "sakha7", 
        color: "#f97316", 
        border: "#ea580c", 
        minSpeed: 255, 
        maxSpeed: 330,
        dialogue: "Look at the gentle cows listening to Krishna's flute! Such peace in the pastures!",
        questType: null
    },
    { 
        name: "Arjun", 
        spriteKey: "sakha8", 
        color: "#38bdf8", 
        border: "#0284c7", 
        minSpeed: 275, 
        maxSpeed: 350,
        dialogue: "I will defend our side of the court with all my strength! Jaya Shree Krishna!",
        questType: null
    }
];

export class Sakha extends Entity {
    constructor(x, y, presetIndex = 0) {
        const preset = SAKHA_PRESETS[presetIndex % SAKHA_PRESETS.length];
        super(x, y, 16, preset.color, preset.minSpeed || 260, preset.maxSpeed || 340, 'sakha');
        this.name = preset.name;
        this.spriteKey = preset.spriteKey;
        this.borderColor = preset.border;
        this.dialogue = preset.dialogue;
        this.questType = preset.questType;
        this.walkTimer = 0;
        this.isMoving = false;
        
        // Pastoral Routine System (Lifelike Idle, Strolls, and Devotional Offerings)
        this.homeX = x;
        this.homeY = y;
        this.routineState = 'idle'; // 'idle', 'stroll', 'seek_fruit', 'carry_offering', 'offer_action', 'return_home'
        this.idleTimer = 2.0 + (presetIndex * 1.5) + Math.random() * 3.0; // Staggered peaceful standing
        this.strollTargetX = x;
        this.strollTargetY = y;
        this.strollTimer = 0;
        this.routineTimer = 25 + (presetIndex * 15) + Math.random() * 15;
        this.heldItem = null; // 'mango', 'flower', null
        this.targetOffering = 'krishna';
        this.targetTree = null;
        this.actionCooldown = 0;
    }

    moveTowardsWithAvoidance(targetX, targetY, speed, dt, obstacles, mapW, mapH, game) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 4) {
            this.isMoving = false;
            return 0;
        }

        let sx = dx / dist;
        let sy = dy / dist;

        // 1. Obstacle avoidance (steer around tree trunks, rocks, ponds)
        for (const obs of obstacles) {
            if (obs.shape === 'circle' && obs.type !== 'flower_carpet') {
                const odx = this.x - obs.x;
                const ody = this.y - obs.y;
                const oDist = Math.hypot(odx, ody);
                const safeZone = (obs.radius || 28) + this.radius + 35;
                if (oDist < safeZone && oDist > 0) {
                    const push = Math.pow((safeZone - oDist) / safeZone, 2) * 2.8;
                    sx += (odx / oDist) * push;
                    sy += (ody / oDist) * push;
                }
            }
        }

        // 2. Mutual Sakha separation force (never clump or overlap!)
        if (game && game.sakhas) {
            for (const other of game.sakhas) {
                if (other === this) continue;
                const odx = this.x - other.x;
                const ody = this.y - other.y;
                const oDist = Math.hypot(odx, ody);
                if (oDist < 48 && oDist > 0) {
                    const push = (48 - oDist) / 48 * 2.2;
                    sx += (odx / oDist) * push;
                    sy += (ody / oDist) * push;
                }
            }
        }

        const sLen = Math.hypot(sx, sy);
        if (sLen > 0) {
            sx /= sLen;
            sy /= sLen;
        }

        this.applyTerrain(obstacles);
        this.moveWithAnim(sx * speed * this.terrainModifier * dt, sy * speed * this.terrainModifier * dt, obstacles, mapW, mapH, dt);
        return dist;
    }

    updateRoutine(dt, obstacles, mapW, mapH, krishna, balram, game) {
        this.updateDynamicSpeed(dt);
        if (this.routineTimer > 0) this.routineTimer -= dt;

        if (this.routineState === 'idle') {
            this.isMoving = false;
            this.walkTimer = 0;
            this.idleTimer -= dt;

            // Face naturally towards Krishna / central resting mat
            if (krishna) {
                const fdx = krishna.x - this.x;
                const fdy = krishna.y - this.y;
                const fLen = Math.hypot(fdx, fdy);
                if (fLen > 0) {
                    this.dx = fdx / fLen;
                    this.dy = fdy / fLen;
                }
            }

            // Time to either stretch legs with a gentle stroll or start fruit offering
            if (this.routineTimer <= 0) {
                this.routineTimer = 35 + Math.random() * 30;
                // Find nearest mango tree or parijat bush
                let bestTree = null;
                let bestDist = Infinity;
                for (const obs of obstacles) {
                    if (obs.type === 'tree' && obs.treeType === 'mango') {
                        const d = Math.hypot(this.x - obs.x, this.y - obs.y);
                        if (d < bestDist) { bestDist = d; bestTree = obs; }
                    } else if (obs.type === 'bush') {
                        const d = Math.hypot(this.x - obs.x, this.y - obs.y);
                        if (d < bestDist && Math.random() < 0.5) { bestDist = d; bestTree = obs; }
                    }
                }

                if (bestTree && bestDist < 550) {
                    this.targetTree = bestTree;
                    this.routineState = 'seek_fruit';
                    this.actionCooldown = 0;
                    return;
                } else if (Math.random() < 0.35 && game && game.ui) {
                    this.pollPastimeCallout(game);
                }
            }

            if (this.idleTimer <= 0) {
                // Decide next relaxed action: short 1.5–2.5s stroll nearby
                const strollAngle = Math.random() * Math.PI * 2;
                const strollDist = 30 + Math.random() * 45;
                this.strollTargetX = this.homeX + Math.cos(strollAngle) * strollDist;
                this.strollTargetY = this.homeY + Math.sin(strollAngle) * strollDist;
                this.strollTimer = 1.8 + Math.random() * 1.2;
                this.routineState = 'stroll';
            }

        } else if (this.routineState === 'stroll') {
            this.strollTimer -= dt;
            const remaining = this.moveTowardsWithAvoidance(this.strollTargetX, this.strollTargetY, 55, dt, obstacles, mapW, mapH, game);

            if (remaining < 18 || this.strollTimer <= 0) {
                this.routineState = 'idle';
                this.idleTimer = 4.5 + Math.random() * 5.0; // Stand peacefully for 4.5–9.5 seconds
                this.isMoving = false;
                this.walkTimer = 0;
            }

        } else if (this.routineState === 'seek_fruit') {
            if (!this.targetTree) {
                this.routineState = 'return_home';
                return;
            }

            // Stand safely outside tree trunk / bush canopy
            const targetDist = (this.targetTree.radius || 28) + this.radius + 18;
            const curDist = Math.hypot(this.targetTree.x - this.x, this.targetTree.y - this.y);

            if (curDist > targetDist + 10) {
                this.moveTowardsWithAvoidance(this.targetTree.x, this.targetTree.y, this.currentSpeed * 0.72, dt, obstacles, mapW, mapH, game);
            } else {
                // Arrived at tree/bush! Pluck fruit or flower
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                if (this.actionCooldown >= 1.6) {
                    this.heldItem = (this.targetTree.type === 'bush') ? 'flower' : 'mango';
                    this.targetOffering = Math.random() < 0.7 ? 'krishna' : 'balram';
                    this.routineState = 'carry_offering';
                    this.actionCooldown = 0;
                    if (game && game.particles) {
                        game.particles.createPetals(this.x, this.y - 20, this.heldItem === 'flower' ? '#f472b6' : '#facc15', 12);
                    }
                }
            }

        } else if (this.routineState === 'carry_offering') {
            const targetObj = (this.targetOffering === 'krishna' && krishna) ? krishna : balram;
            if (!targetObj) {
                this.routineState = 'return_home';
                return;
            }

            // Stand respectfully 55px in front of Krishna / Balram
            const stopDist = 58;
            const curDist = Math.hypot(targetObj.x - this.x, (targetObj.y + 35) - this.y);

            if (curDist > stopDist) {
                this.moveTowardsWithAvoidance(targetObj.x, targetObj.y + 35, this.currentSpeed * 0.75, dt, obstacles, mapW, mapH, game);
            } else {
                // Arrived at Krishna / Balram! Present offering
                this.routineState = 'offer_action';
                this.actionCooldown = 0;
                this.isMoving = false;
                this.walkTimer = 0;

                const fdx = targetObj.x - this.x;
                const fdy = targetObj.y - this.y;
                const fLen = Math.hypot(fdx, fdy) || 1;
                this.dx = fdx / fLen;
                this.dy = fdy / fLen;

                if (game) {
                    if (this.targetOffering === 'krishna') {
                        if (game.particles) game.particles.createSparkle(krishna.x, krishna.y - 30, '#fde047', 25);
                        if (game.sound) game.sound.playFluteNote(587.33, 0.2);
                        if (game.ui) {
                            const quotes = [
                                `${this.name} offers a golden ripe mango to Kanha: "Kanha, the sweetest fruit from the top branch for You!" 🥭`,
                                `${this.name} offers fresh Vrindavan blossoms to Krishna: "Kanha, look at these sweet Parijat flowers!" 🌸`,
                                `${this.name} smiles lovingly: "Kanha, Your smile makes our day complete!" 🦚`
                            ];
                            game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)], 4000);
                        }
                    } else if (balram) {
                        if (game.particles) game.particles.createSparkle(balram.x, balram.y - 30, '#38bdf8', 25);
                        if (game.sound) game.sound.playCheer();
                        if (game.ui) {
                            game.ui.showToast(`${this.name} presents fresh fruit to Dao Balram: "Dao Dada, enjoy this sweet mango!" 🥭`, 4000);
                        }
                    }
                }
            }

        } else if (this.routineState === 'offer_action') {
            this.actionCooldown += dt;
            this.isMoving = false;
            this.walkTimer = 0;
            if (this.actionCooldown >= 2.5) {
                this.heldItem = null;
                this.routineState = 'return_home';
            }

        } else if (this.routineState === 'return_home') {
            const remaining = this.moveTowardsWithAvoidance(this.homeX, this.homeY, 65, dt, obstacles, mapW, mapH, game);
            if (remaining < 25) {
                this.routineState = 'idle';
                this.idleTimer = 6.0 + Math.random() * 6.0;
                this.routineTimer = 35 + Math.random() * 30;
                this.isMoving = false;
                this.walkTimer = 0;
            }
        }
    }

    pollPastimeCallout(game) {
        const polls = [
            `🏃‍♂️ ${this.name} calls out: "Kanha! Let's have a Footrace (गोचारण दौड़) across the groves!"`,
            `🏐 ${this.name} shouts joyfully: "Dao Dada, what say we play Kanduka Kridha (Volleyball) by the sandbanks?"`,
            `💦 ${this.name} laughs: "Who is ready for a splash of Rangotsav (Holi) color fight today?"`,
            `🏃‍♂️ ${this.name}: "Let's play Pakad Pakdai (Tag Chase)! Kanha and Dau get a head start!"`
        ];
        game.ui.showToast(polls[Math.floor(Math.random() * polls.length)], 4500);
    }

    draw(ctx) {
        // Draw character sprite sheet from assets/images/sakha X.png
        const drawn = assetLoader.drawCharacter(
            ctx,
            this.spriteKey,
            this.x,
            this.y,
            this.z,
            this.dx,
            this.dy,
            this.isMoving,
            this.walkTimer,
            68,
            82
        );

        if (!drawn) {
            super.draw(ctx);
        }

        // Draw held item when carrying offering (mango / flower)
        if (this.heldItem) {
            ctx.save();
            ctx.font = '16px serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 4;
            const itemIcon = this.heldItem === 'mango' ? '🥭' : '🌸';
            ctx.fillText(itemIcon, this.x + 12, this.y - this.z - 44);
            ctx.restore();
        }

        // Holi splat overlay if caught
        if (this.isCaught) {
            ctx.save();
            ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.z - 38, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
