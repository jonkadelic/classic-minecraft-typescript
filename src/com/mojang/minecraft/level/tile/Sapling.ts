import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { Bush } from "./Bush";
import { Tiles } from "./Tiles";

export class Sapling extends Bush {
    public constructor(id: number, tex: number) {
        super(id, tex)
        let var3 = 0.4;
        this.setShape(0.5 - var3, 0.0, 0.5 - var3, var3 + 0.5, var3 * 2.0, var3 + 0.5);
    }

    public override tick(level: Level, x: number, y: number, z: number, random: Random): void {
        let id = level.getTile(x, y - 1, z)
        if (!level.isLit(x, y, z) || id != Tiles.dirt.id && id != Tiles.grass.id) {
            level.setTile(x, y, z, 0)
            return
        }
        if (random.nextInt(5) == 0) {
            level.setTile(x, y, z, 0)
            if (!level.maybeGrowTree(x, y, z)) {
                level.setTile(x, y, z, this.id)
            }
        }
    }
}