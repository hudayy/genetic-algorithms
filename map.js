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