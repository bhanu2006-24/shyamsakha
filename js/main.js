import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // Expose to global for button clicks

    // Global action helpers for modal onclick handlers
    window.talkToFriends = () => game.talkToFriends();
    window.offerItem = (item) => game.offerItem(item);
    window.openGameChoice = () => game.ui.openGameChoice();
    window.closeInteractionMenu = () => game.ui.closeInteractionMenu();
    window.closeGameChoice = () => game.ui.closeGameChoice();
    window.startGameMode = (mode) => game.startGameMode(mode);
    window.closeMapModal = () => game.ui.closeMapModal();
    window.selectMap = (mapKey) => {
        game.loadMap(mapKey);
        game.ui.closeMapModal();
    };
    window.closeHelpModal = () => game.ui.closeHelp();
    window.returnToHub = () => game.returnToHub();
});
