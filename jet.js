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

        for (let rect of rects) {
            if (rect.checkForRect(this.x, this.y)) {
                this.died = true;
                return true;
            }
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

        this.inputs = [this.x, this.y];
        this.wallDistance.push(this.distToWall());

        this.output = this.sgd(this.inputs, this.bestOutput[step], learningRate, false);
        this.previousOutput[step] = this.output[0];

        const angle = (this.output[1] * Math.PI) / 4;

        this.vx += Math.cos(angle);
        this.vy += Math.sin(angle);

        this.x += this.vx * jetSpeed;
        this.y += this.vy * jetSpeed;
        this.totalDist += Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 16;
    }

    triCoords() {
        const sideLength = 2, h = Math.sqrt(3) * sideLength / 2, r = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        const points = [[this.x, this.y], [this.x - sideLength, this.y], [this.x - sideLength / 2, this.y + h]];
        const [cx, cy] = points.reduce(([a, b], [px, py]) => [a + px / 3, b + py / 3], [0, 0]);
        return points.flatMap(([px, py]) => {
            const dx = px - cx, dy = py - cy;
            return [dx * Math.cos(r) - dy * Math.sin(r) + cx, dx * Math.sin(r) + dy * Math.cos(r) + cy];
        });
    }    

    draw(color) {
        push();
        strokeWeight(0.1);
        stroke(...color);
        fill(128, 128, 128, 10);

        const angle = Math.atan2(this.vy, this.vx);

        triangle(...this.triCoords(this.x, this.y, angle));

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