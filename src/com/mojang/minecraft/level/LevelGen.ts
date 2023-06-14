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
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < d; y++) {
                for (let z = 0; z < h; z++) {
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
                    dh = Math.trunc(dh / 8) + Math.trunc(d / 3)
                    let rh = Math.trunc(rockMap[x + z * this.width] / 8) + Math.trunc(d / 3)
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
                }
            }
        }
        // Caves
        let count = Math.trunc(w * h * d / 256 / 64)
        for (let i = 0; i < count; i++) {
            let x = this.random.nextFloat() * w
            let y = this.random.nextFloat() * d
            let z = this.random.nextFloat() * h
            let length = Math.trunc(this.random.nextFloat() * this.random.nextFloat() * 150)
            let dir1 = this.random.nextFloat() * Math.PI * 2
            let dira1 = 0.0
            let dir2 = this.random.nextFloat() * Math.PI * 2
            let dira2 = 0.0
            for (let l = 0; l < length; l++) {
                x = x + Math.sin(dir1) * Math.cos(dir2)
                z = z + Math.cos(dir1) * Math.cos(dir2)
                y = y + Math.sin(dir2)
                dir1 += dira1 * 0.2
                dira1 *= 0.9
                dira1 += this.random.nextFloat() - this.random.nextFloat()
                dir2 += dira2 * 0.5
                dir2 *= 0.5
                dira2 *= 0.9
                dira2 += this.random.nextFloat() - this.random.nextFloat()
                let size = Math.sin(l * Math.PI / length) * 2.5 + 1.0
                for (let xx = Math.trunc(x - size); xx <= Math.trunc(x + size); xx++) {
                    for (let yy = Math.trunc(y - size); yy <= Math.trunc(y + size); yy++) {
                        for (let zz = Math.trunc(z - size); zz <= Math.trunc(z + size); zz++) {
                            let ii = (yy * this.height + zz) * this.width + xx
                            let xd = xx - x
                            let yd = yy - y
                            let zd = zz - z
                            let dd = xd * xd + yd * yd * 2 + zd * zd
                            if (dd < size * size &&
                                    xx >= 1 && yy >= 1 && zz >= 1 &&
                                    xx < this.width - 1 && yy < this.depth - 1 && zz < this.height - 1 &&
                                    blocks[ii] == Tiles.rock.id) {
                                blocks[ii] = 0
                            }
                        }
                    }
                }
            }
        }
        return blocks
    }
}