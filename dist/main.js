"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianProduct = exports.PowerSet = exports.BaseN = exports.Combination = exports.Permutation = exports.randomInteger = exports.combinadic = exports.factoradic = exports.factorial = exports.combination = exports.permutation = exports.version = void 0;
exports.version = "1.4.5";
const _BI = typeof BigInt == "function" ? BigInt : Number;
const _crop = (n) => (n <= Number.MAX_SAFE_INTEGER ? Number(n) : _BI(n));
function permutation(n, k) {
    if (n < 0)
        throw new RangeError(`negative n is not acceptable`);
    if (k < 0)
        throw new RangeError(`negative k is not acceptable`);
    if (0 == k)
        return 1;
    if (n < k)
        return 0;
    [n, k] = [_BI(n), _BI(k)];
    let p = _BI(1);
    while (k--)
        p *= n--;
    return _crop(p);
}
exports.permutation = permutation;
function combination(n, k) {
    if (0 == k)
        return 1;
    if (n == k)
        return 1;
    if (n < k)
        return 0;
    const P = permutation;
    const c = _BI(P(n, k)) / _BI(P(k, k));
    return _crop(c);
}
exports.combination = combination;
function factorial(n) {
    return permutation(n, n);
}
exports.factorial = factorial;
function factoradic(n, l = 0) {
    if (n < 0)
        return undefined;
    let [bn, bf] = [_BI(n), _BI(1)];
    if (!l) {
        for (l = 1; bf < bn; bf *= _BI(++l))
            ;
        if (bn < bf)
            bf /= _BI(l--);
    }
    else {
        bf = _BI(factorial(l));
    }
    let digits = [0];
    for (; l; bf /= _BI(l--)) {
        digits[l] = Math.floor(Number(bn / bf));
        bn %= bf;
    }
    return digits;
}
exports.factoradic = factoradic;
function combinadic(n, k) {
    const count = combination(n, k);
    return (m) => {
        if (m < 0 || count <= m)
            return undefined;
        let digits = [];
        let [a, b] = [n, k];
        let x = _BI(count) - _BI(1) - _BI(m);
        for (let i = 0; i < k; i++) {
            a--;
            while (x < combination(a, b))
                a--;
            digits.push(n - 1 - a);
            x -= _BI(combination(a, b));
            b--;
        }
        return digits;
    };
}
exports.combinadic = combinadic;
const _crypto = typeof crypto !== "undefined" ? crypto : {};
const _randomBytes = typeof _crypto["randomBytes"] === "function"
    ? (len) => Uint8Array.from(_crypto["randomBytes"](len))
    : typeof _crypto["getRandomValues"] === "function"
        ? (len) => _crypto["getRandomValues"](new Uint8Array(len))
        : (len) => Uint8Array.from(Array(len), () => Math.random() * 256);
