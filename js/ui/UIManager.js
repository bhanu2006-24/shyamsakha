/**
 * UIManager - Coordinates all overlays, dialogues, inventory bars, and modal menus
 */
export class UIManager {
    constructor(game) {
        this.game = game;

        // Element references
        this.dialogueBox = document.getElementById('dialogueBox');
        this.dialogueName = document.getElementById('dialogueName');
        this.dialogueText = document.getElementById('dialogueText');
        this.dialogueAvatar = document.getElementById('dialogueAvatar');

        this.interactionPrompt = document.getElementById('interactionPrompt');
        this.interactionIcon = document.getElementById('interactionIcon');
        this.interactionText = document.getElementById('interactionText');

        this.toastContainer = document.getElementById('toastContainer');
        this.interactionMenu = document.getElementById('interactionMenuModal');
        this.gameChoiceModal = document.getElementById('gameChoiceModal');
        this.mapModal = document.getElementById('mapChoiceModal');
        this.helpModal = document.getElementById('helpModal');
        this.gameOverModal = document.getElementById('gameOverModal');

        // Inventory fields
        this.invFlowers = document.getElementById('invFlowers');
        this.invFruits = document.getElementById('invFruits');
        this.invWater = document.getElementById('invWater');
        this.invButter = document.getElementById('invButter');

        this.stateBadge = document.getElementById('stateTextUI');
        this.dialogueTimer = null;
    }

    updateInventory(inv) {
        if (this.invFlowers) this.invFlowers.innerText = inv.flowers;
        if (this.invFruits) this.invFruits.innerText = inv.fruits;
        if (this.invWater) this.invWater.innerText = inv.water;
        if (this.invButter) this.invButter.innerText = inv.butter;
    }

    setPhase(text, tagClass = 'tag-resting') {
        if (this.stateBadge) {
            this.stateBadge.innerText = text;
            this.stateBadge.className = `tag-badge ${tagClass}`;
        }
    }

    showPrompt(icon, text) {
        if (this.interactionPrompt) {
            this.interactionIcon.innerText = icon;
            this.interactionText.innerText = text;
            this.interactionPrompt.classList.add('active');
        }
    }

    hidePrompt() {
        if (this.interactionPrompt) {
            this.interactionPrompt.classList.remove('active');
        }
    }

    showDialogue(speaker, text, avatar = '🦚', colorClass = 'text-blue-400') {
        if (!this.dialogueBox) return;

        this.dialogueName.innerText = speaker;
        this.dialogueName.className = `dialogue-speaker ${colorClass}`;
        this.dialogueText.innerText = text;
        this.dialogueAvatar.innerText = avatar;

        this.dialogueBox.classList.add('active');

        clearTimeout(this.dialogueTimer);
        this.dialogueTimer = setTimeout(() => {
            this.dialogueBox.classList.remove('active');
        }, 5500);
    }

    showToast(message) {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>✨</span><span>${message}</span>`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    openInteractionMenu() {
        if (this.interactionMenu) this.interactionMenu.classList.remove('hidden');
    }

    closeInteractionMenu() {
        if (this.interactionMenu) this.interactionMenu.classList.add('hidden');
    }

    openGameChoice() {
        this.closeInteractionMenu();
        if (this.gameChoiceModal) this.gameChoiceModal.classList.remove('hidden');
    }

    closeGameChoice() {
        if (this.gameChoiceModal) this.gameChoiceModal.classList.add('hidden');
    }

    openMapModal() {
        if (this.mapModal) this.mapModal.classList.remove('hidden');
    }

    closeMapModal() {
        if (this.mapModal) this.mapModal.classList.add('hidden');
    }

    openHelp() {
        if (this.helpModal) this.helpModal.classList.remove('hidden');
    }

    closeHelp() {
        if (this.helpModal) this.helpModal.classList.add('hidden');
    }

    showGameOver(title, desc, won = true) {
        const titleEl = document.getElementById('gameOverTitle');
        const descEl = document.getElementById('gameOverDesc');
        if (titleEl) {
            titleEl.innerText = title;
            titleEl.className = won ? 'modal-title text-green-400' : 'modal-title text-red-400';
        }
        if (descEl) descEl.innerHTML = desc;
        if (this.gameOverModal) this.gameOverModal.classList.remove('hidden');
    }

    hideGameOver() {
        if (this.gameOverModal) this.gameOverModal.classList.add('hidden');
    }
}
