import { Entity } from './Entity.js';

/**
 * Monkey (वानर / मर्कट) - Playful, Agile Vrindavan Forest Prankster
 * Features:
 * - Scampers playfully near trees and pastures
 * - Sneaks up when a Sakha is carrying fruit/flower/water offering
 * - Snatches the item with mischievous monkey chatter ("खी-खी! 🐒")
 * - Triggers an energetic pastoral chase where the Sakha pursues the monkey!
 * - Joyfully nibbles prasad and scampers up into tree canopies
 */
export class Monkey extends Entity {
    constructor(x, y, id = 0) {
        super(x, y, 14, '#92400e', 240, 340, 'monkey');
        this.monkeyId = id;
        this.state = 'roam'; // 'roam', 'stalk', 'flee_with_loot', 'munch'
        this.homeX = x;
        this.homeY = y;

        this.targetSakha = null;
        this.heldItem = null; // 'mango', 'flower', 'water'
        this.stateTimer = 2.0 + Math.random() * 3.0;
        this.hopTimer = 0;
        this.tailAngle = 0;
        this.chaseTimer = 0;
        this.munchTimer = 0;
        this.walkTimer = 0;
        this.currentSpeed = 260;
    }

    update(dt, obstacles, mapW, mapH, sakhas, player, game) {
        this.tailAngle += dt * 5;
        this.hopTimer += dt * 8;

        // Ground/jump physics
        if (this.z > 0 || this.vz !== 0) {
            this.vz -= 650 * dt;
            this.z += this.vz * dt;
            if (this.z <= 0) {
                this.z = 0;
                this.vz = 0;
            }
        }

        switch (this.state) {
            case 'roam':
                this.updateRoam(dt, obstacles, mapW, mapH, sakhas, game);
                break;
            case 'stalk':
                this.updateStalk(dt, obstacles, mapW, mapH, game);
                break;
            case 'flee_with_loot':
                this.updateFleeWithLoot(dt, obstacles, mapW, mapH, game);
                break;
            case 'munch':
                this.updateMunch(dt, game);
                break;
        }
    }

