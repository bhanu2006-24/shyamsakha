import { Entity } from './Entity.js';

export const SAKHA_PRESETS = [
    { name: "Sudama", color: "#eab308", border: "#ca8a04", dialogue: "Krishna, let's share some sweet snacks under the Kadamba tree!" },
    { name: "Subala", color: "#f59e0b", border: "#d97706", dialogue: "Catch me if you can! I know every secret pathway in Vrindavan." },
    { name: "Madhumangala", color: "#ec4899", border: "#db2777", dialogue: "If we win this ball game, Mother Yashoda promised us fresh laddoos!" },
    { name: "Mansukha", color: "#10b981", border: "#059669", dialogue: "Let's pass the ball high into the air, over the Kadamba branches!" },
    { name: "Stoka-Krishna", color: "#8b5cf6", border: "#7c3aed", dialogue: "Playing by the Yamuna with Krishna makes every day a celebration." },
    { name: "Dama", color: "#06b6d4", border: "#0891b2", dialogue: "Dao Dada is on our team, nobody can beat His power spike!" }
];

export class Sakha extends Entity {
    constructor(x, y, presetIndex = 0) {
        const preset = SAKHA_PRESETS[presetIndex % SAKHA_PRESETS.length];
        super(x, y, 14, preset.color, 270, 340, 'sakha');
        this.name = preset.name;
        this.borderColor = preset.border;
        this.dialogue = preset.dialogue;
        this.targetPassX = 0;
        this.targetPassY = 0;
    }

    draw(ctx) {
        const drawY = this.y - this.z;

        ctx.save();

        // Shadow
        const shadowScale = Math.max(0.3, 1 - this.z / 300);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 2, (this.radius + 3) * shadowScale, (this.radius - 3) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCaught ? '#64748b' : this.color;
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Facing indicator
        const angle = Math.atan2(this.dy, this.dx);
        ctx.beginPath();
        ctx.moveTo(this.x, drawY);
        ctx.lineTo(this.x + Math.cos(angle) * (this.radius + 3), drawY + Math.sin(angle) * (this.radius + 3));
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Little cowherd cloth wrap
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, drawY - 2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
