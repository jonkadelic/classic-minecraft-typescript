import { Material } from "../material/Material";
import { BookshelfTile } from "./BookshelfTile";
import { Bush } from "./Bush";
import { DirtTile } from "./DirtTile";
import { GlassTile } from "./GlassTile";
import { GrassTile } from "./GrassTile";
import { LeafTile } from "./LeafTile";
import { LiquidTile } from "./LiquidTile";
import { LiquidTileStatic } from "./LiquidTileStatic";
import { MetalTile } from "./MetalTile";
import { Mushroom } from "./Mushroom";
import { OreTile } from "./OreTile";
import { SandTile } from "./SandTile";
import { Sapling } from "./Sapling";
import { SpongeTile } from "./SpongeTile";
import { StoneSlabTile } from "./StoneSlabTile";
import { StoneTile } from "./StoneTile";
import { Tile } from "./Tile";
import { TntTile } from "./TntTile";
import { TreeTile } from "./TreeTile";

export class Tiles {
    public static rock: Tile = new StoneTile(1, 1).setData(1.0)
    public static grass: Tile = new GrassTile(2).setData(1.0)
    public static dirt: Tile = new DirtTile(3, 2).setData(1.0)
    public static stoneBrick: Tile = new Tile(4, 16).setData(1.0)
    public static wood: Tile = new Tile(5, 4).setData(1.0)
    public static sapling: Tile = new Sapling(6, 15).setData(1.0)
    public static unbreakable: Tile = new Tile(7, 17).setData(1.0)
    public static water: Tile = new LiquidTile(8, Material.water).setData(0.0)
    public static calmWater: Tile = new LiquidTileStatic(9, Material.water).setData(0.0)
    public static lava: Tile = new LiquidTile(10, Material.lava).setData(1.0)
    public static calmLava: Tile = new LiquidTileStatic(11, Material.lava).setData(1.0)
    public static sand: Tile = new SandTile(12, 18).setData(1.0)
    public static gravel: Tile = new SandTile(13, 19).setData(1.0)
    public static goldOre: Tile = new OreTile(14, 32).setData(1.0)
    public static ironOre: Tile = new OreTile(15, 33).setData(1.0)
    public static coalOre: Tile = new OreTile(16, 34).setData(1.0)
    public static treeTrunk: Tile = new TreeTile(17).setData(1.0)
    public static leaves: Tile = new LeafTile(18, 22).setData(0.4)
    public static sponge: Tile = new SpongeTile(19, 48).setData(0.9)
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
    public static flower: Tile = new Bush(37, 13).setData(1.0)
    public static rose: Tile = new Bush(38, 12).setData(1.0)
    public static mushroom1: Tile = new Mushroom(39, 29).setData(1.0)
    public static mushroom2: Tile = new Mushroom(40, 28).setData(1.0)
    public static goldBlock: Tile = new MetalTile(41, 40).setData(1.0)
    public static ironBlock: Tile = new MetalTile(42, 39).setData(1.0)
    public static stoneSlab: Tile = new StoneSlabTile(43, true).setData(1.0)
    public static stoneSlabHalf: Tile = new StoneSlabTile(44, false).setData(1.0)
    public static redBrick: Tile = new Tile(45, 7).setData(1.0)
    public static tnt: Tile = new TntTile(46, 8).setData(1.0)
    public static bookshelf: Tile = new BookshelfTile(47, 35).setData(1.0)
    public static mossStone: Tile = new Tile(48, 36).setData(1.0)
    public static obsidian: Tile = new StoneTile(49, 37).setData(1.0)
}