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

function draw() {
    scale(width / 100, -width / 100);
    translate(50, -100);

    background(0);

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

    if (currentStep >= 400 || jets.every(x => x.done)) {
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
        jet.draw();
    }

    currentStep++;
}

class Jet {
    constructor(genes = null) {

        if (genes !== null) this.genes = genes;
        else {
            // initialize the genes with random numbers from 0 to 3 inclusive
            this.genes = Array.from({length: 400}, () => Math.floor(Math.random() * 4));
        }

        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 10;
        this.vx = 0;
        this.vy = 0;
        this.done = false;
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
            return;
        }

        if (dist(this.x, this.y, 0, 90) < 5) {
            this.done = true;
            this.finishTime = step;
            return;
        }


        switch(this.genes[step]) {
            case 0: // right
                this.vx++;
                break;
            case 1: // up
                this.vy++;
                break;
            case 2: // left
                this.vx--;
                break;
            case 3: // down
                this.vy--;
                break;
        }

        this.x += this.vx / 64;
        this.y += this.vy / 64;
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
            // mutate one in fifty genes
            if (Math.random() * 50 < 1) childGenes[i] = Math.floor(Math.random() * 4);
        }
        return new Jet(childGenes);
    }
}