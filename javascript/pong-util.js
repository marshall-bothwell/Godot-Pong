//clamp min/max function
export function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

//scale value to input output range
export function scalerange(num, inlow, inhigh, outlow, outhigh) {
  if (inhigh - inlow === 0) {
    return outlow;
  } else {
    return ((num - inlow) * (outhigh - outlow)) / (inhigh - inlow) + outlow;
  }
}

//gets a random number with optional rounding
export function randomAdjust(range, roundBOOL) {
  var plusOrMinus = Math.random() < 0.5 ? -1 : 1; //random 1 or -1
  var x = Math.random() * range;
  //intergers only
  if (roundBOOL) {
    x = Math.floor(x);
  }
  x = x * plusOrMinus;
  return x;
}

export function boolToOnOff(x) {
  if (x === true) return "ON";
  if (x === false) return "OFF";
}
