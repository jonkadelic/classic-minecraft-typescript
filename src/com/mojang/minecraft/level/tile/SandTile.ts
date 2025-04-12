import { Level } from "../Level";
import { Material } from "../material/Material";
import { Tile } from "./Tile";

export class SandTile extends Tile {
    public override onPlaceByPlayer(level: Level, x: number, y: number, z: number): void {
        this.checkSlide(level, x, y, z)
    }

    public override neighborChanged(level: Level, x: number, y: number, z: number, id: number): void {
        this.checkSlide(level, x, y, z)
    }

    private checkSlide(level: Level, x: number, y: number, z: number): void {
        if (SandTile.isFree(level, x, y - 1, z) && y >= 0) {
            level.setTile(x, y, z, 0)

            while (SandTile.isFree(level, x, y - 1, z) && y > 0) {
                y--
            }

            if (y > 0) {
                level.setTile(x, y, z, this.id)
            }
        }
    }

    private static isFree(level: Level, x: number, y: number, z: number): boolean {
        let tile = level.getTile(x, y, z)
        if (tile == 0) {
            return true
        } else {
            let material = Tile.tiles[tile]!.getMaterial()
            return material == Material.water || material == Material.lava
        }
    }
}
