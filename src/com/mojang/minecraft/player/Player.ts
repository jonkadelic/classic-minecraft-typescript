import { Mob } from "../mob/Mob";
import { Level } from "../level/Level";
import { Input } from "./Input";
import { Inventory } from "./Inventory";
import { BasicAI } from "../mob/ai/BasicAI";
import { Entity } from "../Entity";
import { Mth } from "../../../util/Mth";

export class Player extends Mob {
    public static readonly MAX_HEALTH: number = 20
    public static readonly MAX_ARROWS: number = 99
    public input: Input | null = null
    public inventory: Inventory = new Inventory()
    public userType: number = 0
    public oBob: number = 0
    public bob: number = 0
    public score: number = 0
    public arrows: number = 20
    private static a: number = -1

    public constructor(level: Level) {
        super(level)
        if (level != null) {
            level.player = this
            level.removeEntity(this)
            level.addEntity(this)
        }

        this.heightOffset = 1.62
        this.health = Player.MAX_HEALTH
        this.modelName = "humanoid"
        this.rotOffs = 180.0
        this.ai = new Player$1(this)
    }

    public override resetPos(): void {
        this.heightOffset = 1.62
        this.setSize(0.6, 1.8)
        super.resetPos()
        if (this.level != null) {
            this.level.player = this
        }

        this.health = 20
        this.deathTime = 0
    }

    public override aiStep(): void {
        this.inventory.tick()
        this.oBob = this.bob
        this.input?.tick()
        super.aiStep()
        let bob: number = Mth.sqrt(this.xd * this.xd + this.zd * this.zd)
        let tilt: number = Math.atan(-this.yd * 0.2) * 15.0
        if (bob > 0.1) {
            bob = 0.1
        }

        if (!this.onGround || this.health <= 0) {
            bob = 0.0
        }

        if (this.onGround || this.health <= 0) {
            tilt = 0.0
        }

        this.bob = this.bob + (bob - this.bob) * 0.4
        this.tilt = this.tilt + (tilt - this.tilt) * 0.8

        let entities: Entity[] | null = this.level.findEntities(this, this.bb.grow(1.0, 0.0, 1.0))

        if (this.health > 0 && entities != null) {
            for (let i = 0; i < entities.length; i++) {
                entities[i].playerTouch(this)
            }
        }
    } 

    public releaseAllKeys(): void {
        if (this.input == null) return
        this.input.releaseAllKeys()
    }

    public setKey(key: string, state: boolean): void {
        if (this.input == null) return
        this.input.setKeyState(key, state)
    }

    public addResource(id: number): boolean {
        return this.inventory.addResource(id)
    }

    public override remove(): void { }

    public override awardKillScore(killer: Entity, deathScore: number): void {
        this.score += deathScore
    }

    public override hurt(attacker: Entity | null, damage: number): void {
        if (!this.level.creativeMode) {
            super.hurt(attacker, damage)
        }
    }

    public override isCreativeModeAllowed(): boolean {
        return true
    }
}

export class Player$1 extends BasicAI {
    private readonly player: Player

    public constructor(player: Player) {
        super()
        this.player = player
    }

    public override update(): void {
        if (this.player.input == null) {
            return
        }
        this.jumping = this.player.input.jumping
        this.xxa = this.player.input.xxa
        this.yya = this.player.input.yya
    }
}