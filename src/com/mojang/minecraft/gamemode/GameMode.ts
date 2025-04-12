import { Level } from "../level/Level";
import { Tile } from "../level/tile/Tile";
import { Minecraft } from "../Minecraft";
import { Player } from "../player/Player";

export abstract class GameMode {
    protected readonly minecraft: Minecraft
    public instaBuild: boolean = false

    public constructor(minecraft: Minecraft) {
        this.minecraft = minecraft
    }

    public initLevel(level: Level): void {
        // level.creativeMode = false
        // level.growTrees = true
    }

    public openInventory(): void { }

    public startDestroyBlock(x: number, y: number, z: number) {
        this.destroyBlock(x, y, z)
    }

    public removeResource(count: number): boolean {
        return true
    }

    public destroyBlock(x: number, y: number, z: number): void {
        let level = this.minecraft.level!
        let tile = Tile.tiles[level.getTile(x, y, z)]
        let wasSet = level.netSetTile(x, y, z, 0)
        if (tile != null && wasSet) {
            if (this.minecraft.isConnected()) {
                // this.minecraft.client.sendPlayerAction(x, y, z, 0, this.minecraft.player!.inventory.getSelected())
            }

            // TODO: sound

            tile.destroy(level, x, y, z, this.minecraft.particleEngine)
        }
    }

    public continueDestroyBlock(x: number, y: number, z: number, face: number): void { }

    public stopDestroyBlock(): void { }

    public render(a: number): void { }

    public getPickRange() {
        return 5.0
    }

    public useItem(player: Player, item: number): boolean {
        return false
    }

    public initPlayer(player: Player) { }

    public tick(): void { }

    public onSpawn(level: Level): void { }

    public canHurtPlayer(): boolean {
        return true
    }

    public adjustPlayer(player: Player): void { }
}