let colours = [];
let colourButton;
let bgColor;
let xoff = 0.0;
let analyser;
let mic;
let playing = true;
let dim;
let circleSize;
let thickness;

// Create a new canvas to the browser size
async function setup() {
  if (mic) {
    mic.dispose();
    mic = null;
  } else {
    mic = new Tone.UserMedia();

    await mic.open();
    console.log("opened microphone", mic.label);

    analyser = new AudioEnergy();
    analyser.smoothing = 0.75;

    mic.connect(analyser);
    mic.connect(Tone.Master);
  }
 // Socket Connection Setup
  socket = io.connect('http://localhost:42069');
  // socket.on('mouse', newDrawing);
  createCanvas(windowWidth, windowHeight);

  colours = [color(255), color(0)];
  bgColor = random(colours);
  dim = min(width, height);
}

// On window resize, update the canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // pattern parameters being controlled: thickness, size of circles,
 pattern(window.sliderOneValue * 10, window.sliderTwoValue / 2);
}

// These control updating of default value of slider, based on user input
function sliderOneChange(slider) {
  window.sliderOneValue = sliderOne.value;
  console.log(window.sliderOneValue);
  return window.sliderValue
}

function sliderTwoChange(slider) {
  window.sliderTwoValue = sliderTwo.value;
  console.log(window.sliderTwoValue);
  return window.sliderValue
}

function sliderThreeChange(slider) {
  window.sliderThreeValue = sliderThree.value;
  console.log(window.sliderThreeValue);
  return window.sliderValue
}

function buttonPress() {
if (buttonPress) {
  console.log('button pressed')
  colours = [color(169,210,213),color(70,35,122),color(41,255,184), color(179,184,255), color(255,195,128), color(171,10,10), color(255,241,112)];
  bgColor = random(colours);

}
}
// function mouseMoved() {
//   var data = {
//     x: mouseX,
//     y: mouseY
//   }
//   return false
// }

// This function creates the overall audio generated patterns
function pattern(thickness, diameter = 0.25) {
 if (!mic || !analyser) return;
 analyser.update();

//controls the transparency of the colours
 bgColor.setAlpha(255 * (window.sliderThreeValue));
 //window.sliderThreeValue
 //mouseX/width

 if (playing) {
   //using ToneJS to analyse different levels of the audio to use as parameters of control in the drawing
   const bass = analyser.getEnergy(20, 150);
   const basslevel = map(bass, -100, -30, 0, 100, true);

   const highmid = analyser.getEnergy(2600, 5200);
   const highmidlevel = map(highmid, -100, -30, 0, 100, true);

   const mid = analyser.getEnergy(400, 2600);
   const midlevel = map(mid, -100, -30, 0, 100, true);

   let dim = min(width, height);
   const time = millis() / 1000;
   blendMode(BLEND);

   xoff = xoff + 0.01;
   let n = noise(xoff) * width;
   const frequency = 0.1 * n * 0.001;
   const v = sin(time * frequency);
   const anim = v * 1 + 1;

   background(bgColor);
   blendMode(DIFFERENCE);

   drawEachTile(
     width / 2,
     height / 2,
     dim * 0.5 * anim * (basslevel / 100),
     220,
     time * 0.5,
     diameter
   );

   drawEachTile(
     width / 2,
     height / 2,
     dim * 0.9 * anim * (midlevel / 100),
     180,
     time * 0.5,
     diameter
   );

   drawEachTile(
     width / 2,
     height / 2,
     dim * 0.2 * anim * (highmidlevel / 60),
     80,
     time * 0.5,
     diameter
   );

   drawColumns(width / 2, height / 2, basslevel * 2, 100, time * 0.2, thickness);
 }

}

// Creates circle of circles
function drawEachTile(x, y, radius, sides = 3, angle = 0, diameter) {
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    if (i % 10 == 0) {
      drawTile(sx, sy, diameter);
    }
  }
}

// Creates circle of columns
function drawColumns(x, y, radius, sides = 3, angle = 0, thickness) {
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius * 2;
    let sy = y + sin(a) * radius * 2;
    let ex = x + cos(a) * radius * 10;
    let ey = y + sin(a) * radius * 10;
    if (i % 10 == 0) {
      drawColumn(sx, sy, ex, ey, thickness);
    }
  }
}
// Draw individual circle
function drawTile(sx, sy, diameter) {
  xoff = xoff + 0.0001;
  let n = noise(xoff) * width;
  const frequency = 0.1 * n * 0.000001;
  noStroke();
  fill("fff");
  circleSize = dim * diameter;
  circle(sx + frequency, sy + frequency, circleSize, circleSize);
}

// Draw individal column
function drawColumn(sx, sy, ex, ey, thickness) {
  const dim = min(width, height);
  noFill();
  strokeCap(SQUARE);
  strokeWeight(thickness / dim * 100);
  stroke("#fff");
  line(sx, sy, ex, ey);
}

function mousePressed() {

  Tone.start();
}
