/**
 * UIManager - Coordinates all overlays, dialogues, Sakha Potli (Inventory),
 * Options & Audio settings, and Character pastimes/travel modals
 */
import { assetLoader } from '../core/AssetLoader.js';

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

        // RamSena RPG Dialogue System Elements
        this.dialogueBox = document.getElementById('dialogueBox');
        this.dialogueSpeakerName = document.getElementById('dialogueSpeakerName');
        this.dialogueText = document.getElementById('dialogueText');
        this.dialogueAvatarIcon = document.getElementById('dialogueAvatarIcon');
        this.dialogueActions = document.getElementById('dialogueActions');
        this.dialogueCancelBtn = document.getElementById('dialogueCancelBtn');
        this.dialoguePortraitWrap = document.getElementById('dialoguePortraitWrap');
        this.dialoguePortraitCanvas = document.getElementById('dialoguePortraitCanvas');

        if (this.dialogueCancelBtn) {
            this.dialogueCancelBtn.addEventListener('click', () => this.closeDialogue());
        }

        this.interactionPrompt = document.getElementById('interactionPrompt');
        this.interactionIcon = document.getElementById('interactionIcon');
        this.interactionText = document.getElementById('interactionText');

        this.toastContainer = document.getElementById('toastContainer');

        // Modals
        this.bagModal = document.getElementById('bagModal');
        this.optionsModal = document.getElementById('optionsModal');
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

    renderDialoguePortrait(key) {
        if (!this.dialoguePortraitWrap || !this.dialoguePortraitCanvas) return;

        if (!this.game.sound || !this.game.sound.bigPortrait) {
            this.dialoguePortraitWrap.classList.add('hidden-portrait');
            return;
        }
        this.dialoguePortraitWrap.classList.remove('hidden-portrait');

        const canvas = this.dialoguePortraitCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (key === 'krishna') {
            const img = assetLoader.getImage('krishna');
            if (img) {
                ctx.save();
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 24;
                ctx.drawImage(img, 0, 0, 1024, 1024, 10, 10, canvas.width - 20, canvas.height - 20);
                ctx.restore();
                return;
            }
        } else if (key === 'balram') {
            const img = assetLoader.getImage('balram');
            if (img) {
                ctx.save();
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 24;
                ctx.drawImage(img, 0, 0, 1024, 1024, 10, 10, canvas.width - 20, canvas.height - 20);
                ctx.restore();
                return;
            }
        } else if (key && (key.startsWith('sakha') || key === 'player')) {
            const img = assetLoader.getImage(key) || assetLoader.getImage('player');
            if (img) {
                ctx.save();
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 20;
                ctx.drawImage(img, 0, 0, 1024, 1024, 10, 10, canvas.width - 20, canvas.height - 20);
                ctx.restore();
                return;
            }
        } else if (key === 'cow') {
            ctx.save();
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#fef3c7';
            const cx = canvas.width / 2;
            const cy = canvas.height * 0.55;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 45, 55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3;
            ctx.stroke();
            // Snout
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 25, 30, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            // Horns
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx - 35, cy - 25);
            ctx.quadraticCurveTo(cx - 55, cy - 70, cx - 25, cy - 75);
            ctx.moveTo(cx + 35, cy - 25);
            ctx.quadraticCurveTo(cx + 55, cy - 70, cx + 25, cy - 75);
            ctx.stroke();
            // Gentle eyes
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(cx - 20, cy - 8, 5, 8, -0.2, 0, Math.PI * 2);
            ctx.ellipse(cx + 20, cy - 8, 5, 8, 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Tilak
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(cx, cy - 25, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
    }

    showDialogue(arg1, arg2, arg3, arg4) {
        if (!this.dialogueBox) return;

        clearTimeout(this.dialogueTimer);

        let config = {};
        if (typeof arg1 === 'object' && arg1 !== null) {
            config = arg1;
        } else {
            // Backward-compatible signature: (speaker, text, avatar, colorClass)
            config = {
                speaker: arg1,
                title: arg1,
                text: arg2,
                avatar: arg3 || '🦚',
                autoClose: true
            };
        }

        const title = config.title || config.speaker || 'Shree Krishna';
        const avatar = config.avatar || '🦚';
        const text = config.text || '';
        const portraitKey = config.portraitKey || 'krishna';
        const actions = config.actions || [];

        if (this.dialogueSpeakerName) this.dialogueSpeakerName.innerText = title;
        if (this.dialogueAvatarIcon) this.dialogueAvatarIcon.innerText = avatar;
        if (this.dialogueText) this.dialogueText.innerText = text;

        // Render big portrait on right
        this.renderDialoguePortrait(portraitKey);

        // Populate actions inside the box
        if (this.dialogueActions) {
            this.dialogueActions.innerHTML = '';
            if (actions.length > 0) {
                actions.forEach((act, idx) => {
                    const btn = document.createElement('button');
                    btn.className = `dialogue-action-btn ${act.isCancel ? 'btn-cancel' : ''}`;
                    const numTag = idx < 9 ? `[${idx + 1}] ` : '';
                    btn.innerText = `${numTag}${act.label}`;
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        if (act.onClick) act.onClick();
                    };
                    this.dialogueActions.appendChild(btn);
                });
            }
        }

        this.dialogueBox.classList.add('active');

        if (config.autoClose && (!actions || actions.length === 0)) {
            const duration = this.game.sound && this.game.sound.textSpeed === 'FAST' ? 4200 : 6500;
            this.dialogueTimer = setTimeout(() => {
                this.closeDialogue();
            }, duration);
        }
    }

    isDialogueOpen() {
        return !!(this.dialogueBox && this.dialogueBox.classList.contains('active'));
    }

    closeDialogue() {
        if (this.dialogueBox) {
            this.dialogueBox.classList.remove('active');
        }
        clearTimeout(this.dialogueTimer);
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
            trackBtn.innerText = `BHAJAN ${curTrack.id}`;
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

        const minimapToggle = document.getElementById('optMinimapToggle');
        if (minimapToggle) {
            minimapToggle.innerText = snd.minimapEnabled ? 'ON' : 'OFF';
            minimapToggle.className = snd.minimapEnabled ? 'opt-toggle-btn on' : 'opt-toggle-btn off';
        }

        const compassToggle = document.getElementById('optCompassToggle');
        if (compassToggle) {
            compassToggle.innerText = snd.compassEnabled ? 'ON' : 'OFF';
            compassToggle.className = snd.compassEnabled ? 'opt-toggle-btn on' : 'opt-toggle-btn off';
        }
    }

    /* -------------------------------------------------------------
     * RAMSENA CHARACTER DIALOGUES (KRISHNA, BALRAM, SAKHAS, COW)
     * ------------------------------------------------------------- */
    openKrishnaMenu() {
        this.startDialogueWithKrishna();
    }

    closeKrishnaMenu() {
        this.closeDialogue();
    }

    openBalramMenu() {
        this.startDialogueWithBalram();
    }

    closeBalramMenu() {
        this.closeDialogue();
    }

    startDialogueWithKrishna(customText = null) {
        this.closeAllModals();

        const actions = [
            {
                label: "💬 Talk & Bansuri (संवाद व बांसुरी)",
                onClick: () => this.handleKrishnaTalk()
            },
            {
                label: "🍯 Offer Seva (भेंट / सेवा)",
                onClick: () => this.handleKrishnaOfferMenu()
            },
            {
                label: "🎮 Play Pastimes (खेल / लीला)",
                onClick: () => this.handlePlayMenu('krishna')
            },
            {
                label: "↩ Cancel (वापस जाएं)",
                isCancel: true,
                onClick: () => this.closeDialogue()
            }
        ];

        this.showDialogue({
            title: "🦚 Shree Krishna (श्री कृष्ण)",
            avatar: "🦚",
            portraitKey: "krishna",
            text: customText || 'You stand beside Shree Krishna (श्री कृष्ण). He smiles with divine love and holds His Bansuri:\n"Sakha! What fills your loving heart today in the sacred pastures?"',
            actions: actions
        });
    }

    handleKrishnaTalk() {
        this.game.playFluteMelody();
        const quotes = [
            '"Listen, my dear Sakha... The sweet Yamuna breeze carries the song of My Bansuri through the Kadamba groves! Every cow and calf rejoices to hear it!" 🪈',
            '"Whenever we are together, the whole of Vrindavan becomes an ocean of divine love! Nothing is dearer to Me than the friendship of My Sakhas." 🌸',
            '"Look at Dao Dada resting peacefully by the Yamuna sandbank. Let us celebrate this day with endless pastimes!" 🦚',
            '"Maiya\'s sweet fresh butter and your warm embrace make every moment in Braj complete." 🍯'
        ];
        const text = quotes[Math.floor(Math.random() * quotes.length)];

        this.showDialogue({
            title: "🦚 Shree Krishna (श्री कृष्ण)",
            avatar: "🦚",
            portraitKey: "krishna",
            text: text,
            actions: [
                {
                    label: "🪈 Play Another Bansuri Melody (बांसुरी धुन)",
                    onClick: () => this.handleKrishnaTalk()
                },
                {
                    label: "↩ Back (मुख्य विकल्प)",
                    onClick: () => this.startDialogueWithKrishna()
                }
            ]
        });
    }

    handleKrishnaOfferMenu() {
        const inv = this.game.inventory;
        const actions = [
            {
                label: `🍯 Offer Fresh Makhan (${inv.butter || 0})`,
                onClick: () => {
                    if ((inv.butter || 0) > 0) {
                        this.game.offerToKrishna('butter');
                        this.showDialogue({
                            title: "🦚 Shree Krishna (श्री कृष्ण)",
                            avatar: "🦚",
                            portraitKey: "krishna",
                            text: 'Shree Krishna\'s eyes dance with supreme joy as He tastes the sweet butter:\n"Aha! Fresh Makhan churned by Maiya! Pure nectar of Vrindavan! Blessed is your loving devotion, Sakha!" 🍯',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleKrishnaOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("No Makhan pot! Feed Gau Mata a sweet mango first! 🐮");
                    }
                }
            },
            {
                label: `📿 Offer Vaijayanti Garland (${inv.garlands || 0})`,
                onClick: () => {
                    if ((inv.garlands || 0) > 0) {
                        this.game.offerToKrishna('garland');
                        this.showDialogue({
                            title: "🦚 Shree Krishna (श्री कृष्ण)",
                            avatar: "🦚",
                            portraitKey: "krishna",
                            text: 'You lovingly garland Kanha. The fragrance of sacred blossoms surrounds Him:\n"This Vaijayanti garland carries the very breath of Vrindavan! How tenderly you strung it, Sakha!" 📿',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleKrishnaOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Weave a garland from 3 forest flowers in your Bag (B) first! 📿");
                    }
                }
            },
            {
                label: `🪷 Offer Sacred Lotus (${inv.lotus || 0})`,
                onClick: () => {
                    if ((inv.lotus || 0) > 0) {
                        this.game.offerToKrishna('lotus');
                        this.showDialogue({
                            title: "🦚 Shree Krishna (श्री कृष्ण)",
                            avatar: "🦚",
                            portraitKey: "krishna",
                            text: 'Kanha smiles tenderly holding the blooming lotus:\n"A fragrant lotus from Kamal Sarovar! Pure and radiant like your bhakti, my dear friend." 🪷',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleKrishnaOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Gather a blooming lotus from Kamal Sarovar pond first! 🪷");
                    }
                }
            },
            {
                label: `🥭 Offer Sweet Mango (${inv.fruits || 0})`,
                onClick: () => {
                    if ((inv.fruits || 0) > 0) {
                        this.game.offerToKrishna('fruit');
                        this.showDialogue({
                            title: "🦚 Shree Krishna (श्री कृष्ण)",
                            avatar: "🦚",
                            portraitKey: "krishna",
                            text: 'Kanha relishes the sweet golden mango:\n"Mmm! Golden ripe mango from the orchards! Let us share with all our friends!" 🥭',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleKrishnaOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Pick sweet mangoes from orchard trees first! 🥭");
                    }
                }
            },
            {
                label: `💧 Offer Yamuna Jal (${inv.water || 0})`,
                onClick: () => {
                    if ((inv.water || 0) > 0) {
                        this.game.offerToKrishna('water');
                        this.showDialogue({
                            title: "🦚 Shree Krishna (श्री कृष्ण)",
                            avatar: "🦚",
                            portraitKey: "krishna",
                            text: 'Kanha drinks the cool Yamuna water with bliss:\n"Cool, sweet Yamuna Jal! Nothing quenches the heart like the sacred waters of Kalindi!" 💧',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleKrishnaOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Fill water at the Yamuna riverbank first! 💧");
                    }
                }
            },
            {
                label: "↩ Back (मुख्य विकल्प)",
                isCancel: true,
                onClick: () => this.startDialogueWithKrishna()
            }
        ];

        this.showDialogue({
            title: "🦚 Offer Seva to Krishna",
            avatar: "🍯",
            portraitKey: "krishna",
            text: "Select a loving offering from your Sakha Potli to present to Shree Krishna:",
            actions: actions
        });
    }

    startDialogueWithBalram(customText = null) {
        this.closeAllModals();

        const actions = [
            {
                label: "💬 Talk (संवाद)",
                onClick: () => this.handleBalramTalk()
            },
            {
                label: "🍯 Offer Seva (भेंट / सेवा)",
                onClick: () => this.handleBalramOfferMenu()
            },
            {
                label: "🎮 Play Pastimes (खेल / लीला)",
                onClick: () => this.handlePlayMenu('balram')
            },
            {
                label: "↩ Cancel (वापस जाएं)",
                isCancel: true,
                onClick: () => this.closeDialogue()
            }
        ];

        this.showDialogue({
            title: "🌾 Dao Balaram (दाऊ बलराम)",
            avatar: "🌾",
            portraitKey: "balram",
            text: customText || 'You stand beside Dao Balaram (दाऊ बलराम). He claps you warmly on the shoulder:\n"Chhote Sakha! What pastime or service shall we do today in the pastures?"',
            actions: actions
        });
    }

    handleBalramTalk() {
        const quotes = [
            '"Ha ha! Little brother! Tending cows across these lush Vrindavan pastures with Kanha is our greatest joy! Always stay fearless and full of love!" 🌾',
            '"Look at how wide and vast our pasture is! Running, jumping, and playing with our Sakhas gives immense strength!" 💪',
            '"Kanha\'s flute makes even the wild deer freeze in ecstasy. Never leave His side, Sakha!" 🦚'
        ];
        const text = quotes[Math.floor(Math.random() * quotes.length)];

        this.showDialogue({
            title: "🌾 Dao Balaram (दाऊ बलराम)",
            avatar: "🌾",
            portraitKey: "balram",
            text: text,
            actions: [
                {
                    label: "↩ Back (मुख्य विकल्प)",
                    onClick: () => this.startDialogueWithBalram()
                }
            ]
        });
    }

    handleBalramOfferMenu() {
        const inv = this.game.inventory;
        const actions = [
            {
                label: `🥭 Offer Sweet Mangoes (${inv.fruits || 0})`,
                onClick: () => {
                    if ((inv.fruits || 0) > 0) {
                        this.game.offerToBalram('fruit');
                        this.showDialogue({
                            title: "🌾 Dao Balaram (दाऊ बलराम)",
                            avatar: "🌾",
                            portraitKey: "balram",
                            text: 'Dao Balram bites into the mango and laughs with delight:\n"Ha ha! Splendid, little brother! These sweet Vrindavan mangoes give immense strength for herding the cows!" 🥭',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleBalramOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Pick some sweet mangoes from the trees first! 🥭");
                    }
                }
            },
            {
                label: `💧 Offer Yamuna Jal (${inv.water || 0})`,
                onClick: () => {
                    if ((inv.water || 0) > 0) {
                        this.game.offerToBalram('water');
                        this.showDialogue({
                            title: "🌾 Dao Balaram (दाऊ बलराम)",
                            avatar: "🌾",
                            portraitKey: "balram",
                            text: 'Dao drinks deeply with a satisfied smile:\n"Cool Yamuna Jal is pure nectar after herding the cows through the summer heat!" 💧',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleBalramOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Fill pure water from the Yamuna river first! 💧");
                    }
                }
            },
            {
                label: `🍯 Share Fresh Makhan (${inv.butter || 0})`,
                onClick: () => {
                    if ((inv.butter || 0) > 0) {
                        this.game.inventory.butter--;
                        this.game.particles.createSparkle(this.game.balram.x, this.game.balram.y - 20, '#fde047', 25);
                        this.game.sound.playCheer();
                        this.updateBagUI(this.game.inventory);
                        this.showDialogue({
                            title: "🌾 Dao Balaram (दाऊ बलराम)",
                            avatar: "🌾",
                            portraitKey: "balram",
                            text: 'Dao Balram enjoys Maiya\'s butter with hearty laughter:\n"Nothing compares to Mother Yashoda\'s Makhan! Thank you, my dear Sakha!" 🍯',
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleBalramOfferMenu() },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("No Makhan in pot! Feed Gau Mata a sweet mango first! 🐮");
                    }
                }
            },
            {
                label: "↩ Back (मुख्य विकल्प)",
                isCancel: true,
                onClick: () => this.startDialogueWithBalram()
            }
        ];

        this.showDialogue({
            title: "🌾 Offer Seva to Dao Balram",
            avatar: "🥭",
            portraitKey: "balram",
            text: "Select a refreshing offering for Dao Balaram:",
            actions: actions
        });
    }

    startDialogueWithSakha(sakha) {
        this.closeAllModals();

        const actions = [
            {
                label: "💬 Talk & Banter (वार्तालाप)",
                onClick: () => this.handleSakhaTalk(sakha)
            },
            {
                label: "🍯 Offer & Share (भेंट / प्रसाद)",
                onClick: () => this.handleSakhaOfferMenu(sakha)
            },
            {
                label: "🎮 Play Pastimes (खेल / लीला)",
                onClick: () => this.handlePlayMenu(sakha)
            },
            {
                label: "↩ Cancel (वापस जाएं)",
                isCancel: true,
                onClick: () => this.closeDialogue()
            }
        ];

        this.showDialogue({
            title: `🌿 ${sakha.name} (सखा)`,
            avatar: "🌿",
            portraitKey: sakha.spriteKey || "sakha1",
            text: `You stand beside ${sakha.name}.\n"${sakha.dialogue || 'Sakha! Playing here in Vrindavan with Krishna brings boundless happiness!'}"`,
            actions: actions
        });
    }

    handleSakhaTalk(sakha) {
        const quotes = [
            `"${sakha.name} smiles warmly: 'Sakha! As long as we are in Vrindavan with Kanha, every day is a festival of joy!'\"`,
            `"${sakha.name} laughs: 'Have you seen how playfully the monkeys chase each other through the Kadamba branches?'\"`,
            `"${sakha.name}: 'Whenever Kanha plays His Bansuri, even the cows forget to chew grass!'\"`
        ];
        const text = quotes[Math.floor(Math.random() * quotes.length)];

        this.showDialogue({
            title: `🌿 ${sakha.name} (सखा)`,
            avatar: "🌿",
            portraitKey: sakha.spriteKey || "sakha1",
            text: text,
            actions: [
                {
                    label: "↩ Back (मुख्य विकल्प)",
                    onClick: () => this.startDialogueWithSakha(sakha)
                }
            ]
        });
    }

    handleSakhaOfferMenu(sakha) {
        const inv = this.game.inventory;
        const actions = [];

        // Special Madhumangal Mango Quest!
        if (sakha.name === "Madhumangal") {
            actions.push({
                label: `🥭 Give 2 Ripe Mangoes for Kanha (${inv.fruits || 0}/2)`,
                onClick: () => {
                    if ((inv.fruits || 0) >= 2) {
                        inv.fruits -= 2;
                        inv.butter = (inv.butter || 0) + 1;
                        this.game.particles.createSparkle(sakha.x, sakha.y - 20, '#facc15', 35);
                        this.game.sound.playCheer();
                        this.updateBagUI(inv);
                        this.showDialogue({
                            title: "🥭 Madhumangal (मधुमंगल)",
                            avatar: "🥭",
                            portraitKey: "sakha3",
                            text: "Madhumangal's face beams with sheer delight!\n\"Aha Sakha! Kanha will be so overjoyed with these ripe mangoes! Maiya always blesses us with plenty of Makhan, take this fresh pot of sweet butter in return!\" 🍯",
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleSakhaOfferMenu(sakha) },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Pick at least 2 ripe mangoes from the trees first! 🥭");
                    }
                }
            });
        }

        actions.push(
            {
                label: `🍯 Share Makhan Prasad (${inv.butter || 0})`,
                onClick: () => {
                    if ((inv.butter || 0) > 0) {
                        inv.butter--;
                        this.game.particles.createSparkle(sakha.x, sakha.y - 20, '#fde047', 25);
                        this.game.sound.playCheer();
                        this.updateBagUI(inv);
                        this.showDialogue({
                            title: `🌿 ${sakha.name} (सखा)`,
                            avatar: "🌿",
                            portraitKey: sakha.spriteKey || "sakha1",
                            text: `"${sakha.name} relishes the sweet Makhan with great joy: 'Sakha, Mother Yashoda\'s butter is the nectar of the universe!'\" 🍯`,
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleSakhaOfferMenu(sakha) },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Feed Gau Mata a sweet mango first to receive fresh Makhan! 🐮");
                    }
                }
            },
            {
                label: `🥭 Share Sweet Mango (${inv.fruits || 0})`,
                onClick: () => {
                    if ((inv.fruits || 0) > 0) {
                        inv.fruits--;
                        this.game.particles.createPetals(sakha.x, sakha.y - 20, '#facc15', 20);
                        this.game.sound.playCheer();
                        this.updateBagUI(inv);
                        this.showDialogue({
                            title: `🌿 ${sakha.name} (सखा)`,
                            avatar: "🌿",
                            portraitKey: sakha.spriteKey || "sakha1",
                            text: `"${sakha.name} happily enjoys the juicy mango: 'Such sweetness! Only Vrindavan trees bear fruits like this!'\" 🥭`,
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleSakhaOfferMenu(sakha) },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Pick sweet mangoes from trees first! 🥭");
                    }
                }
            },
            {
                label: `💧 Share Cool Yamuna Jal (${inv.water || 0})`,
                onClick: () => {
                    if ((inv.water || 0) > 0) {
                        inv.water--;
                        this.game.particles.createSparkle(sakha.x, sakha.y - 20, '#38bdf8', 20);
                        this.updateBagUI(inv);
                        this.showDialogue({
                            title: `🌿 ${sakha.name} (सखा)`,
                            avatar: "🌿",
                            portraitKey: sakha.spriteKey || "sakha1",
                            text: `"${sakha.name} drinks cool Yamuna Jal: 'Ah, so refreshing! Thank you, my dear friend!'\" 💧`,
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleSakhaOfferMenu(sakha) },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Fill water from the Yamuna riverbank first! 💧");
                    }
                }
            },
            {
                label: "↩ Back (मुख्य विकल्प)",
                isCancel: true,
                onClick: () => this.startDialogueWithSakha(sakha)
            }
        );

        this.showDialogue({
            title: `🌿 Offer & Share with ${sakha.name}`,
            avatar: "🍯",
            portraitKey: sakha.spriteKey || "sakha1",
            text: `Share food and prasad with your dear friend ${sakha.name}:`,
            actions: actions
        });
    }

    startDialogueWithCow(cow) {
        this.closeAllModals();

        const actions = [
            {
                label: "💬 Talk & Pet (सहलाएं व दुलार)",
                onClick: () => this.handleCowPet(cow)
            },
            {
                label: "🍯 Offer Treats (घास व फल)",
                onClick: () => this.handleCowOfferMenu(cow)
            },
            {
                label: "🎮 Play Bansuri (बांसुरी धुन)",
                onClick: () => {
                    this.game.playFluteMelody();
                    this.showDialogue({
                        title: "🐮 Gau Mata (सुरभि)",
                        avatar: "🐮",
                        portraitKey: "cow",
                        text: "Gau Mata stops grazing, lifts her gentle head, and listens with closed eyes to the sweet sound of Krishna's Bansuri. Complete peace fills the pastures.",
                        actions: [
                            { label: "↩ Back (मुख्य विकल्प)", onClick: () => this.startDialogueWithCow(cow) },
                            { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                        ]
                    });
                }
            },
            {
                label: "↩ Cancel (वापस जाएं)",
                isCancel: true,
                onClick: () => this.closeDialogue()
            }
        ];

        this.showDialogue({
            title: "🐮 Gau Mata (सुरभि)",
            avatar: "🐮",
            portraitKey: "cow",
            text: "Gau Mata grazes peacefully on the tender meadow grass. She looks at you with gentle, affectionate eyes.",
            actions: actions
        });
    }

    handleCowPet(cow) {
        this.game.sound.playCowBell();
        this.game.particles.createSparkle(cow.x, cow.y - 20, '#f472b6', 15);
        this.showDialogue({
            title: "🐮 Gau Mata (सुरभि)",
            avatar: "🐮",
            portraitKey: "cow",
            text: "You gently stroke Gau Mata's warm, soft neck. She closes her eyes, flickers her ears, and lets out a sweet, contented \"Moooo...\" ❤️",
            actions: [
                {
                    label: "↩ Back (मुख्य विकल्प)",
                    onClick: () => this.startDialogueWithCow(cow)
                }
            ]
        });
    }

    handleCowOfferMenu(cow) {
        const inv = this.game.inventory;
        const actions = [
            {
                label: `🥭 Feed Sweet Mango (${inv.fruits || 0})`,
                onClick: () => {
                    if ((inv.fruits || 0) > 0) {
                        inv.fruits--;
                        inv.butter = (inv.butter || 0) + 1;
                        this.game.particles.createSparkle(cow.x, cow.y - 15, '#f472b6', 25);
                        this.game.sound.playCowBell();
                        this.updateBagUI(inv);
                        this.showDialogue({
                            title: "🐮 Gau Mata (सुरभि)",
                            avatar: "🐮",
                            portraitKey: "cow",
                            text: "Gau Mata happily relishes the sweet mango! She blesses you with loving eyes and gifts you a fresh pot of sweet Makhan (butter)! 🍯",
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleCowOfferMenu(cow) },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Pick some sweet mangoes from the trees first! 🥭");
                    }
                }
            },
            {
                label: `🌸 Adorn with Forest Flowers (${inv.flowers || 0})`,
                onClick: () => {
                    if ((inv.flowers || 0) > 0) {
                        inv.flowers--;
                        this.game.particles.createPetals(cow.x, cow.y - 15, '#f472b6', 25);
                        this.game.sound.playCowBell();
                        this.updateBagUI(inv);
                        this.showDialogue({
                            title: "🐮 Gau Mata (सुरभि)",
                            avatar: "🐮",
                            portraitKey: "cow",
                            text: "You lovingly adorn Gau Mata's forehead with fresh Vrindavan forest blossoms. She licks your hand gently: \"Mooo...\"",
                            actions: [
                                { label: "↩ Back to Offers", onClick: () => this.handleCowOfferMenu(cow) },
                                { label: "↩ Done", isCancel: true, onClick: () => this.closeDialogue() }
                            ]
                        });
                    } else {
                        this.showToast("Gather wild forest flowers from bushes first! 🌸");
                    }
                }
            },
            {
                label: "↩ Back (मुख्य विकल्प)",
                isCancel: true,
                onClick: () => this.startDialogueWithCow(cow)
            }
        ];

        this.showDialogue({
            title: "🐮 Offer Treats to Gau Mata",
            avatar: "🥭",
            portraitKey: "cow",
            text: "Select a gentle offering for Gau Mata:",
            actions: actions
        });
    }

    /**
     * UNIFIED PASTIMES (PLAY) SUBMENU
     * When requested from ANY Sakha anywhere in Vrindavan (like on the riverbanks or in mango orchards),
     * the Sakha calls out to Krishna and the game begins right where you are!
     */
    handlePlayMenu(initiator) {
        const isSakha = initiator && initiator !== 'krishna' && initiator !== 'balram';
        const actions = [
            {
                label: "🎯 Dām Denā (Tag with Denner / पकड़ा-पकड़ी)",
                onClick: () => this.triggerPastimeWithNpc('dennertag', initiator)
            },
            {
                label: "🏃‍♂️ Pakad Pakdai (Tag Chase)",
                onClick: () => this.triggerPastimeWithNpc('tag', initiator)
            },
            {
                label: "💦 Rangotsav (Holi Battle)",
                onClick: () => this.triggerPastimeWithNpc('holi', initiator)
            },
            {
                label: "🏐 Kanduka Kridha (Volleyball on Sandbanks)",
                onClick: () => this.triggerPastimeWithNpc('volleyball', initiator)
            },
            {
                label: "🏁 Dhaavan Spardha (Footrace / दौड़)",
                onClick: () => this.triggerPastimeWithNpc('race', initiator)
            },
            {
                label: "↩ Back (मुख्य विकल्प)",
                isCancel: true,
                onClick: () => {
                    if (initiator === 'krishna') this.startDialogueWithKrishna();
                    else if (initiator === 'balram') this.startDialogueWithBalram();
                    else if (isSakha) this.startDialogueWithSakha(initiator);
                    else this.closeDialogue();
                }
            }
        ];

        const title = isSakha ? `🎮 Play with ${initiator.name}` : "🎮 Choose Sacred Pastime";
        const desc = isSakha
            ? `Ask ${initiator.name} to start a game! He will run to Kanha to start it, and we can play right here from wherever we are!`
            : "Choose which transcendental pastime to enjoy across Vrindavan:";

        this.showDialogue({
            title: title,
            avatar: "🎮",
            portraitKey: isSakha ? initiator.spriteKey : (initiator === 'balram' ? 'balram' : 'krishna'),
            text: desc,
            actions: actions
        });
    }

    triggerPastimeWithNpc(mode, initiator) {
        this.closeDialogue();
        const pastimesNames = {
            volleyball: "Kanduka Kridha (Volleyball)",
            dennertag: "Dām Denā (Tag with Denner / पकड़ा-पकड़ी)",
            tag: "Pakad Pakdai (Tag Chase)",
            holi: "Rangotsav (Holi Battle)",
            race: "Dhaavan Spardha (Footrace / दौड़)"
        };
        const gameName = pastimesNames[mode] || mode;

        if (initiator && initiator !== 'krishna' && initiator !== 'balram') {
            // SAKHA SMAX: Joyfully runs to Krishna to ask Him to start the game!
            initiator.bubbleIcon = '🗣️';
            initiator.bubbleTimer = 4.0;
            initiator.routineState = 'ask_krishna';
            initiator.askGameMode = mode;
            initiator.askTimer = 0;

            this.showToast(`🏃‍♂️ ${initiator.name} runs to Kanha: "Kanha! Let's start ${gameName} right here from the banks!" 🌸`, 4000);
            if (this.game.sound) this.game.sound.playCheer();
        } else if (initiator === 'balram') {
            // DAO BALRAM CALLS OUT TO KRISHNA
            if (this.game.sound) this.game.sound.playCheer();
            this.showToast(`🌾 Dao Balram calls out: "Kanha! Little brother wants to play ${gameName}! Let's begin!"`, 3000);
            this.game.playFluteMelody();
            setTimeout(() => {
                this.game.startGameMode(mode);
            }, 600);
        } else {
            // KRISHNA DIRECTLY STARTS WITH BANSURI
            this.game.playFluteMelody();
            this.showToast(`🦚 Shree Krishna plays His Bansuri: "Let ${gameName} begin right where everyone stands!" 🪈`, 3500);
            setTimeout(() => {
                this.game.startGameMode(mode);
            }, 600);
        }
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

    closeGameChoice() {
        this.closeDialogue();
    }

    isAnyModalOpen() {
        return this.isDialogueOpen() ||
            (this.bagModal && !this.bagModal.classList.contains('hidden')) ||
            (this.optionsModal && !this.optionsModal.classList.contains('hidden')) ||
            (this.helpModal && !this.helpModal.classList.contains('hidden')) ||
            (this.gameOverModal && !this.gameOverModal.classList.contains('hidden'));
    }

    closeAllModals() {
        this.closeDialogue();
        if (this.bagModal) this.bagModal.classList.add('hidden');
        if (this.optionsModal) this.optionsModal.classList.add('hidden');
        if (this.helpModal) this.helpModal.classList.add('hidden');
        if (this.gameOverModal) this.gameOverModal.classList.add('hidden');
    }
}
