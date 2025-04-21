import { Mth } from "../../../util/Mth";
import { Entity } from "../Entity";
import { Level } from "../level/Level";
import { gl, matrix, shader } from "../Minecraft";
import { ModelDispatcher } from "../model/ModelDispatcher";
import { Textures } from "../renderer/Textures";
import { AI } from "./ai/AI";
import { BasicAI } from "./ai/BasicAI";

export class Mob extends Entity {
    public static readonly ATTACK_DURATION: number = 5
    public static readonly TOTAL_AIR_SUPPLY: number = 300
    public static modelCache: ModelDispatcher
    public invulnerableDuration: number = 20
    public rot: number = 0
    public timeOffs: number = 0
    public speed: number = 0
    public rotA: number = 0
    protected yBodyRot: number = 0
    protected yBodyRotO: number = 0
    protected oRun: number = 0
    protected run: number = 0
    protected animStep: number = 0
    protected animStepO: number = 0
    protected tickCount: number = 0
    public hasHair: boolean = true
    public textureName: string = "/char.png"
    public allowAlpha: boolean = true
    public rotOffs: number = 0.0
    public modelName: string | null = null
    protected bobStrength: number = 1.0
    protected deathScore: number = 0
    public renderOffset: number = 0.0
    public health: number = 20
    public lastHealth: number = 0
    public invulnerableTime: number = 0
    public airSupply: number = Mob.TOTAL_AIR_SUPPLY
    public hurtTime: number = 0
    public hurtDuration: number = 0
    public hurtDir: number = 0
    public deathTime: number = 0
    public attackTime: number = 0
    public oTilt: number = 0
    public tilt: number = 0
    protected dead: boolean = false
    public ai: AI | null

    public constructor(level: Level) {
        super(level)
        this.rotA = (Math.random() + 1.0) * 0.01
        this.setPos(this.x, this.y, this.z)
        this.timeOffs = Math.random() * 12398
        this.rot = Math.random() * Math.PI * 2
        this.speed = 1.0
        this.ai = new BasicAI()
        this.footSize = 0.5
    }

    public override isPushable(): boolean {
        return !this.removed
    }

    public override tick(): void {
        super.tick()
        this.oTilt = this.tilt
        if (this.attackTime > 0) {
            this.attackTime--
        }

        if (this.hurtTime > 0) {
            this.hurtTime--
        }

        if (this.invulnerableTime > 0) {
            this.invulnerableTime--
        }

        if (this.health <= 0) {
            this.deathTime++
            if (this.deathTime > 20) {
                if (this.ai != null) {
                    this.ai.beforeRemove()
                }

                this.remove()
            }
        }

        if (this.isUnderWater()) {
            if (this.airSupply > 0) {
                this.airSupply--
            } else {
                this.hurt(null, 2)
            }
        } else {
            this.airSupply = 300
        }

        if (this.isInWater()) {
            this.fallDistance = 0.0
        }

        if (this.isInLava()) {
            this.hurt(null, 10)
        }

        this.animStepO = this.animStep
        this.yBodyRotO = this.yBodyRot
        this.yRotO = this.yRot
        this.xRotO = this.xRot
        this.tickCount++
        this.oRun = this.run
        this.aiStep()

        let dx = this.x - this.xo
        let dz = this.z - this.zo
        let dist = Mth.sqrt(dx * dx + dz * dz)
        
        let newYBodyRot: number = this.yBodyRot
        let animStepIncrement: number = 0.0
        let runFactor: number = 0.0

        if (!(dist <= 0.05)) {
            runFactor = 1.0
            animStepIncrement = dist * 3.0
            newYBodyRot = Math.atan2(dz, dx) * 180.0 / Math.PI - 90.0
        }

        if (!this.onGround) {
            runFactor = 0.0
        }

        this.run = this.run + (runFactor - this.run) * 0.3
        let yBodyRotDelta = newYBodyRot - this.yBodyRot

        while (yBodyRotDelta < -180.0) {
            yBodyRotDelta += 360.0
        }

        while (yBodyRotDelta >= 180.0) {
            yBodyRotDelta -= 360.0
        }

        let isRotationFlipped: boolean = yBodyRotDelta < -90.0 || yBodyRotDelta >= 90.0

        this.yBodyRot = this.yRot - yBodyRotDelta
        this.yBodyRot += yBodyRotDelta * 0.1
        if (isRotationFlipped) {
            animStepIncrement = -animStepIncrement
        }

        while (this.yRot - this.yRotO < -180.0) {
			this.yRotO -= 360.0;
		}

		while (this.yRot - this.yRotO >= 180.0) {
			this.yRotO += 360.0;
		}

		while (this.yBodyRot - this.yBodyRotO < -180.0) {
			this.yBodyRotO -= 360.0;
		}

		while (this.yBodyRot - this.yBodyRotO >= 180.0) {
			this.yBodyRotO += 360.0;
		}

		while (this.xRot - this.xRotO < -180.0) {
			this.xRotO -= 360.0;
		}

		while (this.xRot - this.xRotO >= 180.0) {
			this.xRotO += 360.0;
		}

		this.animStep += animStepIncrement;
    }

