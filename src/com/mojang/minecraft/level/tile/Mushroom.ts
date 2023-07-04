import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { Bush } from "./Bush";
import { Tiles } from "./Tiles";

export class Mushroom extends Bush {
    public constructor(id: number, tex: number) {
        super(id, tex);
        let f = 0.2
        this.setShape(0.5 - f, 0.0, 0.5 - f, f + 0.5, f * 2, f + 0.5)
    }

    public override tick(level: Level, x: number, y: number, z: number, random: Random): void {
        let tileBelow = level.getTile(x, y - 1, z)
        if (level.isLit(x, y, z) || tileBelow != Tiles.rock.id && tileBelow != Tiles.gravel.id && tileBelow != Tiles.stoneBrick.id) {
            level.setTile(x, y, z, 0)
        }
    }
}