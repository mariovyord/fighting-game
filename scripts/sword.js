export class Sword {
  /**
   * Represents a sword in the game.
   * @param {string} imgUrl - The URL of the sword's image.
   * @param {number} scale - The scaling factor for the sword image.
   */
  constructor(canvas, ctx, imgUrl, scale = 1) {
    this.canvas = canvas;
    this.ctx = ctx;
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

    this.ctx.save();
    this.ctx.translate(x, y);

    // Flip the sword if facing left
    if (!facingRight) {
      this.ctx.scale(-1, 1); // Flip horizontally
    }

    this.ctx.rotate(rotation); // Rotate the sword
    this.ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    this.ctx.restore();
  }
}
