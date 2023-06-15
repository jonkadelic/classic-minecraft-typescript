import { Bush } from "./Bush";
import { DirtTile } from "./DirtTile";
import { GrassTile } from "./GrassTile";
import { Tile } from "./Tile";

export class Tiles {
    public static rock: Tile = new Tile(1, 1)
    public static grass: Tile = new GrassTile(2)
    public static dirt: Tile = new DirtTile(3, 2)
    public static stoneBrick: Tile = new Tile(4, 16)
    public static wood: Tile = new Tile(5, 4)
    public static sapling: Tile = new Bush(6)
    public static unbreakable: Tile = new Tile(7, 17)
    public static water: Tile
    public static calmWater: Tile
    public static lava: Tile
    public static calmLava: Tile
    public static sand: Tile
    public static gravel: Tile
    public static goldOre: Tile
    public static ironOre: Tile
    public static coalOre: Tile
    public static treeTrunk: Tile
    public static leaves: Tile
    public static sponge: Tile
    public static glass: Tile
    public static cloth_00: Tile = new Tile(21, 64)
    public static cloth_01: Tile = new Tile(22, 65)
    public static cloth_02: Tile = new Tile(23, 66)
    public static cloth_03: Tile = new Tile(24, 67)
    public static cloth_04: Tile = new Tile(25, 68)
    public static cloth_05: Tile = new Tile(26, 69)
    public static cloth_06: Tile = new Tile(27, 70)
    public static cloth_07: Tile = new Tile(28, 71)
    public static cloth_08: Tile = new Tile(29, 72)
    public static cloth_09: Tile = new Tile(30, 73)
    public static cloth_10: Tile = new Tile(31, 74)
    public static cloth_11: Tile = new Tile(32, 75)
    public static cloth_12: Tile = new Tile(33, 76)
    public static cloth_13: Tile = new Tile(34, 77)
    public static cloth_14: Tile = new Tile(35, 78)
    public static cloth_15: Tile = new Tile(36, 79)
    public static flower: Tile
    public static rose: Tile
    public static mushroom1: Tile
    public static mushroom2: Tile
    public static goldBlock: Tile
    public static ironBlock: Tile
    public static stoneSlab: Tile
    public static stoneSlabHalf: Tile
    public static redBrick: Tile
    public static tnt: Tile
    public static bookshelf: Tile
    public static mossStone: Tile = new Tile(48, 36)
    public static obsidian: Tile
}