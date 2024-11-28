class Layer {
    constructor(inputs, outputs, runSigmoid) {
        const stddev = Math.sqrt(2.0 / (inputs + outputs));
        
        this.weights = Array.from({ length: outputs }, () => 
            Array.from({ length: inputs }, () => generateGaussian() * stddev)
        );
        
        this.biases = Array.from({ length: outputs }, () => generateGaussian() * stddev);
        
        this.numInputs = inputs;
        this.numOutputs = outputs;
        
        this.runSigmoid = runSigmoid;
        
        this.weightGrads = Array.from({ length: outputs }, () => Array(inputs).fill(0));
        this.biasGrads = Array.from({ length: outputs }, () => 0);
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
            if (this.runSigmoid) output = sigmoid(output);
            outputs.push(output);
        }
        return outputs;
    }

    sgd(inputs, outputs, _learningRate, agent) {
        const epsilon = 1e-4;
    
        this.forEachWeight((i, j) => {
            const originalWeight = this.weights[i][j];

            let lossA = agent.loss(inputs, outputs);

            this.weights[i][j] += epsilon;
            
            let lossB = agent.loss(inputs, outputs);
            
            this.weightGrads[i][j] = (lossB - lossA) / epsilon;
            
            this.weights[i][j] = originalWeight;
        });
    
        this.forEachBias((i) => {
            const originalBias = this.biases[i];
            
            let lossA = agent.loss(inputs, outputs);
            
            this.biases[i] += epsilon;
            
            let lossB = agent.loss(inputs, outputs);
            
            this.biasGrads[i] = (lossB - lossA) / epsilon;
            
            this.biases[i] = originalBias;
        });
    
        this.forEachWeight((i, j) => {
            this.weights[i][j] -= _learningRate * this.weightGrads[i][j];
        });
    
        this.forEachBias((i) => {
            this.biases[i] -= _learningRate * this.biasGrads[i];
        });
    }
}