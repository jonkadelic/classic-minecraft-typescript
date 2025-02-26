import { SelectBlockScreen } from "../gui/BlockSelectScreen";
import { Level } from "../level/Level";
import { Minecraft } from "../Minecraft";
import { Player } from "../player/Player";
import { User } from "../User";
import { GameMode } from "./GameMode";

export class CreativeMode extends GameMode {
    public constructor(minecraft: Minecraft) {
        super(minecraft)

        this.instaBuild = true
    }

    public override openInventory(): void {
        this.minecraft.setScreen(new SelectBlockScreen())
    }

    public override initLevel(level: Level): void {
        super.initLevel(level)

        // level.removeAllNonCreativeModeEntities()
        // level.creativeMode = true
        // level.growTrees = false
    }

    public override adjustPlayer(player: Player): void {
        for (let i = 0; i < 9; i++) {
            player.inventory.count[i] = 1
            if (player.inventory.slots[i] <= 0) {
                player.inventory.slots[i] = User.allowedTiles[i].id
            }
        }
    }

    public override canHurtPlayer(): boolean {
        return false
    }
}