import { Random } from "../../../util/Random";

export class NoiseMap {
    private random: Random = new Random()
    private seed: number = this.random.nextInt()
    private levels: number = 0
    private fuzz: number = 16

    public constructor(levels: number) {
        this.levels = levels
    }

    public read(width: number, height: number): number[] {
        let x: number
        let random = new Random()
        let tmp = new Array(width * height)
        let level = this.levels
        let step = width >> level
        let y = 0
        while (y < height) {
            x = 0
            while (x < width) {
                tmp[x + y * width] = (random.nextInt(256) - 128) * this.fuzz
                x += step
            }
            y += step
        }
        step = width >> level
        while (step > 1) {
            let x2: number
            let val = 256 * (step << level)
            let ss = step / 2
            let y2 = 0
            while (y2 < height) {
                x2 = 0
                while (x2 < width) {
                    let m: number
                    let ul = tmp[(x2 + 0) % width + (y2 + 0) % height * width]
                    let ur = tmp[(x2 + step) % width + (y2 + 0) % height * width]
                    let dl = tmp[(x2 + 0) % width + (y2 + step) % height * width]
                    let dr = tmp[(x2 + step) % width + (y2 + step) % height * width]
                    tmp[x2 + ss + (y2 + ss) * width] = m = (ul + ur + dl + dr) / 4 + random.nextInt(val * 2) - val
                    x2 += step
                }
                y2 += step
            }
            y2 = 0
            while (y2 < height) {
                x2 = 0
                while (x2 < width) {
                    let c = tmp[x2 + y2 * width]
                    let r = tmp[(x2 + step) % width + y2 * width]
                    let d = tmp[x2 + (y2 + step) % width * width]
                    let mu = tmp[(x2 + ss & width - 1) + (y2 + ss - step & height - 1) * width]
                    let ml = tmp[(x2 + ss - step & width - 1) + (y2 + ss & height - 1) * width]
                    let m = tmp[(x2 + ss) % width + (y2 + ss) % height * width]
                    let u = (c + r + m + mu) / 4 + random.nextInt(val * 2) - val
                    let l = (c + d + m + ml) / 4 + random.nextInt(val * 2) - val
                    tmp[x2 + ss + y2 * width] = u
                    tmp[x2 + (y2 + ss) * width] = l
                    x2 += step
                }
                y2 += step
            }
            step /= 2
        }
        let result = new Array(width * height)
        y = 0
        while (y < height) {
            x = 0
            while (x < width) {
                result[x + y * width] = tmp[x % width + y % height * width] / 512 + 128
                x++
            }
            y++
        }
        return result
    }
}