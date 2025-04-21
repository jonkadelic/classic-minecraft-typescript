import { Mth } from "../../../../util/Mth";
import { ProgressListener } from "../../../../util/ProgressListener";
import { Random } from "../../../../util/Random";
import { ProgressRenderer } from "../../ProgressRenderer";
import { Level } from "../Level";
import { Tile } from "../tile/Tile";
import { Tiles } from "../tile/Tiles";
import { Distort } from "./synth/Distort";
import { PerlinNoise } from "./synth/PerlinNoise";

export class LevelGen {
    private progressListener: ProgressListener
    private width: number = 0
    private height: number = 0
    private depth: number = 0
    private random: Random = new Random()
    private blocks: number[] = []
    private waterLevel: number = 0
    private coords: number[] = new Array(0x100000)

    public constructor(progressListener: ProgressListener) {
        this.progressListener = progressListener
    }

    public async generateLevel(userName: string, width: number, height: number, depth: number): Promise<Level> {
        this.progressListener.progressStart("Generate level")
        this.width = width
        this.height = height
        this.depth = depth
        this.waterLevel = Math.trunc(depth / 2)
        this.blocks = new Array(width * height << 6)

        this.progressListener.progressStage("Raising..")
        let heightMap: number[] = this.buildHeightmap(width, height)

        this.progressListener.progressStage("Eroding..")
        this.erodeHeightmap(heightMap)

        this.progressListener.progressStage("Soiling..")
        this.buildBlocks(heightMap)

        this.progressListener.progressStage("Carving..")
        this.carveTunnels(4)
        this.carveTunnels_(Tiles.coalOre.id, 90, 1, 4)
        this.carveTunnels_(Tiles.ironOre.id, 70, 2, 4)
        this.carveTunnels_(Tiles.goldOre.id, 50, 3, 4)

        this.progressListener.progressStage("Watering..")
        this.addWater()

        this.progressListener.progressStage("Melting..")
        this.addLava()

        this.progressListener.progressStage("Growing..")
        this.addSurfaceBlocks(heightMap)

        this.progressListener.progressStage("Planting..")
        this.growFlowers(heightMap)
        this.growMushrooms(heightMap)

        let level: Level = new Level()
        level.waterLevel = this.waterLevel
        level.setData(width, depth, height, this.blocks)
        level.createTime = Date.now()
        level.creator = userName
        level.name = "A Nice World"

        this.growTrees(level, heightMap)

        return level
    }

    private buildBlocks(heightMap: number[]): void {
        let w = this.width
        let h = this.height
        let d = this.depth
        let noise: PerlinNoise = new PerlinNoise(this.random, 8)

        for (let x = 0; x < w; x++) {
            this.setProgress(x * Math.trunc(100 / (this.width - 1)))

            for (let z = 0; z < h; z++) {
                let rand = Math.trunc(noise.getValue(x, z) / 24.0) - 4
                let dh = heightMap[x + z * w] + this.waterLevel
                let rh = dh + rand

                heightMap[x + z * w] = Math.max(dh, rh)

                if (heightMap[x + z * w] > d - 2) {
                    heightMap[x + z * w] = d - 2
                }

                if (heightMap[x + z * w] < 1) {
                    heightMap[x + z * w] = 1
                }

                for (let y = 0; y < d; y++) {
                    let i = (y * this.height + z) * this.width + x
                    let id = 0

                    if (y <= dh) {
                        id = Tiles.dirt.id
                    }

                    if (y <= rh) {
                        id = Tiles.rock.id
                    }

                    if (y == 0) {
                        id = Tiles.lava.id
                    }

                    this.blocks[i] = id
                }
            }
        }
    }

