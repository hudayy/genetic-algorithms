function sigmoid(x) {
    const clampedX = Math.max(-50, Math.min(50, x));
    return 1 / (1 + Math.exp(-clampedX));
}

function softmax(arr, temp) {
    const maxVal = Math.max(...arr);
    const scaledArr = arr.map(x => x - maxVal);

    const expVals = scaledArr.map(x => Math.exp(x / temp));
    const sum = expVals.reduce((a, b) => a + b, 0);

    return expVals.map(val => val / sum);
}

function convertToOneHot(probabilities, deterministic = false, temperature = 1.0) {
    const explorationTemperature = Math.max(1.0, 10.0 * Math.exp(-generation / 50));

    const adjustedProbs = softmax(probabilities, explorationTemperature);

    if (deterministic) {
        const oneHot = Array(probabilities.length).fill(0);
        oneHot[adjustedProbs.indexOf(Math.max(...adjustedProbs))] = 1;
        return oneHot;
    }

    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < adjustedProbs.length; i++) {
        if ((cumulative += adjustedProbs[i]) > rand) {
            const oneHot = Array(probabilities.length).fill(0);
            oneHot[i] = 1;
            return oneHot;
        }
    }

    const oneHot = Array(probabilities.length).fill(0);
    oneHot[probabilities.length - 1] = 1;
    return oneHot;
}

function generateGaussian() {
    return Math.sqrt(-2 * Math.log(Math.random() || 1)) * Math.cos(2 * Math.PI * Math.random());
}

class NeuralNet {
    constructor(nodes, _learningRate, sigmoidLast = false, softmaxLast = false) {
        this.layers = [];
        this.grads = [];
        this.softmaxLast = softmaxLast;
        this.learningRate = _learningRate;
        let runSigmoid = true;
        for (let i = 0; i < nodes.length - 1; i++) {
            if (sigmoidLast == false && i == nodes.length - 2) runSigmoid = false;
            this.layers.push(new Layer(nodes[i], nodes[i + 1], runSigmoid));
        }
    }

    forward(inputs) {
        for (let i = 0; i < this.layers.length; i++) {
            inputs = this.layers[i].forward(inputs);
        }
        return inputs;
    }

    loss(inputs, trueOutputs) {
        let totalLoss = 0;
        for (let i = 0; i < trueOutputs.length; i++) {
            const output = this.forward(inputs[i]);
            for (let j = 0; j < trueOutputs[0].length; j++) {
                const error = trueOutputs[i][j] - output[j];
                totalLoss += error * error;
            }
        }
        return totalLoss / trueOutputs.length;
    }

    sgd(inputs, outputs) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].sgd(inputs, outputs, this.learningRate, this);
        }
    }
}