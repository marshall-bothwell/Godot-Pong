/*This is where the game code takes place
You'll mainly be adding imports from audio.js or events.js
and then activating/checking them in the top two sections
STARTUP EVENTS - things that will run once when the game starts
RUNNING PROCESSES - things that will run every frame
*/


//Import Code From Other JS Modules
//Sound functions and classes
import {
  wallSound,
  paddleSound,
  scoreSound,
  ambientSound,
  adventureMusic,
  villageMusic,
  playDeferredSounds
} from "./pong-audio.js";
//Defaults for game objects
import { Game, Ball, Paddle } from "./pong-classes.js";
//Game Events
import {
  GameEvent,
  gameEventArray,
  ballHitWall,
  ballHitPaddle,
  leftScoreHit,
  rightScoreHit,
  leftScoreHigher,
  rightScoreHigher,
  computerPlayer,
  mouseControl,
  muteControl,
  volumeUpControl,
  volumeDownControl
} from "./pong-events.js";
//Utility functions
import { clamp, scalerange, randomAdjust, boolToOnOff } from "./pong-util.js";
//import * as Tone from "../lib/Tone.js";

//GAME OBJECTS///DON'T CHANGE THESE
var updateInterval = 15; //game framerate
var game = new Game();
game.htmlElement = document.getElementById("game");
var ball = new Ball();
ball.htmlElement = document.getElementById("ball");
ballReset();
var paddleArray = [];
var paddleLeft = new Paddle();
paddleLeft.controller = "player1";
paddleLeft.htmlElement = document.getElementById("left-paddle");
paddleArray.push(paddleLeft);
//If the game is too hard, make your paddle bigger, but don't go too big!
//paddleLeft.size.y = 150;
var paddleRight = new Paddle();
paddleRight.controller = "player2";
paddleRight.htmlElement = document.getElementById("right-paddle");
paddleArray.push(paddleRight);
paddlesReset();
//END OF GAME OBJECTS///

//STARTUP EVENTS
ambientSound.play();

//RUNNING PROCESSES (updated every frame of the game)
function gameProcess() {
  //ambient sound
  if (rightScore > leftScore) {
    rightScoreHigher.turnOn();
    leftScoreHigher.turnOff();
  } else if (rightScore < leftScore) {
    rightScoreHigher.turnOff();
    leftScoreHigher.turnOn();
  }

  ambientSound.player.playbackRate = scalerange(
    Math.abs(ball.direction.x),
    0,
    5,
    1,
    3
  );
  //EVENTS
  // this is a non-persistant event so it only needs to be checked
  if (ballHitWall.state === true) {
    wallSound.play();
  }
  if (ballHitPaddle.state) {
    paddleSound.play();
  }
  if (leftScoreHit.state) {
    scoreSound.play();
  }
  if (rightScoreHit.state) {
    scoreSound.play();
  }
  //this is a persistant event so it must be checked and checked if it changed
  if (rightScoreHigher.state && rightScoreHigher.changed) {
    adventureMusic.play();
    villageMusic.stop();
  }
  if (leftScoreHigher.state && leftScoreHigher.changed) {
    villageMusic.play();
    adventureMusic.stop();
  }
}

///////////////////////////////////////////////////////////////
//EVERYTHING BELOW HERE IS IMPORTANT GAME CODE/////////////////
///////////////////////////////////////////////////////////////
//State Handlers
var keysDown = {}; //Keyboard input handling
var resetScoreAndBall = false; //reset score and ball state

//HTML Elements
game.htmlElement.style.height = game.size.y + "px";
game.htmlElement.style.width = game.size.x + "px";
computerPlayer.htmlElement = document.getElementById("computer-control-state");
computerPlayer.htmlElement.innerHTML =
  game.computerDifficulty[game.computerState];
mouseControl.htmlElement = document.getElementById("mouse-control-state");
mouseControl.htmlElement.innerHTML = boolToOnOff(mouseControl.state);
muteControl.htmlElement = document.getElementById("mute-state");
muteControl.htmlElement.innerHTML = boolToOnOff(game.mute);
var volumeDisplay = document.getElementById("volume-state");
volumeDisplay.innerHTML = game.volume;
var gameErrors = document.getElementById("errors"); //update error text
var gameDebug = document.getElementById("debug"); //update debug text
//EXAMPLE:
//gameDebug.innerHTML = "XXXX";

//Score Display
var leftScoreDisplay = document.getElementById("left-score");
var rightScoreDisplay = document.getElementById("right-score");
var leftScore = 0;
var rightScore = 0;

//Computer Control
var computerDirection = 0; //computer control paddle direction
var computerDirectionOld = 0; //computer control paddle direction storage

//Main Update Loop
var update = function() {
  try {
    controlUpdate();
    updateComputer();
    paddlesUpdate();
    updateBall();
    ballCheckMax();
    gameProcess();
    eventsReset();
    playDeferredSounds();
  } catch (error) {
    //make critical errors stop the update
    gameErrors.innerHTML = error;
    console.log(error);
    clearInterval(run);
  }
};

