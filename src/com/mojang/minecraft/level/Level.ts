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
import { Material } from "./material/Material";
import { Entity } from "../Entity";

export class Level {
    private static readonly TILE_UPDATE_INTERVAL = 400
    public xSize: number
    public zSize: number
    public ySize: number
    public blocks: number[]
    public name: string = ""
    public creator: string = ""
    public createTime: number = 0
    public xSpawn: number = 0
    public ySpawn: number = 0
    public zSpawn: number = 0
    public rotSpawn: number = 0
    public waterLevel: number = 0

    private lightDepths: number[]
    private levelListeners: LevelListener[] = []
    private random: Random = new Random()
    private unprocessed = 0
    private networkMode = false

    public constructor(xSize: number, zSize: number, ySize: number) {
        this.xSize = xSize
        this.zSize = zSize
        this.ySize = ySize
        this.blocks = new Array(xSize * zSize * ySize)
        this.lightDepths = new Array(xSize * zSize)
        let mapLoaded = this.load()
        if (!mapLoaded) {
            this.regenerate()
        }
        this.calcLightDepths(0, 0, xSize, zSize)
    }

    public regenerate(): void {
        this.blocks = new LevelGen(this.xSize, this.zSize, this.ySize).generateMap()
        let treeMap = new NoiseMap(2).read(this.xSize, this.zSize)
        
        // Trees
        for (let x = 0; x < this.xSize; x++) {
            for (let z = 0; z < this.zSize; z++) {
                for (let y = 0; y < this.ySize - 1; y++) {
                    let i = (y * this.zSize + z) * this.xSize + x
                    let id = this.blocks[i]
                    if (id == Tiles.grass.id && this.random.nextInt(100) == 0 && treeMap[x + z * this.xSize] < 128) {
                        this.maybeGrowTree(x, y + 1, z)
                        break
                    }
                }
            }
        }

        this.calcLightDepths(0, 0, this.xSize, this.zSize)
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

        this.calcLightDepths(0, 0, this.xSize, this.zSize)
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

    public setData(xSize: number, zSize: number, ySize: number, blocks: number[]) {
        this.xSize = xSize
        this.zSize = zSize
        this.ySize = ySize
        this.blocks = blocks
        this.calcLightDepths(0, 0, xSize, zSize)
        for (let i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].allChanged()
        }

        this.findSpawn()
    }

    public findSpawn() {
        let random = new Random()
        let i = 0

        let x = 0
        let z = 0
        let y = 0
        do {
            i++;
            x = random.nextInt(this.xSize / 2) + this.xSize / 4
            z = random.nextInt(this.zSize / 2) + this.zSize / 4
            y = this.getHighestTile(x, z) + 1
            if (i == 10000) {
                this.xSpawn = x
                this.ySpawn = y
                this.zSpawn = z
                return
            }
        } while (y < this.getWaterLevel())

        this.xSpawn = x
        this.ySpawn = y
        this.zSpawn = z
    }

