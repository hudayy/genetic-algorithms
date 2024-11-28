// neural net constants
const nodeLengths = [
    2,
    10,
    8
];
const learningRate = 0.1;
const mutationFactor = 1;
const generationLength = 1000;
const temperature = 1;
// jet constants
const fitnessQueueLength = 10;
const jetSpeed = 0.01;
// map constants
const goalX = 0;
const goalY = 90;
const rects = [
    new Rect(-50, 60, 80, 5),
    new Rect(-30, 40, 80, 5),
    new Rect(-50, 20, 80, 5)
];
// variable initialization
let deterministic = false;
let simSpeed = 1;
let generation = 0;
let currentStep = 0;
let peakFitness = -Infinity;
let jet = null;
function setup() {
    const canvas = document.getElementById("app");
    jet = new Jet();
    createCanvas(canvas.clientWidth, canvas.clientHeight, canvas);
    createMenu();
}
function keyPressed() {
    if (key == " ") {
        if (isLooping()) noLoop();
        else loop();
    }
}
function keyPressed() {
    if (key == "d") deterministic = !deterministic;
}
function draw() {
    for(let sim = 0; sim < simSpeed; sim++){
        if (!sim) {
            scale(width / 100, -width / 100);
            translate(50, -100);
            background(0, 0, 0);
            frameRate(120);
            push();
            stroke(255);
            strokeWeight(0.25);
            fill(0, 128, 128, 200);
            ellipse(goalX, goalY, 10);
            pop();
            for (let rect of rects)rect.draw();
            jet.draw([
                256
            ]);
        }
        if (currentStep >= generationLength || jet.done()) {
            generation++;
            currentStep = 0;
            jet.reset();
        }
        jet.update(currentStep);
        currentStep++;
    }
}

//# sourceMappingURL=index.c4775257.js.map
