import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { CompositeNoise } from "./synth/CompositeNoise";
import { PerlinNoise } from "./synth/PerlinNoise";

export class RandomLevelSource {
    private width: number = 0
    private depth: number = 0
    private height: number = 0
    private random: Random = new Random()
    private blocks: number[] = []
    private waterLevel: number = 0

    public constructor() {
    }

    public create(creator: string, width: number, depth: number, height: number): Level {
        this.width = width
        this.depth = depth
        this.height = height
        this.waterLevel = height / 2
        this.blocks = new Array(width * depth * height)

        // Raising...
        let heightmap1 = new CompositeNoise(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let heightmap2 = new CompositeNoise(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let cf = new PerlinNoise(this.random, 6)
        let map = new Array(width * depth)
        let f = 1.3
        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.depth; z++) {
                let h1 = heightmap1.getValue(x / f, z / f) / 6 - 4
                let h2 = heightmap2.getValue(x / f, z / f) / 5 + 10 -4
            }
        }

        return new Level(this.width, this.height, this.depth)
    }
}