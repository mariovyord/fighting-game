import { Player } from "./player.js";

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.backgroundImage = new Image();
    this.backgroundImage.src = "../assets/images/sky.png";
    this.groundImage = new Image();
    this.groundImage.src = "../assets/images/ground.png";

    this.resetGame();

    // Keyboard controls
    this.keys = {};
    window.addEventListener("keydown", (e) => (this.keys[e.key] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.key] = false));
  }

  /**
   * Resets the game to its initial state, including player positions and health.
   */
  resetGame() {
    this.player1 = new Player(
      this.canvas,
      this.ctx,
      this.canvas.width / 3,
      this.canvas.height / 2,
      "Player 1",
      "../assets/images/padre.png"
    );
    this.player2 = new Player(
      this.canvas,
      this.ctx,
      (2 * this.canvas.width) / 3,
      this.canvas.height / 2,
      "Player 2",
      "../assets/images/padre2.png"
    );
    this.gravity = 0.5;
    this.floorY = this.canvas.height - 50; // Position of the floor (50px from bottom)
    this.gameOver = false; // Flag to indicate if the game is over
    this.winner = null; // Store the winner's name
    this.player2.facingRight = false; // Player 2 faces left
  }

  /**
   * Checks if any player's health has reached 0, and if so, ends the game.
   */
  checkGameOver() {
    if (this.player1.health <= 0) {
      this.winner = this.player2.name;
      this.gameOver = true;
    } else if (this.player2.health <= 0) {
      this.winner = this.player1.name;
      this.gameOver = true;
    }
  }

  /**
   * Updates the game state, including player movements, attacks, and health checks.
   */
  update() {
    if (this.gameOver) return;

    // Apply gravity and update both players
    [this.player1, this.player2].forEach((player) => {
      player.velocity.y += this.gravity;

      // Stop the player on the floor
      if (player.position.y + player.height / 2 >= this.floorY) {
        player.velocity.y = 0; // Stop downward movement
        player.position.y = this.floorY - player.height / 2; // Place player on the floor
      }
    });

    // Player 1 controls (Arrow keys)
    if (this.keys["ArrowLeft"]) {
      this.player2.velocity.x = -4; // Move left
      this.player2.rotation = Math.PI; // Face left
    } else if (this.keys["ArrowRight"]) {
      this.player2.velocity.x = 4; // Move right
      this.player2.rotation = 0; // Face right
    } else {
      this.player2.velocity.x = 0; // Stop horizontal movement
    }

    if (this.keys["ArrowUp"]) {
      if (this.player2.position.y + this.player2.height / 2 >= this.floorY) {
        this.player2.velocity.y = -12; // Jump
      }
    }

    if (this.keys["ArrowDown"]) {
      this.player2.velocity.y += 1; // Accelerate downward
    }

    // Player 2 controls (WASD keys)
    if (this.keys["a"]) {
      this.player1.velocity.x = -4; // Move left
      this.player1.rotation = Math.PI; // Face left
    } else if (this.keys["d"]) {
      this.player1.velocity.x = 4; // Move right
      this.player1.rotation = 0; // Face right
    } else {
      this.player1.velocity.x = 0; // Stop horizontal movement
    }

    if (this.keys["w"]) {
      if (this.player1.position.y + this.player1.height / 2 >= this.floorY) {
        this.player1.velocity.y = -12; // Jump
      }
    }

    if (this.keys["s"]) {
      this.player1.velocity.y += 1; // Accelerate downward
    }

    // Trigger sword attack
    if (this.keys[" "]) this.player1.attack(this.player2); // Player 2 attacks Player 1
    if (this.keys["Shift"]) this.player2.attack(this.player1); // Player 1 attacks Player 2

    // Update players
    this.player1.update();
    this.player2.update();

    // Check if any player has died
    this.checkGameOver();
  }

  /**
   * Draws the game state, including players, health bars, and game-over messages.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw the sky
    // Draw the background image
    if (this.backgroundImage.complete) {
      this.ctx.drawImage(
        this.backgroundImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }

    // Draw the ground image
    if (this.groundImage.complete) {
      this.ctx.drawImage(
        this.groundImage,
        0,
        this.floorY,
        this.canvas.width,
        50
      );
    }

    // Draw both players
    this.player1.draw();
    this.player2.draw();

    // Draw health bars
    this.drawHealthBar(this.player1, 50);
    this.drawHealthBar(this.player2, this.canvas.width - 250);

    // If the game is over, display the winner
    if (this.gameOver) {
      this.displayGameOver();
    }
  }

  /**
   * Draws the health bar of a player.
   * @param {Player} player - The player whose health bar to draw.
   * @param {number} x - The x-coordinate where the health bar will be drawn.
   */
  drawHealthBar(player, x) {
    this.ctx.save();
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(x, 20, 200, 20); // Background of the health bar
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(x, 20, (player.health / 100) * 200, 20); // Health remaining
    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Arial";
    this.ctx.fillText(`${player.name}: ${player.health} HP`, x + 10, 35);
    this.ctx.restore();
  }

  /**
   * Displays the game-over message and the winner's name.
   */
  displayGameOver() {
    this.ctx.save();
    this.ctx.fillStyle = "black";
    this.ctx.font = "36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${this.winner} Wins!`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    this.ctx.font = "20px Arial";
    this.ctx.restore();
    this.ctx.fillText(
      "Press R to Restart",
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );

    // Listen for the "R" key to restart the game
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r") {
        this.resetGame();
      }
    });
  }

  /**
   * The main game loop, which updates and draws the game state at every frame.
   */
  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
