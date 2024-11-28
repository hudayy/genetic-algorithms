import { Value } from "./value.ts";

function generateGaussian() {
    return Math.sqrt(-2 * Math.log(Math.random() || 1)) * Math.cos(2 * Math.PI * Math.random());
}

abstract class Module {
    zero_grad(): void {
        for (const p of this.parameters()) {
            p.grad = 0;
        }
    }

    abstract parameters(): Value[];
}

type UnaryFunc = (xs: Value[]) => Value[];

class Neuron extends Module {
    public w: Value[];
    public b: Value;

    constructor(nin: number) {
        super();
        this.w = Array.from({ length: nin }, () => new Value(Math.random() * 2 - 1));
        this.b = new Value(0);
    }

    forward(xs: Value[]): Value {
        return xs.map((x, i) => x.mul(this.w[i])).reduce((a, b) => a.add(b)).add(this.b);
    }

    parameters(): Value[] {
        return [...this.w, this.b];
    }
}

class Layer extends Module {
    public neurons: Neuron[];

    constructor(nin: number, nout: number) {
        super();
        this.neurons = Array.from({ length: nout }, () => new Neuron(nin));
        const stddev = Math.sqrt(2/(nin+nout));
        for (const neuron of this.neurons) {
            neuron.w = Array.from({ length: nin }, () => new Value(generateGaussian()/stddev));
        }
    }

    forward(xs: Value[]): Value[] {
        return this.neurons.map(neuron => neuron.forward(xs))
    }

    parameters(): Value[] {
        return this.neurons.map(neuron => neuron.parameters()).flat();
    }
}

export class MLP extends Module {
    public layers: (Layer | UnaryFunc)[] = [];

    constructor(layers: (number | UnaryFunc)[]) {
        super();
        let lastNout;
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (typeof (layer) === "number") {
                if (lastNout !== undefined) {
                    this.layers.push(new Layer(lastNout, layer));
                }
                lastNout = layer;
            } else {
                this.layers.push(layer);
            }
        }
    }

    forward(xs: number[] | Value[]): Value[] {
        if (!(xs[0] instanceof Value)) xs = xs.map(x => new Value(x));
        for (const layer of this.layers) {
            if (layer instanceof Layer) {
                xs = layer.forward(xs as Value[]);
            } else {
                xs = layer(xs as Value[]);
            }
        }
        return xs as Value[];
    }

    parameters(): Value[] {
        return this.layers.filter(layer => layer instanceof Layer).map(layer => layer.parameters()).flat();
    }
}