    public calcLightDepths(x0: number, y0: number, x1: number, y1: number): void {
        let x = x0
        while (x < x0 + x1) {
            let z = y0
            while (z < y0 + y1) {
                let oldDepth = this.lightDepths[x + z * this.xSize]
                let y = this.ySize - 1
                while (y > 0 && !this.isLightBlocker(x, y, z)) {
                    y--
                }
                this.lightDepths[x + z * this.xSize] = y
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
        if (aABB.x0 < 0) {
            --x0
        }
        if (aABB.y0 < 0) {
            --y0
        }
        if (aABB.z0 < 0) {
            --z0
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
                        if (aabb != null && aABB.intersectsInner(aabb)) {
                            aABBs.push(aabb)
                        }
                    } else if(x < 0 || y < 0 || z < 0 || x >= this.xSize || z >= this.zSize) {
                        let aabb = Tiles.unbreakable.getAABB(x, y, z)
                        if (aabb != null && aABB.intersectsInner(aabb)) {
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

    public swap(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
        if (this.networkMode) {
            return
        }
        let id0 = this.getTile(x0, y0, z0)
        let id1 = this.getTile(x1, y1, z1)
        this.setTileNoNeighborChange(x0, y0, z0, id1)
        this.setTileNoNeighborChange(x1, y1, z1, id0)
        this.updateNeighborsAt(x0, y0, z0, id1)
        this.updateNeighborsAt(x1, y1, z1, id0)
    }

    public setTileNoNeighborChange(x: number, y: number, z: number, type: number): boolean {
        if (this.networkMode) {
            return false
        }
        return this.netSetTileNoNeighborChange(x, y, z, type)
    }

    public netSetTileNoNeighborChange(x: number, y: number, z: number, type: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= this.xSize || y >= this.ySize || z >= this.zSize) {
            return false
        }
        if (type == this.getTile(x, y, z)) {
            return false
        }
        if (type == 0 && (x == 0 || z == 0 || x == this.xSize - 1 || z == this.zSize - 1)) {
            // type = Tiles.water.id
        }
        let currentTile = this.getTile(x, y, z)
        this.blocks[x + z * this.xSize + y * this.xSize * this.zSize] = type
        if (currentTile != 0) {
            Tile.tiles[currentTile].onRemove(this, x, y, z)
        }
        if (type != 0) {
            Tile.tiles[type].onPlace(this, x, y, z)
        }
        this.calcLightDepths(x, z, 1, 1)

        // TODO: Stopgap solution until LevelRenderer is updated
        for (let i = 0; i < this.levelListeners.length; i++) {
            this.levelListeners[i].tileChanged(x, y, z)
        }
        return true
    }

    public setTile(x: number, y: number, z: number, type: number): boolean {
        if (this.networkMode) {
            return false
        }
        if (this.setTileNoNeighborChange(x, y, z, type)) {
            this.updateNeighborsAt(x, y, z, type)
            return true
        }
        return false
    }

    public netSetTile(x: number, y: number, z: number, type: number): boolean {
        if (this.setTileNoNeighborChange(x, y, z, type)) {
            this.updateNeighborsAt(x, y, z, type)
            return true
        }
        return false
    }

    public updateNeighborsAt(x: number, y: number, z: number, type: number): void {
        this.neighborChanged(x - 1, y, z, type)
        this.neighborChanged(x + 1, y, z, type)
        this.neighborChanged(x, y - 1, z, type)
        this.neighborChanged(x, y + 1, z, type)
        this.neighborChanged(x, y, z - 1, type)
        this.neighborChanged(x, y, z + 1, type)
    }

    public setTileNoUpdate(x: number, y: number, z: number, type: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= this.xSize || y >= this.ySize || z >= this.zSize) {
            return false
        }
        if (type == this.getTile(x, y, z)) {
            return false
        }
        this.blocks[x + z * this.xSize + y * this.xSize * this.zSize] = type
        return true
    }

    private neighborChanged(x: number, y: number, z: number, type: number): void {
        if (x < 0 || y < 0 || z < 0 || x >= this.xSize || y >= this.ySize || z >= this.zSize) {
            return
        }
        let tile = Tile.tiles[this.getTile(x, y, z)]
        if (tile != null) {
            tile.neighborChanged(this, x, y, z, type)
        }
    }

    public isLit(x: number, y: number, z: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= this.xSize || y >= this.ySize || z >= this.zSize) {
            return true
        }
        return y >= this.lightDepths[x + z * this.xSize]
    }

    public getTile(x: number, y: number, z: number): number {
        if (x < 0 || y < 0 || z < 0 || x >= this.xSize || y >= this.ySize || z >= this.zSize) {
            return 0
        }
        return this.blocks[x + z * this.xSize + y * this.xSize * this.zSize]
    }

    public isSolidTile(x: number, y: number, z: number): boolean {
        let tile = Tile.tiles[this.getTile(x, y, z)]
        return tile != null && tile.isSolid()
    }

    public getHighestTile(x: number, z: number): number {
        let y = this.ySize
        while ((this.getTile(x, y - 1, z) == 0 || Tile.tiles[this.getTile(x, y - 1, z)].getMaterial() != Material.none) && y > 0) {
            y--
        }

        return y
    }

    public setSpawnPos(x: number, y: number, z: number, rot: number): void {
        this.xSpawn = x
        this.ySpawn = y
        this.zSpawn = z
        this.rotSpawn = rot
    }


    public getBrightness(x: number, y: number, z: number): number {
        return this.isLit(x, y, z) ? 1.0 : 0.6
    }

    public tick(): void {
        this.unprocessed += this.xSize * this.zSize * this.ySize
        let ticks = this.unprocessed / Level.TILE_UPDATE_INTERVAL
        this.unprocessed -= ticks * Level.TILE_UPDATE_INTERVAL
        for (let i = 0; i < ticks; i++) {
            let x = this.random.nextInt(this.xSize)
            let y = this.random.nextInt(this.ySize)
            let z = this.random.nextInt(this.zSize)
            let tile = Tile.tiles[this.getTile(x, y, z)]
            if (tile != null) {
                tile.tick(this, x, y, z, this.random)
            }
        }
    }

    public getGroundLevel() {
        return this.getWaterLevel() - 2
    }

    public getWaterLevel(): number {
        return this.waterLevel
    }

    public getLiquid(x: number, y: number, z: number): Material {
        let tile = this.getTile(x, y, z)
        if (tile == 0) {
            return Material.none
        }
        return Tile.tiles[tile].getMaterial()
    }

    public isWater(x: number, y: number, z: number): boolean {
        let tile = this.getTile(x, y, z)
        if (tile == 0) {
            return false
        }
        return Tile.tiles[tile].getMaterial() == Material.water
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
                    if (ix >= 0 && iy >= 0 && iz >= 0 && ix < this.xSize && iy < this.ySize && iz < this.zSize) {
                        let id = this.blocks[(iy * this.zSize + iz) * this.xSize + ix] & 0xFF;
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
        let id = this.blocks[((y - 1) * this.zSize + z) * this.xSize + x] & 0xFF;
        if (id != Tiles.grass.id || y >= this.ySize - trunkHeight - 1) {
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

    public explode(entity: Entity, x: number, y: number, z: number, radius: number): void {
        let x0 = Math.trunc(x - radius - 1)
        let x1 = Math.trunc(x + radius + 1)
        let y0 = Math.trunc(y - radius - 1)
        let y1 = Math.trunc(y + radius + 1)
        let z0 = Math.trunc(z - radius - 1)
        let z1 = Math.trunc(z + radius + 1)
        for (let xx = x0; xx < x1; xx++) {
            for (let yy = y1 - 1; yy >= y0; yy--) {
                for (let zz = z0; zz < z1; zz++) {
                    let xd = xx + 0.5 - x
                    let yd = yy + 0.5 - y
                    let zd = zz + 0.5 - z
                    let dist = xd * xd + yd * yd + zd * zd
                    if (dist >= radius * radius) {
                        continue
                    }
                    let id = this.getTile(xx, yy, zz)
                    if (id > 0) {
                        let tile = Tile.tiles[id]
                        if (!tile.isExplodable()) continue
                        // tile.dropItems(this, xx, yy, zz, 0.3)
                        this.setTile(xx, yy, zz, 0)
                        Tile.tiles[id].explode(this, xx, yy, zz)
                    }
                }
            }
        }
        // TODO
    }
}