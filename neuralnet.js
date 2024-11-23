function generateGaussian() {
    return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
}

class NeuralNet {
    constructor(nodes) {
        this.layers = []
        for (let i = 0; i < nodes.length - 1; i++) {
            this.layers.push(new Layer(nodes[i], nodes[i + 1], i != nodes.length - 2));
        }
        this._loss = null;
        this.mutate(learningRate);
    }

    forward(inputs) {
        for (let i = 0; i < this.layers.length; i++) {
            inputs = this.layers[i].forward(inputs);
        }
        return inputs;
    }

    mutate() {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].mutate();
        }
    }

    loss(inputs, outputs) {
        if (this._loss != null) return this._loss;
        let loss = 0
        for (let i = 0; i < inputs.length; i++) {
            let error = 0;
            for (let j = 0; j < outputs[i].length; j++) {
                error += outputs[i][j] - this.forward(inputs[i])[j];
            }
            loss += error * error
        }
        this._loss = loss;
        return loss;
    }

    clone() {
        let clone = new NeuralNet(nodeLengths);
        clone.layers = this.layers.map(layer => layer.clone());
        clone.mutate();
        return clone;
    }
}

function sigma(x) {
    return 1 / (1 + Math.exp(-x));
}

class Layer {
    constructor(inputs, outputs, sigma) {
        this.weights = Array.from({ length: outputs }, () => Array(inputs).fill(0));
        this.biases = Array.from({ length: outputs }, () => 0);
        this.numInputs = inputs;
        this.numOutputs = outputs;
        this.sigma = sigma;
    }

    forward(inputs) {
        let outputs = []
        for (let i = 0; i < this.numOutputs; i++) {
            let output = 0;
            for (let j = 0; j < this.numInputs; j++) {
                output += inputs[j] * this.weights[i][j];
                output += this.biases[i];
            }
            if (this.sigma) output = sigma(output);
            outputs.push(output);
        }
        return outputs;
    }

    mutate() {
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                this.weights[i][j] += generateGaussian() * learningRate;
            }
        }
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] += generateGaussian() * learningRate;
        }
    }

    clone() {
        let clonedLayer = new Layer(this.numInputs, this.numOutputs, this.sigma);
        clonedLayer.weights = this.weights.map(row => [...row]);
        clonedLayer.biases = [...this.biases];
        return clonedLayer;
    }
}

// let nets = [];

// for (let i = 0; i < numNets; i++) {
//     nets.push(new NeuralNet(nodeLengths));
// }

// for (let i = 0; i < gens; i++) {
//     nets.sort((a, b) => a.loss(...data) - b.loss(...data));

//     let numChildren = numNets / 2;
//     nets = nets.splice(0, numChildren);
//     for (let i = 0; i < numChildren; i++) {
//         nets.push(nets[i].clone(mutationChance))
//     }
// }

// nets.sort((a, b) => a.loss(...data) - b.loss(...data));

// let finalOutputs = []

// for (let i = 0; i < trainingInputs.length; i++) {
//     console.log(...nets[0].forward(trainingInputs[i]));
// }

// console.log(nets[0].loss(...data));