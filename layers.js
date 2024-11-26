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