import { Random } from "../../../../../util/Random";
import { SurfaceNoise } from "./SurfaceNoise";

export class ImprovedNoise extends SurfaceNoise {
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
        let u = ImprovedNoise.fade(X)
        let v = ImprovedNoise.fade(Y)
        let w = ImprovedNoise.fade(Z)
        let A = this.p[floorX] + floorY
        let AA = this.p[A] + floorZ
        let AB = this.p[A + 1] + floorZ
        let B = this.p[floorX + 1] + floorY
        let BA = this.p[B] + floorZ
        let BB = this.p[B + 1] + floorZ
        return ImprovedNoise.lerp(
            w,
            ImprovedNoise.lerp(
                v,
                ImprovedNoise.lerp(
                    u,
                    ImprovedNoise.grad(this.p[AA], X, Y, Z),
                    ImprovedNoise.grad(this.p[BA], X - 1, Y, Z)
                ),
                ImprovedNoise.lerp(
                    u,
                    ImprovedNoise.grad(this.p[AB], X, Y - 1, Z),
                    ImprovedNoise.grad(this.p[BB], X - 1, Y - 1, Z)
                )
            ),
            ImprovedNoise.lerp(
                v,
                ImprovedNoise.lerp(
                    u,
                    ImprovedNoise.grad(this.p[AA + 1], X, Y, Z - 1),
                    ImprovedNoise.grad(this.p[BA + 1], X - 1, Y, Z - 1)
                ), ImprovedNoise.lerp(
                    u,
                    ImprovedNoise.grad(this.p[AB + 1], X, Y - 1, Z - 1),
                    ImprovedNoise.grad(this.p[BB + 1], X - 1, Y - 1, Z - 1)
                )
            )
        )
    }
    
}