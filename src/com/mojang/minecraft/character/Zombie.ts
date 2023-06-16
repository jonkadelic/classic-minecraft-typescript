import { Matrix } from "../../../util/Matrix";
import { Entity } from "../Entity";
import { gl, matrix, shader } from "../Minecraft";
import { Level } from "../level/Level";
import { Textures } from "../renderer/Textures";
import { ZombieModel } from "./ZombieModel";

export class Zombie extends Entity {
    public rot: number = 0
    public timeOffs: number = 0
    public speed: number = 0
    public rotA: number = 0
    private static zombieModel: ZombieModel | null = null
    private textures: Textures

    public constructor(level: Level, textures: Textures, x: number, y: number, z: number) {
        super(level)
        if (Zombie.zombieModel == null) {
            Zombie.zombieModel = new ZombieModel()
        }
        this.textures = textures
        this.rotA = (Math.random() + 1.0) * 0.01
        this.setPos(x, y, z)
        this.timeOffs = Math.random() * 1239813
        this.rot = Math.random() * Math.PI * 2
        this.speed = 1.0
    }

    public override tick(): void {
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
        let xa = 0.0
        let ya = 0.0
        if (this.y < -100) {
            this.remove()
        }
        this.rot += this.rotA
        this.rotA = (this.rotA * 0.99)
        this.rotA = (this.rotA + (Math.random() - Math.random()) * Math.random() * Math.random() * 0.08)
        xa = Math.sin(this.rot)
        ya = Math.cos(this.rot)
        if (this.onGround && Math.random() < 0.08) {
            this.yd = 0.5
        }
        this.moveRelative(xa, ya, this.onGround ? 0.1 : 0.02)
        this.yd = (this.yd - 0.08)
        this.move(this.xd, this.yd, this.zd)
        this.xd *= 0.91
        this.yd *= 0.98
        this.zd *= 0.91
        if (this.onGround) {
            this.xd *= 0.7
            this.zd *= 0.7
        }
    }

    public override render(a: number): void {
        gl.bindTexture(gl.TEXTURE_2D, this.textures.loadTexture("./char.png"))
        matrix.push()
        let brightness = this.getBrightness(a)
        shader.setColor(brightness, brightness, brightness)
        let time = performance.now() / 1000 * 10 * this.speed + this.timeOffs
        let size = 0.058333334
        let yy = (-Math.abs(Math.sin(time * 0.6662)) * 5 - 23)
        matrix.translate(this.xo + (this.x - this.xo) * a, this.yo + (this.y - this.yo) * a, this.zo + (this.z - this.zo) * a)
        matrix.scale(1, -1, 1)
        matrix.scale(size, size, size)
        matrix.translate(0, yy, 0)
        let c = 57.29578
        matrix.rotate(this.rot * c + 180, 0, 1, 0)
        Zombie.zombieModel?.render(time)
        shader.setColor(1, 1, 1)
        matrix.pop()
    }
}