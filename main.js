let POPULATION = 1000;
let GENERATION_LENGTH  = 400;
let mutationChance = 100;
let simSpeed = 1;

let jets = [];
let generation = 0;
let currentStep = 0;
let peakFitness = 0;  // Track the highest fitness ever achieved

function setup() {
    const canvas = document.getElementById("app");

    for (let i = 0; i < POPULATION; i++) {
        jets.push(new Jet());
    }

    createCanvas(canvas.clientWidth, canvas.clientHeight, canvas);

    // Create menu UI on the left side
    createMenu();
}

function createMenu() {
    let menu = createDiv();
    menu.position(0, 0);
    menu.style('width', '300px');
    menu.style('height', '100vh');
    menu.style('background-color', 'rgba(0, 0, 0, 0.7)');
    menu.style('color', 'white');
    menu.style('padding', '10px');
    menu.style('display', 'flex');
    menu.style('flex-direction', 'column');
    menu.style('align-items', 'flex-start'); // Align elements to the left

    // Mutation chance input
    createSpan('Mutation Chance:').parent(menu);
    let mutationInput = createInput(mutationChance.toString());
    mutationInput.attribute('type', 'number');
    mutationInput.parent(menu);
    mutationInput.style('display', 'block');
    mutationInput.style('margin-bottom', '10px');
    mutationInput.input(() => mutationChance = parseInt(mutationInput.value()));

    // Sim speed input
    createSpan('Simulation Speed:').parent(menu);
    let simSpeedInput = createInput(simSpeed.toString());
    simSpeedInput.attribute('type', 'number');
    simSpeedInput.parent(menu);
    simSpeedInput.style('display', 'block');
    simSpeedInput.style('margin-bottom', '10px');
    simSpeedInput.input(() => simSpeed = Math.max(1, parseInt(simSpeedInput.value())));

    // Maximum mutation angle input (in degrees)
    createSpan('Max Mutation Angle (Degrees):').parent(menu);
    let maxAngleInput = createInput('36'); // Default value: 36 degrees
    maxAngleInput.attribute('type', 'number');
    maxAngleInput.parent(menu);
    maxAngleInput.style('display', 'block');
    maxAngleInput.style('margin-bottom', '10px');
    maxAngleInput.input(() => {
        let degrees = parseInt(maxAngleInput.value());
        // Convert degrees to a fraction of 2π
        mutationMaxAngle = degrees * Math.PI / 180; // Convert degrees to radians
    });

    // Generation display
    createSpan('Generation: ').parent(menu);
    let genDisplay = createSpan('0');
    genDisplay.parent(menu);
    genDisplay.style('display', 'block');
    genDisplay.style('margin-bottom', '10px');
    function updateGenDisplay() {
        genDisplay.html(generation);
    }

    // Peak fitness display
    createSpan('Peak Fitness: ').parent(menu);
    let peakFitnessDisplay = createSpan('0');
    peakFitnessDisplay.parent(menu);
    peakFitnessDisplay.style('display', 'block');
    peakFitnessDisplay.style('margin-bottom', '10px');
    function updatePeakFitness() {
        peakFitnessDisplay.html(peakFitness);
    }

    // Updating generation and peak fitness
    function updateStats() {
        updateGenDisplay();
        updatePeakFitness();
    }

    setInterval(updateStats, 100); // Update stats every 100ms
}


function keyPressed() {
    if (key == " ") {
        if (isLooping()) {
            noLoop()
        } else {
            loop()
            simSpeed = 1
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

    // draw the rectangle
    push();
    stroke(255);
    strokeWeight(0.25);
    fill(255, 255, 255, 40);
    rect(-30, 40, 60, 40);
    pop();

    for (let i = 0; i < simSpeed; i++) {
        if (currentStep >= 500 || jets.every(x => x.done)) {
            generation++;
            currentStep = 0;
            jets.sort((a, b) => b.fitness() - a.fitness());

            jets = jets.splice(0, POPULATION / 2);
            for (let i = jets.length; i < POPULATION; i++) {
                jets[i] = jets[i - POPULATION / 2].reproduce();
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

let mutationMaxAngle = 36 * Math.PI / 180;

class Jet {
    constructor(genes = null) {
        if (genes !== null) this.genes = genes;
        else {
            this.genes = Array.from({ length: 500 }, () => Math.random() * 2 * Math.PI);
        }

        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 10;
        this.vx = 0;
        this.vy = 0;
        this.done = false;
        this.lifeTime = 500;
        this.finishTime = 0;
    }

    dead() {
        if (this.x < -50) return true;
        if (this.x >= 50) return true;
        if (this.y >= 100) return true;
        if (this.y < 0) return true;

        if (this.x >= -30 && this.x < 30 && this.y >= 40 && this.y < 80) return true;

        return false;
    }

    update(step) {
        if (this.done) return;

        if (this.dead()) {
            this.done = true;
            this.lifeTime = step;
            return;
        }

        if (dist(this.x, this.y, 0, 90) < 5) {
            this.done = true;
            this.finishTime = step;
            return;
        }

        this.vx += Math.cos(this.genes[step]);
        this.vy += Math.sin(this.genes[step]);

        this.x += this.vx / 16;
        this.y += this.vy / 16;
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
        if (this.finishTime) return 500 - this.finishTime;
        return -dist(this.x, this.y, 0, 90);
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
