import { Game } from './core/Game.js';

function initGame() {
    if (window.__gameInitialized) return;
    window.__gameInitialized = true;

    const game = new Game();
    window.game = game; // Expose to global for button clicks

    // Global action helpers for modal onclick handlers
    window.talkToFriends = () => game.talkToFriends();
    window.startGameMode = (mode) => game.startGameMode(mode);
    window.returnToHub = () => game.returnToHub();

    // Sakha Potli (Bag) Modals & Actions
    window.openBagModal = () => game.ui.openBagModal();
    window.closeBagModal = () => game.ui.closeBagModal();
    window.selectBagItem = (key) => game.ui.selectBagItem(key);
    window.craftGarland = () => game.craftGarland();
    window.offerFromPotli = (item) => {
        if (item === 'fruit' || item === 'water') {
            game.offerToBalram(item);
        } else {
            game.offerToKrishna(item);
        }
    };

    // Options & Audio Modal Actions
    window.openOptionsModal = () => game.ui.openOptionsModal();
    window.closeOptionsModal = () => game.ui.closeOptionsModal();
    window.setMusicVolume = (vol) => {
        game.sound.setMusicVolume(vol);
        game.ui.updateOptionsUI();
    };
    window.adjustVolume = (delta) => {
        game.sound.adjustVolume(delta);
        game.ui.updateOptionsUI();
    };
    window.toggleBgm = () => {
        game.sound.toggleBgm();
        game.ui.updateOptionsUI();
    };
    window.cycleBhajanTrack = () => {
        game.sound.cycleBhajanTrack();
        game.ui.updateOptionsUI();
    };
    window.toggleSfx = () => {
        game.sound.toggleSfx();
        game.ui.updateOptionsUI();
    };
    window.toggleTextSpeed = () => {
        game.sound.toggleTextSpeed();
        game.ui.updateOptionsUI();
    };
    window.togglePortrait = () => {
        game.sound.togglePortrait();
        game.ui.updateOptionsUI();
    };
    window.toggleMinimapSetting = () => {
        game.toggleMinimap();
    };
    window.toggleCompassSetting = () => {
        game.toggleCompass();
    };

    // Shree Krishna Pastimes & Character Dialogues
    window.closeDialogue = () => game.ui.closeDialogue();
    window.openKrishnaMenu = () => game.ui.openKrishnaMenu();
    window.closeKrishnaMenu = () => game.ui.closeKrishnaMenu();
    window.startPastimeFromKrishna = (mode) => game.startPastimeFromKrishna(mode);
    window.offerToKrishna = (item) => game.offerToKrishna(item);
    window.playKrishnaFluteSong = () => game.playFluteMelody();

    // Dao Balaram Sacred Map Travel Modal
    window.openBalramMenu = () => game.ui.openBalramMenu();
    window.closeBalramMenu = () => game.ui.closeBalramMenu();
    window.travelFromBalram = (mapKey) => game.travelFromBalram(mapKey);
    window.offerToBalram = (item) => game.offerToBalram(item);

    // Help & Guide Modal
    window.openHelpModal = () => game.ui.openHelp();
    window.closeHelpModal = () => game.ui.closeHelp();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