    private buildHeightmap(width: number, height: number): number[] {
        let a: Distort = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let b: Distort = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let noise: PerlinNoise = new PerlinNoise(this.random, 6)
        let heightMap: number[] = new Array(this.width * this.height)
        let s: number = 1.3

        for (let x = 0; x < this.width; x++) {
            this.setProgress(x * Math.trunc(100 / (this.width - 1)))

            for (let z = 0; z < this.height; z++) {
                let av = a.getValue(x * s, z * s) / 6.0 - 4
                let bv = b.getValue(x * s, z * s) / 5.0 + 10.0 - 4

                if (noise.getValue(x, z) / 8.0 > 0.0) {
                    bv = av
                }

                let h = Math.max(av, bv) / 2.0

                if (h < 0.0) {
                    h *= 0.8
                }

                heightMap[x + z * this.width] = Math.trunc(h)
            }
        }

        return heightMap
    }

    private erodeHeightmap(heightMap: number[]): void {
        let a: Distort = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let b: Distort = new Distort(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))

        for (let x = 0; x < this.width; x++) {
            this.setProgress(x * Math.trunc(100 / (this.width - 1)))

            for (let z = 0; z < this.height; z++) {
                let av = a.getValue(x << 1, z << 1) / 8.0
                let bv = b.getValue(x << 1, z << 1) > 0.0 ? 1 : 0

                if (av > 2.0) {
                    let h = heightMap[x + z * this.width]
                    h = (Math.trunc((h - bv) / 2) << 1) + bv
                    heightMap[x + z * this.width] = h
                }
            }
        }
    }

    private carveTunnels(total: number): void {
        let w = this.width
        let h = this.height
        let d = this.depth
        let count = Math.trunc(w * h * d / 256 / 64) << 1

        for (let i = 0; i < count; i++) {
            this.setProgress(i * Math.trunc(100 / (count - 1) / total))
            let x = this.random.nextFloat() * w
            let y = this.random.nextFloat() * d
            let z = this.random.nextFloat() * h
            let length = Math.trunc((this.random.nextFloat() + this.random.nextFloat()) * 200.0)
            let dir1 = this.random.nextFloat() * Math.PI * 2.0
            let dira1 = 0.0
            let dir2 = this.random.nextFloat() * Math.PI * 2.0
            let dira2 = 0.0
            let r = this.random.nextFloat() * this.random.nextFloat()

            for (let l = 0; l < length; l++) {
                x += Mth.sin(dir1) * Mth.cos(dir2)
                z += Mth.cos(dir1) * Mth.cos(dir2)
                y += Mth.sin(dir2)
                dir1 += dira1 * 0.2
                dira1 = (dira1 * 0.9) + (this.random.nextFloat() - this.random.nextFloat())
                dir2 = (dir2 + dira2 * 0.5) * 0.5
                dira2 = (dira2 * 0.75) + (this.random.nextFloat() - this.random.nextFloat())
                if (!(this.random.nextFloat() < 0.25)) {
                    let rx = x + (this.random.nextFloat() * 4.0 - 2.0) * 0.2
                    let ry = y + (this.random.nextFloat() * 4.0 - 2.0) * 0.2
                    let rz = z + (this.random.nextFloat() * 4.0 - 2.0) * 0.2
                    let size = (this.depth - ry) / this.depth
                    size = 1.2 + (size * 3.5 + 1.0) * r
                    size = Mth.sin(l * Math.PI / length) * size

                    for (let xx = Math.trunc(rx - size); xx <= Math.trunc(rx + size); xx++) {
                        for (let yy = Math.trunc(ry - size); yy <= Math.trunc(ry + size); yy++) {
                            for (let zz = Math.trunc(rz - size); zz <= Math.trunc(rz + size); zz++) {
                                let xd = xx - rx
                                let yd = yy - ry
                                let zd = zz - rz
                                if (xd * xd + yd * yd * 2.0 + zd * zd < size * size
                                    && xx >= 1 && yy >= 1 && zz >= 1
                                    && xx < this.width - 1 && yy < this.depth - 1 && zz < this.height - 1
                                ) {
                                    let ii = (yy * this.height + zz) * this.width + xx
                                    if (this.blocks[ii] == Tiles.rock.id) {
                                        this.blocks[ii] = 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private carveTunnels_(tt: number, scale: number, i: number, total: number): void {
        let target = tt
        let w = this.width
        let h = this.height
        let d = this.depth
        let count = Math.trunc(w * h * d / 256 / 64 * scale / 100)

        for (let i = 0; i < count; i++) {
            this.setProgress(i * Math.trunc(100 / (count - 1) / total) + i * Math.trunc(100 / total))
            let x = this.random.nextFloat() * w
            let y = this.random.nextFloat() * d
            let z = this.random.nextFloat() * h
            let length = Math.trunc((this.random.nextFloat() + this.random.nextFloat()) * 75.0 * scale / 100.0)
            let dir1 = this.random.nextFloat() * Math.PI * 2.0
            let dira1 = 0.0
            let dir2 = this.random.nextFloat() * Math.PI * 2.0
            let dira2 = 0.0

            for (let l = 0; l < length; l++) {
                x += Mth.sin(dir1) * Mth.cos(dir2)
                z += Mth.cos(dir1) * Mth.cos(dir2)
                y += Mth.sin(dir2)
                dir1 += dira1 * 0.2
                dira1 = (dira1 * 0.9) + (this.random.nextFloat() - this.random.nextFloat())
                dir2 = (dir2 + dira2 * 0.5) * 0.5
                dira2 = (dira2 * 0.9) + (this.random.nextFloat() - this.random.nextFloat())
                let size = Mth.sin(l * Math.PI / length) * scale / 100.0 + 1.0

                for (let xx = Math.trunc(x - size); xx <= Math.trunc(x + size); xx++) {
                    for (let yy = Math.trunc(y - size); yy <= Math.trunc(y + size); yy++) {
                        for (let zz = Math.trunc(z - size); zz <= Math.trunc(z + size); zz++) {
                            let xd = xx - x
                            let yd = yy - y
                            let zd = zz - z
                            if (xd * xd + yd * yd * 2.0 + zd * zd < size * size
                                && xx >= 1 && yy >= 1 && zz >= 1
                                && xx < this.width - 1 && yy < this.depth - 1 && zz < this.height - 1
                            ) {
                                let ii = (yy * this.height + zz) * this.width + zz
                                if (this.blocks[ii] == Tiles.rock.id) {
                                    this.blocks[ii] = target
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private addWater(): void {
        let source = 0
        let target = Tiles.calmWater.id
        this.setProgress(0)

        for (let x = 0; x < this.width; x++) {
            this.floodFillLiquid(x, Math.trunc(this.depth / 2 - 1), 0, source, target)
            this.floodFillLiquid(x, Math.trunc(this.depth / 2 - 1), this.height - 1, source, target)
        }

        for (let y = 0; y < this.height; y++) {
            this.floodFillLiquid(0, Math.trunc(this.depth / 2 - 1), y, source, target)
            this.floodFillLiquid(this.width - 1, Math.trunc(this.depth / 2 - 1), y, source, target)
        }

        let count = Math.trunc(this.width * this.height / 8000)

        for (let i = 0; i < count; i++) {
            if (i % 100 == 0) {
                this.setProgress(i * Math.trunc(100 / (count - 1)))
            }

            let x = this.random.nextInt(this.width)
            let y = this.waterLevel - 1 - this.random.nextInt(2)
            let z = this.random.nextInt(this.height)
            if (this.blocks[(y * this.height + z) * this.width + x] == source) {
                this.floodFillLiquid(x, y, z, source, target)
            }
        }

        this.setProgress(100)
    }

    private addLava(): void {
        let count = Math.trunc(this.width * this.height * this.depth / 20000)

        for (let i = 0; i < count; i++) {
            if (i % 100 == 0) {
                this.setProgress(i * Math.trunc(100 / (count - 1)))
            }

            let x = this.random.nextInt(this.width)
            let y = Math.trunc(this.random.nextFloat() * this.random.nextFloat() * (this.waterLevel - 3))
            let z = this.random.nextInt(this.height)
            if (this.blocks[(y * this.height + z) * this.width + x] == 0) {
                this.floodFillLiquid(x, y, z, 0, Tiles.calmLava.id)
            }
        }

        this.setProgress(100)
    }

    private addSurfaceBlocks(heightMap: number[]): void {
        let w = this.width
        let h = this.height
        let d = this.depth
        let a: PerlinNoise = new PerlinNoise(this.random, 8)
        let b: PerlinNoise = new PerlinNoise(this.random, 8)

        for (let x = 0; x < w; x++) {
            this.setProgress(x * Math.trunc(100 / (this.width - 1)))

            for (let z = 0; z < h; z++) {
                let sand = a.getValue(x, z) > 8.0
                let gravel = b.getValue(x, z) > 12.0

                let hh = heightMap[x + z * w]
                let i = (hh * this.height + z) * this.width + x
                let t = this.blocks[((hh + 1) * this.height + z) * this.width + x] & 0xFF

                if ((t == Tiles.water.id || t == Tiles.calmWater.id) && hh <= d / 2 - 1 && gravel) {
                    this.blocks[i] = Tiles.gravel.id
                }

                if (t == 0) {
                    let tt = Tiles.grass.id
                    if (hh <= d / 2 - 1 && sand) {
                        tt = Tiles.sand.id
                    }

                    this.blocks[i] = tt
                }
            }
        }
    }

    private growFlowers(heightMap: number[]): void {
        let w = this.width
        let h = this.height
        let d = this.depth
        let count = Math.trunc(this.width * this.height / 3000)

        for (let i = 0; i < count; i++) {
            let r = this.random.nextInt(2)
            this.setProgress(i * Math.trunc(50 / (count - 1)))
            let x = this.random.nextInt(this.width)
            let z = this.random.nextInt(this.height)

            for (let j = 0; j < 10; j++) {
                let xx = x
                let zz = z

                for (let k = 0; k < 5; k++) {
                    xx += this.random.nextInt(6) - this.random.nextInt(6)
                    zz += this.random.nextInt(6) - this.random.nextInt(6)

                    if ((r < 2 || this.random.nextInt(4) == 0) && xx >= 0 && zz >= 0 && xx < this.width && zz < this.height) {
                        let hh = heightMap[xx + zz * w] + 1
                        if ((this.blocks[(hh * this.height + zz) * this.width + xx] & 0xFF) == 0) {
                            let ii = (hh * this.height + zz) * this.width + xx
                            if ((this.blocks[((hh - 1) * this.height + zz) * this.width + xx] & 0xFF) == Tiles.grass.id) {
                                if (r == 0) {
                                    this.blocks[ii] = Tiles.flower.id
                                } else if (r == 1) {
                                    this.blocks[ii] = Tiles.rose.id
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private growMushrooms(heightMap: number[]): void {
        let w = this.width
        let h = this.height
        let d = this.depth
        let count = Math.trunc(this.width * this.height * this.depth / 2000)

        for (let i = 0; i < count; i++) {
            let r = this.random.nextInt(2)
            this.setProgress(i * Math.trunc(50 / (count - 1) + 50))
            let x = this.random.nextInt(this.width)
            let y = this.random.nextInt(this.depth)
            let z = this.random.nextInt(this.height)

            for (let j = 0; j < 20; j++) {
                let xx = x
                let yy = y
                let zz = z

                for (let k = 0; k < 5; k++) {
                    xx += this.random.nextInt(6) - this.random.nextInt(6)
                    yy += this.random.nextInt(2) - this.random.nextInt(2)
                    zz += this.random.nextInt(6) - this.random.nextInt(2)

                    if ((r < 2 || this.random.nextInt(4) == 0)
                        && xx >= 0 && zz >= 0 && yy >= 1
                        && xx < this.width && zz < this.height && yy < heightMap[xx + zz * w] - 1
                        && (this.blocks[(yy * this.height + zz) * this.width + xx] & 0xFF) == 0
                    ) {
                        let ii = (yy * this.height + zz) * this.width + xx
                        if ((this.blocks[((yy - 1) * this.height + zz) * this.width + xx] & 0xFF) == Tiles.rock.id) {
                            if (r == 0) {
                                this.blocks[ii] = Tiles.mushroom1.id
                            } else if (r == 1) {
                                this.blocks[ii] = Tiles.mushroom2.id
                            }
                        }
                    }
                }
            }
        }
    }

    private growTrees(level: Level, heightMap: number[]): void {
        let w = this.width
        let h = this.height
        let d = this.depth
        let count = Math.trunc(this.width * this.height / 4000)

        for (let i = 0; i < count; i++) {
            this.setProgress(i * Math.trunc(50 / (count - 1) + 50))
            let x = this.random.nextInt(this.width)
            let z = this.random.nextInt(this.height)

            for (let j = 0; j < 20; j++) {
                let xx = x
                let zz = z

                for (let k = 0; k < 20; k++) {
                    xx += this.random.nextInt(6) - this.random.nextInt(6)
                    zz += this.random.nextInt(6) - this.random.nextInt(6)

                    if (xx >= 0 && zz >= 0 && xx < this.width && zz < this.height) {
                        let hh = heightMap[xx + zz * w] + 1
                        if (this.random.nextInt(4) == 0) {
                            level.maybeGrowTree(xx, hh, zz)
                        }
                    }
                }
            }
        }
    }

    private setProgress(i: number): void {
        this.progressListener.progressStagePercentage(i)
    }

    private floodFillLiquid(x: number, y: number, z: number, source: number, tt: number): number {
        let target = tt
        let coordBuffer: number[][] = []
        let p = 0
        let wBits = 1
        let hBits = 1

        while (1 << wBits < this.width) {
            wBits++
        }

        while (1 << hBits < this.height) {
            hBits++
        }

        let hMask = this.height - 1
        let wMask = this.width - 1
        this.coords[p++] = ((y << hBits) + z << wBits) + x
        let tiles = 0
        let upStep = this.width * this.height

        while (p > 0) {
            let cl = this.coords[--p]
            if (p == 0 && coordBuffer.length > 0) {
                this.coords = coordBuffer[coordBuffer.length - 1]; coordBuffer.length--
                p = this.coords.length
            }

            let z0 = cl >> wBits & hMask
            let y0 = cl >> wBits + hBits
            let x0 = cl & wMask

            let x1 = 0;
            for (x1 = x0; x0 > 0 && this.blocks[cl - 1] == 0; cl--) {
                x0--
            }

            while (x1 < this.width && this.blocks[cl + x1 - x0] == 0) {
                x1++
            }

            let z1 = cl >> wBits & hMask
            let y1 = cl >> wBits + hBits
            if (z1 != z0 || y1 != y0) {
                console.log("Diagonal flood!?")
            }

            let lastNorth = false
            let lastSouth = false
            let lastBelow = false
            tiles += x1 - x0

            for (let xx = x0; xx < x1; xx++) {
                this.blocks[cl] = target

                if (z0 > 0) {
                    let north = this.blocks[cl - this.width] == 0
                    if (north && !lastNorth) {
                        if (p == this.coords.length) {
                            coordBuffer.push(this.coords)
                            this.coords = new Array(0x100000)
                            p = 0
                        }

                        this.coords[p++] = cl - this.width
                    }

                    lastNorth = north
                }

                if (z0 < this.height - 1) {
                    let south = this.blocks[cl + this.width] == 0
                    if (south && !lastSouth) {
                        if (p == this.coords.length) {
                            coordBuffer.push(this.coords)
                            this.coords = new Array(0x100000)
                            p = 0
                        }

                        this.coords[p++] = cl + this.width
                    }

                    lastSouth = south
                }

                if (y0 > 0) {
                    let belowId = this.blocks[cl - upStep]
                    if ((target == Tiles.lava.id || target == Tiles.calmLava.id)
                        && (belowId == Tiles.water.id || belowId == Tiles.calmWater.id)
                    ) {
                        this.blocks[cl - upStep] = Tiles.rock.id
                    }

                    let below = belowId == 0
                    if (below && !lastBelow) {
                        if (p == this.coords.length) {
                            coordBuffer.push(this.coords)
                            this.coords = new Array(0x100000)
                            p = 0
                        }

                        this.coords[p++] = cl - upStep
                    }

                    lastBelow = below
                }

                cl++
            }
        }

        return tiles
    }
}
