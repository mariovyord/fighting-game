import { Sword } from "./sword.js";

export class Player {
  /**
   * Represents a player in the game.
   * @param {number} x - The initial x-coordinate of the player.
   * @param {number} y - The initial y-coordinate of the player.
   * @param {string} name - The name of the player.
   * @param {string} imgUrl - The URL of the player's image.
   */
  constructor(canvas, ctx, x, y, name, imgUrl, scale = 4) {
    this.canvas = canvas;
    this.ctx = ctx;
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
    this.sword = new Sword(
      this.canvas,
      this.ctx,
      "../assets/images/sword.png",
      2
    ); // Sword image with scale 1

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
      Math.min(this.canvas.width - this.width / 2, this.position.x)
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

      // Play sword sound effect
      const swordSound = new Audio("../assets/audio/sword.wav");
      swordSound.play();
    }
  }

  /**
   * Draws the player and their sword on the this.canvas.
   */
  draw() {
    this.ctx.save();
    this.ctx.translate(this.position.x, this.position.y);

    // Flip the player image if facing left
    if (!this.facingRight) {
      this.ctx.scale(-1, 1); // Flip horizontally
    }

    // Draw the player image if loaded
    if (this.image) {
      this.ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    this.ctx.restore();

    // Draw the sword
    const swordX =
      this.position.x + (this.facingRight ? this.width / 2 : -this.width / 2);
    const swordY = this.position.y;
    this.sword.draw(swordX, swordY, this.sword.rotation, this.facingRight);
  }
}
