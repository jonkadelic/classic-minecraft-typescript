import { Bush } from "./Bush";
import { DirtTile } from "./DirtTile";
import { GlassTile } from "./GlassTile";
import { GrassTile } from "./GrassTile";
import { LeafTile } from "./LeafTile";
import { Sapling } from "./Sapling";
import { Tile } from "./Tile";
import { TreeTile } from "./TreeTile";

export class Tiles {
    public static rock: Tile = new Tile(1, 1).setData(1.0)
    public static grass: Tile = new GrassTile(2).setData(1.0)
    public static dirt: Tile = new DirtTile(3, 2).setData(1.0)
    public static stoneBrick: Tile = new Tile(4, 16).setData(1.0)
    public static wood: Tile = new Tile(5, 4).setData(1.0)
    public static sapling: Tile = new Sapling(6, 15).setData(1.0)
    public static unbreakable: Tile = new Tile(7, 17).setData(1.0)
    public static water: Tile
    public static calmWater: Tile
    public static lava: Tile
    public static calmLava: Tile
    public static sand: Tile
    public static gravel: Tile
    public static goldOre: Tile
    public static ironOre: Tile
    public static coalOre: Tile
    public static treeTrunk: Tile = new TreeTile(17).setData(1.0)
    public static leaves: Tile = new LeafTile(18, 22).setData(0.4)
    public static sponge: Tile // 0.9
    public static glass: Tile = new GlassTile(20, 49, false).setData(1.0)
    public static cloth_00: Tile = new Tile(21, 64).setData(1.0)
    public static cloth_01: Tile = new Tile(22, 65).setData(1.0)
    public static cloth_02: Tile = new Tile(23, 66).setData(1.0)
    public static cloth_03: Tile = new Tile(24, 67).setData(1.0)
    public static cloth_04: Tile = new Tile(25, 68).setData(1.0)
    public static cloth_05: Tile = new Tile(26, 69).setData(1.0)
    public static cloth_06: Tile = new Tile(27, 70).setData(1.0)
    public static cloth_07: Tile = new Tile(28, 71).setData(1.0)
    public static cloth_08: Tile = new Tile(29, 72).setData(1.0)
    public static cloth_09: Tile = new Tile(30, 73).setData(1.0)
    public static cloth_10: Tile = new Tile(31, 74).setData(1.0)
    public static cloth_11: Tile = new Tile(32, 75).setData(1.0)
    public static cloth_12: Tile = new Tile(33, 76).setData(1.0)
    public static cloth_13: Tile = new Tile(34, 77).setData(1.0)
    public static cloth_14: Tile = new Tile(35, 78).setData(1.0)
    public static cloth_15: Tile = new Tile(36, 79).setData(1.0)
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
    public static mossStone: Tile = new Tile(48, 36).setData(1.0)
    public static obsidian: Tile
}