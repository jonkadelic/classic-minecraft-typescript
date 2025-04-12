import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { Material } from "../material/Material";
import { LiquidTile } from "./LiquidTile";
import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class LiquidTileStatic extends LiquidTile {
    public constructor(id: number, material: Material) {
        super(id, material)
        this.liquidId = id - 1
        this.calmLiquidId = id
        this.setTicking(false)
    }

    public override tick(level: Level, x: number, y: number, z: number, random: Random): void {
        // Do nothing
    }

    public override neighborChanged(level: Level, x: number, y: number, z: number, id: number): void {
        let shouldFlow = false

        if (level.getTile(x - 1, y, z) == 0) {
            shouldFlow = true
        }
        if (level.getTile(x + 1, y, z) == 0) {
            shouldFlow = true
        }
        if (level.getTile(x, y, z - 1) == 0) {
            shouldFlow = true
        }
        if (level.getTile(x, y, z + 1) == 0) {
            shouldFlow = true
        }
        if (level.getTile(x, y - 1, z) == 0) {
            shouldFlow = true
        }

        if (id != 0) {
            let material = Tile.tiles[id]!.getMaterial()
            if (this.material == Material.water && material == Material.lava ||
                this.material == Material.lava && material == Material.water
            ) {
                level.setTile(x, y, z, Tiles.rock.id)
                return
            }
        }

        if (shouldFlow) {
            level.setTileNoUpdate(x, y, z, this.liquidId)
            level.addToTickNextTick(x, y, z, this.liquidId)
        }
    }
}