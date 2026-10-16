/**
 * UIManager - Coordinates all overlays, dialogues, Sakha Potli (Inventory),
 * Options & Audio settings, and Character pastimes/travel modals
 */

export const POTLI_ITEMS = {
    butter: {
        id: 'butter',
        name: 'Fresh Churned Makhan',
        hindiName: 'माखन की मटकी',
        icon: '🍯',
        desc: 'Pure, sweet butter churned with supreme affection by Yashoda Maiya in Gokul. Shree Krishna\'s most treasured delight across all creation. Offer it to Kanhaiya for boundless joy and divine blessings.',
        actionLabel: 'Offer to Shree Krishna',
        actionType: 'offer_butter'
    },
    flowers: {
        id: 'flowers',
        name: 'Wild Forest Flowers',
        hindiName: 'वन पुष्प (मालती / चमेली)',
        icon: '🌸',
        desc: 'Fragrant wild blossoms (Malati, Juhi, and Parijat) gathered from flowering green bushes across the pastures. String 3 flowers together to weave a sacred Vaijayanti Garland for Krishna.',
        actionLabel: 'String Vaijayanti Garland (Need 3)',
        actionType: 'craft_garland'
    },
    lotus: {
        id: 'lotus',
        name: 'Sacred Water Lotus',
        hindiName: 'पवित्र जल कमल',
        icon: '🪷',
        desc: 'Transcendental lotus flowers blooming in the cool sacred waters of Yamuna and lily pad ponds. Offered in loving adoration at the lotus feet of Shree Krishna.',
        actionLabel: 'Offer Lotus to Krishna',
        actionType: 'offer_lotus'
    },
    fruits: {
        id: 'fruits',
        name: 'Vrindavan Sweet Mangoes',
        hindiName: 'रसीले आम्र फल',
        icon: '🥭',
        desc: 'Golden, honey-sweet forest mangoes picked from sacred Vrindavan orchards. Dao Balaram, the gentle cows, and all the cowherd friends relish their nourishing sweetness.',
        actionLabel: 'Share with Dao Dada & Gau Mata',
        actionType: 'offer_fruit'
    },
    water: {
        id: 'water',
        name: 'Sacred Yamuna Jal',
        hindiName: 'पवित्र यमुना जल',
        icon: '💧',
        desc: 'Cool, crystalline waters gathered from the sacred Kalindi (Yamuna) riverbank. Used to quench thirst and in joyous Holi celebrations with the Sakhas.',
        actionLabel: 'Offer Cool Water to Friends',
        actionType: 'offer_water'
    },
    garlands: {
        id: 'garlands',
        name: 'Vaijayanti Garland',
        hindiName: 'वैजयंती वनमाला',
        icon: '📿',
        desc: 'A hand-woven garland of fragrant lotuses and forest blooms. Krishna wears it gracefully around his neck while playing his flute in the pastures.',
        actionLabel: 'Adorn Shree Krishna',
        actionType: 'offer_garland'
    }
};

