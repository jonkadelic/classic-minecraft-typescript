import { Random } from "../../../../../util/Random";
import { Synth } from "./Synth";

export class BasicNoise extends Synth {
    private p: number[] = new Array(512)

    public constructor(random: Random = new Random()) {
        super()
        for (let i = 0; i < 256; i++) {
            this.p[i] = i
        }
        for (let i = 0; i < 256; i++) {
            let newI = random.nextInt(256 - i) + i
            let temp = this.p[i]
            this.p[i] = this.p[newI]
            this.p[newI] = temp
            this.p[i + 256] = this.p[i]
        }
    }

    private static fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    private static lerp(t: number, a: number, b: number): number {
        return a + t * (b - a)
    }

    private static grad(hash: number, x: number, y: number, z: number): number {
        let h = hash & 15
        let u = h < 8 ? x : y
        let v = h < 4 ? y : h == 12 || h == 14 ? x : z
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v)
    }

    public override getValue(x: number, y: number): number {
        let Z = 0.0
        let Y = y
        let X = x
        let floorX = Math.floor(X) & 0xFF
        let floorY = Math.floor(Y) & 0xFF
        let floorZ = Math.floor(Z) & 0xFF
        X -= Math.floor(X)
        Y -= Math.floor(Y)
        Z -= Math.floor(Z)
        let u = BasicNoise.fade(X)
        let v = BasicNoise.fade(Y)
        let w = BasicNoise.fade(Z)
        let A = this.p[floorX] + floorY
        let AA = this.p[A] + floorZ
        let AB = this.p[A + 1] + floorZ
        let B = this.p[floorX + 1] + floorY
        let BA = this.p[B] + floorZ
        let BB = this.p[B + 1] + floorZ
        return BasicNoise.lerp(
            w,
            BasicNoise.lerp(
                v,
                BasicNoise.lerp(
                    u,
                    BasicNoise.grad(this.p[AA], X, Y, Z),
                    BasicNoise.grad(this.p[BA], X - 1, Y, Z)
                ),
                BasicNoise.lerp(
                    u,
                    BasicNoise.grad(this.p[AB], X, Y - 1, Z),
                    BasicNoise.grad(this.p[BB], X - 1, Y - 1, Z)
                )
            ),
            BasicNoise.lerp(
                v,
                BasicNoise.lerp(
                    u,
                    BasicNoise.grad(this.p[AA + 1], X, Y, Z - 1),
                    BasicNoise.grad(this.p[BA + 1], X - 1, Y, Z - 1)
                ), BasicNoise.lerp(
                    u,
                    BasicNoise.grad(this.p[AB + 1], X, Y - 1, Z - 1),
                    BasicNoise.grad(this.p[BB + 1], X - 1, Y - 1, Z - 1)
                )
            )
        )
    }
    
}