import { Level } from "../level/Level";
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

    public startDestroyBlock(x: number, y: number, z: number) { }

    public removeResource(count: number): boolean {
        return true
    }

    public destroyBlock(x: number, y: number, z: number): void {
        // TODO
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