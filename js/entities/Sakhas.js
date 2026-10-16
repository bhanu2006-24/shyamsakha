import { Entity } from './Entity.js';
import { assetLoader } from '../core/AssetLoader.js';

export const SAKHA_PRESETS = [
    { name: "Sudama", spriteKey: "sakha1", color: "#eab308", border: "#ca8a04", dialogue: "Krishna, let's share some sweet snacks under the Kadamba tree!" },
    { name: "Subala", spriteKey: "sakha2", color: "#f59e0b", border: "#d97706", dialogue: "Catch me if you can! I know every secret pathway in Vrindavan." },
    { name: "Madhumangala", spriteKey: "sakha3", color: "#ec4899", border: "#db2777", dialogue: "If we win this ball game, Mother Yashoda promised us fresh laddoos!" },
    { name: "Mansukha", spriteKey: "sakha4", color: "#10b981", border: "#059669", dialogue: "Let's pass the ball high into the air, over the Kadamba branches!" },
    { name: "Stoka-Krishna", spriteKey: "sakha5", color: "#8b5cf6", border: "#7c3aed", dialogue: "Playing by the Yamuna with Krishna makes every day a divine celebration." },
    { name: "Dama", spriteKey: "sakha6", color: "#06b6d4", border: "#0891b2", dialogue: "Dao Dada is on our team, nobody can beat His power spike!" },
    { name: "Shridama", spriteKey: "sakha7", color: "#f97316", border: "#ea580c", dialogue: "Look at the gentle cows listening to Krishna's flute! Such peace!" },
    { name: "Arjuna (Gopa)", spriteKey: "sakha8", color: "#38bdf8", border: "#0284c7", dialogue: "I will defend our side of the volleyball court with all my strength!" }
];

export class Sakha extends Entity {
    constructor(x, y, presetIndex = 0) {
        const preset = SAKHA_PRESETS[presetIndex % SAKHA_PRESETS.length];
        super(x, y, 16, preset.color, 270, 340, 'sakha');
        this.name = preset.name;
        this.spriteKey = preset.spriteKey;
        this.borderColor = preset.border;
        this.dialogue = preset.dialogue;
        this.walkTimer = 0;
        this.isMoving = false;
    }

    moveWithAnim(dx, dy, obstacles, mapWidth, mapHeight, dt) {
        this.isMoving = (dx !== 0 || dy !== 0);
        if (this.isMoving) {
            this.walkTimer += dt;
        }
        this.move(dx, dy, obstacles, mapWidth, mapHeight);
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
