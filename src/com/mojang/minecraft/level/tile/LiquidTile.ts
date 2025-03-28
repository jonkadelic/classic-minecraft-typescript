import { Random } from "../../../../util/Random";
import { AABB } from "../../phys/AABB";
import { Tesselator } from "../../renderer/Tesselator";
import { Level } from "../Level";
import { Material } from "../material/Material";
import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class LiquidTile extends Tile {
    protected material: Material
    protected calmLiquidId: number
    protected liquidId: number

    public constructor(id: number, material: Material) {
        super(id, 14);

        this.material = material;
        if (material == Material.lava) {
            this.tex = 30;
        }

        this.liquidId = id;
        this.calmLiquidId = id + 1;

        let gap: number = 0.01;
        let topGap: number = 0.1;

        this.setShape(gap + 0.0, 0.0 - topGap + gap, gap + 0.0, gap + 1.0, 1.0 - topGap + gap, gap + 1.0);
        this.setTicking(true);
        if (material == Material.lava) {
            this.setTickSpeed(16);
        }
    }

    public override isCubeShaped(): boolean {
        return false
    }

    public override onPlaceByPlayer(level: Level, x: number, y: number, z: number): void {
        level.addToTickNextTick(x, y, z, this.liquidId);
    }

    public override tick(level: Level, x: number, y: number, z: number, random: Random): void {
        let hasSpread = false
        let hasSpreadDown = false

        do {
            y--
            if (level.getTile(x, y, z) != 0 || !this.canSpreadInto(level, x, y, z)) {
                break
            }

            hasSpreadDown = level.setTile(x, y, z, this.liquidId);
            if (hasSpreadDown) {
                hasSpread = true;
            }
        } while (hasSpreadDown && this.material != Material.lava)

        y++
        if (this.material == Material.water || !hasSpread) {
            hasSpread = hasSpread ||
                this.tryToSpreadInto(level, x - 1, y, z) ||
                this.tryToSpreadInto(level, x + 1, y, z) ||
                this.tryToSpreadInto(level, x, y, z - 1) ||
                this.tryToSpreadInto(level, x, y, z + 1)
        }

        if (!hasSpread) {
            level.setTileNoUpdate(x, y, z, this.calmLiquidId)
        } else {
            level.addToTickNextTick(x, y, z, this.liquidId)
        }
    }

    private canSpreadInto(level: Level, x: number, y: number, z: number): boolean {
        if (this.material == Material.water) {
            for (let xx = x - 2; xx <= x + 2; xx++) {
                for (let yy = y - 2; yy < y + 2; yy++) {
                    for (let zz = z - 2; zz < z + 2; zz++) {
                        if (level.getTile(xx, yy, zz) == Tiles.sponge.id) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    private tryToSpreadInto(level: Level, x: number, y: number, z: number): boolean {
        if (level.getTile(x, y, z) == 0) {
            if (!this.canSpreadInto(level, x, y, z)) {
                return false;
            }

            if (level.setTile(x, y, z, this.liquidId)) {
                level.addToTickNextTick(x, y, z, this.liquidId);
            }
        }

        return false;
    }

    protected override getBrightness(level: Level, x: number, y: number, z: number): number {
        return this.material == Material.lava ? 100.0 : level.getBrightness(x, y, z)
    }

    public override getAABB(x: number, y: number, z: number): AABB | null {
        return null
    }

    public override blocksLight(): boolean {
        return true
    }

    public override isSolidRender(): boolean {
        return false
    }

    public override getMaterial(): Material {
        return this.material
    }

    public override isFaceVisible(level: Level, x: number, y: number, z: number, face: number): boolean {
        if (x >= 0 && y >= 0 && z >= 0 && x < level.width && z < level.height) {
            let tile = level.getTile(x, y, z)
            if (tile != this.liquidId && tile != this.calmLiquidId) {
                return face != 1 ||
                    level.getTile(x - 1, y, z) != 0 &&
                    level.getTile(x + 1, y, z) != 0 &&
                    level.getTile(x, y, z - 1) != 0 &&
                    level.getTile(x, y, z + 1) != 0
                ? super.isFaceVisible(level, x, y, z, face)
                : true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    public override renderFace(t: Tesselator, x: number, y: number, z: number, face: number, tex?: number | null): void {
        super.renderFace(t, x, y, z, face, tex)
        super.renderFaceInner(t, x, y, z, face)
    }

    public override neighborChanged(level: Level, x: number, y: number, z: number, id: number): void {
        if (id != 0) {
            let material = Tile.tiles[id].getMaterial()
            if (this.material == Material.water && material == Material.lava ||
                this.material == Material.lava && material == Material.water
            ) {
                level.setTile(x, y, z, Tiles.rock.id)
                return
            }
        }

        level.addToTickNextTick(x, y, z, id)
    }

    public override getTickDelay(): number {
        return this.material == Material.lava ? 5 : 0
    }

    public override getResourceCount(): number {
        return 0
    }

    public override getRenderLayer(): number {
        return this.material == Material.water ? 1 : 0
    }
}