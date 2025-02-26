import { Tile } from "./level/tile/Tile";
import { Tiles } from "./level/tile/Tiles";

export class User {
    public static allowedTiles: Tile[] = []
    public name: string
    public sessionId: string
    public mpPass: string = ""
    public isPremium: boolean = true

    public constructor(name: string, sessionId: string) {
        this.name = name
        this.sessionId = sessionId
    }

    static {
        User.allowedTiles.push(Tiles.rock)
        User.allowedTiles.push(Tiles.stoneBrick)
        User.allowedTiles.push(Tiles.redBrick)
        User.allowedTiles.push(Tiles.dirt)
        User.allowedTiles.push(Tiles.wood)
        User.allowedTiles.push(Tiles.treeTrunk)
        User.allowedTiles.push(Tiles.leaves)
        User.allowedTiles.push(Tiles.glass)
        User.allowedTiles.push(Tiles.stoneSlabHalf)
        User.allowedTiles.push(Tiles.mossStone)
        User.allowedTiles.push(Tiles.sapling)
        User.allowedTiles.push(Tiles.flower)
        User.allowedTiles.push(Tiles.rose)
        User.allowedTiles.push(Tiles.mushroom1)
        User.allowedTiles.push(Tiles.mushroom2)
        User.allowedTiles.push(Tiles.sand)
        User.allowedTiles.push(Tiles.gravel)
        User.allowedTiles.push(Tiles.sponge)
        User.allowedTiles.push(Tiles.cloth_00)
        User.allowedTiles.push(Tiles.cloth_01)
        User.allowedTiles.push(Tiles.cloth_02)
        User.allowedTiles.push(Tiles.cloth_03)
        User.allowedTiles.push(Tiles.cloth_04)
        User.allowedTiles.push(Tiles.cloth_05)
        User.allowedTiles.push(Tiles.cloth_06)
        User.allowedTiles.push(Tiles.cloth_07)
        User.allowedTiles.push(Tiles.cloth_08)
        User.allowedTiles.push(Tiles.cloth_09)
        User.allowedTiles.push(Tiles.cloth_10)
        User.allowedTiles.push(Tiles.cloth_11)
        User.allowedTiles.push(Tiles.cloth_12)
        User.allowedTiles.push(Tiles.cloth_13)
        User.allowedTiles.push(Tiles.cloth_14)
        User.allowedTiles.push(Tiles.cloth_15)
        User.allowedTiles.push(Tiles.coalOre)
        User.allowedTiles.push(Tiles.ironOre)
        User.allowedTiles.push(Tiles.goldOre)
        User.allowedTiles.push(Tiles.ironBlock)
        User.allowedTiles.push(Tiles.goldBlock)
        User.allowedTiles.push(Tiles.bookshelf)
        User.allowedTiles.push(Tiles.tnt)
        User.allowedTiles.push(Tiles.obsidian)
    }

}