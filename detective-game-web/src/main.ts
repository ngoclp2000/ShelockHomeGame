import { initGame } from './game/phaserGame';
import { initUI } from './ui/uiRoot';

// Initialize game and UI
document.addEventListener('DOMContentLoaded', () => {
  // Start Phaser game
  initGame();
  
  // Initialize HTML/CSS UI overlay
  initUI();
  
  console.log('🔍 Detective Investigation Game Started');
});
