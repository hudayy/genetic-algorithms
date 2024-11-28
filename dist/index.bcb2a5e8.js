class Jet extends NeuralNet {
    constructor(){
        super(nodeLengths, learningRate, false, true);
        this.previousOutput = Array.from({
            length: generationLength
        }, ()=>Array(nodeLengths[nodeLengths.length - 1]).fill(0));
        this.bestOutput = this.previousOutput;
        this.bestInput = Array.from({
            length: generationLength
        }, ()=>Array(nodeLengths[0]).fill(0));
        this.fitnessQueue = [];
        this.reset();
    }
    reset() {
        if (!deterministic) this.learn();
        this.fitnessEnqueue(this.fitness());
        this.setPeakFitness();
        this.x = 0;
        this.y = 10;
        this.vx = 0;
        this.vy = 0;
        this.previousInput = [];
        this.lifeTime = generationLength;
        this.finishTime = 0;
    }
    fitnessEnqueue(fitness) {
        this.fitnessQueue.push(fitness);
        if (this.fitnessQueue.length > fitnessQueueLength) this.fitnessQueue.shift();
    }
    averageFitness() {
        return this.fitnessQueue.reduce((a, b)=>a + b, 0) / this.fitnessQueue.length;
    }
    setPeakFitness() {
        if (this.fitness() > peakFitness) peakFitness = this.fitness();
    }
    learn() {
        if (this.fitness() > this.averageFitness()) {
            this.bestOutput = this.previousOutput;
            this.bestInput = this.previousInput;
        }
        this.sgd(this.bestInput, this.bestOutput, learningRate);
    }
    dead() {
        if (this.x < -50) return true;
        if (this.x >= 50) return true;
        if (this.y >= 100) return true;
        if (this.y < 0) return true;
        for (let rect of rects){
            if (rect.checkForRect(this.x, this.y)) return true;
        }
        return false;
    }
    done() {
        if (this.dead()) return true;
        if (this.distToGoal() < 5) return true;
        return false;
    }
    update(step) {
        this.inputs = [
            this.distToGoal(),
            this.distToWall()
        ];
        this.previousInput.push(this.inputs);
        this.output = convertToOneHot(this.forward(this.inputs, temperature), deterministic);
        this.previousOutput[step] = this.output;
        const angle = this.output.findIndex((value)=>value === 1) * Math.PI / 4;
        this.vx += Math.cos(angle);
        this.vy += Math.sin(angle);
        this.x += this.vx * jetSpeed;
        this.y += this.vy * jetSpeed;
    }
    triCoords() {
        const sideLength = 2, h = Math.sqrt(3) * sideLength / 2, r = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        const points = [
            [
                this.x,
                this.y - h * 0.5
            ],
            [
                this.x - sideLength / 2,
                this.y + h / 2
            ],
            [
                this.x + sideLength / 2,
                this.y + h / 2
            ]
        ];
        const [cx, cy] = points.reduce(([a, b], [px, py])=>[
                a + px / 3,
                b + py / 3
            ], [
            0,
            0
        ]);
        return points.flatMap(([px, py])=>{
            const dx = px - cx, dy = py - cy;
            return [
                dx * Math.cos(r) - dy * Math.sin(r) + cx,
                dx * Math.sin(r) + dy * Math.cos(r) + cy
            ];
        });
    }
    draw(color) {
        push();
        strokeWeight(0.1);
        stroke(...color);
        fill(128, 128, 128, 10);
        triangle(...this.triCoords());
        pop();
    }
    fitness() {
        let fitness = 0;
        if (this.finishTime) fitness = generationLength - this.finishTime;
        else {
            fitness += -this.distToGoal();
            if (this.dead()) fitness -= 200;
        }
        return fitness;
    }
    distToWall() {
        let minDist = Infinity;
        for (let rect of rects){
            const closestX = Math.max(rect.x, Math.min(this.x, rect.xBound));
            const closestY = Math.max(rect.y, Math.min(this.y, rect.yBound));
            const dist1 = Math.sqrt((closestX - this.x) ** 2 + (closestY - this.y) ** 2);
            minDist = Math.min(minDist, dist1);
        }
        return minDist;
    }
    distToGoal() {
        return dist(this.x, this.y, goalX, goalY);
    }
}

//# sourceMappingURL=index.bcb2a5e8.js.map
