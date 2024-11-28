import { MLP } from "./nn.ts";
import { Value } from "./value.ts";

const learningRate = 0.01;
const batchSize = 64;

const leakyRelu = (xs: Value[]): Value[] => xs.map(x => x.leakyRelu());
const sigmoid = (xs: Value[]): Value[] => xs.map(x => x.sigmoid().mul(2).sub(1));

const nn = new MLP([1, sigmoid, 8, sigmoid, 8, sigmoid, 8, sigmoid, 8, sigmoid, 1]);

const data: [number[], number[]][] = [];
// for (let i = 0; i < Math.PI * 2; i += 0.01) data.push([[i], [Math.sin(i)]]);
for (let i = 0; i < Math.PI * 2; i += 0.02) data.push([[i], [Math.sin(i)]]);

function loss(trainingData: [number[], number[]][]): Value {
    let totalLoss = new Value(0);
    for (let [input, output] of trainingData) {
        const error = nn.forward(input)[0].sub(output[0]);
        totalLoss = totalLoss.add(error.mul(error));
    }
    return totalLoss.div(trainingData.length);
}

let batchIndex = 0;

// randomize the data
data.sort(() => Math.random() - 0.5);


let epoch = 0;
while (true) {
    if (batchIndex >= data.length) batchIndex = 0;
    let batch = data.slice(batchIndex, Math.min(batchIndex + batchSize, data.length))
    batchIndex += batchSize;
    nn.zero_grad();
    let l = loss(batch);
    if (epoch % 100 == 0) console.log(`Loss: ${l}`);
    if (epoch > 5000) break;
    l.backward();
    for (const param of nn.parameters()) {
        param.data -= learningRate * Math.max(Math.min(param.grad, 1), -1);
    }
    epoch++;
}

data.sort((a,b) => a[0][0] - b[0][0]);

for (let [input, output] of data) {
    console.log(`${nn.forward(input)}`);
}

nn.zero_grad();
let l = loss(data);
l.backward()
console.log(`Final loss: ${l}`);