function randomInteger(min = 0, max = Math.pow(2, 53)) {
    let ctor = min.constructor;
    if (arguments.length === 0) {
        return Math.floor(Math.random() * ctor(max));
    }
    if (arguments.length == 1) {
        ;
        [min, max] = [ctor(0), min];
    }
    if (typeof min == "number") {
        ;
        [min, max] = [Math.ceil(Number(min)), Math.ceil(Number(max))];
        return Math.floor(Math.random() * (max - min)) + min;
    }
    const mag = ctor(max) - ctor(min);
    const len = mag.toString(16).length;
    const u8s = _randomBytes(len);
    const rnd = u8s.reduce((a, v) => (a << ctor(8)) + ctor(v), ctor(0));
    return ((ctor(rnd) * mag) >> ctor(len * 8)) + ctor(min);
}
exports.randomInteger = randomInteger;
class _CBase {
    static of(...args) {
        return new (Function.prototype.bind.apply(this, [null].concat(args)))();
    }
    static from(arg) {
        return new (Function.prototype.bind.apply(this, [null].concat(arg)))();
    }
    [Symbol.iterator]() {
        return (function* (it, len) {
            for (let i = 0; i < len; i++)
                yield it.nth(i);
        })(this, this.length);
    }
    toArray() {
        return [...this];
    }
    get isBig() {
        return Number.MAX_SAFE_INTEGER < this.length;
    }
    get isSafe() {
        return typeof BigInt !== "undefined" || !this.isBig;
    }
    _check(n) {
        if (n < 0) {
            if (this.length < -n)
                return undefined;
            return _crop(_BI(this.length) + _BI(n));
        }
        if (this.length <= n)
            return undefined;
        return n;
    }
    nth(n) {
        return [];
    }
    sample() {
        return this.nth(randomInteger(this.length));
    }
    samples() {
        return (function* (it) {
            while (true)
                yield it.sample();
        })(this);
    }
}
class Permutation extends _CBase {
    constructor(seed, size = 0) {
        super();
        this.seed = [...seed];
        this.size = 0 < size ? size : this.seed.length;
        this.length = permutation(this.seed.length, this.size);
        Object.freeze(this);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        const offset = this.seed.length - this.size;
        const skip = factorial(offset);
        let digits = factoradic(_BI(n) * _BI(skip), this.seed.length);
        let source = this.seed.slice();
        let result = [];
        for (let i = this.seed.length - 1; offset <= i; i--) {
            result.push(source.splice(digits[i], 1)[0]);
        }
        return result;
    }
}
exports.Permutation = Permutation;
class Combination extends _CBase {
    constructor(seed, size = 0) {
        super();
        this.seed = [...seed];
        this.size = 0 < size ? size : this.seed.length;
        this.size = size;
        this.length = combination(this.seed.length, this.size);
        this.comb = combinadic(this.seed.length, this.size);
        Object.freeze(this);
    }
    bitwiseIterator() {
        const ctor = this.length.constructor;
        const [zero, one, two] = [ctor(0), ctor(1), ctor(2)];
        const inc = (x) => {
            const u = x & -x;
            const v = u + x;
            return v + (((v ^ x) / u) >> two);
        };
        let x = (one << ctor(this.size)) - one;
        return (function* (it, len) {
            for (let i = 0; i < len; i++, x = inc(x)) {
                var result = [];
                for (let y = x, j = 0; zero < y; y >>= one, j++) {
                    if (y & one)
                        result.push(it.seed[j]);
                }
                yield result;
            }
        })(this, this.length);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        return this.comb(n).reduce((a, v) => a.concat(this.seed[v]), []);
    }
}
exports.Combination = Combination;
class BaseN extends _CBase {
    constructor(seed, size = 1) {
        super();
        this.seed = [...seed];
        this.size = size;
        let base = this.seed.length;
        this.base = base;
        let length = size < 1
            ? 0
            : Array(size)
                .fill(_BI(base))
                .reduce((a, v) => a * v);
        this.length = _crop(length);
        Object.freeze(this);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        let bn = _BI(n);
        const bb = _BI(this.base);
        let result = [];
        for (let i = 0; i < this.size; i++) {
            var bd = bn % bb;
            result.push(this.seed[Number(bd)]);
            bn -= bd;
            bn /= bb;
        }
        return result;
    }
}
exports.BaseN = BaseN;
class PowerSet extends _CBase {
    constructor(seed) {
        super();
        this.seed = [...seed];
        const length = _BI(1) << _BI(this.seed.length);
        this.length = _crop(length);
        Object.freeze(this);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        let bn = _BI(n);
        let result = [];
        for (let bi = _BI(0); bn; bn >>= _BI(1), bi++)
            if (bn & _BI(1))
                result.push(this.seed[Number(bi)]);
        return result;
    }
}
exports.PowerSet = PowerSet;
class CartesianProduct extends _CBase {
    constructor(...args) {
        super();
        this.seed = args.map((v) => [...v]);
        this.size = this.seed.length;
        const length = this.seed.reduce((a, v) => a * _BI(v.length), _BI(1));
        this.length = _crop(length);
        Object.freeze(this);
    }
    nth(n) {
        n = this._check(n);
        if (n === undefined)
            return undefined;
        let bn = _BI(n);
        let result = [];
        for (let i = 0; i < this.size; i++) {
            const base = this.seed[i].length;
            const bb = _BI(base);
            const bd = bn % bb;
            result.push(this.seed[i][Number(bd)]);
            bn -= bd;
            bn /= bb;
        }
        return result;
    }
}
exports.CartesianProduct = CartesianProduct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWFhLFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQWM5QixNQUFNLEdBQUcsR0FBa0IsT0FBTyxNQUFNLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtBQUl4RSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBTXhGLFNBQWdCLFdBQVcsQ0FBQyxDQUFTLEVBQUUsQ0FBUztJQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsTUFBTSxJQUFJLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0lBQy9ELElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxNQUFNLElBQUksVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FDbEI7SUFBQSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDZCxPQUFPLENBQUMsRUFBRTtRQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQTtJQUNwQixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNuQixDQUFDO0FBVEQsa0NBU0M7QUFNRCxTQUFn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