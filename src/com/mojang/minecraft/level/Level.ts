import { Random } from "../../../util/Random";
import { HitResult } from "../HitResult";
import { AABB } from "../phys/AABB";
import { Vec3 } from "../character/Vec3";
import { LevelGen } from "./LevelGen";
import { LevelListener } from "./LevelListener";
import { Tile } from "./tile/Tile";
import { Tiles } from "./tile/Tiles";
import Base256 from "base256-encoding"
import { NoiseMap } from "./NoiseMap";

export class Level {
    private static readonly TILE_UPDATE_INTERVAL = 400
    public readonly width: number
    public readonly height: number
    public readonly depth: number
    private blocks: number[]
    private lightDepths: number[]
    private levelListeners: LevelListener[] = []
    private random: Random = new Random()
    private unprocessed = 0

    public constructor(w: number, h: number, d: number) {
        this.width = w
        this.height = h
        this.depth = d
        this.blocks = new Array(w * h * d)
        this.lightDepths = new Array(w * h)
        let mapLoaded = this.load()
        if (!mapLoaded) {
            this.regenerate()
        }
        this.calcLightDepths(0, 0, w, h)
    }

    public regenerate(): void {
        this.blocks = new LevelGen(this.width, this.height, this.depth).generateMap()
        let treeMap = new NoiseMap(2).read(this.width, this.height)
        
        // Trees
        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.height; z++) {
                for (let y = 0; y < this.depth - 1; y++) {
                    let i = (y * this.height + z) * this.width + x
                    let id = this.blocks[i]
                    if (id == Tiles.grass.id && this.random.nextInt(100) == 0 && treeMap[x + z * this.width] < 128) {
                        this.maybeGrowTree(x, y + 1, z)
                        break
                    }
                }
            }
        }

        this.calcLightDepths(0, 0, this.width, this.height)
        for (let i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].allChanged()
        }
    }

    public load(): boolean {
        let level = localStorage.getItem("level")
        if (level == null) {
            return false
        }
        this.blocks = Array.from(Base256.decode(level))

        this.calcLightDepths(0, 0, this.width, this.height)
        for (let i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].allChanged()
        }
        console.log("Loaded level")
        return true
    }

    public save(): void {
        let toWrite = Base256.encode(new Uint8Array(this.blocks))
        try {
            localStorage.setItem("level", toWrite)
            console.log("Saved level: " + toWrite.length + " bytes")
        } catch (e) {
            console.log(e)
        }
    }

    public calcLightDepths(x0: number, y0: number, x1: number, y1: number): void {
        let x = x0
        while (x < x0 + x1) {
            let z = y0
            while (z < y0 + y1) {
                let oldDepth = this.lightDepths[x + z * this.width]
                let y = this.depth - 1
                while (y > 0 && !this.isLightBlocker(x, y, z)) {
                    y--
                }
                this.lightDepths[x + z * this.width] = y
                if (oldDepth != y) {
                    let y10 = oldDepth < y ? oldDepth : y
                    let y11 = oldDepth > y ? oldDepth : y
                    let i = 0
                    while (i < this.levelListeners.length) {
                        this.levelListeners[i].lightColumnChanged(x, z, y10, y11)
                        i++
                    }
                }
                z++
            }
            x++
        }
    }

    public addListener(listener: LevelListener): void {
        this.levelListeners.push(listener)
    }

    public removeListener(listener: LevelListener): void {
        this.levelListeners.splice(this.levelListeners.indexOf(listener), 1)
    }

    public isLightBlocker(x: number, y: number, z: number): boolean {
        let tile = Tile.tiles[this.getTile(x, y, z)]
        return tile == null ? false : tile.blocksLight()
    }

    public getCubes(aABB: AABB): AABB[] {
        let aABBs: AABB[] = []
        let x0 = Math.trunc(aABB.x0)
        let x1 = Math.trunc(aABB.x1 + 1)
        let y0 = Math.trunc(aABB.y0)
        let y1 = Math.trunc(aABB.y1 + 1)
        let z0 = Math.trunc(aABB.z0)
        let z1 = Math.trunc(aABB.z1 + 1)
        if (x0 < 0) {
            x0 = 0
        }
        if (y0 < 0) {
            y0 = 0
        }
        if (z0 < 0) {
            z0 = 0
        }
        if (x1 > this.width) {
            x1 = this.width
        }
        if (y1 > this.depth) {
            y1 = this.depth
        }
        if (z1 > this.height) {
            z1 = this.height
        }
        let x = x0
        while (x < x1) {
            let y = y0
            while (y < y1) {
                let z = z0
                while (z < z1) {
                    let tile = Tile.tiles[this.getTile(x, y, z)]
                    if (tile != null) {
                        let aabb = tile.getAABB(x, y, z)
                        if (aabb != null) {
                            aABBs.push(aabb)
                        }
                    }
                    z++
                }
                y++
            }
            x++
        }
        return aABBs
    }

    public setTile(x: number, y: number, z: number, type: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return false
        }
        if (type == this.getTile(x, y, z)) {
            return false
        }
        this.blocks[x + z * this.width + y * this.width * this.height] = type
        this.calcLightDepths(x, z, 1, 1)
        let i = 0
        while (i < this.levelListeners.length) {
            this.levelListeners[i++].tileChanged(x, y, z)
            i++
        }
        return true
    }

    public isLit(x: number, y: number, z: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return true
        }
        return y >= this.lightDepths[x + z * this.width]
    }

    public getTile(x: number, y: number, z: number): number {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return 0
        }
        return this.blocks[x + z * this.width + y * this.width * this.height]
    }

    public isSolidTile(x: number, y: number, z: number): boolean {
        let tile = Tile.tiles[this.getTile(x, y, z)]
        return tile != null && tile.isSolid()
    }

    public tick(): void {
        this.unprocessed += this.width * this.height * this.depth
        let ticks = this.unprocessed / Level.TILE_UPDATE_INTERVAL
        this.unprocessed -= ticks * Level.TILE_UPDATE_INTERVAL
        for (let i = 0; i < ticks; i++) {
            let x = this.random.nextInt(this.width)
            let y = this.random.nextInt(this.depth)
            let z = this.random.nextInt(this.height)
            let tile = Tile.tiles[this.getTile(x, y, z)]
            if (tile != null) {
                tile.tick(this, x, y, z, this.random)
            }
        }
    }

    public clip(a: Vec3, b: Vec3): HitResult | null {
        if (Number.isNaN(a.x) || Number.isNaN(a.y) || Number.isNaN(a.z)) {
            return null
        }
        if (Number.isNaN(b.x) || Number.isNaN(b.y) || Number.isNaN(b.z)) {
            return null
        }
        let xb = Math.trunc(b.x)
        let yb = Math.trunc(b.y)
        let zb = Math.trunc(b.z)
        let xa = Math.trunc(a.x)
        let ya = Math.trunc(a.y)
        let za = Math.trunc(a.z)
        for (let i = 20; i >= 0; i--) {
            if (Number.isNaN(a.x) || Number.isNaN(a.y) || Number.isNaN(a.z)) {
                return null
            }
            if (xb == xa && yb == ya && zb == za) {
                return null
            }
            let f1 = 999
            let f2 = 999
            let f3 = 999
            if (xb > xa) {
                f1 = xa + 1
            }
            if (xb < xa) {
                f1 = xa
            }
            if (yb > ya) {
                f2 = ya + 1
            }
            if (yb < ya) {
                f2 = ya
            }
            if (zb > za) {
                f3 = za + 1
            }
            if (zb < za) {
                f3 = za
            }
            let f4 = 999
            let f5 = 999
            let f6 = 999
            let dx = b.x - a.x
            let dy = b.y - a.y
            let dz = b.z - a.z
            if (f1 != 999) {
                f4 = (f1 - a.x) / dx
            }
            if (f2 != 999) {
                f5 = (f2 - a.y) / dy
            }
            if (f3 != 999) {
                f6 = (f3 - a.z) / dz
            }
            let face = 0
            if (f4 < f5 && f4 < f6) {
                if (xb > xa) {
                    face = 4
                } else {
                    face = 5
                }
                a.x = f1
                a.y += dy * f4
                a.z += dz * f4
            } else if (f5 < f6) {
                if (yb > ya) {
                    face = 0
                } else {
                    face = 1
                }
                a.x += dx * f5
                a.y = f2
                a.z += dz * f5
            } else {
                if (zb > za) {
                    face = 2
                } else {
                    face = 3
                }
                a.x += dx * f6
                a.y += dy * f6
                a.z = f3
            }

            xa = Math.trunc(a.x)
            if (face == 5) {
                xa--
            }

            ya = Math.trunc(a.y)
            if (face == 1) {
                ya--
            }
            
            za = Math.trunc(a.z)
            if (face == 3) {
                za--
            }

            let tileId = this.getTile(xa, ya, za)
            let tile = Tile.tiles[tileId]
            if (tileId <= 0 || tile == null) {
                continue
            }

            let hitResult: HitResult | null = tile.clip(xa, ya, za, a, b)
            if (hitResult != null) {
                return hitResult
            }
        }

        return null
    }

    public maybeGrowTree(x: number, y: number, z: number): boolean {
        let trunkHeight = this.random.nextInt(3) + 4;
        let canPlace = 1;
        for (let iy = y; iy <= y + 1 + trunkHeight; ++iy) {
            let r = 1;
            if (iy == y) {
                r = 0;
            }
            if (iy >= y + 1 + trunkHeight - 2) {
                r = 2;
            }
            for (let ix = x - r; ix <= x + r && canPlace != 0; ++ix) {
                for (let iz = z - r; iz <= z + r && canPlace != 0; ++iz) {
                    if (ix >= 0 && iy >= 0 && iz >= 0 && ix < this.width && iy < this.depth && iz < this.height) {
                        let id = this.blocks[(iy * this.height + iz) * this.width + ix] & 0xFF;
                        if (id == 0) continue;
                        canPlace = 0;
                        continue;
                    }
                    canPlace = 0;
                }
            }
        }
        if (canPlace == 0) {
            return false;
        }
        let id = this.blocks[((y - 1) * this.height + z) * this.width + x] & 0xFF;
        if (id != Tiles.grass.id || y >= this.depth - trunkHeight - 1) {
            return false;
        }
        this.setTile(x, y - 1, z, Tiles.dirt.id);
        for (let iy = y - 3 + trunkHeight; iy <= y + trunkHeight; ++iy) {
            let blockY = iy - (y + trunkHeight);
            let r = 1 - Math.trunc(blockY / 2);
            for (let ix = x - r; ix <= x + r; ++ix) {
                let dx = ix - x;
                for (let iz = z - r; iz <= z + r; ++iz) {
                    let dz = iz - z;
                    if (Math.abs(dx) == r && Math.abs(dz) == r && (this.random.nextInt(2) == 0 || blockY == 0)) continue;
                    this.setTile(ix, iy, iz, Tiles.leaves.id);
                }
            }
        }
        for (let iy = 0; iy < trunkHeight; ++iy) {
            this.setTile(x, y + iy, z, Tiles.treeTrunk.id);
        }
        return true;
    }
}