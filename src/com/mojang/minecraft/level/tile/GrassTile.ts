import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class GrassTile extends Tile {
    public constructor(id: number) {
        super(id, 3)
    }

    public override getTexture(face: number): number {
        if (face === 1) {
            return 0
        }
        if (face === 0) {
            return 2
        }
        return 3
    }

    public override tick(level: Level, x: number, y: number, z: number, random: Random): void {
        if (!level.isLit(x, y, z)) {
            level.setTile(x, y, z, Tiles.dirt.id)
        } else {
            let i = 0
            while (i < 4) {
                let xt = x + random.nextInt(3) - 1
                let yt = y + random.nextInt(5) - 3
                let zt = z + random.nextInt(3) - 1
                if (level.getTile(xt, yt, zt) == Tiles.dirt.id && level.isLit(xt, yt, zt)) {
                    level.setTile(xt, yt, zt, Tiles.grass.id)
                }
                i++
            }
        }
    }
}