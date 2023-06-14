export class Random {
    private static readonly p2_16	= 0x0000000010000;
    private static readonly p2_24	= 0x0000001000000;
    private static readonly p2_27	= 0x0000008000000;
    private static readonly p2_31	= 0x0000080000000;
    private static readonly p2_32	= 0x0000100000000;
    private static readonly p2_48	= 0x1000000000000;
    private static readonly p2_53	= Math.pow(2, 53);	// NB: exceeds Number.MAX_SAFE_INTEGER
 
    private static readonly m2_16	= 0xffff;

    //
    // multiplicative term for the PRNG
    //
    private static readonly c2 = 0x0005;
    private static readonly c1 = 0xdeec;
    private static readonly c0 = 0xe66d;

    private s2: number;
    private s1: number;
    private s0: number;
    private nextNextGaussian: number;
    private haveNextNextGaussian: boolean;

    public constructor();
    public constructor(seedVal?: number) {
        if (seedVal === undefined) {
            seedVal = Math.trunc(Math.random() * Random.p2_48)
        }
        this.setSeed(seedVal)
    }

    //
    // 53-bit safe version of
    // seed = (seed * 0x5DEECE66DL + 0xBL) & ((1L << 48) - 1)
    //
    private _next(): number {

        let carry = 0xb

        let r0 = (this.s0 * Random.c0) + carry
        carry = r0 >>> 16
        r0 &= Random.m2_16

        let r1 = (this.s1 * Random.c0 + this.s0 * Random.c1) + carry
        carry = r1 >>> 16
        r1 &= Random.m2_16

        let r2 = (this.s2 * Random.c0 + this.s1 * Random.c1 + this.s0 * Random.c2) + carry
        r2 &= Random.m2_16;

        [this.s2, this.s1, this.s0] = [r2, r1, r0]

        return this.s2 * Random.p2_16 + this.s1
    }

    private next_signed(bits: number): number {
        return this._next() >> (32 - bits)
    }

    private next(bits: number): number {
        return this._next() >>> (32 - bits)
    }

    private checkIsPositiveInt(n: number) {
        if (n < 0 || n > 0x7FFFFFFF) {
            throw RangeError()
        }
    }

    public setSeed(n: number): void {
        this.s0 =                ((n) & Random.m2_16) ^ Random.c0
        this.s1 = ((n / Random.p2_16) & Random.m2_16) ^ Random.c1
        this.s2 = ((n / Random.p2_32) & Random.m2_16) ^ Random.c2
    }

    public nextInt(bound?: number) {
        if (bound === undefined) {
            return this.next_signed(32)
        }

        this.checkIsPositiveInt(bound)

        // special case if bound is a power of two
        if ((bound & -bound) === bound) {
            let r = this.next(31) / Random.p2_31
            return ~~(bound * r)
        }

        let bits: number
        let val: number
        do {
            bits = this.next(31)
            val = bits % bound
        } while (bits - val + (bound - 1) < 0)

        return val
    }

    public nextLong(): BigInt {
        let msb = BigInt(this.next_signed(32))
        let lsb = BigInt(this.next_signed(32))
        let p2_32n = BigInt(Random.p2_32)
        return msb * p2_32n + lsb
    }

    public nextBoolean(): boolean {
        return this.next(1) != 0
    }

    public nextFloat(): number {
        return this.next(24) / Random.p2_24
    }

    public nextDouble(): number {
        return (Random.p2_27 * this.next(26) + this.next(27)) / Random.p2_53;
    }
}