    public aiStep(): void {
        if (this.ai != null) {
            this.ai.tick(this.level, this)
        }
    }

    protected bindTexture(textures: Textures): void {
        this.textureId = textures.loadTexture(this.textureName)
        gl.bindTexture(gl.TEXTURE_2D, this.textureId)
    }

    public override render(textures: Textures, a: number): void {
        if (this.modelName != null) {
            let attackTime = this.attackTime - a
            if (attackTime < 0.0) {
                attackTime = 0.0
            }

            while (this.yBodyRotO - this.yBodyRot < -180.0) {
                this.yBodyRotO += 360.0
            }

            while (this.yBodyRotO - this.yBodyRot >= 180.0) {
                this.yBodyRotO -= 360.0
            }

            while (this.xRotO - this.xRot < -180.0) {
                this.xRotO += 360.0
            }

            while (this.xRotO - this.xRot >= 180.0) {
                this.xRotO -= 360.0
            }

            while (this.yRotO - this.yRot < -180.0) {
                this.yRotO += 360.0
            }

            while (this.yRotO - this.yRot >= 180.0) {
                this.yRotO -= 360.0
            }

            let yBodyRot = this.yBodyRotO + (this.yBodyRot - this.yBodyRotO) * a
            let run = this.oRun + (this.run - this.oRun) * a
            let yRot = this.yRotO + (this.yRot - this.yRotO) * a
            let xRot = this.xRotO + (this.xRot - this.xRotO) * a

            yRot -= yBodyRot

            matrix.push()
            let animStep = this.animStepO + (this.animStep - this.animStepO) * a
            let br = this.getBrightness(a)
            shader.setColor(br, br, br)

            let scale = 0.0625
            let bob = -Math.abs(Mth.cos(animStep * 0.6662)) * 5.0 * run * this.bobStrength - 23.0
            matrix.translate(
                this.xo + (this.x - this.xo) * a,
                this.yo + (this.y - this.yo) * a - 1.62 + this.renderOffset,
                this.zo + (this.z - this.zo) * a
            )

            let fall = this.hurtTime - a
            if (fall > 0.0 || this.health <= 0) {
                if (fall < 0.0) {
                    fall = 0.0
                } else {
                    let hurtPercentage = fall / this.hurtDuration
                    fall = Mth.sin(hurtPercentage * hurtPercentage * hurtPercentage * hurtPercentage * Math.PI) * 14.0
                }

                if (this.health <= 0) {
                    let deathTime = (this.deathTime + a) / 20.0
                    fall += deathTime * deathTime * 800.0
                    if (fall > 90.0) {
                        fall = 90.0
                    }
                }
    
                matrix.rotate(180.0 - yBodyRot + this.rotOffs, 0.0, 1.0, 0.0)
                matrix.scale(1.0, 1.0, 1.0)
                matrix.rotate(-this.hurtDir, 0.0, 1.0, 0.0)
                matrix.rotate(-fall, 0.0, 0.0, 1.0)
                matrix.rotate(this.hurtDir, 0.0, 1.0, 0.0)
                matrix.rotate(-(180.0 - yBodyRot + this.rotOffs), 0.0, 1.0, 0.0)    
            }
            
            matrix.translate(0.0, -bob * scale, 0.0)
            matrix.scale(1.0, -1.0, 1.0)
            matrix.rotate(180.0 - yBodyRot + this.rotOffs, 0.0, 1.0, 0.0)
            if (!this.allowAlpha) {
                shader.setAlphaTest(false)
            } else {
                gl.disable(gl.CULL_FACE)
            }

            matrix.scale(-1.0, 1.0, 1.0)
            Mob.modelCache.getModelById(this.modelName)!.attackTime = attackTime / 5.0
            this.bindTexture(textures)
            this.renderModel(textures, animStep, a, run, yRot, xRot, scale)
            if (this.invulnerableTime > this.invulnerableDuration - 10) {
                shader.setColor(1.0, 1.0, 1.0, 0.75)
                gl.enable(gl.BLEND)
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
                this.bindTexture(textures)
                this.renderModel(textures, animStep, a, run, yRot, xRot, scale)
                gl.disable(gl.BLEND)
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
            }

            shader.setAlphaTest(true)
            if (this.allowAlpha) {
                gl.enable(gl.CULL_FACE)
            }

            shader.setColor(1.0, 1.0, 1.0, 1.0)
            matrix.pop()
        }
    }

