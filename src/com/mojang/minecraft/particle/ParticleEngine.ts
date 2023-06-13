import { gl } from "../Minecraft";
import { Player } from "../Player";
import { Level } from "../level/Level";
import { Tesselator } from "../renderer/Tesselator";
import { Textures } from "../renderer/Textures";
import { Particle } from "./Particle";

export class ParticleEngine {
    protected level: Level
    private particles: Particle[] = []
    private textures: Textures
    private buffer: WebGLBuffer
    private vertices: number = 0

    public constructor(level: Level, textures: Textures) {
        this.level = level
        this.textures = textures
        let buf = gl.createBuffer()
        if (!buf) throw new Error("Failed to create buffer")
        this.buffer = buf
    }

    public add(particle: Particle): void {
        this.particles.push(particle)
    }

    public tick(): void {
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i]
            p.tick()
            if (p.removed) {
                this.particles.splice(i--, 1)
            }
        }
    }

    public render(player: Player, a: number, layer: number): void {
        if (this.particles.length === 0) return
        gl.bindTexture(gl.TEXTURE_2D, this.textures.loadTexture("./terrain.png", gl.NEAREST))
        let xa = -(Math.cos(player.yRot * Math.PI / 180))
        let za = -Math.sin(player.yRot * Math.PI / 180)
        let xa2 = -za * Math.sin(player.xRot * Math.PI / 180)
        let za2 = xa * Math.sin(player.xRot * Math.PI / 180)
        let ya =  Math.cos(player.xRot * Math.PI / 180)
        let t = Tesselator.instance
        t.color_f(0.8, 0.8, 0.8)
        t.init(this.buffer)
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i]
            if (p.isLit() !== (layer === 1)) {
                p.renderParticle(t, a, xa, ya, za, xa2, za2)
            }
        }
        this.vertices = t.flush()
        Tesselator.drawBuffer(this.buffer, this.vertices)
    }
}