import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl } from "../Minecraft";
import { Player } from "../player/Player";
import { AABB } from "../phys/AABB";
import { Tesselator } from "./Tesselator";
import { Level } from "../level/Level";
import { Tile } from "../level/tile/Tile";
import { Tiles } from "../level/tile/Tiles";
import { Culler } from "./Culler";

export class Chunk {
    private static readonly NUM_LAYERS: number = 2

    private readonly level: Level
    private buffers: RenderBuffer[] = []
    private static t: Tesselator = Tesselator.instance
    public static updates: number = 0
    private readonly x: number
    private readonly y: number
    private readonly z: number
    private readonly xs: number
    private readonly ys: number
    private readonly zs: number
    public visible: boolean = false
    public empty: boolean[] = new Array(Chunk.NUM_LAYERS)
    public dirty: boolean = false

    public constructor(level: Level, x: number, y: number, z: number, size: number) {
        this.level = level
        this.x = x
        this.y = y
        this.z = z
        this.xs = this.ys = this.zs = size
        this.buffers = [new RenderBuffer(gl.STATIC_DRAW), new RenderBuffer(gl.STATIC_DRAW)]
        this.reset()
    }

    public rebuild(): void {
        Chunk.updates++
        let x0 = this.x
        let y0 = this.y
        let z0 = this.z
        let x1 = this.x + this.xs
        let y1 = this.y + this.ys
        let z1 = this.z + this.zs

        this.empty.fill(true)

        for (let i = 0; i < Chunk.NUM_LAYERS; i++) {
            let renderNextLayer = false
            let rendered = false

            Chunk.t.begin()

            for (let x = x0; x < x1; x++) {
                for (let y = y0; y < y1; y++) {
                    for (let z = z0; z < z1; z++) {
                        let tileId = this.level.getTile(x, y, z)
                        if (tileId > 0) {
                            let tile = Tile.tiles[tileId]
                            if (tile.getRenderLayer() != i) {
                                renderNextLayer = true
                            } else {
                                rendered = tile.render(this.level, x, y, z, Chunk.t) || rendered
                            }
                        }
                    }
                }
            }

            Chunk.t.end(this.buffers[i])

            if (rendered) {
                this.empty[i] = false
            }
            if (!renderNextLayer) {
                break
            }
        }
    }

    public compare(player: Player): number {
        let dx = player.x - this.x
        let dy = player.y - this.y
        let dz = player.z - this.z
        return dx * dx + dy * dy + dz * dz
    }

    private reset(): void {
        this.empty.fill(true)
    }

    public delete(): void {
        this.reset()
        for (let rb of this.buffers) {
            rb.delete()
        }
    }

    public render(layer: number): number {
        if (!this.visible) {
            return 0
        }

        let c = 0
        if (!this.empty[layer]) {
            this.buffers[layer].draw()
            c++
        }

        return c
    }

    public cull(culler: Culler): void {
        this.visible = culler.cubeInFrustum(this.x, this.y, this.z, this.x + this.xs, this.y + this.ys, this.z + this.zs)
    }
}