    public renderModel(textures: Textures, time: number, a: number, r: number, yRot: number, xRot: number, scale: number): void {
        Mob.modelCache.getModelById(this.modelName!)!.render(time, r, this.tickCount + a, yRot, xRot, scale)
    }

    public heal(amount: number): void {
        if (this.health > 0) {
            this.health += amount
            if (this.health > 20) {
                this.health = 20
            }

            this.invulnerableTime = Math.trunc(this.invulnerableDuration / 2)
        }
    }

    public override hurt(attacker: Entity | null, damage: number): void {
        if (!this.level.creativeMode) {
            if (this.health > 0) {
                this.ai?.hurt(attacker, damage)
                if (this.invulnerableTime > this.invulnerableDuration / 2) {
                    if (this.lastHealth - damage >= this.health) {
                        return
                    }

                    this.health = this.lastHealth - damage
                } else {
                    this.lastHealth = this.health
                    this.invulnerableTime = this.invulnerableDuration
                    this.health -= damage
                    this.hurtTime = this.hurtDuration = 10
                }

                this.hurtDir = 0.0
                if (attacker != null) {
                    let dx: number = attacker.x - this.x
                    let dz: number = attacker.z - this.z
                    this.hurtDir = (Math.atan2(dz, dx) * 180.0 / Math.PI) - this.yRot
                    this.knockback(attacker, damage, dx, dz)
                } else {
                    this.hurtDir = Math.trunc(Math.random() * 2.0) * 180
                }

                if (this.health <= 0) {
                    this.die(attacker)
                }
            }
        }
    }

    public knockback(source: Entity, damage: number, dx: number, dz: number): void {
        let dist: number = Mth.sqrt(dx * dx + dz * dz)
        let scale: number = 0.4
        this.xd /= 2.0
        this.yd /= 2.0
        this.zd /= 2.0
        this.xd -= dx / dist * scale
        this.yd += scale
        this.zd -= dz / dist * scale
        if (this.yd > scale) {
            this.yd = scale
        }
    }

    public die(killer: Entity | null): void {
        if (!this.level.creativeMode) {
            if (this.deathScore > 0 && killer != null) {
                killer.awardKillScore(this, this.deathScore)
            }

            this.dead = true
        }
    }

    public travel(xxa: number, yya: number): void {
        if (this.isInWater()) {
            let oy: number = this.y
            this.moveRelative(xxa, yya, 0.02)
            this.move(this.xd, this.yd, this.zd)
            this.xd *= 0.8
            this.yd *= 0.8
            this.zd *= 0.8
            this.yd = this.yd - 0.02
            if (this.horizontalCollision && this.isFree(this.xd, this.yd + 0.6 - this.y + oy, this.zd)) {
                this.yd = 0.3
            }
        } else if (this.isInLava()) {
            let oy: number = this.y
            this.moveRelative(xxa, yya, 0.02)
            this.move(this.xd, this.yd, this.zd)
            this.xd *= 0.5
            this.yd *= 0.5
            this.zd *= 0.5
            this.yd = this.yd - 0.02
            if (this.horizontalCollision && this.isFree(this.xd, this.yd + 0.6 - this.y + oy, this.zd)) {
                this.yd = 0.3
            }
        } else {
            this.moveRelative(xxa, yya, this.onGround ? 0.1 : 0.02)
            this.move(this.xd, this.yd, this.zd)
            this.xd *= 0.91
            this.yd *= 0.98
            this.zd *= 0.91
            this.yd = this.yd - 0.08
            if (this.onGround) {
                let scale: number = 0.6
                this.xd *= scale
                this.zd *= scale
            }
        }
    }
}