function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function softmax(arr) {
    let sum = arr.map(Math.exp).reduce((a, b) => a + b);
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
    return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
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
        // returns the output
        let softmaxOut = 0
        if (this.softmaxLast) softmaxOut = getOutput(softmax(inputs), deterministic);
        return [inputs, softmaxOut];
    }

    loss(inputs, outputs, deterministic) {
        let loss = 0
        for (let i = 0; i < inputs.length; i++) {
            let error = 0;
            for (let j = 0; j < outputs[i].length; j++) {
                error += outputs[i][j] - this.forward(inputs[i], deterministic)[j][0];
            }
            loss += error * error
        }
        return loss;
    }

    sgd(inputs, outputs, _learningRate, deterministic) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].sgd(inputs, outputs, _learningRate, deterministic, this);
        }
        return this.forward(inputs, deterministic)
    }

    mutate(_learningRate) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].mutate(_learningRate);
        }
    }
}

class Layer {
    constructor(inputs, outputs, runSigmoid) {
        this.weights = Array.from({ length: outputs }, () => Array(inputs).fill(0));
        this.biases = Array.from({ length: outputs }, () => 0);
        this.weightGrads = Array.from({ length: outputs }, () => Array(inputs).fill(0));
        this.biasGrads = Array.from({ length: outputs }, () => 0);
        this.numInputs = inputs;
        this.numOutputs = outputs;
        this.runSigmoid = runSigmoid;
    }

    forEachWeight(func) {
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                func(i, j);
            }
        }
    }

    forEachBias(func) {
        for (let i = 0; i < this.biases.length; i++) {
            func(i);
        }
    }

    forward(inputs) {
        let outputs = [];
        for (let i = 0; i < this.numOutputs; i++) {
            let output = 0;
            for (let j = 0; j < this.numInputs; j++) {
                output += inputs[j] * this.weights[i][j];
                output += this.biases[i];
            }
            if (this.sigmoid) output = sigmoid(output);
            outputs.push(output);
        }
        return outputs;
    }

    sgd(inputs, outputs, _learningRate, deterministic, agent) {
        let epsilon = 0.0000001;
        this.forEachWeight((i, j) => {
            let paramCache = this.weights[i][j];
            let lossA = agent.loss(inputs, outputs, deterministic);
            this.weights[i][j] += epsilon;
            let lossB = agent.loss(inputs, outputs, deterministic);
            this.weightGrads[i][j] = (lossB - lossA) / epsilon;
            this.weights[i][j] = paramCache;
        });

        this.forEachBias((i) => {
            let paramCache = this.biases[i];
            let lossA = agent.loss(inputs, outputs);
            this.biases[i] += epsilon;
            let lossB = agent.loss(inputs, outputs);
            this.biasGrads[i] = (lossB - lossA) / epsilon;
            this.biases[i] = paramCache;
        });

        this.forEachWeight((i, j) => {
            this.weights[i][j] += _learningRate * this.weightGrads[i][j];
        });

        this.forEachBias((i) => {
            this.biases[i] += _learningRate * this.biasGrads[i];
        });
    }

    mutate(_learningRate) {
        this.forEachWeight((i, j) => {
            this.weights[i][j] += generateGaussian() * _learningRate;
        });

        this.forEachBias((i) => {
            this.biases[i] += generateGaussian() * _learningRate;
        });
    }
}