import { mat4 } from "gl-matrix";
import { Matrix } from "../../../util/Matrix";
import { HitResult } from "../HitResult";
import { gl, matrix, Minecraft, shader } from "../Minecraft";
import { Player } from "../player/Player";
import { Frustum } from "./Frustum";
import { Textures } from "./Textures";
import { Chunk } from "./Chunk";
import { Level } from "../level/Level";
import { LevelListener } from "../level/LevelListener";
import { Tesselator } from "./Tesselator";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { Tile } from "../level/tile/Tile";
import { Tiles } from "../level/tile/Tiles";
import { Culler } from "./Culler";

export class LevelRenderer {
    public static readonly CHUNK_SIZE = 16
    public static readonly MAX_VISIBLE_REBUILDS_PER_FRAME = 3
    public static readonly MAX_INVISIBLE_REBUILDS_PER_FRAME = 1

    public level: Level | null = null
    public textures: Textures
    public worldBorderRenderBuffers: RenderBuffer[]
    public dirtyChunks: Chunk[] = []
    private sortedChunks: Chunk[] | null = null
    public chunks: Chunk[] | null = null
    private xChunks: number = 0
    private yChunks: number = 0
    private zChunks: number = 0
    private hitRenderBuffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)
    private cloudRenderBuffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)
    public mc: Minecraft
    public ticks: number = 0
    private xOld: number = -9999.0
    private yOld: number = -9999.0
    private zOld: number = -9999.0
    public destroyProgress: number = 0.0

    public constructor(mc: Minecraft, textures: Textures) {
        this.mc = mc
        this.textures = textures
        this.worldBorderRenderBuffers = [
            new RenderBuffer(gl.STATIC_DRAW),
            new RenderBuffer(gl.STATIC_DRAW),
        ]
    }

    private renderBedrockBorder(): void {
        // todo: LevelRenderer.java line 60
    }

    private renderWaterBorder(): void {
        // todo: LevelRenderer.java line 122
    }

    public setLevel(level: Level | null): void {
        if (this.level != null) {
            this.level.removeListener(this)
        }

        this.level = level
        if (level != null) {
            level.addListener(this)
            this.allChanged()
        }
    }

    public allChanged(): void {
        if (this.level == null) {
            return
        }

        if (this.chunks != null) {
            for (let chunk of this.chunks) {
                chunk.delete()
            }
        }

        this.xChunks = Math.trunc(this.level.width / 16.0)
        this.yChunks = Math.trunc(this.level.depth / 16.0)
        this.zChunks = Math.trunc(this.level.height / 16.0)

        this.chunks = new Array(this.xChunks * this.yChunks * this.zChunks)
        this.sortedChunks = new Array(this.xChunks * this.yChunks * this.zChunks)

        let c = 0
        for (let x = 0; x < this.xChunks; x++) {
            for (let y = 0; y < this.yChunks; y++) {
                for (let z = 0; z < this.zChunks; z++) {
                    this.chunks[(z * this.yChunks + y) * this.xChunks + x] = new Chunk(this.level, x << 4, y << 4, z << 4, 16)
                    this.sortedChunks[(z * this.yChunks + y) * this.xChunks + x] = this.chunks[(z * this.yChunks + y) * this.xChunks + x]
                    c += 2
                }
            }
        }

        for (let dc of this.dirtyChunks) {
            dc.dirty = false
        }

        this.dirtyChunks.length = 0

        this.renderBedrockBorder()
        this.renderWaterBorder()

        this.setDirty(0, 0, 0, this.level.width, this.level.depth, this.level.height)
    }

    public tick(): void {
        this.ticks++
    }

    public renderClouds(a: number): void {
        // Minecraft.java line 685 to 749 inclusive

        gl.bindTexture(gl.TEXTURE_2D, this.textures.loadTexture("./clouds.png"))
        shader.setColor(1.0, 1.0, 1.0, 1.0)

        let s = 512
        let d = 2048 / s

        let cr = (this.level!.cloudColor >> 16 & 0xFF) / 255.0
        let cg = (this.level!.cloudColor >> 8 & 0xFF) / 255.0
        let cb = (this.level!.cloudColor >> 0 & 0xFF) / 255.0

        let t = Tesselator.instance
        
        let scale = 4.8828125E-4;
        let yy = this.level!.depth - 2
        let zOffset = (this.ticks + a) * scale * 0.03

        t.begin()
        t.color_f(cr, cg, cb)

        for (let xx = -s * d; xx < this.level!.width + s * d; xx += s) {
            for (let zz = -s * d; zz < this.level!.height + s * d; zz += s) {
                t.vertexUV(xx,     yy, zz + s, xx * scale + zOffset,       (zz + s) * scale);
                t.vertexUV(xx + s, yy, zz + s, (xx + s) * scale + zOffset, (zz + s) * scale);
                t.vertexUV(xx + s, yy, zz,     (xx + s) * scale + zOffset, zz * scale);
                
                t.vertexUV(xx + s, yy, zz,     (xx + s) * scale + zOffset, zz * scale);
                t.vertexUV(xx,     yy, zz,     xx * scale + zOffset,       zz * scale);
                t.vertexUV(xx,     yy, zz + s, xx * scale + zOffset,       (zz + s) * scale);

                t.vertexUV(xx,     yy, zz,     xx * scale + zOffset,       zz * scale);
                t.vertexUV(xx + s, yy, zz,     (xx + s) * scale + zOffset, zz * scale);
                t.vertexUV(xx + s, yy, zz + s, (xx + s) * scale + zOffset, (zz + s) * scale);
                
                t.vertexUV(xx + s, yy, zz + s, (xx + s) * scale + zOffset, (zz + s) * scale);
                t.vertexUV(xx,     yy, zz + s, xx * scale + zOffset,       (zz + s) * scale);
                t.vertexUV(xx,     yy, zz,     xx * scale + zOffset,       zz * scale);
            }
        }

        t.end(this.cloudRenderBuffer)
        this.cloudRenderBuffer.draw()

        t.begin()

        cr = (this.level!.skyColor >> 16 & 0xFF) / 255.0
        cg = (this.level!.skyColor >> 8 & 0xFF) / 255.0
        cb = (this.level!.skyColor >> 0 & 0xFF) / 255.0

        t.color_f(cr, cg, cb)

        yy = this.level!.depth + 10

        for (let x = -s * d; x < this.level!.width + s * d; x += s) {
            for (let z = -s * d; z < this.level!.height + s * d; z += s) {
                t.vertex(x, yy, z)
                t.vertex(x + s, yy, z)
                t.vertex(x + s, yy, z + s)
                
                t.vertex(x + s, yy, z + s)
                t.vertex(x, yy, z + s)
                t.vertex(x, yy, z)
            }
        }

        t.end(this.cloudRenderBuffer)
        this.cloudRenderBuffer.draw()
    }

    public render(player: Player, layer: number): number {
        if (this.sortedChunks == null) {
            return 0
        }

        let dx = player.x - this.xOld
        let dy = player.y - this.yOld
        let dz = player.z - this.zOld

        if (dx * dx + dy * dy + dz * dz > 64.0) {
            this.xOld = player.x
            this.yOld = player.y
            this.zOld = player.z
            this.sortedChunks.sort((c0, c1) => {
                if (c0 == c1) {
                    return 0
                }
        
                return c0.compare(this.mc.player!) < c1.compare(this.mc.player!) ? -1 : 1        
            })
        }

        let total = 0
        for (let c of this.sortedChunks) {
            total += c.render(layer)
        }

        return total
    }

    public updateDirtyChunks(player: Player) {
        this.dirtyChunks.sort((c0, c1) => {
            if (c0 == c1) {
                return 0
            }

            let i0 = c0.visible
            let i1 = c1.visible
            if (i0 && !i1) {
                return 1
            } else if (i1 && !i0) {
                return -1
            } else {
                let d0 = c0.compare(player)
                let d1 = c1.compare(player)
                if (d0 < d1) {
                    return 1
                } else if (d0 > d1) {
                    return -1
                } else {
                    return 0
                }
            }
        })

        let maxDirtyChunksIndex = this.dirtyChunks.length - 1
        let dirtyChunksToRebuild = this.dirtyChunks.length
        if (dirtyChunksToRebuild > LevelRenderer.MAX_VISIBLE_REBUILDS_PER_FRAME) {
            dirtyChunksToRebuild = LevelRenderer.MAX_VISIBLE_REBUILDS_PER_FRAME
        }

        for (let i = 0; i < dirtyChunksToRebuild; i++) {
            let chunk = this.dirtyChunks[maxDirtyChunksIndex - i]
            this.dirtyChunks.splice(maxDirtyChunksIndex - i)
            chunk.rebuild()
            chunk.dirty = false
        }
    }

    public renderHit(player: Player, h: HitResult, mode: number, item: number, a: number): void {

    }

    public renderHitOutline(player: Player, h: HitResult, mode: number, item: number, a: number) {

    }

    public setDirty(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
        if (this.chunks == null) {
            return
        }

        x0 = Math.trunc(x0 / LevelRenderer.CHUNK_SIZE)
        x1 = Math.trunc(x1 / LevelRenderer.CHUNK_SIZE)
        y0 = Math.trunc(y0 / LevelRenderer.CHUNK_SIZE)
        y1 = Math.trunc(y1 / LevelRenderer.CHUNK_SIZE)
        z0 = Math.trunc(z0 / LevelRenderer.CHUNK_SIZE)
        z1 = Math.trunc(z1 / LevelRenderer.CHUNK_SIZE)
        if (x0 < 0) {
            x0 = 0
        }
        if (y0 < 0) {
            y0 = 0
        }
        if (z0 < 0) {
            z0 = 0
        }
        if (x1 >= this.xChunks) {
            x1 = this.xChunks - 1
        }
        if (y1 >= this.yChunks) {
            y1 = this.yChunks - 1
        }
        if (z1 >= this.zChunks) {
            z1 = this.zChunks - 1
        }
        for (let x = x0; x <= x1; x++) {
            for (let y = y0; y <= y1; y++) {
                for (let z = z0; z <= z1; z++) {
                    let chunk = this.chunks[(z * this.yChunks + y) * this.xChunks + x]
                    if (!chunk.dirty) {
                        chunk.dirty = true
                        this.dirtyChunks.push(chunk)
                    }
                }
            }
        }
    }

    public cull(culler: Culler) {
        if (this.chunks == null) {
            return
        }

        for (let i = 0; i < this.chunks.length; i++) {
            this.chunks[i].cull(culler)
        }
    }
}