var run = setInterval(update, updateInterval); // this is the master update interval

function scoreDisplayUpdate() {
  leftScoreDisplay.innerHTML = leftScore;
  rightScoreDisplay.innerHTML = rightScore;
}

function updateBall() {
  //Calculate new Ball Position
  var newBallPos = {
    x: ball.position.x + ball.direction.x,
    y: ball.position.y + ball.direction.y
  };

  //Wall Collisions
  //Right Wall
  if (newBallPos.x + ball.size.x > game.size.x - game.padding.x) {
    ball.position.x = game.size.x - game.padding.x;
    ball.direction.x = -Math.abs(ball.direction.x + ball.acceleration);
    ball.direction.y += paddleRight.velocity.y * -1 * ball.inertialTransfer;
    ball.direction.y += randomAdjust(1, false);
    //check for leftscore via paddleRight position
    if (
      ball.position.y + paddleRight.size.y / 2 < paddleRight.position.y ||
      ball.position.y > paddleRight.position.y + paddleRight.size.y
    ) {
      //only count the score if the other paddle has hit
      if (paddleLeft.hasHit) {
        leftScore += 1;
        scoreDisplayUpdate();
        leftScoreHit.turnOn();
        paddleLeft.hasHit = false;
      } else {
        ballHitWall.turnOn();
      }
      ball.position.x = game.size.x - game.padding.x;
      ball.direction.x = ball.initial.x * -1; //reset ball speed
      ball.direction.y = ball.initial.y;
    } else {
      ballHitPaddle.turnOn();
      paddleRight.hasHit = true;
    }
  }
  //Bottom Wall
  if (newBallPos.y + ball.size.y > game.size.y - game.padding.y) {
    ball.direction.y = -Math.abs(ball.direction.y);
    ballHitWall.turnOn();
  }
  //Left Wall
  if (newBallPos.x < game.padding.x) {
    ball.position.x = game.padding.x;
    ball.direction.x = Math.abs(ball.direction.x - ball.acceleration);
    ball.direction.y += paddleLeft.velocity.y * -1 * ball.inertialTransfer;
    ball.direction.y += randomAdjust(1, false);
    //check for rightScore via paddleLeft position
    if (
      ball.position.y + paddleLeft.size.y / 2 < paddleLeft.position.y ||
      ball.position.y > paddleLeft.position.y + paddleLeft.size.y
    ) {
      //only count the score if the other paddle has hit
      if (paddleRight.hasHit) {
        rightScore += 1;
        scoreDisplayUpdate();
        rightScoreHit.turnOn();
        paddleRight.hasHit = false;
      } else {
        ballHitWall.turnOn();
      }
      ball.position.x = game.padding.x;
      ball.direction.x = ball.initial.x; //reset ball speed
      ball.direction.y = ball.initial.y;
    } else {
      ballHitPaddle.turnOn();
      paddleLeft.hasHit = true;
    }
  }
  //Top Wall
  if (newBallPos.y < game.padding.y) {
    ball.direction.y = Math.abs(ball.direction.y);
    ballHitWall.turnOn();
  }
  //Move Ball
  ball.position.x = newBallPos.x;
  ball.position.y = newBallPos.y;
  //Update HTML element position
  ball.htmlElement.style.top = ball.position.y + "px";
  ball.htmlElement.style.left = ball.position.x + "px";
}

//Reset Ball Position to Center
function ballReset() {
  ball.position.x = game.size.x / 2;
  ball.position.y = game.size.y / 2;
  ball.direction.x = ball.initial.x;
  ball.direction.y = ball.initial.y;
}

//Constrain Ball Speed to Maximums
function ballCheckMax() {
  ball.direction.x = clamp(
    ball.direction.x,
    -1 * ball.maximum.x,
    ball.maximum.x
  );
  ball.direction.y = clamp(
    ball.direction.y,
    -1 * ball.maximum.y,
    ball.maximum.y
  );
}

//Move Paddles
function paddlesUpdate() {
  for (var i = 0; i < paddleArray.length; i++) {
    paddleArray[i].oldPosition.y = paddleArray[i].position.y;
    paddleMove(paddleArray[i]);
    if (mouseControl.state && i === 0) {
      paddleArray[i].position.y = game.mousePosition.y;
    }
    //update velocity value
    paddleArray[i].velocity.y =
      paddleArray[i].oldPosition.y - paddleArray[i].position.y;
  }
}

function paddleMove(target) {
  var newPosition = target.position.y + target.direction.y;
  //check if inside game bounds
  if (newPosition + target.size.y < game.size.y && newPosition > 0) {
    target.position.y += target.direction.y; //move paddle toward direction
    target.htmlElement.style.top = target.position.y + "px"; //redraw paddle position
    target.htmlElement.style.height = target.size.y + "px"; //update paddles size
  }
}

function paddlesReset() {
  for (var i = 0; i < paddleArray.length; i++) {
    paddleArray[i].position.y = game.size.y / 2 - paddleArray[i].size.y / 2;
    paddleArray[i].hasHit = false;
  }
}

