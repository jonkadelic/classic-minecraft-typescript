import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl } from "../Minecraft";
import { Player } from "../player/Player";
import { AABB } from "../phys/AABB";
import { Tesselator } from "../renderer/Tesselator";
import { Level } from "./Level";
import { Tile } from "./tile/Tile";
import { Tiles } from "./tile/Tiles";

export class Chunk {
    public aabb: AABB
    public readonly level: Level
    public readonly x0: number
    public readonly y0: number
    public readonly z0: number
    public readonly x1: number
    public readonly y1: number
    public readonly z1: number
    public readonly x: number
    public readonly y: number
    public readonly z: number
    public dirty: boolean = true
    private buffers: RenderBuffer[] = []
    public dirtiedTime: number = 0
    private static t: Tesselator = Tesselator.instance
    public static updates: number = 0
    private static totalTime: number = 0
    private static totalUpdates: number = 0

    public constructor(level: Level, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
        this.level = level
        this.x0 = x0
        this.y0 = y0
        this.z0 = z0
        this.x1 = x1
        this.y1 = y1
        this.z1 = z1
        this.x = (x0 + x1) / 2
        this.y = (y0 + y1) / 2
        this.z = (z0 + z1) / 2
        this.aabb = new AABB(x0, y0, z0, x1, y1, z1)
        this.buffers = [new RenderBuffer(gl.STATIC_DRAW), new RenderBuffer(gl.STATIC_DRAW)]
    }

    private rebuildLayer(layer: number): void {
        this.dirty = false
        Chunk.updates++
        let before = Date.now()
        Chunk.t.init()
        let tiles = 0
        for (let x = this.x0; x < this.x1; x++) {
            for (let y = this.y0; y < this.y1; y++) {
                for (let z = this.z0; z < this.z1; z++) {
                    let tileId = this.level.getTile(x, y, z)
                    if (tileId > 0) {
                        let tile: Tile = Tile.tiles[tileId]
                        if (tile.getRenderLayer() == layer) {
                            Tile.tiles[tileId].render(this.level, x, y, z, Chunk.t)
                            tiles++
                        }
                    }
                }
            }
        }
        Chunk.t.flush(this.buffers[layer])
        let after = Date.now()
        if (tiles > 0) {
            Chunk.totalTime += after - before
            Chunk.totalUpdates++
        }
    }

    public rebuild(): void {
        this.rebuildLayer(0)
        this.rebuildLayer(1)
    }

    public render(layer: number): void {
        this.buffers[layer].draw()
    }

    public setDirty(): void {
        if (!this.dirty) {
            this.dirty = true
            this.dirtiedTime = Date.now()
        }
    }

    public isDirty(): boolean {
        return this.dirty
    }

    public distanceToSqr(player: Player): number {
        let xd = this.x - player.x
        let yd = this.y - player.y
        let zd = this.z - player.z
        return xd * xd + yd * yd + zd * zd
    }
}