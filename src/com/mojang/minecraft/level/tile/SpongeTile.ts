import { Level } from "../Level";
import { Tile } from "./Tile";

export class SpongeTile extends Tile {
    public constructor(id: number, tex: number) {
        super(id, tex)
    }

    public override onPlace(level: Level, x: number, y: number, z: number): void {
        for (let i = x - 2; i <= x + 2; i++) {
            for (let j = y - 2; j <= y + 2; j++) {
                for (let k = z - 2; k <= z + 2; k++) {
                    if (!level.isWater(i, j, k)) {
                        continue
                    }
                    level.setTileNoNeighborChange(i, j, k, 0)
                }
            }
        }
    }

    public override onRemove(level: Level, x: number, y: number, z: number): void {
        for (let i = x - 2; i <= x + 2; i++) {
            for (let j = y - 2; j <= y + 2; j++) {
                for (let k = z - 2; k <= z + 2; k++) {
                    level.updateNeighborsAt(i, j, k, level.getTile(i, j, k))
                }
            }
        }
    }
}