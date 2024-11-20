let population = 1000;
let generationLength = 10000;
let mutationChance = 50;
let simSpeed = 1;

let jets = [];
let generation = 0;
let currentStep = 0;
let peakFitness = -generationLength;  // Track the highest fitness ever achieved

function setup() {
    const canvas = document.getElementById("app");

    for (let i = 0; i < population; i++) {
        jets.push(new Jet());
    }

    createCanvas(canvas.clientWidth, canvas.clientHeight, canvas);

    // Create menu UI on the left side
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

const rects = [
    new Rect(-50, 60, 80, 5),
    new Rect(-30, 40, 80, 5),
    new Rect(-50, 20, 80, 5),
]

function checkForRect(x, y) {
    for (let i = 0; i < rects.length; i++) {
        if (x >= rects[i].x && x < rects[i].xBound && y >= rects[i].y && y < rects[i].yBound) {
            return [true, i];
        }
    }
    return [false, null];
}

function mouseMoved() {
    rectInfo = checkForRect(mouseX, mouseY)
    if (rectInfo[0]) {
        rects[rectInfo[1]].hover = true;
    } else {
        for (let i = 0; i < rects.length; i++) {
            rects[i].hover = false;
        }
    }
}

function draw() {
    scale(width / 100, -width / 100);
    translate(50, -100);

    background(0, 0, 0);

    frameRate(120);

    // draw the goal
    push();
    stroke(255);
    strokeWeight(0.25);
    fill(0, 128, 128, 200);
    ellipse(0, 90, 10);
    pop();

    // draw the rectangles
    for (let i = 0; i < rects.length; i++) {
        rects[i].draw();
    }


    for (let i = 0; i < simSpeed; i++) {
        if (generation == 1000 && peakFitness < 0) {
            generation = 0
            for (let j = 0; j < jets.length; j++) {
                jets[j] = new Jet();
            }
        }
        if (currentStep >= 500 || jets.every(x => x.done)) {
            generation++;
            currentStep = 0;
            jets.sort((a, b) => b.fitness() - a.fitness());

            jets = jets.splice(0, population / 2);
            for (let i = jets.length; i < population; i++) {
                jets[i] = jets[i - population / 2].reproduce();
            }

            jets.forEach(jet => jet.reset());
        }

        for (let jet of jets) {
            jet.update(currentStep);
            if (i == 0) {
                jet.draw();
            }
        }

        // Track peak fitness: if a jet's fitness exceeds the previous peak, update it
        peakFitness = Math.max(peakFitness, ...jets.map(jet => jet.fitness()));

        currentStep++;
    }
}

let mutationMaxAngle = 180 * Math.PI / 180;

class Jet {
    constructor(genes = null) {
        if (genes !== null) this.genes = genes;
        else {
            this.genes = Array.from({ length: generationLength }, () => Math.random() * 2 * Math.PI);
        }

        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 10;
        this.vx = 0;
        this.vy = 0;
        this.totalDist = 0;
        this.done = false;
        this.lifeTime = 500;
        this.finishTime = 0;
    }

    dead() {
        if (this.x < -50) return true;
        if (this.x >= 50) return true;
        if (this.y >= 100) return true;
        if (this.y < 0) return true;

        if (checkForRect(this.x, this.y)[0]) return true;

        return false;
    }

    update(step) {
        if (this.dead()) {
            this.done = true;
            this.lifeTime = step;
            this.died = true;
            return;
        }

        if (dist(this.x, this.y, 0, 90) < 5) {
            this.done = true;
            this.finishTime = step;
            this.died = true;
            return;
        }

        if (this.done) {
            this.died = false;
            return;
        }

        this.vx += Math.cos(this.genes[step]);
        this.vy += Math.sin(this.genes[step]);

        this.x += this.vx / 16;
        this.y += this.vy / 16;
        this.totalDist += Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 16;
    }

    draw() {
        push();
        strokeWeight(0.1);
        stroke(255);
        fill(128, 128, 128, 10);

        // Calculate the angle based on the velocity of the jet
        const angle = Math.atan2(this.vy, this.vx);

        // Pass the angle for rotation
        triangle(...triCoords(this.x, this.y, angle));

        pop();
    }

    fitness() {
        let fitness = -generationLength;
        if (this.finishTime) {
            fitness = 500 - this.finishTime;
        } else {
            fitness = -dist(this.x, this.y, 0, 90) * 3 + this.totalDist + this.lifeTime - generationLength;
        }
        return fitness;
    }

    reproduce() {
        let childGenes = [...this.genes];
        for (let i = 0; i < childGenes.length; i++) {
            if (Math.random() * mutationChance < 1) {
                childGenes[i] = (childGenes[i] + (Math.random() * 2 * mutationMaxAngle - mutationMaxAngle)) % (2 * Math.PI);
            }
        }
        return new Jet(childGenes);
    }
}
