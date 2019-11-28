const bauhausBg = ["#80212121", "#FFEAEAEA"]
// const bauhausBg = ["#80BEBCB4", "#80DFD9CA", "#801E2019"];
//rgb 190,188,180, 223,217,202, 30,32,25
// new colours "#80212121" "#FFEAEAEA"
let bgColor;
let xoff = 0.0;
let analyser;
let mic;
let playing = true;
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
  console.log(sliderOne.value);
  console.log(sliderTwo);
  console.log(sliderThree);
 // Socket Connection Setup
  socket = io.connect('http://localhost:3000');
  // socket.on('mouse', newDrawing);
  createCanvas(windowWidth, windowHeight);
  bgColor = random(bauhausBg);
}

// On window resize, update the canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
 pattern(window.sliderOneValue *100);
}

function sliderOneChange(slider) {
  window.sliderOneValue = sliderOne.value;
  //console.log(window.sliderValue);
  return window.sliderValue
}

function sliderTwoChange(slider) {
  window.sliderTwoValue = sliderTwo.value;
  console.log(window.sliderValue);
  return window.sliderValue
}

function sliderThreeChange(slider) {
  window.sliderThreeValue = sliderThree.value;
  console.log(window.sliderValue);
  return window.sliderValue
}

function mouseMoved() {
// SET INTERVAL INSTEAD OF CONSISTENTLY SENDING MOUSE DATA
  var data = {
    x: mouseX,
    y: mouseY
  }
  return false
}

// This function creates the overall audio generated patterns
function pattern(thickness) {
 if (!mic || !analyser) return;
 analyser.update();

 if (playing) {
   const bass = analyser.getEnergy(20, 150);
   const basslevel = map(bass, -100, -30, 0, 100, true);

   const highmid = analyser.getEnergy(2600, 5200);
   const highmidlevel = map(highmid, -100, -30, 0, 100, true);

   const mid = analyser.getEnergy(400, 2600);
   const midlevel = map(mid, -100, -30, 0, 100, true);

   let dim = min(width, height);
   blendMode(BLEND);
   const time = millis() / 1000;

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
     time * 0.5
   );

   drawEachTile(
     width / 2,
     height / 2,
     dim * 0.9 * anim * (midlevel / 100),
     180,
     time * 0.5
   );

   drawEachTile(
     width / 2,
     height / 2,
     dim * 0.2 * anim * (highmidlevel / 60),
     80,
     time * 0.5
   );

   drawColumns(width / 2, height / 2, basslevel * 2, 100, time * 0.2, thickness);
 }

}

// Creates circle of circles
function drawEachTile(x, y, radius, sides = 3, angle = 0) {
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    if (i % 10 == 0) {
      drawTile(sx, sy);
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
function drawTile(sx, sy) {
  xoff = xoff + 0.0001;
  let n = noise(xoff) * width;
  const frequency = 0.1 * n * 0.00001;
  const dim = min(width, height);
  noStroke();
  fill("fff");
  circle(sx + frequency, sy + frequency, dim * 0.25, dim * 0.25);
}

// Draw individal column
function drawColumn(sx, sy, ex, ey, thickness) {
  const dim = min(width, height);
  noFill();
  strokeCap(SQUARE);
  // parameter to play with
  strokeWeight(thickness / dim * 100);
  stroke("#fff");
  line(sx, sy, ex, ey);
}

function mousePressed() {

  Tone.start();
}
