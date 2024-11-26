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
        fill(255, 255, 255, 40);
        rect(this.x, this.y, this.w, this.h);
        pop();
    }

    checkForRect(x, y) {
        if (x >= this.x && x < this.xBound && y >= this.y && y < this.yBound) {
            return true;
        }
        return false;
    }

}

