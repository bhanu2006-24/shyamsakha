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
        
        // Dynamic Pastoral Routine System
        this.homeX = x;
        this.homeY = y;
        this.routineState = 'idle'; 
        // Possible states:
        // 'idle', 'stroll', 'seek_fruit', 'seek_water', 'carry_offering', 'offer_action',
        // 'seek_prank_target', 'flee_prank', 'chase_prankster', 'pet_cow', 'chat',
        // 'chase_monkey', 'return_home'

        this.idleTimer = 1.0 + (presetIndex * 0.5) + Math.random() * 1.2;
        this.strollTargetX = x;
        this.strollTargetY = y;
        this.strollTimer = 0;
        // Immediate staggered routine starts: 1.0s, 2.3s, 3.6s, 4.9s... Sakhas act immediately!
        this.routineTimer = 1.0 + (presetIndex * 1.3);
        this.heldItem = null; // 'mango', 'flower', 'water_pot'
        this.targetOffering = 'krishna';
        this.targetTree = null;
        this.targetCow = null;
        this.targetFriend = null;
        this.targetMonkey = null;
        this.actionCooldown = 0;
        this.bubbleIcon = null;
        this.bubbleTimer = 0;
        this.courtHomeX = x;
        this.courtHomeY = y;
    }

    moveTowardsWithAvoidance(targetX, targetY, speed, dt, obstacles, mapW, mapH, game) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) {
            this.isMoving = false;
            return 0;
        }

        let sx = dx / dist;
        let sy = dy / dist;

        // 1. Obstacle avoidance (Fast Bounding-Box Pre-Filter: check only obstacles within 180px)
        const checkRange = 180;
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            if (obs.shape === 'circle' && obs.type !== 'flower_carpet') {
                if (Math.abs(this.x - obs.x) > checkRange || Math.abs(this.y - obs.y) > checkRange) continue;
                const odx = this.x - obs.x;
                const ody = this.y - obs.y;
                const oDist = Math.hypot(odx, ody);
                const safeZone = (obs.radius || 28) + this.radius + 30;
                if (oDist < safeZone && oDist > 0) {
                    const push = Math.pow((safeZone - oDist) / safeZone, 2) * 2.6;
                    sx += (odx / oDist) * push;
                    sy += (ody / oDist) * push;
                }
            }
        }

        // 2. Mutual Sakha separation force
        if (game && game.sakhas) {
            for (let i = 0; i < game.sakhas.length; i++) {
                const other = game.sakhas[i];
                if (other === this) continue;
                const odx = this.x - other.x;
                const ody = this.y - other.y;
                if (Math.abs(odx) > 60 || Math.abs(ody) > 60) continue;
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

    /**
     * Lifelike Autonomous Behavior in Vrindavan Hub:
     * Sakhas randomly take on diverse tasks: plucking mangoes, gathering flowers,
     * fetching Yamuna Jal, petting cows, playful water splashing pranks, and chasing monkeys!
     */
    updateRoutine(dt, obstacles, mapW, mapH, krishna, balram, game) {
        this.updateDynamicSpeed(dt);
        if (this.routineTimer > 0) this.routineTimer -= dt;
        if (this.bubbleTimer > 0) {
            this.bubbleTimer -= dt;
            if (this.bubbleTimer <= 0) this.bubbleIcon = null;
        }

        // --- IDLE STATE ---
        if (this.routineState === 'idle') {
            this.isMoving = false;
            this.walkTimer = 0;
            this.idleTimer -= dt;

            // Face naturally towards Krishna or central clearing
            if (krishna) {
                const fdx = krishna.x - this.x;
                const fdy = krishna.y - this.y;
                const fLen = Math.hypot(fdx, fdy);
                if (fLen > 0) {
                    this.dx = fdx / fLen;
                    this.dy = fdy / fLen;
                }
            }

            // Pick a brand new random pastoral task immediately!
            if (this.routineTimer <= 0) {
                this.routineTimer = 2.0 + Math.random() * 3.0;
                const roll = Math.random();

                if (roll < 0.28) {
                    // 1. Mango Plucking Task (Closest mango tree or fruit resource)
                    let bestTree = null;
                    let bestDist = Infinity;
                    for (let i = 0; i < obstacles.length; i++) {
                        const obs = obstacles[i];
                        if (obs.type === 'tree' && (obs.treeType === 'mango' || obs.hasResource === 'fruit')) {
                            const d = Math.hypot(this.x - obs.x, this.y - obs.y);
                            if (d < bestDist) { bestDist = d; bestTree = obs; }
                        }
                    }
                    if (bestTree) {
                        this.targetTree = bestTree;
                        this.routineState = 'seek_fruit';
                        this.actionCooldown = 0;
                        this.bubbleIcon = '🥭';
                        this.bubbleTimer = 3.0;
                        if (game && game.ui) {
                            game.ui.showToast(`🥭 ${this.name} runs to pluck sweet ripe mangoes for Kanha!`);
                        }
                        return;
                    }
                } else if (roll < 0.52) {
                    // 2. Flower Gathering Task (Closest bush or Parijat flower tree)
                    let bestTree = null;
                    let bestDist = Infinity;
                    for (let i = 0; i < obstacles.length; i++) {
                        const obs = obstacles[i];
                        if (obs.type === 'bush' || (obs.type === 'tree' && (obs.treeType === 'parijat' || obs.hasResource === 'flower'))) {
                            const d = Math.hypot(this.x - obs.x, this.y - obs.y);
                            if (d < bestDist) { bestDist = d; bestTree = obs; }
                        }
                    }
                    if (bestTree) {
                        this.targetTree = bestTree;
                        this.routineState = 'seek_fruit';
                        this.actionCooldown = 0;
                        this.bubbleIcon = '🌸';
                        this.bubbleTimer = 3.0;
                        if (game && game.ui) {
                            game.ui.showToast(`🌸 ${this.name} skips towards the fragrant bushes to gather blossoms!`);
                        }
                        return;
                    }
                } else if (roll < 0.72) {
                    // 3. Yamuna Jal Fetching / Water Service (Sacred Jal Shrine in clearing)
                    this.routineState = 'seek_water';
                    this.actionCooldown = 0;
                    this.bubbleIcon = '🏺';
                    this.bubbleTimer = 2.5;
                    if (game && game.ui) {
                        game.ui.showToast(`🏺 ${this.name} goes to fetch cool Yamuna Jal in a clay Kalash!`);
                    }
                    return;
                } else if (roll < 0.88 && game && game.cows && game.cows.length > 0) {
                    // 4. Pet & Feed Gau Mata (Cow)
                    const cow = game.cows[Math.floor(Math.random() * game.cows.length)];
                    this.targetCow = cow;
                    this.routineState = 'pet_cow';
                    this.actionCooldown = 0;
                    this.bubbleIcon = '🌿';
                    this.bubbleTimer = 2.5;
                    if (game && game.ui) {
                        game.ui.showToast(`🐄 ${this.name} goes to pet Gau Mata and offer fresh durva grass!`);
                    }
                    return;
                } else if (game && game.sakhas && game.sakhas.length > 1) {
                    // 5. Friendly Chat
                    const otherSakhas = game.sakhas.filter(s => s !== this && s.routineState === 'idle');
                    if (otherSakhas.length > 0) {
                        this.targetFriend = otherSakhas[Math.floor(Math.random() * otherSakhas.length)];
                        this.routineState = 'chat';
                        this.actionCooldown = 0;
                        this.bubbleIcon = '💬';
                        this.bubbleTimer = 2.5;
                        this.targetFriend.bubbleIcon = '😄';
                        this.targetFriend.bubbleTimer = 2.5;
                        if (game && game.ui) {
                            game.ui.showToast(`🌾 ${this.name} and ${this.targetFriend.name} share stories and laughter under the Kadamba tree!`);
                        }
                        return;
                    }
                } else if (Math.random() < 0.35 && game && game.ui) {
                    this.pollPastimeCallout(game);
                }
            }

            if (this.idleTimer <= 0) {
                // Short stroll nearby
                const strollAngle = Math.random() * Math.PI * 2;
                const strollDist = 35 + Math.random() * 55;
                this.strollTargetX = this.homeX + Math.cos(strollAngle) * strollDist;
                this.strollTargetY = this.homeY + Math.sin(strollAngle) * strollDist;
                this.strollTimer = 1.6 + Math.random() * 1.2;
                this.routineState = 'stroll';
            }

        // --- STROLL STATE ---
        } else if (this.routineState === 'stroll') {
            this.strollTimer -= dt;
            const remaining = this.moveTowardsWithAvoidance(this.strollTargetX, this.strollTargetY, 68, dt, obstacles, mapW, mapH, game);

            if (remaining < 20 || this.strollTimer <= 0) {
                this.routineState = 'idle';
                this.idleTimer = 1.2 + Math.random() * 1.8;
                this.isMoving = false;
                this.walkTimer = 0;
            }

        // --- SEEK FRUIT / FLOWER ---
        } else if (this.routineState === 'seek_fruit') {
            if (!this.targetTree) {
                this.routineState = 'return_home';
                return;
            }

            const targetDist = (this.targetTree.radius || 28) + this.radius + 18;
            const curDist = Math.hypot(this.targetTree.x - this.x, this.targetTree.y - this.y);

            if (curDist > targetDist + 15) {
                this.moveTowardsWithAvoidance(this.targetTree.x, this.targetTree.y, this.currentSpeed * 0.78, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                if (this.actionCooldown >= 1.4) {
                    const isFlower = (this.targetTree.type === 'bush' || this.targetTree.treeType === 'parijat' || this.targetTree.hasResource === 'flower');
                    this.heldItem = isFlower ? 'flower' : 'mango';
                    // 65% Krishna, 25% Balram, 10% Player
                    const r = Math.random();
                    this.targetOffering = r < 0.65 ? 'krishna' : (r < 0.9 ? 'balram' : 'player');
                    this.routineState = 'carry_offering';
                    this.actionCooldown = 0;
                    this.bubbleIcon = this.heldItem === 'flower' ? '🌸' : '🥭';
                    this.bubbleTimer = 5.0;
                    if (game && game.particles) {
                        game.particles.createPetals(this.x, this.y - 20, isFlower ? '#f472b6' : '#facc15', 16);
                    }
                }
            }

        // --- SEEK YAMUNA WATER (Jal Seva) ---
        } else if (this.routineState === 'seek_water') {
            // Sacred Jal Shrine in clearing (at cx + 340, cy + 90)
            const map = (game && game.mapManager && game.mapManager.currentMap) || { centerX: 8000, centerY: 7400 };
            const waterX = map.centerX + 340;
            const waterY = map.centerY + 90;
            const curDist = Math.hypot(waterX - this.x, waterY - this.y);

            if (curDist > 45) {
                this.moveTowardsWithAvoidance(waterX, waterY, this.currentSpeed * 0.78, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                if (this.actionCooldown >= 1.2) {
                    this.heldItem = 'water_pot';
                    this.actionCooldown = 0;
                    this.bubbleIcon = '🏺';
                    this.bubbleTimer = 4.0;
                    if (game && game.particles) {
                        game.particles.createSparkle(this.x, this.y - 15, '#38bdf8', 16);
                    }

                    // 40% chance of playful water prank on a friend!
                    if (Math.random() < 0.4 && game && game.sakhas && game.sakhas.length > 1) {
                        const candidates = game.sakhas.filter(s => s !== this);
                        this.targetFriend = candidates[Math.floor(Math.random() * candidates.length)];
                        this.routineState = 'seek_prank_target';
                        this.bubbleIcon = '🤫';
                    } else {
                        this.targetOffering = Math.random() < 0.7 ? 'krishna' : 'balram';
                        this.routineState = 'carry_offering';
                    }
                }
            }

        // --- CARRY DEVOTIONAL OFFERING ---
        } else if (this.routineState === 'carry_offering') {
            let targetObj = krishna;
            if (this.targetOffering === 'balram') targetObj = balram;
            if (this.targetOffering === 'player') targetObj = game.player;

            if (!targetObj) {
                this.routineState = 'return_home';
                return;
            }

            const stopDist = 62;
            const curDist = Math.hypot(targetObj.x - this.x, (targetObj.y + 35) - this.y);

            if (curDist > stopDist) {
                this.moveTowardsWithAvoidance(targetObj.x, targetObj.y + 35, this.currentSpeed * 0.76, dt, obstacles, mapW, mapH, game);
            } else {
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
                                `${this.name} lovingly presents fresh offering to Kanha: "Kanha, the sweetest mango from Vrindavan for You!" 🥭`,
                                `${this.name} offers fragrant Yamuna Jal: "Cool, sweet Yamuna Jal for You, Kanha!" 🏺`,
                                `${this.name} places fresh blossoms: "A fragrant garland for my beloved Shyam!" 🌸`
                            ];
                            game.ui.showToast(quotes[Math.floor(Math.random() * quotes.length)], 4000);
                        }
                    } else if (balram) {
                        if (game.particles) game.particles.createSparkle(balram.x, balram.y - 30, '#38bdf8', 25);
                        if (game.sound) game.sound.playCheer();
                        if (game.ui) {
                            game.ui.showToast(`${this.name} presents cool Yamuna Jal & fruit to Dao Balram! 🌾`, 4000);
                        }
                    } else if (game.player) {
                        if (game.particles) game.particles.createSparkle(game.player.x, game.player.y - 25, '#4ade80', 25);
                        if (game.ui) {
                            game.ui.showToast(`${this.name} shares sweet forest prasadam with you! "Here my dear friend, taste this bliss!" 🥭`, 4000);
                        }
                    }
                }
            }

        // --- OFFER ACTION FINALIZE ---
        } else if (this.routineState === 'offer_action') {
            this.actionCooldown += dt;
            this.isMoving = false;
            this.walkTimer = 0;
            if (this.actionCooldown >= 1.8) {
                this.heldItem = null;
                this.routineState = 'return_home';
            }

        // --- PLAYFUL WATER SPLASH PRANK ---
        } else if (this.routineState === 'seek_prank_target') {
            if (!this.targetFriend) {
                this.routineState = 'return_home';
                return;
            }

            const dist = Math.hypot(this.targetFriend.x - this.x, this.targetFriend.y - this.y);
            if (dist > 45) {
                this.moveTowardsWithAvoidance(this.targetFriend.x, this.targetFriend.y, this.currentSpeed * 0.85, dt, obstacles, mapW, mapH, game);
            } else {
                // SPLASH WATER!
                this.isMoving = false;
                this.walkTimer = 0;
                this.heldItem = null;
                this.bubbleIcon = '💦';
                this.bubbleTimer = 3.0;

                const victim = this.targetFriend;
                victim.routineState = 'chase_prankster';
                victim.targetFriend = this;
                victim.bubbleIcon = '💢';
                victim.bubbleTimer = 3.0;

                this.routineState = 'flee_prank';
                this.actionCooldown = 5.0;

                if (game) {
                    if (game.particles) {
                        game.particles.createSparkle(victim.x, victim.y - 20, '#38bdf8', 30);
                    }
                    if (game.sound) game.sound.playBallBounce();
                    if (game.ui) {
                        game.ui.showToast(`💦 छपाक! ${this.name} ने ${victim.name} पर यमुना जल छिड़क दिया! अरे भागो!`, 4500);
                    }
                }
            }

        // --- FLEE PRANK (Prankster giggling away!) ---
        } else if (this.routineState === 'flee_prank') {
            this.actionCooldown -= dt;
            if (this.targetFriend) {
                const fdx = this.x - this.targetFriend.x;
                const fdy = this.y - this.targetFriend.y;
                const fDist = Math.hypot(fdx, fdy) || 1;
                this.moveWithAnim((fdx / fDist) * this.currentSpeed * 0.95 * dt, (fdy / fDist) * this.currentSpeed * 0.95 * dt, obstacles, mapW, mapH, dt);
            }

            if (this.actionCooldown <= 0) {
                this.routineState = 'return_home';
                this.targetFriend = null;
            }

        // --- CHASE PRANKSTER (Splashed friend playfully chasing!) ---
        } else if (this.routineState === 'chase_prankster') {
            if (!this.targetFriend || this.targetFriend.routineState !== 'flee_prank') {
                this.routineState = 'return_home';
                this.targetFriend = null;
                return;
            }

            const dist = Math.hypot(this.targetFriend.x - this.x, this.targetFriend.y - this.y);
            if (dist > 30) {
                this.moveTowardsWithAvoidance(this.targetFriend.x, this.targetFriend.y, this.currentSpeed * 0.92, dt, obstacles, mapW, mapH, game);
            } else {
                // Caught the prankster! Laughter all around
                this.routineState = 'idle';
                this.idleTimer = 2.0;
                this.routineTimer = 2.5;
                this.targetFriend.routineState = 'idle';
                this.targetFriend.idleTimer = 2.0;
                this.targetFriend.routineTimer = 2.5;
                if (game && game.ui) {
                    game.ui.showToast(`😂 ${this.name} ने पकड़ लिया! दोनों सखा आनन्द से हंस पड़े!`, 4000);
                }
            }

        // --- PET & FEED COW (Gau Mata Seva) ---
        } else if (this.routineState === 'pet_cow') {
            if (!this.targetCow) {
                this.routineState = 'return_home';
                return;
            }

            const curDist = Math.hypot(this.targetCow.x - this.x, this.targetCow.y - this.y);
            if (curDist > 55) {
                this.moveTowardsWithAvoidance(this.targetCow.x, this.targetCow.y, this.currentSpeed * 0.72, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                this.bubbleIcon = '❤️';
                this.bubbleTimer = 2.5;

                if (this.actionCooldown >= 2.4) {
                    if (game && game.particles) {
                        game.particles.createSparkle(this.targetCow.x, this.targetCow.y - 25, '#f472b6', 20);
                    }
                    if (game && game.sound) game.sound.playFluteNote(440, 0.3);
                    if (game && game.ui) {
                        game.ui.showToast(`🐄 ${this.name} ने गौ माता को हरी दूर्वा घास खिलाई और प्यार से सहलाया!`, 4000);
                    }
                    this.targetCow = null;
                    this.routineState = 'return_home';
                }
            }

        // --- CHAT WITH FRIEND ---
        } else if (this.routineState === 'chat') {
            if (!this.targetFriend) {
                this.routineState = 'return_home';
                return;
            }

            const dist = Math.hypot(this.targetFriend.x - this.x, this.targetFriend.y - this.y);
            if (dist > 45) {
                this.moveTowardsWithAvoidance(this.targetFriend.x, this.targetFriend.y, this.currentSpeed * 0.72, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                this.bubbleIcon = '💬';
                this.bubbleTimer = 2.5;

                if (this.actionCooldown >= 2.5) {
                    this.targetFriend = null;
                    this.routineState = 'return_home';
                }
            }

        // --- CHASE MONKEY (When a monkey steals food!) ---
        } else if (this.routineState === 'chase_monkey') {
            if (!this.targetMonkey || this.targetMonkey.state !== 'flee_with_loot') {
                this.routineState = 'return_home';
                this.targetMonkey = null;
                return;
            }

            this.bubbleIcon = '🐒';
            this.bubbleTimer = 2.0;

            const dist = Math.hypot(this.targetMonkey.x - this.x, this.targetMonkey.y - this.y);
            this.moveTowardsWithAvoidance(this.targetMonkey.x, this.targetMonkey.y, this.currentSpeed * 0.98, dt, obstacles, mapW, mapH, game);

        // --- ASK KRISHNA TO START GAME ---
        } else if (this.routineState === 'ask_krishna') {
            if (!krishna) {
                this.routineState = 'idle';
                return;
            }
            this.bubbleIcon = '🗣️';
            this.bubbleTimer = 0.5;

            // Sprint energetically towards Krishna's location
            const dist = this.moveTowardsWithAvoidance(krishna.x, krishna.y, 460, dt, obstacles, mapW, mapH, game);
            this.askTimer = (this.askTimer || 0) + dt;

            // Particle footstep dust
            if (game && game.particles && Math.random() < 0.35) {
                game.particles.createDust(this.x, this.y + 10, '#fde047', 2);
            }

            // When reaching near Krishna (dist < 180) or after sprint timeout (2.0s)
            if (dist < 180 || this.askTimer >= 2.0) {
                this.isMoving = false;
                this.walkTimer = 0;
                this.routineState = 'idle';
                const modeToStart = this.askGameMode || 'dennertag';
                this.askGameMode = null;
                this.askTimer = 0;

                // Krishna turns and answers!
                if (game) {
                    game.playFluteMelody();
                    if (game.particles) {
                        game.particles.createSparkle(krishna.x, krishna.y - 25, '#fef08a', 45);
                    }
                    const pastimesNames = {
                        volleyball: "Kanduka Kridha (Volleyball)",
                        dennertag: "Dām Denā (Tag with Denner / पकड़ा-पकड़ी)",
                        tag: "Pakad Pakdai (Tag Chase)",
                        holi: "Rangotsav (Holi Battle)",
                        race: "Dhaavan Spardha (Footrace / दौड़)"
                    };
                    const gName = pastimesNames[modeToStart] || modeToStart;
                    game.ui.showToast(`🦚 Shree Krishna calls out: "Ha ha! Splendid, ${this.name}! Let ${gName} begin right where everyone is!" 🪈`, 4500);
                    setTimeout(() => {
                        game.startGameMode(modeToStart);
                    }, 400);
                }
            }

        // --- RETURN HOME ---
        } else if (this.routineState === 'return_home') {
            const remaining = this.moveTowardsWithAvoidance(this.homeX, this.homeY, this.currentSpeed * 0.74, dt, obstacles, mapW, mapH, game);
            if (remaining < 32) {
                this.routineState = 'idle';
                this.idleTimer = 1.2 + Math.random() * 1.5;
                this.routineTimer = 2.0 + Math.random() * 3.0; // Starts next lively routine in 2-5 seconds!
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
            `🏃‍♂️ ${this.name}: "Let's play Dām Denā (पकड़ा-पकड़ी)! Who will be the first Denner?"`
        ];
        game.ui.showToast(polls[Math.floor(Math.random() * polls.length)], 4500);
    }

    draw(ctx) {
        // Draw character sprite sheet
        const drawn = assetLoader.drawCharacter(
            ctx,
            this.spriteKey,
            this.x,
            this.y,
            this.z,
            this.renderDx !== undefined ? this.renderDx : this.dx,
            this.renderDy !== undefined ? this.renderDy : this.dy,
            this.isMoving,
            this.walkTimer,
            68,
            82
        );

        if (!drawn) {
            super.draw(ctx);
        }

        // Draw held item above Sakha's head with charming bobbing animation badge
        if (this.heldItem) {
            ctx.save();
            const bob = Math.sin(Date.now() * 0.006) * 4;
            const itemY = this.y - this.z - 48 + bob;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.x + 14, itemY - 6, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.font = '15px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let itemIcon = '🥭';
            if (this.heldItem === 'flower') itemIcon = '🌸';
            if (this.heldItem === 'water_pot') itemIcon = '🏺';
            ctx.fillText(itemIcon, this.x + 14, itemY - 5);
            ctx.restore();
        }

        // Draw emotion / thought bubble with clean dialogue cloud style
        if (this.bubbleIcon) {
            ctx.save();
            const bubbleY = this.y - this.z - (this.heldItem ? 68 : 52);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(this.x - 14, bubbleY - 14, 28, 22, 7);
            ctx.fill();
            ctx.stroke();

            ctx.font = '14px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.bubbleIcon, this.x, bubbleY - 2);
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
