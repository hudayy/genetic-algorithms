export class Value {
    public data: number;
    public grad: number;

    private _backward: () => void;
    private _children: Value[];

    constructor(data: number, children: Value[] = []) {
        this.data = data;
        this.grad = 0;
        this._backward = () => null;
        this._children = children;
    }

    relu(): Value {
        const out = new Value(this.data > 0 ? this.data : 0, [this]);

        out._backward = () => {
            this.grad += (this.data > 0 ? 1 : 0) * out.grad;
        };

        return out;
    }

    leakyRelu(): Value {
        const out = new Value(this.data > 0 ? this.data : this.data * 0.01, [this]);

        out._backward = () => {
            this.grad += (this.data > 0 ? 1 : 0.01) * out.grad;
        };

        return out;
    }

    sigmoid(): Value {
        const out = new Value(1 / (1 + Math.exp(this.data)), [this]);

        out._backward = () => {
            this.grad += 1 / (1 + Math.exp(-this.data)) * (1 - 1 / (1 + Math.exp(-this.data))) * out.grad;
        };

        return out;
    }

    add(other: Value | number): Value {
        other = other instanceof Value ? other : new Value(other);

        const out = new Value(this.data + other.data, [this, other]);

        out._backward = () => {
            this.grad += out.grad;
            other.grad += out.grad;
        };

        return out;
    }

    sub(other: Value | number): Value {
        return this.add(other instanceof Value ? other.mul(-1) : -1 * other);
    }

    mul(other: Value | number): Value {
        other = other instanceof Value ? other : new Value(other);

        const out = new Value(this.data * other.data, [this, other]);

        out._backward = () => {
            this.grad += other.data * out.grad;
            other.grad += this.data * out.grad;
        };

        return out;
    }

    div(other: Value | number): Value {
        return this.mul(other instanceof Value ? other.pow(-1) : 1 / other);
    }

    pow(other: number): Value {
        const out = new Value(this.data ** other, [this]);

        out._backward = () => {
            this.grad += other * this.data ** (other - 1) * out.grad;
        };

        return out;
    }

    backward(): void {
        const topo: Value[] = [];
        const visited = new Set<Value>();

        const buildTopo = (v: Value) => {
            if (!visited.has(v)) {
                visited.add(v);
                v._children.forEach(child => buildTopo(child));
                topo.push(v);
            }
        };

        buildTopo(this);

        this.grad = 1;
        for (let i = topo.length - 1; i >= 0; i--) {
            topo[i]._backward();
        }
    }

    toString(): string {
        return this.data.toString();
    }
}