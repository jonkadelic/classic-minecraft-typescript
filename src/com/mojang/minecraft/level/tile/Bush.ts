import { Random } from "../../../../util/Random";
import { AABB } from "../../phys/AABB";
import { Tesselator } from "../../renderer/Tesselator";
import { Level } from "../Level";
import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class Bush extends Tile {
    public constructor(id: number) {
        super(id, 15)
    }
    
    public override tick(level: Level, x: number, y: number, z: number, random: Random): void {
        let below = level.getTile(x, y - 1, z)
        if (!level.isLit(x, y, z) || below != Tiles.dirt.id && below != Tiles.grass.id) {
            level.setTile(x, y, z, 0)
        }
    }

    public override render(t: Tesselator, level: Level, layer: number, x: number, y: number, z: number): void {
        if (level.isLit(x, y, z) != (layer != 1)) {
            return
        }
        let tex = this.getTexture(15)
        let u0 = (tex % 16) / 16.0
        let u1 = u0 + (1 / 16.0)
        let v0 = Math.trunc(tex / 16) / 16.0
        let v1 = v0 + (1 / 16.0)
        let rots = 2
        t.color_f(1, 1, 1)
        let r = 0
        while (r < rots) {
            let xa = Math.sin(r * Math.PI / rots + Math.PI / 4) * 0.5
            let za = Math.cos(r * Math.PI / rots + Math.PI / 4) * 0.5
            let x0 = x + 0.5 - xa
            let x1 = x + 0.5 + xa
            let y0 = y + 0
            let y1 = y + 1
            let z0 = z + 0.5 - za
            let z1 = z + 0.5 + za
            t.vertexUV(x0, y1, z0, u1, v0)
            t.vertexUV(x1, y1, z1, u0, v0)
            t.vertexUV(x1, y0, z1, u0, v1)

            t.vertexUV(x1, y0, z1, u0, v1)
            t.vertexUV(x0, y0, z0, u1, v1)
            t.vertexUV(x0, y1, z0, u1, v0)

            t.vertexUV(x1, y1, z1, u0, v0)
            t.vertexUV(x0, y1, z0, u1, v0)
            t.vertexUV(x0, y0, z0, u1, v1)

            t.vertexUV(x0, y0, z0, u1, v1)
            t.vertexUV(x1, y0, z1, u0, v1)
            t.vertexUV(x1, y1, z1, u0, v0)
            r++
        }
    }

    public override getAABB(x: number, y: number, z: number): AABB | null {
        return null
    }

    public override blocksLight(): boolean {
        return false
    }

    public override isSolid(): boolean {
        return false
    }
}