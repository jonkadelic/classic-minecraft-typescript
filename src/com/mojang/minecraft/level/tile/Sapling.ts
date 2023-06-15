import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { Bush } from "./Bush";
import { Tiles } from "./Tiles";

export class Sapling extends Bush {
    public constructor(id: number, tex: number) {
        super(id, tex)
        // TODO: setShape
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