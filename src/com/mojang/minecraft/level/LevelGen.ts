import { Random } from "../../../util/Random";
import { NoiseMap } from "./NoiseMap";
import { Tile } from "./tile/Tile";
import { Tiles } from "./tile/Tiles";

export class LevelGen {
    private width: number
    private height: number
    private depth: number
    private random: Random = new Random()

    public constructor(width: number, height: number, depth: number) {
        this.width = width
        this.height = height
        this.depth = depth
    }

    public generateMap(): number[] {
        let w = this.width
        let h = this.height
        let d = this.depth
        let heightmap1 = new NoiseMap(0).read(w, h)
        let heightmap2 = new NoiseMap(0).read(w, h)
        let cf = new NoiseMap(1).read(w, h)
        let rockMap = new NoiseMap(1).read(w, h)
        let blocks = new Array(w * h * d)
        let x = 0
        while (x < w) {
            let y = 0
            while (y < d) {
                let z = 0
                while (z < h) {
                    let dh: number = 0
                    let dh1 = heightmap1[x + z * this.width]
                    let dh2 = heightmap2[x + z * this.width]
                    let cfh = cf[x + z * this.width]
                    if (cfh < 128) {
                        dh2 = dh1
                    }
                    if (dh2 > (dh = dh1)) {
                        dh = dh2
                    } else {
                        dh2 = dh1
                    }
                    dh = Math.floor(dh / 8) + Math.floor(d / 3)
                    let rh = Math.floor(rockMap[x + z * this.width] / 8) + Math.floor(d / 3)
                    if (rh > dh - 2) {
                        rh = dh - 2
                    }
                    let i = (y * this.height + z) * this.width + x
                    let id = 0
                    if (y == dh) {
                        id = Tiles.grass.id
                    }
                    if (y < dh) {
                        id = Tiles.dirt.id
                    }
                    if (y <= rh) {
                        id = Tiles.rock.id
                    }
                    blocks[i] = id
                    z++
                }
                y++
            }
            x++
        }
        // TODO
        return blocks
    }
}