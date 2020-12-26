export declare const version = "1.4.5";
declare type anyint = number | bigint;
declare type Optional<T> = T | undefined;
export declare function permutation(n: anyint, k: anyint): number | bigint;
export declare function combination(n: anyint, k: anyint): number | bigint;
export declare function factorial(n: anyint): number | bigint;
export declare function factoradic(n: anyint, l?: number): number[];
export declare function combinadic(n: number, k: number): (m: anyint) => number[];
export declare function randomInteger(min?: anyint, max?: anyint): any;
declare class _CBase<T, U> {
    static of(...args: any[]): any;
    static from(arg: any): any;
    [Symbol.iterator](): Generator<U[], void, unknown>;
    toArray(): U[][];
    get isBig(): boolean;
    get isSafe(): boolean;
    _check(n: anyint): Optional<anyint>;
    nth(n: anyint): Optional<U[]>;
    seed: T[];
    size: number;
    length: anyint;
    sample(): Optional<U[]>;
    samples(): Generator<U[], never, unknown>;
}
export declare class Permutation<T> extends _CBase<T, T> {
    constructor(seed: Iterable<T>, size?: number);
    nth(n: anyint): Optional<T[]>;
}
export declare class Combination<T> extends _CBase<T, T> {
    comb: (anyint: any) => number[];
    constructor(seed: Iterable<T>, size?: number);
    bitwiseIterator(): Generator<any[], void, unknown>;
    nth(n: anyint): Optional<T[]>;
}
export declare class BaseN<T> extends _CBase<T, T> {
    base: number;
    constructor(seed: Iterable<T>, size?: number);
    nth(n: anyint): Optional<T[]>;
}
export declare class PowerSet<T> extends _CBase<T, T> {
    constructor(seed: Iterable<T>);
    nth(n: anyint): Optional<T[]>;
}
export declare class CartesianProduct<T> extends _CBase<T[], T> {
    constructor(...args: Iterable<T>[]);
    nth(n: anyint): Optional<T[]>;
}
export {};