//Handle Keyboard Control
function controlUpdate() {
  var keysCount = 0;
  paddleLeft.direction.y = 0; //reset paddles before movement is set
  paddleRight.direction.y = 0;
  for (var key in keysDown) {
    // check which keys are down
    keysCount += 1;
    var value = Number(key);
    //Left Paddle Control
    if (value === 84) {
    }
    if (value === 83) {
      //S
      paddleLeft.direction.y = paddleLeft.speed; //move down
    } else if (value === 87) {
      //W
      paddleLeft.direction.y = paddleLeft.speed * -1; //move up
    }
    //Right Paddle Control
    if (value === 40) {
      //cursor-down
      paddleRight.direction.y = paddleRight.speed; //move down
    } else if (value === 38) {
      //cursor-up
      paddleRight.direction.y = paddleRight.speed * -1; //move up
    }
    //Toggle Computer Control
    //1
    if (value === 49 && computerPlayer.changedManual === false) {
      game.computerState =
        (game.computerState + 1) % game.computerDifficulty.length;
      computerPlayer.changedManual = true; //computer player state is changed
      computerPlayer.htmlElement.innerHTML =
        game.computerDifficulty[game.computerState];
    }
    //Toggle Mouse Control
    //2
    if (value === 50 && mouseControl.changedManual === false) {
      mouseControl.state = !mouseControl.state; // toggle computer player state
      mouseControl.changedManual = true; //computer player state is changed
      mouseControl.htmlElement.innerHTML = boolToOnOff(mouseControl.state);
    }
    //Toggle Mute
    //M
    if (value === 77 && muteControl.changedManual === false) {
      game.mute = !game.mute; //toggle mute state
      muteControl.changedManual = true; //mute state is changed
      muteControl.htmlElement.innerHTML = boolToOnOff(game.mute);
    }
    //Volume Up
    //N
    if (value === 78 && volumeUpControl.changedManual === false) {
      volumeUpControl.changedManual = true; //volumeup state is changed
      setVolume(game.volume + 1);
      volumeDisplay.innerHTML = game.volume;
    }
    //Volume Down
    //B
    if (value === 66 && volumeDownControl.changedManual === false) {
      volumeDownControl.changedManual = true; //volumedown state is changed
      setVolume(game.volume - 1);
      volumeDisplay.innerHTML = game.volume;
    }
    //Reset Score, Ball Position, and Paddle Positions
    //R
    if (value === 82 && resetScoreAndBall === false) {
      resetScoreAndBall = true; //computer player state is changed
      leftScore = 0;
      rightScore = 0;
      ballReset();
      paddlesReset();
    }
  }
  if (keysCount === 0) {
    //zero all paddle movement if no keys are down

    scoreDisplayUpdate();
    computerPlayer.changedManual = false; //reset computer player state is changed
    mouseControl.changedManual = false; //reset mouse control state is changed
    muteControl.changedManual = false; //reset mute control state is changed
    volumeUpControl.changedManual = false; //reset volume-up control state is changed
    volumeDownControl.changedManual = false; //reset volume-down control state is changed
    Tone.Master.mute = game.mute; //set tone.js mute
    if (!game.mute) setVolume(game.volume);
    resetScoreAndBall = false; //reset score and ball detect
  }
}

//Input Listeners
//KeyDown
window.addEventListener("keydown", evt => {
  keysDown[evt.keyCode] = true;
});
//KeyUp
window.addEventListener("keyup", evt => {
  delete keysDown[evt.keyCode];
});
//MouseMove
game.htmlElement.addEventListener("mousemove", function(evt) {
  game.mousePosition.x = evt.pageX - game.padding.x;
  game.mousePosition.y = evt.pageY - game.padding.y;
});

//Run Computer Control on paddleRight
function updateComputer() {
  if (game.computerState > 0) {
    //sync paddle position.y toward ballposition.y
    computerDirectionOld = paddleRight.direction.y;
    computerDirection =
      ball.position.y - paddleRight.position.y - paddleRight.size.y / 2;
    var difficultySpeed = game.computerDifficultySpeed[game.computerState];
    paddleRight.direction.y = clamp(
      computerDirection,
      difficultySpeed * -1,
      difficultySpeed
    );
    paddleRight.direction.y =
      (paddleRight.direction.y + computerDirectionOld) / 2;
    paddleMove(paddleRight);
    //redraw paddle position
    paddleRight.htmlElement.style.top = paddleRight.position.y + "px";
  }
}

//Resets Events that are not Persistent
function eventsReset() {
  for (var i = 0; i < gameEventArray.length; i++) {
    if (gameEventArray[i].persistent === false) {
      gameEventArray[i].state = false;
    }
    gameEventArray[i].changed = false;
  }
}

function setVolume(x) {
  game.volume = x;
  game.volume = clamp(x, 0, 10); //clamp volume range
  if (!game.mute)
    Tone.Master.volume.value = scalerange(game.volume, 0, 10, -40, 0); //scale to dB
}
