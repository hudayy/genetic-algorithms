function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function softmax(arr) {
    let sum = arr.map(Math.exp).reduce((a, b) => a + b);
    console.log(arr.map(x => Math.exp(x) / sum));
    return arr.map(x => Math.exp(x) / sum);
}

function getOutput(outputs, deterministic = true) {
    if (deterministic) return outputs.indexOf(Math.max(...outputs));
    let rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < outputs.length; i++) {
        cumulative += outputs[i];
        if (rand < cumulative) return [i];
    }
}

function generateGaussian() {
    return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

class NeuralNet {
    constructor(nodes, _learningRate, sigmoidLast = false, softmaxLast = false) {
        this.layers = [];
        this.grads = [];
        this.softmaxLast = softmaxLast;
        let runSigmoid = true;
        for (let i = 0; i < nodes.length - 1; i++) {
            if (sigmoidLast == false && i == nodes.length - 2) runSigmoid = false;
            this.layers.push(new Layer(nodes[i], nodes[i + 1], runSigmoid));
        }
    }

    forward(inputs, deterministic = true) {
        for (let i = 0; i < this.layers.length; i++) {
            inputs = this.layers[i].forward(inputs);
        }
        let softmaxOut = 0;
        if (this.softmaxLast) softmaxOut = getOutput(softmax(inputs), deterministic);
        return [inputs, softmaxOut];
    }

    loss(inputs, outputs, deterministic) {
        let loss = 0;
        for (let i = 0; i < inputs.length; i++) {
            let error = 0;
            for (let j = 0; j < outputs[i].length; j++) {
                error += outputs[i][j] - this.forward(inputs[i], deterministic)[j][0];
            }
            loss += error * error;
        }
        return loss;
    }

    sgd(inputs, outputs, _learningRate, deterministic) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].sgd(inputs, outputs, _learningRate, deterministic, this);
        }
        return this.forward(inputs, deterministic);
    }

    mutate(_learningRate) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].mutate(_learningRate);
        }
    }
}