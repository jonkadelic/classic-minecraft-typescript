import { mat4 } from "gl-matrix";
import { Matrix } from "../../../util/Matrix";
import { HitResult } from "../HitResult";
import { gl, matrix, shader } from "../Minecraft";
import { Player } from "../player/Player";
import { Frustum } from "../renderer/Frustum";
import { Textures } from "../renderer/Textures";
import { Chunk } from "./Chunk";
import { Level } from "./Level";
import { LevelListener } from "./LevelListener";
import { Tesselator } from "../renderer/Tesselator";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { Tile } from "./tile/Tile";
import { Tiles } from "./tile/Tiles";

export class LevelRenderer implements LevelListener {
    public static readonly MAX_REBUILDS_PER_FRAME = 8
    public static readonly CHUNK_SIZE = 16
    private level: Level
    private chunks: Chunk[] = []
    private xChunks: number
    private yChunks: number
    private zChunks: number
    private textures: Textures
    private hitRenderBuffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)

    public constructor(level: Level, textures: Textures) {
        this.level = level
        this.textures = textures
        level.addListener(this)
        this.xChunks = Math.ceil(level.xSize / LevelRenderer.CHUNK_SIZE)
        this.yChunks = Math.ceil(level.ySize / LevelRenderer.CHUNK_SIZE)
        this.zChunks = Math.ceil(level.zSize / LevelRenderer.CHUNK_SIZE)
        this.chunks = new Array(this.xChunks * this.yChunks * this.zChunks)
        for (let x = 0; x < this.xChunks; x++) {
            for (let y = 0; y < this.yChunks; y++) {
                for (let z = 0; z < this.zChunks; z++) {
                    let x0 = x * LevelRenderer.CHUNK_SIZE
                    let y0 = y * LevelRenderer.CHUNK_SIZE
                    let z0 = z * LevelRenderer.CHUNK_SIZE
                    let x1 = (x + 1) * LevelRenderer.CHUNK_SIZE
                    let y1 = (y + 1) * LevelRenderer.CHUNK_SIZE
                    let z1 = (z + 1) * LevelRenderer.CHUNK_SIZE
                    if (x1 > level.xSize) {
                        x1 = level.xSize
                    }
                    if (y1 > level.ySize) {
                        y1 = level.ySize
                    }
                    if (z1 > level.zSize) {
                        z1 = level.zSize
                    }
                    this.setChunk(x, y, z, new Chunk(level, x0, y0, z0, x1, y1, z1))
                }
            }
        }
    }

    public getAllDirtyChunks(): Chunk[] | null {
        let dirtyChunks: Chunk[] | null = null
        for (let chunk of this.chunks) {
            if (chunk.dirty) {
                if (dirtyChunks == null) {
                    dirtyChunks = []
                }
                dirtyChunks.push(chunk)
            }
        }
        return dirtyChunks
    }

    public render(player: Player, layer: number): void {
        if (!shader.isLoaded()) return
        let id = this.textures.loadTexture("./terrain.png")
        gl.bindTexture(gl.TEXTURE_2D, id)
        let frustum = Frustum.getFrustum()
        shader.use()

        for (let chunk of this.chunks) {
            if (frustum.isVisible(chunk.aabb)) {
                chunk.render(layer)
            }
        }
    }

    public updateDirtyChunks(player: Player) {
        let dirty = this.getAllDirtyChunks()
        if (dirty == null) {
            return
        }
        let frustum = Frustum.getFrustum()
        let now = Date.now()
        dirty.sort((c0, c1) => {
            let i0 = frustum.isVisible(c0.aabb)
            let i1 = frustum.isVisible(c1.aabb)
            if (i0 && !i1) {
                return -1
            }
            if (i1 && !i0) {
                return 1
            }
            let t0 = Math.trunc((now - c0.dirtiedTime) / 2000)
            let t1 = Math.trunc((now - c1.dirtiedTime) / 2000)
            if (t0 < t1) {
                return -1
            }
            if (t0 > t1) {
                return 1
            }
            return c0.distanceToSqr(player) < c1.distanceToSqr(player) ? -1 : 1
        })
        for (let i = 0; i < LevelRenderer.MAX_REBUILDS_PER_FRAME && i < dirty.length; i++) {
            dirty[i].rebuild()
        }
    }

    public renderHit(h: HitResult): void {
        let t = Tesselator.instance
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        t.init()
        shader.setColor(1, 1, 1, (Math.sin(Date.now() / 100) * 0.2 + 0.4) * 0.5)
        let tile = Tile.tiles[this.level.getTile(h.x, h.y, h.z)]
        if (tile != null) {
            for (let i = 0; i < 6; i++) {
                tile.renderFaceNoTexture(t, h.x, h.y, h.z, i)
            }
        } else {
            for (let i = 0; i < 6; i++) {
                Tiles.rock.renderFaceNoTexture(t, h.x, h.y, h.z, i)
            }
        }
        t.flush(this.hitRenderBuffer)
        this.hitRenderBuffer.draw()
        gl.disable(gl.BLEND)
    }

    public setDirty(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
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
                    this.getChunk(x, y, z).setDirty()
                }
            }
        }
    }

    private getChunk(x: number, y: number, z: number): Chunk {
        return this.chunks[(y * this.xChunks * this.zChunks) + (x * this.zChunks) + z]
    }

    private setChunk(x: number, y: number, z: number, chunk: Chunk): void {
        this.chunks[(y * this.xChunks * this.zChunks) + (x * this.zChunks) + z] = chunk
    }

    public tileChanged(x: number, y: number, z: number): void {
        this.setDirty(x - 1, y - 1, z - 1, x + 1, y + 1, z + 1)
    }

    public lightColumnChanged(x: number, z: number, y0: number, y1: number): void {
        this.setDirty(x - 1, y0 - 1, z - 1, x + 1, y1 + 1, z + 1)
    }

    public allChanged(): void {
        this.setDirty(0, 0, 0, this.level.xSize, this.level.ySize, this.level.zSize)
    } 
}