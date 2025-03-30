import { Random } from "../../../../../util/Random";
import { BasicNoise } from "./BasicNoise";
import { Synth } from "./Synth";

export class PerlinNoise extends Synth {
    private noiseLevels: Synth[]
    private levels: number

    public constructor(random: Random, levels: number) {
        super()
        this.levels = levels
        this.noiseLevels = new Array(levels)
        for (let i = 0; i < levels; i++) {
            this.noiseLevels[i] = new BasicNoise(random)
        }
    }

    public override getValue(x: number, y: number): number {
        let value = 0.0
        let d = 1.0
        for (let i = 0; i < this.levels; i++) {
            value += this.noiseLevels[i].getValue(x / d, y / d) * d
            d *= 2.0
        }
        return value
    }
}