import { Game } from "./scripts/game.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;

// Start background music
const backgroundMusic = new Audio("../assets/audio/background.wav");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

/**
 * Starts the background music.
 * Note: Most browsers will block audio playback until the user has interacted with the page.
 * This function will be triggered by a key press or mouse click to comply with browser policies.
 */
function startBackgroundMusic() {
  backgroundMusic.play();
  document.removeEventListener("keydown", startBackgroundMusic);
  document.removeEventListener("click", startBackgroundMusic);
}

// Start music after any key press or mouse click
document.addEventListener("keydown", startBackgroundMusic);
document.addEventListener("click", startBackgroundMusic);

// Initialize the game
const game = new Game(canvas, ctx);
game.loop();
