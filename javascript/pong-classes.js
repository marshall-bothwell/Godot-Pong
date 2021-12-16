/*This File sets up the main game objects and their default properties
You can edit any of these values to tweak the defaults but keep in mind,
some properties like speed and position get rewritten by the game.
You probably don't want to add new classes.
*/
export class Game {
  constructor(
    size,
    padding,
    htmlElement,
    mousePosition,
    mute,
    volume,
    computerstate,
    computerDifficulty,
    computerDifficultySpeed
  ) {
    this.size = { x: 600, y: 500 }; //container for entire game
    this.padding = { x: 10, y: 10 }; //white space inside game border
    this.htmlElement = null; //element on HTML page
    this.mousePosition = { x: 0, y: 0 };
    this.mute = false; //default mute state
    this.volume = 6; //default volume output 0-10
    this.computerState = 0; //default computer control amount
    this.computerDifficulty = ["off", "easy", "medium", "hard", "impossible"]; //sets the computer difficulty names
    this.computerDifficultySpeed = [0, 2, 4, 8, 100]; //sets the computer difficulty speeds
  }
}

export class Ball {
  constructor(
    size,
    position,
    direction,
    interval,
    acceleration,
    initial,
    intertialTransfer,
    htmlElement
  ) {
    this.size = { x: 20, y: 20 }; // default ball size
    this.position = { x: 50, y: 50 }; // default ball position
    this.direction = { x: 5, y: 0 }; //Ball speed when game starts
    this.acceleration = 0; //X speed multipler on successful block
    this.initial = { x: 2, y: 0 }; //speed reset on point score
    this.maximum = { x: 20, y: 10 }; //maximum speed
    this.inertialTransfer = 0.25; //multiplier for velocity.y transfer from paddle
    this.htmlElement = null; //element on HTML page
  }
}

export class Paddle {
  constructor(
    size,
    position,
    oldPosition,
    direction,
    velocity,
    speed,
    hasHit,
    htmlElement
  ) {
    this.size = { x: 10, y: 75 }; //default paddle size
    this.position = { x: 50, y: 50 }; //paddle position, (Y is top)
    this.oldPosition = { x: 50, y: 50 }; //paddle position 1 frame ago
    this.velocity = { x: 0, y: 0 }; //calculated velocity
    this.direction = { x: 0, y: 0 }; //position offset
    this.speed = 10; //rate that paddle moves with keyboard
    this.hasHit = false; //keep track of wheter paddle hit ball or not
    this.htmlElement = null; //element on HTML page
  }
}