export class UIManager {
    constructor(game) {
        this.game = game;

        // Overlay dialogs
        this.dialogueBox = document.getElementById('dialogueBox');
        this.dialogueName = document.getElementById('dialogueName');
        this.dialogueText = document.getElementById('dialogueText');
        this.dialogueAvatar = document.getElementById('dialogueAvatar');

        this.interactionPrompt = document.getElementById('interactionPrompt');
        this.interactionIcon = document.getElementById('interactionIcon');
        this.interactionText = document.getElementById('interactionText');

        this.toastContainer = document.getElementById('toastContainer');

        // Modals
        this.bagModal = document.getElementById('bagModal');
        this.optionsModal = document.getElementById('optionsModal');
        this.krishnaModal = document.getElementById('krishnaMenuModal');
        this.balramModal = document.getElementById('balramMenuModal');
        this.helpModal = document.getElementById('helpModal');
        this.gameOverModal = document.getElementById('gameOverModal');

        this.stateBadge = document.getElementById('stateTextUI');
        this.bagCountBadge = document.getElementById('bagCountBadge');
        this.dialogueTimer = null;
        this.selectedPotliItem = 'butter';
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
        const duration = this.game.sound.textSpeed === 'FAST' ? 4200 : 6500;
        this.dialogueTimer = setTimeout(() => {
            this.dialogueBox.classList.remove('active');
        }, duration);
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

    /* -------------------------------------------------------------
     * SAKHA POTLI (BAG & INVENTORY)
     * ------------------------------------------------------------- */
    openBagModal() {
        this.closeAllModals();
        if (this.bagModal) {
            this.bagModal.classList.remove('hidden');
            this.updateBagUI(this.game.inventory);
        }
    }

    closeBagModal() {
        if (this.bagModal) this.bagModal.classList.add('hidden');
    }

    selectBagItem(key) {
        this.selectedPotliItem = key;
        this.updateBagUI(this.game.inventory);
    }

    updateInventory(inv) {
        this.updateBagUI(inv);
    }

    updateBagUI(inv) {
        if (!inv) return;
        // Update bag counter badge on top bar
        const totalItems = (inv.butter || 0) + (inv.flowers || 0) + (inv.lotus || 0) +
                           (inv.fruits || 0) + (inv.water || 0) + (inv.garlands || 0);
        if (this.bagCountBadge) {
            this.bagCountBadge.innerText = totalItems;
        }

        const listEl = document.getElementById('potliItemList');
        if (!listEl) return;

        const itemKeys = ['butter', 'flowers', 'lotus', 'fruits', 'water', 'garlands'];
        let html = '';

        itemKeys.forEach(k => {
            const def = POTLI_ITEMS[k];
            if (!def) return;
            const qty = inv[k] || 0;
            const isSelected = this.selectedPotliItem === k;
            const padQty = qty < 10 ? `×0${qty}` : `×${qty}`;

            html += `
                <div onclick="selectBagItem('${k}')" class="potli-item-row ${isSelected ? 'active' : ''}">
                    <div class="potli-row-left">
                        <span class="potli-row-icon">${def.icon}</span>
                        <span class="potli-row-name">${def.name}</span>
                    </div>
                    <span class="potli-row-qty">${padQty}</span>
                </div>
            `;
        });

        listEl.innerHTML = html;

        // Update right pane detail
        const curDef = POTLI_ITEMS[this.selectedPotliItem] || POTLI_ITEMS.butter;
        const curQty = inv[this.selectedPotliItem] || 0;

        const iconEl = document.getElementById('detailIcon');
        const titleEl = document.getElementById('detailTitle');
        const descEl = document.getElementById('detailDesc');
        const actionWrap = document.getElementById('detailActionWrap');

        if (iconEl) iconEl.innerText = curDef.icon;
        if (titleEl) titleEl.innerText = curDef.name.toUpperCase();
        if (descEl) descEl.innerText = curDef.desc;

        if (actionWrap) {
            if (this.selectedPotliItem === 'flowers') {
                const canCraft = (inv.flowers || 0) >= 3;
                actionWrap.innerHTML = `
                    <button onclick="craftGarland()" class="btn-potli-action ${canCraft ? 'btn-active-action' : 'disabled'}" ${canCraft ? '' : 'disabled'}>
                        <span>📿</span> String Vaijayanti Garland (Requires 3 Flowers)
                    </button>
                `;
            } else if (this.selectedPotliItem === 'lotus') {
                const hasLotus = (inv.lotus || 0) > 0;
                actionWrap.innerHTML = `
                    <button onclick="offerFromPotli('lotus')" class="btn-potli-action ${hasLotus ? 'btn-active-action' : 'disabled'}" ${hasLotus ? '' : 'disabled'}>
                        <span>🪷</span> Offer Sacred Lotus at Krishna's Feet
                    </button>
                `;
            } else if (this.selectedPotliItem === 'butter') {
                const hasButter = (inv.butter || 0) > 0;
                actionWrap.innerHTML = `
                    <button onclick="offerFromPotli('butter')" class="btn-potli-action ${hasButter ? 'btn-active-action' : 'disabled'}" ${hasButter ? '' : 'disabled'}>
                        <span>🍯</span> Offer Makhan to Shree Krishna
                    </button>
                `;
            } else if (this.selectedPotliItem === 'fruits') {
                const hasFruits = (inv.fruits || 0) > 0;
                actionWrap.innerHTML = `
                    <button onclick="offerFromPotli('fruit')" class="btn-potli-action ${hasFruits ? 'btn-active-action' : 'disabled'}" ${hasFruits ? '' : 'disabled'}>
                        <span>🥭</span> Offer Mango to Dao Dada & Gau Mata
                    </button>
                `;
            } else if (this.selectedPotliItem === 'water') {
                const hasWater = (inv.water || 0) > 0;
                actionWrap.innerHTML = `
                    <button onclick="offerFromPotli('water')" class="btn-potli-action ${hasWater ? 'btn-active-action' : 'disabled'}" ${hasWater ? '' : 'disabled'}>
                        <span>💧</span> Share Cool Yamuna Jal
                    </button>
                `;
            } else if (this.selectedPotliItem === 'garlands') {
                const hasGarland = (inv.garlands || 0) > 0;
                actionWrap.innerHTML = `
                    <button onclick="offerFromPotli('garland')" class="btn-potli-action ${hasGarland ? 'btn-active-action' : 'disabled'}" ${hasGarland ? '' : 'disabled'}>
                        <span>📿</span> Adorn Shree Krishna with Garland
                    </button>
                `;
            } else {
                actionWrap.innerHTML = `
                    <button class="btn-potli-action disabled" disabled>
                        <span>✨</span> Sacred Prasad
                    </button>
                `;
            }
        }
    }

    /* -------------------------------------------------------------
     * OPTIONS & AUDIO MODAL
     * ------------------------------------------------------------- */
    openOptionsModal() {
        this.closeAllModals();
        if (this.optionsModal) {
            this.optionsModal.classList.remove('hidden');
            this.updateOptionsUI();
        }
    }

    closeOptionsModal() {
        if (this.optionsModal) this.optionsModal.classList.add('hidden');
    }

    updateOptionsUI() {
        const snd = this.game.sound;
        const volText = document.getElementById('optVolumeText');
        const volSlider = document.getElementById('optVolumeSlider');
        const bgmToggle = document.getElementById('optBgmToggle');
        const trackBtn = document.getElementById('optTrackBtn');
        const sfxToggle = document.getElementById('optSfxToggle');
        const speedBtn = document.getElementById('optTextSpeed');
        const portraitToggle = document.getElementById('optPortraitToggle');

        const volPct = Math.round(snd.musicVolume * 100);
        if (volText) volText.innerText = `${volPct}%`;
        if (volSlider) volSlider.value = volPct;

        if (bgmToggle) {
            bgmToggle.innerText = snd.bgmEnabled ? 'ON' : 'OFF';
            bgmToggle.className = snd.bgmEnabled ? 'opt-toggle-btn on' : 'opt-toggle-btn off';
        }

        if (trackBtn) {
            const curTrack = snd.bhajanTracks[snd.currentTrackIndex];
            trackBtn.innerText = `BHAJAN ${curTrack.id} - ${curTrack.title.toUpperCase()}`;
        }

        if (sfxToggle) {
            sfxToggle.innerText = snd.sfxEnabled ? 'ON' : 'OFF';
            sfxToggle.className = snd.sfxEnabled ? 'opt-toggle-btn on' : 'opt-toggle-btn off';
        }

        if (speedBtn) {
            speedBtn.innerText = snd.textSpeed;
        }

        if (portraitToggle) {
            portraitToggle.innerText = snd.bigPortrait ? 'ON' : 'OFF';
            portraitToggle.className = snd.bigPortrait ? 'opt-toggle-btn on' : 'opt-toggle-btn off';
        }
    }

    /* -------------------------------------------------------------
     * CHARACTER MODALS (KRISHNA & BALRAM)
     * ------------------------------------------------------------- */
    openKrishnaMenu() {
        this.closeAllModals();
        if (this.krishnaModal) this.krishnaModal.classList.remove('hidden');
    }

    closeKrishnaMenu() {
        if (this.krishnaModal) this.krishnaModal.classList.add('hidden');
    }

    openBalramMenu() {
        this.closeAllModals();
        if (this.balramModal) this.balramModal.classList.remove('hidden');
    }

    closeBalramMenu() {
        if (this.balramModal) this.balramModal.classList.add('hidden');
    }

    openHelp() {
        this.closeAllModals();
        if (this.helpModal) this.helpModal.classList.remove('hidden');
    }

    closeHelp() {
        if (this.helpModal) this.helpModal.classList.add('hidden');
    }

    showGameOver(title, desc, won = true) {
        this.closeAllModals();
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

    closeAllModals() {
        if (this.bagModal) this.bagModal.classList.add('hidden');
        if (this.optionsModal) this.optionsModal.classList.add('hidden');
        if (this.krishnaModal) this.krishnaModal.classList.add('hidden');
        if (this.balramModal) this.balramModal.classList.add('hidden');
        if (this.helpModal) this.helpModal.classList.add('hidden');
        if (this.gameOverModal) this.gameOverModal.classList.add('hidden');
    }
}
