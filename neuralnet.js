let nets = [];
const numNets = 100;
const gens = 10000;
const mutationChance = 0.1;
const hiddenLayers = [8, 8]

const trainingInputs = [
    [0], [0.1], [0.2],
    [0.30000000000000004], [0.4], [0.5],
    [0.6], [0.7], [0.7999999999999999],
    [0.8999999999999999], [0.9999999999999999], [1.0999999999999999],
    [1.2], [1.3], [1.4000000000000001],
    [1.5000000000000002], [1.6000000000000003], [1.7000000000000004],
    [1.8000000000000005], [1.9000000000000006], [2.0000000000000004],
    [2.1000000000000005], [2.2000000000000006], [2.3000000000000007],
    [2.400000000000001], [2.500000000000001], [2.600000000000001],
    [2.700000000000001], [2.800000000000001], [2.9000000000000012],
    [3.0000000000000013], [3.1000000000000014], [3.2000000000000015],
    [3.3000000000000016], [3.4000000000000017], [3.5000000000000018],
    [3.600000000000002], [3.700000000000002], [3.800000000000002],
    [3.900000000000002], [4.000000000000002], [4.100000000000001],
    [4.200000000000001], [4.300000000000001], [4.4],
    [4.5], [4.6], [4.699999999999999],
    [4.799999999999999], [4.899999999999999], [4.999999999999998],
    [5.099999999999998], [5.1999999999999975], [5.299999999999997],
    [5.399999999999997], [5.4999999999999964], [5.599999999999996],
    [5.699999999999996], [5.799999999999995], [5.899999999999995],
    [5.999999999999995], [6.099999999999994], [6.199999999999994]
]
const trainingOutputs = [
    [0], [0.09983341664682815], [0.19866933079506122],
    [0.2955202066613396], [0.3894183423086505], [0.479425538604203],
    [0.5646424733950354], [0.644217687237691], [0.7173560908995227],
    [0.7833269096274833], [0.8414709848078964], [0.8912073600614353],
    [0.9320390859672263], [0.963558185417193], [0.9854497299884603],
    [0.9974949866040544], [0.9995736030415051], [0.9916648104524686],
    [0.973847630878195], [0.9463000876874144], [0.9092974268256815],
    [0.8632093666488735], [0.8084964038195899], [0.7457052121767197],
    [0.6754631805511504], [0.5984721441039558], [0.5155013718214634],
    [0.42737988023382895], [0.33498815015590383], [0.23924932921398112],
    [0.1411200080598659], [0.04158066243328916], [-0.05837414342758142],
    [-0.15774569414324996], [-0.25554110202683294], [-0.3507832276896215],
    [-0.44252044329485407], [-0.5298361409084948], [-0.6118578909427207],
    [-0.6877661591839753], [-0.7568024953079294], [-0.8182771110644114],
    [-0.8715757724135886], [-0.9161659367494552], [-0.9516020738895161],
    [-0.977530117665097], [-0.9936910036334644], [-0.9999232575641008],
    [-0.9961646088358408], [-0.9824526126243328], [-0.958924274663139],
    [-0.9258146823277331], [-0.8834546557201545], [-0.8322674422239027],
    [-0.7727644875559894], [-0.7055403255703945], [-0.6312666378723244],
    [-0.5506855425976414], [-0.4646021794137613], [-0.37387666483024096],
    [-0.27941549819893097], [-0.18216250427210112], [-0.0830894028175026]
];

const data = [trainingInputs, trainingOutputs]
const nodeLengths = [trainingInputs[0].length, ...hiddenLayers, trainingOutputs[0].length]

class NeuralNet {
    constructor(nodes) {
        this.layers = []
        for (let i = 0; i < nodes.length - 1; i++) {
            this.layers.push(new Layer(nodes[i], nodes[i + 1], i != nodes.length - 2));
        }
        this._loss = null;
        this.mutate();
    }

    forward(inputs) {
        for (let i = 0; i < this.layers.length; i++) {
            inputs = this.layers[i].forward(inputs);
        }
        return inputs;
    }

    mutate(chance) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].mutate(chance);
        }
    }

    loss(inputs, outputs) {
        if (this._loss != null) return this._loss;
        let loss = 0
        for (let i = 0; i < inputs.length; i++) {
            let error = outputs[i][0] - this.forward(inputs[i])[0];
            loss += error * error
        }
        this._loss = loss;
        return loss;
    }

    clone(mutationChance) {
        let clone = new NeuralNet(this.layers.length);
        clone.layers = this.layers.map(layer => layer.clone());
        clone.mutate(mutationChance)
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

    mutate(chance) {
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                if (Math.random() < chance) {
                    this.weights[i][j] += (Math.round(Math.random()) - 0.5) * 0.1;
                }
            }
        }
        for (let i = 0; i < this.biases.length; i++) {
            if (Math.random() < chance) this.biases[i] += (Math.round(Math.random()) - 0.5) * 0.1;
        }
    }

    clone() {
        let clonedLayer = new Layer(this.numInputs, this.numOutputs, this.sigma);
        clonedLayer.weights = this.weights.map(row => [...row]); // Deep copy weights
        clonedLayer.biases = [...this.biases]; // Deep copy biases
        return clonedLayer;
    }
}

for (let i = 0; i < numNets; i++) {
    nets.push(new NeuralNet(nodeLengths));
}

for (let i = 0; i < gens; i++) {
    nets.sort((a, b) => a.loss(...data) - b.loss(...data));

    let numChildren = numNets / 2;
    nets = nets.splice(0, numChildren);
    for (let i = 0; i < numChildren; i++) {
        nets.push(nets[i].clone(mutationChance))
    }
}

nets.sort((a, b) => a.loss(...data) - b.loss(...data));

let finalOutputs = []

for (let i = 0; i < trainingInputs.length; i++) {
    finalOutputs.push(nets[0].forward(trainingInputs[i]));
}

console.log(nets[0].loss(...data));