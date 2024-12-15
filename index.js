const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;

class Game {
  constructor() {
    this.backgroundImage = new Image();
    this.backgroundImage.src = "sky.png";
    this.groundImage = new Image();
    this.groundImage.src = "ground.png";

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
      canvas.width / 3,
      canvas.height / 2,
      "Player 1",
      "./padre.png"
    );
    this.player2 = new Player(
      (2 * canvas.width) / 3,
      canvas.height / 2,
      "Player 2",
      "./padre2.png"
    );
    this.gravity = 0.5;
    this.floorY = canvas.height - 50; // Position of the floor (50px from bottom)
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
      this.player1.velocity.x = -5; // Move left
      this.player1.rotation = Math.PI; // Face left
    } else if (this.keys["ArrowRight"]) {
      this.player1.velocity.x = 5; // Move right
      this.player1.rotation = 0; // Face right
    } else {
      this.player1.velocity.x = 0; // Stop horizontal movement
    }

    if (this.keys["ArrowUp"]) {
      if (this.player1.position.y + this.player1.height / 2 >= this.floorY) {
        this.player1.velocity.y = -12; // Jump
      }
    }

    if (this.keys["ArrowDown"]) {
      this.player1.velocity.y += 1; // Accelerate downward
    }

    // Player 2 controls (WASD keys)
    if (this.keys["a"]) {
      this.player2.velocity.x = -5; // Move left
      this.player2.rotation = Math.PI; // Face left
    } else if (this.keys["d"]) {
      this.player2.velocity.x = 5; // Move right
      this.player2.rotation = 0; // Face right
    } else {
      this.player2.velocity.x = 0; // Stop horizontal movement
    }

    if (this.keys["w"]) {
      if (this.player2.position.y + this.player2.height / 2 >= this.floorY) {
        this.player2.velocity.y = -12; // Jump
      }
    }

    if (this.keys["s"]) {
      this.player2.velocity.y += 1; // Accelerate downward
    }

    // Trigger sword attack
    if (this.keys["Shift"]) this.player1.attack(this.player2); // Player 1 attacks Player 2
    if (this.keys[" "]) this.player2.attack(this.player1); // Player 2 attacks Player 1

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the sky
    // Draw the background image
    if (this.backgroundImage.complete) {
      ctx.drawImage(this.backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw the ground image
    if (this.groundImage.complete) {
      ctx.drawImage(this.groundImage, 0, this.floorY, canvas.width, 50);
    }

    // Draw both players
    this.player1.draw();
    this.player2.draw();

    // Draw health bars
    this.drawHealthBar(this.player1, 50);
    this.drawHealthBar(this.player2, canvas.width - 250);

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
    ctx.fillStyle = "black";
    ctx.fillRect(x, 20, 200, 20); // Background of the health bar
    ctx.fillStyle = "red";
    ctx.fillRect(x, 20, (player.health / 100) * 200, 20); // Health remaining
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(`${player.name}: ${player.health} HP`, x + 10, 35);
  }

  /**
   * Displays the game-over message and the winner's name.
   */
  displayGameOver() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${this.winner} Wins!`, canvas.width / 2, canvas.height / 2);

    ctx.font = "20px Arial";
    ctx.restore();
    ctx.fillText(
      "Press R to Restart",
      canvas.width / 2,
      canvas.height / 2 + 50
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

class Sword {
  /**
   * Represents a sword in the game.
   * @param {string} imgUrl - The URL of the sword's image.
   * @param {number} scale - The scaling factor for the sword image.
   */
  constructor(imgUrl, scale = 1) {
    this.rotation = 0; // Sword's rotation
    this.image = null; // Sword's image
    this.width = 0;
    this.height = 0;

    // Load the sword image
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
    };
  }

  /**
   * Draws the sword on the canvas.
   * @param {number} x - The x-coordinate of the sword's position.
   * @param {number} y - The y-coordinate of the sword's position.
   * @param {number} rotation - The rotation of the sword.
   * @param {boolean} facingRight - Whether the sword is facing right.
   */
  draw(x, y, rotation, facingRight) {
    if (!this.image) return; // Only draw if the image is loaded

    ctx.save();
    ctx.translate(x, y);

    // Flip the sword if facing left
    if (!facingRight) {
      ctx.scale(-1, 1); // Flip horizontally
    }

    ctx.rotate(rotation); // Rotate the sword
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

class Player {
  /**
   * Represents a player in the game.
   * @param {number} x - The initial x-coordinate of the player.
   * @param {number} y - The initial y-coordinate of the player.
   * @param {string} name - The name of the player.
   * @param {string} imgUrl - The URL of the player's image.
   */
  constructor(x, y, name, imgUrl, scale = 4) {
    this.velocity = { x: 0, y: 0 }; // Velocity
    this.position = { x: x, y: y }; // Start position
    this.facingRight = true; // Direction player is facing
    this.isAttacking = false; // Sword attack state
    this.health = 100; // Player health
    this.name = name; // Player name
    this.width = 64;
    this.height = 64;
    this.scale = scale;

    // Sword instance
    this.sword = new Sword("./sword.png", 2); // Sword image with scale 1

    // Player image loading
    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      this.image = image;
      this.width = image.width * this.scale;
      this.height = image.height * this.scale;
    };
  }

  /**
   * Updates the player's position and sword attack state.
   */
  update() {
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Update facing direction based on velocity
    if (this.velocity.x > 0) this.facingRight = true; // Moving right
    if (this.velocity.x < 0) this.facingRight = false; // Moving left

    // Prevent the player from leaving canvas boundaries horizontally
    this.position.x = Math.max(
      this.width / 2,
      Math.min(canvas.width - this.width / 2, this.position.x)
    );

    // Sword attack logic
    if (this.isAttacking) {
      this.sword.rotation += Math.PI / 36; // Rotate the sword during the attack
      if (this.sword.rotation >= Math.PI / 2) {
        this.sword.rotation = 0; // Reset rotation
        this.isAttacking = false; // End attack
      }
    }
  }

  /**
   * Performs a sword attack on the opponent, applying damage if the attack hits.
   * @param {Player} opponent - The player being attacked.
   */
  attack(opponent) {
    if (!this.isAttacking) {
      this.isAttacking = true; // Start the attack
      this.sword.rotation = -Math.PI / 4; // Initial rotation of the sword

      // Check collision with the opponent
      const swordX =
        this.position.x + (this.facingRight ? this.width / 2 : -this.width / 2); // Adjust sword position based on direction
      const swordY = this.position.y;

      const swordDistance = Math.hypot(
        swordX - opponent.position.x,
        swordY - opponent.position.y
      );

      if (swordDistance < opponent.width / 2) {
        opponent.health = Math.max(0, opponent.health - 10); // Reduce opponent health
      }
    }
  }

  /**
   * Draws the player and their sword on the canvas.
   */
  draw() {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Flip the player image if facing left
    if (!this.facingRight) {
      ctx.scale(-1, 1); // Flip horizontally
    }

    // Draw the player image if loaded
    if (this.image) {
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    ctx.restore();

    // Draw the sword
    const swordX =
      this.position.x + (this.facingRight ? this.width / 2 : -this.width / 2);
    const swordY = this.position.y;
    this.sword.draw(swordX, swordY, this.sword.rotation, this.facingRight);
  }
}

// Initialize the game
const game = new Game();
game.loop();
