/*This File creates GameEvents which are easy to use triggers or states
You likely want to use the turnOn() turnOff() functions to track if state has changed
If you create a new event, be sure to import it at the top of index.js!
*/

export class GameEvent {
  constructor(persistent, state, changed, htmlElement) {
    this.persistent = false; //does state get reset?
    this.state = false; //current state
    this.changed = false; //check if changed for retriggering handlers
    this.changedManual = false; //like changed but won't get auto-handled
    this.htmlElement = null; //element on HTML page
  }
  //Turn ON with change awareness
  turnOn() {
    if (this.state === false) {
      this.changed = true;
    }
    this.state = true;
  }
  //Turn OFF with change awareness
  turnOff() {
    if (this.state === true) {
      this.changed = true;
    }
    this.state = false;
  }
}

//container to keep track of events
export var gameEventArray = [];

//Game Events
export var ballHitWall = new GameEvent();
ballHitWall.persistent = false;
gameEventArray.push(ballHitWall);

export var ballHitPaddle = new GameEvent();
ballHitPaddle.persistent = false;
gameEventArray.push(ballHitPaddle);

export var leftScoreHit = new GameEvent();
leftScoreHit.persistent = false;
gameEventArray.push(leftScoreHit);

export var rightScoreHit = new GameEvent();
rightScoreHit.persistent = false;
gameEventArray.push(rightScoreHit);

export var leftScoreHigher = new GameEvent();
leftScoreHigher.persistent = true;
gameEventArray.push(leftScoreHigher);

export var rightScoreHigher = new GameEvent();
rightScoreHigher.persistent = true;
gameEventArray.push(rightScoreHigher);

//Add More Events HERE

////////////////////////////////////////////
//These are required for the game's keyboard control
export var computerPlayer = new GameEvent();
computerPlayer.persistent = true;
gameEventArray.push(computerPlayer);

export var mouseControl = new GameEvent();
mouseControl.persistent = true;
gameEventArray.push(mouseControl);

export var muteControl = new GameEvent();
muteControl.persistent = false;
gameEventArray.push(muteControl);

export var volumeUpControl = new GameEvent();
volumeUpControl.persistent = false;
gameEventArray.push(volumeUpControl);

export var volumeDownControl = new GameEvent();
volumeDownControl.persistent = false;
gameEventArray.push(volumeDownControl);
