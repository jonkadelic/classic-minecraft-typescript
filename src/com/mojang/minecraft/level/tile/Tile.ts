import { AABB } from "../../phys/AABB";
import { Tesselator } from "../../renderer/Tesselator";
import { Level } from "../Level";
import { Random } from "../../../../util/Random";
import { ParticleEngine } from "../../particle/ParticleEngine";
import { Particle } from "../../particle/Particle";
import { GrassTile } from "./GrassTile";
import { DirtTile } from "./DirtTile";
import { Bush } from "./Bush";
import { Tiles } from "./Tiles";

export class Tile {
    public static tiles: Tile[] = new Array(256)
    public tex: number
    public id: number

    public constructor(id: number, tex: number = undefined) {
        this.id = id;
        Tile.tiles[id] = this
        
        if (tex)
        {
            this.tex = tex
        }
    }
    
    public render(t: Tesselator, level: Level, layer: number, x: number, y: number, z: number): void {
        let c1 = 1.0
        let c2 = 0.8
        let c3 = 0.6
        if (this.shouldRenderFace(level, x, y - 1, z, layer)) {
            t.color_f(c1, c1, c1)
            this.renderFace(t, x, y, z, 0)
        }
        if (this.shouldRenderFace(level, x, y + 1, z, layer)) {
            t.color_f(c1, c1, c1)
            this.renderFace(t, x, y, z, 1)
        }
        if (this.shouldRenderFace(level, x, y, z - 1, layer)) {
            t.color_f(c2, c2, c2)
            this.renderFace(t, x, y, z, 2)
        }
        if (this.shouldRenderFace(level, x, y, z + 1, layer)) {
            t.color_f(c2, c2, c2)
            this.renderFace(t, x, y, z, 3)
        }
        if (this.shouldRenderFace(level, x - 1, y, z, layer)) {
            t.color_f(c3, c3, c3)
            this.renderFace(t, x, y, z, 4)
        }
        if (this.shouldRenderFace(level, x + 1, y, z, layer)) {
            t.color_f(c3, c3, c3)
            this.renderFace(t, x, y, z, 5)
        }
    }

    private shouldRenderFace(level: Level, x: number, y: number, z: number, layer: number): boolean {
        return !level.isSolidTile(x, y, z) && (level.isLit(x, y, z) !== (layer == 1));
    }

    protected getTexture(face: number): number {
        return this.tex
    }

    public renderFace(t: Tesselator, x: number, y: number, z: number, face: number): void {
        let tex = this.getTexture(face)
        let u0 = (tex % 16) / 16.0
        let u1 = u0 + (1 / 16.0)
        let v0 = Math.floor(tex / 16) / 16.0
        let v1 = v0 + (1 / 16.0)
        let x0 = x
        let x1 = x + 1
        let y0 = y
        let y1 = y + 1
        let z0 = z
        let z1 = z + 1
        if (face == 0) {
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x0, y0, z0, u0, v0);
            t.vertexUV(x1, y0, z0, u1, v0);
            
            t.vertexUV(x1, y0, z0, u1, v0);
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x0, y0, z1, u0, v1);
        }
        if (face == 1) {
            t.vertexUV(x1, y1, z1, u1, v1);
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x0, y1, z0, u0, v0);
            
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y1, z1, u0, v1);
            t.vertexUV(x1, y1, z1, u1, v1);
        }
        if (face == 2) {
            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z0, u0, v0);
            t.vertexUV(x1, y0, z0, u0, v1);
            
            t.vertexUV(x1, y0, z0, u0, v1);
            t.vertexUV(x0, y0, z0, u1, v1);
            t.vertexUV(x0, y1, z0, u1, v0);
        }
        if (face == 3) {
            t.vertexUV(x0, y1, z1, u0, v0);
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x1, y0, z1, u1, v1);
            
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x1, y1, z1, u1, v0);
            t.vertexUV(x0, y1, z1, u0, v0);
        }
        if (face == 4) {
            t.vertexUV(x0, y1, z1, u1, v0);
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y0, z0, u0, v1);
            
            t.vertexUV(x0, y0, z0, u0, v1);
            t.vertexUV(x0, y0, z1, u1, v1);
            t.vertexUV(x0, y1, z1, u1, v0);
        }
        if (face == 5) {
            t.vertexUV(x1, y0, z1, u0, v1);
            t.vertexUV(x1, y0, z0, u1, v1);
            t.vertexUV(x1, y1, z0, u1, v0);
            
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x1, y0, z1, u0, v1);
        }
    }

    public renderFaceNoTexture(t: Tesselator, x: number, y: number, z: number, face: number): void {
        let x0 = x
        let x1 = x + 1
        let y0 = y
        let y1 = y + 1
        let z0 = z
        let z1 = z + 1
        if (face == 0) {
            t.vertex(x0, y0, z1)
            t.vertex(x0, y0, z0)
            t.vertex(x1, y0, z0)
            t.vertex(x1, y0, z0)
            t.vertex(x1, y0, z1)
            t.vertex(x0, y0, z1)
        }
        if (face == 1) {
            t.vertex(x1, y1, z1)
            t.vertex(x1, y1, z0)
            t.vertex(x0, y1, z0)
            t.vertex(x0, y1, z0)
            t.vertex(x0, y1, z1)
            t.vertex(x1, y1, z1)
        }
        if (face == 2) {
            t.vertex(x0, y1, z0)
            t.vertex(x1, y1, z0)
            t.vertex(x1, y0, z0)
            t.vertex(x1, y0, z0)
            t.vertex(x0, y0, z0)
            t.vertex(x0, y1, z0)
        }
        if (face == 3) {
            t.vertex(x0, y1, z1)
            t.vertex(x0, y0, z1)
            t.vertex(x1, y0, z1)
            t.vertex(x1, y0, z1)
            t.vertex(x1, y1, z1)
            t.vertex(x0, y1, z1)
        }
        if (face == 4) {
            t.vertex(x0, y1, z1)
            t.vertex(x0, y0, z1)
            t.vertex(x0, y0, z0)
            t.vertex(x0, y0, z0)
            t.vertex(x0, y1, z0)
            t.vertex(x0, y1, z1)
        }
        if (face == 5) {
            t.vertex(x1, y1, z0)
            t.vertex(x1, y0, z0)
            t.vertex(x1, y0, z1)
            t.vertex(x1, y0, z1)
            t.vertex(x1, y1, z1)
            t.vertex(x1, y1, z0)
        }
    }

    public getTileAABB(x: number, y: number, z: number): AABB {
        return new AABB(x, y, z, x + 1, y + 1, z + 1)
    }
    
    public getAABB(x: number, y: number, z: number): AABB {
        return new AABB(x, y, z, x + 1, y + 1, z + 1)
    }

    public blocksLight(): boolean {
        return true
    }

    public isSolid(): boolean {
        return true
    }

    public tick(level: Level, x: number, y: number, z: number, random: Random): void {
    }

    public destroy(level: Level, x: number, y: number, z: number, particleEngine: ParticleEngine): void {
        const SD: number = 4
        let xx: number = 0
        while (xx < SD) {
            let yy: number = 0
            while (yy < SD) {
                let zz: number = 0
                while (zz < SD) {
                    const xp: number = x + (xx + 0.5) / SD
                    const yp: number = y + (yy + 0.5) / SD
                    const zp: number = z + (zz + 0.5) / SD
                    particleEngine.add(new Particle(level, xp, yp, zp, xp - x - 0.5, yp - y - 0.5, zp - z - 0.5, this.tex))
                    zz++
                }
                yy++
            }
            xx++
        }
    }
}