    updateRoam(dt, obstacles, mapW, mapH, sakhas, game) {
        this.stateTimer -= dt;

        // 1. Check if any nearby Sakha is carrying an offering!
        if (sakhas && sakhas.length > 0) {
            for (const s of sakhas) {
                if (s.heldItem && (s.routineState === 'carry_offering' || s.routineState === 'seek_prank_target')) {
                    const dist = Math.hypot(s.x - this.x, s.y - this.y);
                    if (dist < 280) {
                        this.targetSakha = s;
                        this.state = 'stalk';
                        this.stateTimer = 7.0;
                        if (game && game.particles) {
                            game.particles.createSparkle(this.x, this.y - 20, '#facc15', 8);
                        }
                        return;
                    }
                }
            }
        }

        // 2. Playful casual bounding / wandering near home grove
        if (this.stateTimer <= 0) {
            this.stateTimer = 2.5 + Math.random() * 3.5;
            const wanderAngle = Math.random() * Math.PI * 2;
            const wanderDist = 60 + Math.random() * 120;
            this.targetX = this.homeX + Math.cos(wanderAngle) * wanderDist;
            this.targetY = this.homeY + Math.sin(wanderAngle) * wanderDist;
        }

        if (this.targetX !== undefined) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 15) {
                const spd = 90;
                this.dx = dx / dist;
                this.dy = dy / dist;
                this.moveWithAnim(this.dx * spd * dt, this.dy * spd * dt, obstacles, mapW, mapH, dt);
                if (Math.random() < 0.04 && this.z === 0) {
                    this.vz = 140; // Playful little hop
                }
            } else {
                this.isMoving = false;
            }
        }
    }

    updateStalk(dt, obstacles, mapW, mapH, game) {
        this.stateTimer -= dt;

        if (!this.targetSakha || !this.targetSakha.heldItem || this.stateTimer <= 0) {
            this.targetSakha = null;
            this.state = 'roam';
            this.stateTimer = 2.0;
            return;
        }

        // Bound swiftly towards the Sakha to snatch!
        const dx = this.targetSakha.x - this.x;
        const dy = this.targetSakha.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 28) {
            this.dx = dx / dist;
            this.dy = dy / dist;
            const speed = this.currentSpeed * 1.15;
            this.moveWithAnim(this.dx * speed * dt, this.dy * speed * dt, obstacles, mapW, mapH, dt);

            // Bound in air
            if (this.z === 0 && Math.random() < 0.15) {
                this.vz = 200;
            }
        } else {
            // SNATCH THE ITEM!
            this.heldItem = this.targetSakha.heldItem;
            const snatchedSakha = this.targetSakha;
            const itemName = this.heldItem === 'mango' ? 'रसीला आम (Mango)' : (this.heldItem === 'water_pot' ? 'यमुना जल कलश' : 'पुष्प माला');

            snatchedSakha.heldItem = null;
            snatchedSakha.routineState = 'chase_monkey';
            snatchedSakha.targetMonkey = this;
            snatchedSakha.actionCooldown = 0;

            this.state = 'flee_with_loot';
            this.chaseTimer = 9.0;
            this.vz = 260; // Big escape leap!

            if (game) {
                if (game.particles) {
                    game.particles.createSparkle(this.x, this.y - 25, '#fde047', 22);
                    game.particles.createPetals(this.x, this.y - 20, '#f97316', 15);
                }
                if (game.sound) game.sound.playBallHit(false);
                if (game.ui) {
                    game.ui.showToast(`🐒 चतुर मर्कट ने ${snatchedSakha.name} से ${itemName} झपट लिया! अरे पकड़ो!`, 4500);
                }
            }
        }
    }

    updateFleeWithLoot(dt, obstacles, mapW, mapH, game) {
        this.chaseTimer -= dt;

        // Flee away from targetSakha or player
        let chaser = this.targetSakha;
        if (!chaser && game) chaser = game.player;

        let fleeDx = 0;
        let fleeDy = 0;

        if (chaser) {
            fleeDx = this.x - chaser.x;
            fleeDy = this.y - chaser.y;
        } else {
            fleeDx = Math.cos(this.tailAngle);
            fleeDy = Math.sin(this.tailAngle);
        }

        const len = Math.hypot(fleeDx, fleeDy) || 1;
        this.dx = fleeDx / len;
        this.dy = fleeDy / len;

        // High agility zig-zag sprint
        const zigZag = Math.sin(this.chaseTimer * 4) * 0.45;
        const moveX = (this.dx * Math.cos(zigZag) - this.dy * Math.sin(zigZag)) * this.currentSpeed * 1.05 * dt;
        const moveY = (this.dx * Math.sin(zigZag) + this.dy * Math.cos(zigZag)) * this.currentSpeed * 1.05 * dt;

        this.moveWithAnim(moveX, moveY, obstacles, mapW, mapH, dt);

        if (this.z === 0 && Math.random() < 0.22) {
            this.vz = 210; // Acrobatic leaps
        }

        // Chase concludes after 9 seconds of comical pursuit
        if (this.chaseTimer <= 0) {
            this.state = 'munch';
            this.munchTimer = 3.5;
            this.isMoving = false;
            if (this.targetSakha) {
                this.targetSakha.routineState = 'return_home';
                this.targetSakha = null;
            }
            if (game && game.ui) {
                game.ui.showToast(`🐒 मर्कट ने पेड़ पर बैठकर आनन्द से प्रसाद पा लिया! सब सखा खिलखिला कर हंस पड़े! 🥭`, 4000);
            }
        }
    }

    updateMunch(dt, game) {
        this.munchTimer -= dt;
        this.isMoving = false;

        // Munches on fruit
        if (Math.random() < 0.15 && game && game.particles) {
            game.particles.createSparkle(this.x, this.y - 20, '#fde047', 4);
        }

        if (this.munchTimer <= 0) {
            this.heldItem = null;
            this.state = 'roam';
            this.stateTimer = 4.0;
        }
    }

    draw(ctx) {
        const drawY = this.y - this.z;

        ctx.save();

        // 1. Shadow on ground
        const shadowScale = Math.max(0.4, 1 - this.z / 200);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * shadowScale, (this.radius * 0.55) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(this.x, drawY);

        // Face direction flip
        if (this.dx < 0) {
            ctx.scale(-1, 1);
        }

        // 2. Playful Curled Tail (swaying)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const tailSway = Math.sin(this.tailAngle) * 6;
        ctx.moveTo(-8, -4);
        ctx.quadraticCurveTo(-18, -14 + tailSway, -22, -6 + tailSway);
        ctx.quadraticCurveTo(-26, 2, -20, 6);
        ctx.stroke();

        // 3. Body (Tender warm brown coat)
        const bodyGrad = ctx.createLinearGradient(-8, -12, 8, 4);
        bodyGrad.addColorStop(0, '#b45309');
        bodyGrad.addColorStop(0.6, '#92400e');
        bodyGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.ellipse(0, -6, 10, 13, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Chest cream patch
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(2, -5, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Arms & Paws
        ctx.fillStyle = '#92400e';
        const bounce = Math.sin(this.hopTimer) * 3;
        ctx.beginPath();
        ctx.ellipse(5, -4 + bounce, 4, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 5. Head
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(3, -20, 9, 0, Math.PI * 2);
        ctx.fill();

        // Face mask (light peach/cream muzzle)
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(5, -18, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Round Monkey Ears
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(-4, -22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(-4, -22, 2, 0, Math.PI * 2);
        ctx.fill();

        // Expressive Eyes
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(4, -20, 1.8, 0, Math.PI * 2);
        ctx.arc(8, -20, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4.5, -20.5, 0.7, 0, Math.PI * 2);
        ctx.arc(8.5, -20.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Tiny cute nose & grin
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(6, -17, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(6, -15.5, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();

        // 6. Draw Held Loot / Snatched Prasad above monkey's head!
        if (this.heldItem) {
            ctx.save();
            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 4;
            const icon = this.heldItem === 'mango' ? '🥭' : (this.heldItem === 'water_pot' ? '🏺' : '🌸');
            ctx.fillText(icon, this.x, drawY - 32);
            ctx.restore();
        }

        // 7. Mischievous exclamation if fleeing with loot
        if (this.state === 'flee_with_loot') {
            ctx.save();
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 3;
            ctx.fillText("🐒 खी-खी!", this.x, drawY - 44);
            ctx.restore();
        }
    }
}
