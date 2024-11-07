const POPULATION = 1000;
const GENERATION_LENGTH = 400;

let jets = [];

function setup() {
    const canvas = document.getElementById("app");

    for (let i = 0; i < POPULATION; i++) {
        jets.push(new Jet());
    }

    createCanvas(canvas.clientWidth, canvas.clientHeight, canvas);
}

let generation = 0;
let currentStep = 0;

let simSpeed = 1;

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

function mouseWheel(event) {
    simSpeed = Math.max(simSpeed -= event.deltaY, 1)
}

function draw() {
    scale(width / 100, -width / 100);
    translate(50, -100);

    background(0, 0, 0, 10);

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
        if (currentStep >= 1000 || jets.every(x => x.done)) {
            generation = 0;
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

        currentStep++;
    }
}

class Jet {
    constructor(genes = null) {

        if (genes !== null) this.genes = genes;
        else {
            // initialize the genes with random numbers from 0 to 3 inclusive
            this.genes = Array.from({ length: 1000 }, () => Math.random() * 2 * Math.PI);
        }

        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 10;
        this.vx = 0;
        this.vy = 0;
        this.done = false;
        this.lifeTime = 1000;
        this.finishTime = 0;
    }

    dead() {
        // if we crashed into the walls, we are dead
        if (this.x < -50) return true;
        if (this.x >= 50) return true;
        if (this.y >= 100) return true;
        if (this.y < 0) return true;

        // if we crashed into the rectangle, we are dead
        if (
            this.x >= -30 &&
            this.x < 30 &&
            this.y >= 40 &&
            this.y < 80
        ) return true;

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


        this.vx += Math.cos(this.genes[step])
        this.vy += Math.sin(this.genes[step])

        this.x += this.vx / 16;
        this.y += this.vy / 16;
    }

    draw() {
        push();

        strokeWeight(0.1);
        stroke(255);
        fill(128, 128, 128, 10);
        ellipse(this.x, this.y, 2);

        pop();
    }

    fitness() {
        // if we reached the goal, our fitness is 1000 minus the time it took to finish
        if (this.finishTime) return 1000 - this.finishTime;

        // otherwise, our fitness is the negative distance from the goal
        return -dist(this.x, this.y, 0, 90);
    }

    reproduce() {
        let childGenes = [...this.genes];
        for (let i = 0; i < childGenes.length; i++) {
            // let mutationChance = 100 * (1 - i / this.lifeTime);
            let mutationChance = 100;
            if (Math.random() * mutationChance < 1) childGenes[i] = (childGenes[i] + Math.random() * 2 * Math.PI / 10) % (2 * Math.PI);
        }
        return new Jet(childGenes);
    }
}