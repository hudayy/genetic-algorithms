const nodeLengths = [2, 5, 8];
const learningRate = 10000;
const mutationFactor = 1;
const generationLength = 10000;
const survivalRate = 0.1;

let simSpeed = 1;
const jetSpeed = 0.05;

const goalX = 0;
const goalY = 90;

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
        if (isLooping()) {
            noLoop()
        } else {
            loop()
        }
    }
}

function triCoords(x, y, radians) {
    const sideLength = 2;
    const height = Math.sqrt(3) * sideLength / 2;

    const x1 = x;
    const y1 = y;

    const x2 = x - sideLength;
    const y2 = y;

    const x3 = x - sideLength / 2;
    const y3 = y + height;

    function rotatePoint(px, py, cx, cy, radians) {
        const cosTheta = Math.cos(radians);
        const sinTheta = Math.sin(radians);

        const translatedX = px - cx;
        const translatedY = py - cy;

        const newX = translatedX * cosTheta - translatedY * sinTheta;
        const newY = translatedX * sinTheta + translatedY * cosTheta;

        return [newX + cx, newY + cy];
    }

    const centerX = (x1 + x2 + x3) / 3;
    const centerY = (y1 + y2 + y3) / 3;

    const rotatedAngle = radians + Math.PI / 2;

    const [x1Rot, y1Rot] = rotatePoint(x1, y1, centerX, centerY, rotatedAngle);
    const [x2Rot, y2Rot] = rotatePoint(x2, y2, centerX, centerY, rotatedAngle);
    const [x3Rot, y3Rot] = rotatePoint(x3, y3, centerX, centerY, rotatedAngle);

    return [x1Rot, y1Rot, x2Rot, y2Rot, x3Rot, y3Rot];
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.xBound = x + w;
        this.yBound = y + h;
    }

    draw() {
        push();
        stroke(255);
        strokeWeight(0.25);
        fill(255, 255, 255, 40)
        rect(this.x, this.y, this.w, this.h);
        pop();
    }
}

function checkForRect(x, y) {
    for (let i = 0; i < rects.length; i++) {
        if (x >= rects[i].x && x < rects[i].xBound && y >= rects[i].y && y < rects[i].yBound) {
            return [true, i];
        }
    }
    return [false, null];
}

const rects = [
    new Rect(-50, 60, 80, 5),
    new Rect(-30, 40, 80, 5),
    new Rect(-50, 20, 80, 5),
]

function draw() {
    for (let sim = 0; sim < simSpeed; sim++) {

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

            for (let rect of rects) {
                rect.draw();
            }
        }

        if (currentStep >= generationLength || jet.done) {
            generation++;
            currentStep = 0;
            jet.reset();
        }

        if (!sim) {
            jet.draw([256]);
        }

        if (jet.fitness() > peakFitness) {
            console.log('peaked')
            peakFitness = jet.fitness();
            jet.bestOutput = jet.previousOutput
        }

        jet.update(currentStep);
        currentStep++;
    }
}

let mutationMaxAngle = 180 * Math.PI / 180;

class Jet extends NeuralNet {
    constructor() {
        super(nodeLengths, learningRate, false, true)
        this.previousOutput = Array.from({ length: generationLength }, () => Array(8).fill(0));
        this.bestOutput = this.previousOutput;
        this.mutate(mutationFactor);
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 10;
        this.vx = 0;
        this.vy = 0;
        this.totalDist = 0;
        this.done = false;
        this.lifeTime = generationLength;
        this.finishTime = 0;
        this.wallDistance = [];
    }

    dead() {
        this.died = false;
        if (this.x < -50) return true;
        if (this.x >= 50) return true;
        if (this.y >= 100) return true;
        if (this.y < 0) return true;

        if (checkForRect(this.x, this.y)[0]) {
            this.died = true;
            return true;
        }

        return false;
    }

    update(step) {
        if (this.done) return;

        if (this.dead()) {
            this.done = true;
            this.lifeTime = step;
            return;
        }

        if (this.distToGoal() < 5) {
            this.done = true;
            this.finishTime = step;
            return;
        }

        this.inputs = [this.x, this.y]
        this.wallDistance.push(this.distToWall())

        this.output = this.sgd(this.inputs, this.bestOutput[step], learningRate, false);
        this.previousOutput[step] = this.output[0];

        const angle = (this.output[1] * Math.PI) / 4;

        this.vx += Math.cos(angle);
        this.vy += Math.sin(angle);

        this.x += this.vx * jetSpeed;
        this.y += this.vy * jetSpeed;
        this.totalDist += Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 16;
    }

    draw(color) {
        push();
        strokeWeight(0.1);
        stroke(...color);
        fill(128, 128, 128, 10);

        const angle = Math.atan2(this.vy, this.vx);

        triangle(...triCoords(this.x, this.y, angle));

        pop();
    }

    fitness() {
        let fitness = 0;
        if (this.finishTime) {
            fitness = generationLength - this.finishTime;
        } else {
            fitness += -this.distToGoal();
        }
        return fitness;
    }

    distToWall() {
        let minDist = Infinity;

        for (let rect of rects) {
            const closestX = Math.max(rect.x, Math.min(this.x, rect.xBound));
            const closestY = Math.max(rect.y, Math.min(this.y, rect.yBound));
            const dist = Math.sqrt((closestX - this.x) ** 2 + (closestY - this.y) ** 2);
            minDist = Math.min(minDist, dist);
        }

        return minDist;
    }

    distToGoal() {
        return dist(this.x, this.y, goalX, goalY);
    }
}