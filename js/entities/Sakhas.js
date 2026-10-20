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

        this.idleTimer = 2.0 + (presetIndex * 1.2) + Math.random() * 2.5;
        this.strollTargetX = x;
        this.strollTargetY = y;
        this.strollTimer = 0;
        this.routineTimer = 18 + (presetIndex * 8) + Math.random() * 12;
        this.heldItem = null; // 'mango', 'flower', 'water_pot'
        this.targetOffering = 'krishna';
        this.targetTree = null;
        this.targetCow = null;
        this.targetFriend = null;
        this.targetMonkey = null;
        this.actionCooldown = 0;
        this.bubbleIcon = null;
        this.bubbleTimer = 0;
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

        // 1. Obstacle avoidance
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

        // 2. Mutual Sakha separation force
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

            // Pick a brand new random pastoral task!
            if (this.routineTimer <= 0) {
                this.routineTimer = 25 + Math.random() * 25;
                const roll = Math.random();

                if (roll < 0.25) {
                    // 1. Mango Offering Task
                    let bestTree = null;
                    let bestDist = Infinity;
                    for (const obs of obstacles) {
                        if (obs.type === 'tree' && obs.treeType === 'mango') {
                            const d = Math.hypot(this.x - obs.x, this.y - obs.y);
                            if (d < bestDist) { bestDist = d; bestTree = obs; }
                        }
                    }
                    if (bestTree) {
                        this.targetTree = bestTree;
                        this.routineState = 'seek_fruit';
                        this.actionCooldown = 0;
                        return;
                    }
                } else if (roll < 0.45) {
                    // 2. Flower Gathering Task
                    let bestTree = null;
                    let bestDist = Infinity;
                    for (const obs of obstacles) {
                        if (obs.type === 'bush' || (obs.type === 'tree' && obs.treeType === 'parijat')) {
                            const d = Math.hypot(this.x - obs.x, this.y - obs.y);
                            if (d < bestDist) { bestDist = d; bestTree = obs; }
                        }
                    }
                    if (bestTree) {
                        this.targetTree = bestTree;
                        this.routineState = 'seek_fruit';
                        this.actionCooldown = 0;
                        return;
                    }
                } else if (roll < 0.65) {
                    // 3. Yamuna Jal Fetching / Water Service
                    this.routineState = 'seek_water';
                    this.actionCooldown = 0;
                    return;
                } else if (roll < 0.82 && game && game.cows && game.cows.length > 0) {
                    // 4. Pet & Feed Gau Mata (Cow)
                    const cow = game.cows[Math.floor(Math.random() * game.cows.length)];
                    this.targetCow = cow;
                    this.routineState = 'pet_cow';
                    this.actionCooldown = 0;
                    return;
                } else if (roll < 0.92 && game && game.sakhas && game.sakhas.length > 1) {
                    // 5. Friendly Chat
                    const otherSakhas = game.sakhas.filter(s => s !== this && s.routineState === 'idle');
                    if (otherSakhas.length > 0) {
                        this.targetFriend = otherSakhas[Math.floor(Math.random() * otherSakhas.length)];
                        this.routineState = 'chat';
                        this.actionCooldown = 0;
                        return;
                    }
                } else if (Math.random() < 0.4 && game && game.ui) {
                    this.pollPastimeCallout(game);
                }
            }

            if (this.idleTimer <= 0) {
                // Short stroll nearby
                const strollAngle = Math.random() * Math.PI * 2;
                const strollDist = 35 + Math.random() * 55;
                this.strollTargetX = this.homeX + Math.cos(strollAngle) * strollDist;
                this.strollTargetY = this.homeY + Math.sin(strollAngle) * strollDist;
                this.strollTimer = 2.0 + Math.random() * 1.5;
                this.routineState = 'stroll';
            }

        // --- STROLL STATE ---
        } else if (this.routineState === 'stroll') {
            this.strollTimer -= dt;
            const remaining = this.moveTowardsWithAvoidance(this.strollTargetX, this.strollTargetY, 60, dt, obstacles, mapW, mapH, game);

            if (remaining < 20 || this.strollTimer <= 0) {
                this.routineState = 'idle';
                this.idleTimer = 4.0 + Math.random() * 4.5;
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

            if (curDist > targetDist + 12) {
                this.moveTowardsWithAvoidance(this.targetTree.x, this.targetTree.y, this.currentSpeed * 0.75, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                if (this.actionCooldown >= 1.6) {
                    this.heldItem = (this.targetTree.type === 'bush' || this.targetTree.treeType === 'parijat') ? 'flower' : 'mango';
                    // 70% Krishna, 20% Balram, 10% Player
                    const r = Math.random();
                    this.targetOffering = r < 0.7 ? 'krishna' : (r < 0.9 ? 'balram' : 'player');
                    this.routineState = 'carry_offering';
                    this.actionCooldown = 0;
                    if (game && game.particles) {
                        game.particles.createPetals(this.x, this.y - 20, this.heldItem === 'flower' ? '#f472b6' : '#facc15', 14);
                    }
                }
            }

        // --- SEEK YAMUNA WATER ---
        } else if (this.routineState === 'seek_water') {
            // Shoreline around x: 14320
            const shoreX = 14320;
            const shoreY = Math.max(3000, Math.min(13000, this.homeY + (Math.random() - 0.5) * 400));
            const curDist = Math.hypot(shoreX - this.x, shoreY - this.y);

            if (curDist > 45) {
                this.moveTowardsWithAvoidance(shoreX, shoreY, this.currentSpeed * 0.78, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                if (this.actionCooldown >= 1.5) {
                    this.heldItem = 'water_pot';
                    this.actionCooldown = 0;
                    if (game && game.particles) {
                        game.particles.createSparkle(this.x, this.y - 15, '#38bdf8', 15);
                    }

                    // 40% chance of playful water prank on a friend!
                    if (Math.random() < 0.4 && game && game.sakhas && game.sakhas.length > 1) {
                        const candidates = game.sakhas.filter(s => s !== this);
                        this.targetFriend = candidates[Math.floor(Math.random() * candidates.length)];
                        this.routineState = 'seek_prank_target';
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

            const stopDist = 58;
            const curDist = Math.hypot(targetObj.x - this.x, (targetObj.y + 35) - this.y);

            if (curDist > stopDist) {
                this.moveTowardsWithAvoidance(targetObj.x, targetObj.y + 35, this.currentSpeed * 0.75, dt, obstacles, mapW, mapH, game);
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
                    }
                }
            }

        // --- OFFER ACTION FINALIZE ---
        } else if (this.routineState === 'offer_action') {
            this.actionCooldown += dt;
            this.isMoving = false;
            this.walkTimer = 0;
            if (this.actionCooldown >= 2.2) {
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
                this.actionCooldown = 7.0;

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
                this.idleTimer = 3.0;
                this.targetFriend.routineState = 'idle';
                this.targetFriend.idleTimer = 3.0;
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
                this.moveTowardsWithAvoidance(this.targetCow.x, this.targetCow.y, this.currentSpeed * 0.7, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                this.bubbleIcon = '❤️';
                this.bubbleTimer = 2.5;

                if (this.actionCooldown >= 2.8) {
                    if (game && game.particles) {
                        game.particles.createSparkle(this.targetCow.x, this.targetCow.y - 25, '#f472b6', 18);
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
                this.moveTowardsWithAvoidance(this.targetFriend.x, this.targetFriend.y, this.currentSpeed * 0.7, dt, obstacles, mapW, mapH, game);
            } else {
                this.isMoving = false;
                this.walkTimer = 0;
                this.actionCooldown += dt;
                this.bubbleIcon = '💬';
                this.bubbleTimer = 2.5;

                if (this.actionCooldown >= 3.0) {
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
            const remaining = this.moveTowardsWithAvoidance(this.homeX, this.homeY, 65, dt, obstacles, mapW, mapH, game);
            if (remaining < 25) {
                this.routineState = 'idle';
                this.idleTimer = 4.0 + Math.random() * 5.0;
                this.routineTimer = 25 + Math.random() * 25;
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

        // Draw held item above Sakha's head
        if (this.heldItem) {
            ctx.save();
            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 4;
            let itemIcon = '🥭';
            if (this.heldItem === 'flower') itemIcon = '🌸';
            if (this.heldItem === 'water_pot') itemIcon = '🏺';
            ctx.fillText(itemIcon, this.x + 12, this.y - this.z - 44);
            ctx.restore();
        }

        // Draw emotion / thought bubble
        if (this.bubbleIcon) {
            ctx.save();
            ctx.font = '16px serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.bubbleIcon, this.x, this.y - this.z - 52);
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
