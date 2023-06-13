import { Keyboard, Keys, Mouse, MouseButton } from "syncinput";
import { Timer } from "./Timer";
import { Level } from "./level/Level";
import { LevelRenderer } from "./level/LevelRenderer";
import { Player } from "./Player";
import { ParticleEngine } from "./particle/ParticleEngine";
import { Entity } from "./Entity";
import { Textures } from "./renderer/Textures";
import { HitResult } from "./HitResult";
import { AABB } from "./phys/AABB";
import { Chunk } from "./level/Chunk";
import { Tile } from "./level/tile/Tile";
import { Matrix } from "../../util/Matrix";
import { Frustum } from "./renderer/Frustum";
import { Shader } from "../../../shader";
import { Tiles } from "./level/tile/Tiles";

export let gl: WebGLRenderingContext
export let mouse = new Mouse()
export let keyboard = new Keyboard()
export let matrix = new Matrix()
export let shader: Shader = null


export class Minecraft {
    public static readonly VERSION_STRING = "0.0.11a"
    private width: number
    private height: number
    private fogColor0: number[] = new Array(4)
    private fogColor1: number[] = new Array(4)
    private timer: Timer = new Timer(20)
    private level: Level = null
    private levelRenderer: LevelRenderer = null
    private player: Player = null
    private paintTexture: number = 1
    private particleEngine: ParticleEngine = null
    private entities: Entity[] = []
    private parent: HTMLCanvasElement
    public pause: boolean = false
    private yMouseAxis: number = -1
    public textures: Textures
    private editMode: number = 0
    private running: boolean = false
    private fpsString: String = ""
    private mouseGrabbed: boolean = false
    private hitResult: HitResult = null

    private frames: number = 0
    private lastTime: number = 0

    public constructor(parent: HTMLCanvasElement, width: number, height: number) {
        this.parent = parent
        this.width = width
        this.height = height
        this.textures = new Textures()
    }

    public init(): void {
        fetch("shader/base.vert")
            .then(response => response.text())
            .then(text => {
                fetch("shader/base.frag")
                    .then(response => response.text())
                    .then(text2 => {
                        shader = new Shader(text, text2)
                    })
            })

        this.fogColor0 = [0xFE / 0xFF, 0xFB / 0xFF, 0xFA / 0xFF, 1.0]
        this.fogColor1 = [0x0E / 0xFF, 0x0B / 0xFF, 0x0A / 0xFF, 1.0]
        let fr = 0.5
        let fg = 0.8
        let fb = 1.0
        this.checkGlError("Pre startup")
        gl.clearColor(fr, fg, fb, 1.0)
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.setActive(Matrix.MODELVIEW)
        this.checkGlError("Startup")
        this.level = new Level(256, 256, 64)
        this.levelRenderer = new LevelRenderer(this.level, this.textures)
        this.player = new Player(this.level)
        this.particleEngine = new ParticleEngine(this.level, this.textures)
        this.checkGlError("Post startup")
    }

    private checkGlError(string: string): void {
        let errorCode = gl.getError()
        if (errorCode !== gl.NO_ERROR) {
            let errorString = ""
            console.log("########## GL ERROR ##########")
            console.log("@ " + string)
            console.log(errorCode + ": " + errorString)
        }
    }

    public destroy(): void {
        this.level?.save()
    }

    public run(): void {
        this.running = true
        this.init()
        this.frames = 0
        this.lastTime = Date.now()

        this.loop()
    }

    private loop(): void {
        if (this.running) {
            if (this.pause) {
                requestAnimationFrame(() => this.loop())
                return
            }
            this.timer.advanceTime()
            for (let i = 0; i < this.timer.ticks; i++) {
                this.tick()
            }
            this.checkGlError("Pre render")
            this.render(this.timer.a)
            this.checkGlError("Post render")
            this.frames++
            while (Date.now() >= this.lastTime + 1000) {
                this.fpsString = this.frames + " fps, " + Chunk.updates + " chunk updates"
                Chunk.updates = 0
                this.lastTime += 1000
                this.frames = 0
            }
            requestAnimationFrame(() => this.loop())
        } else {
            this.destroy()
        }
    }

    public stop(): void {
        this.running = false
    }

    public grabMouse(): void {
        if (this.mouseGrabbed) return
        this.mouseGrabbed = true
        this.parent.requestPointerLock()
    }

    private handleMouseClick(): void {
        if (this.editMode == 0) {
            if (this.hitResult != null) {
                let oldTile: Tile = Tile.tiles[this.level.getTile(this.hitResult.x, this.hitResult.y, this.hitResult.z)]
                let changed = this.level.setTile(this.hitResult.x, this.hitResult.y, this.hitResult.z, 0)
                if (oldTile != null && changed) {
                    oldTile.destroy(this.level, this.hitResult.x, this.hitResult.y, this.hitResult.z, this.particleEngine)
                }
            }
        } else if (this.hitResult != null) {
            let aabb: AABB;
            let x = this.hitResult.x
            let y = this.hitResult.y
            let z = this.hitResult.z
            if (this.hitResult.f == 0) {
                y--
            }
            if (this.hitResult.f == 1) {
                y++
            }
            if (this.hitResult.f == 2) {
                z--
            }
            if (this.hitResult.f == 3) {
                z++
            }
            if (this.hitResult.f == 4) {
                x--
            }
            if (this.hitResult.f == 5) {
                x++
            }
            if ((aabb = Tile.tiles[this.paintTexture].getAABB(x, y, z)) == null || this.isFree(aabb)) {
                this.level.setTile(x, y, z, this.paintTexture)
            }
        }
    }

    public tick(): void {
        this.mouseGrabbed = document.pointerLockElement == this.parent
        if (!this.mouseGrabbed && mouse.buttonPressed(MouseButton.LEFT) || mouse.buttonPressed(MouseButton.RIGHT)) {
            this.grabMouse()
        }
        if (this.mouseGrabbed) {
            // Mouse
            if (mouse.buttonPressed(MouseButton.LEFT)) {
                this.handleMouseClick()
            }
            if (mouse.buttonPressed(MouseButton.RIGHT)) {
                this.editMode = (this.editMode + 1) % 2
                console.log(this.editMode)
            }

            // Keyboard
            if (keyboard.keyJustPressed(Keys.ENTER)) {
                this.level.save()
            }
            if (keyboard.keyJustPressed(Keys.NUM1)) {
                this.paintTexture = Tiles.rock.id
            }
            if (keyboard.keyJustPressed(Keys.NUM2)) {
                this.paintTexture = Tiles.dirt.id
            }
            if (keyboard.keyJustPressed(Keys.NUM3)) {
                this.paintTexture = Tiles.stoneBrick.id
            }
            if (keyboard.keyJustPressed(Keys.NUM4)) {
                this.paintTexture = Tiles.bush.id
            }
            if (keyboard.keyJustPressed(Keys.NUM5)) {
                this.paintTexture = Tiles.wood.id
            }
            if (keyboard.keyJustPressed(Keys.Y)) {
                this.yMouseAxis *= -1
            }
        }
        this.level.tick()
        this.particleEngine.tick()
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].tick()
            if (this.entities[i].removed) {
                this.entities.splice(i--, 1)
            }
        }
        this.player.tick()
    }

    private isFree(aabb: AABB): boolean {
        if (this.player.bb.intersects(aabb)) {
            return false
        }
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].bb.intersects(aabb)) {
                return false
            }
        }
        return true
    }

    private moveCameraToPlayer(a: number): void {
        matrix.translate(0, 0, -0.3)
        matrix.rotate(this.player.xRot, 1, 0, 0)
        matrix.rotate(this.player.yRot, 0, 1, 0)
        let x = this.player.xo + (this.player.x - this.player.xo) * a
        let y = this.player.yo + (this.player.y - this.player.yo) * a
        let z = this.player.zo + (this.player.z - this.player.zo) * a
        matrix.translate(-x, -y, -z)
    }

    private setupCamera(a: number): void {
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.perspective(70, this.width / this.height, 0.05, 1000)
        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()
        this.moveCameraToPlayer(a)
    }

    private setupPickCamera(a: number, x: number, y: number): void {
        // TODO
    }

    private pick(a: number): void {
        this.hitResult = new HitResult(
            0, 
            Math.floor(this.player.x), 
            Math.floor(this.player.y - 2), 
            Math.floor(this.player.z),
            1
        )
    }

    public render(a: number): void {
        gl.viewport(0, 0, this.width, this.height)
        if (this.mouseGrabbed) {
            let xo = 0.0
            let yo = 0.0
            xo = mouse.delta.x
            yo = mouse.delta.y
            this.player.turn(xo, yo * this.yMouseAxis)
        }
        this.checkGlError("Set viewport")
        this.pick(a)
        this.checkGlError("Picked")
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this.setupCamera(a)
        this.checkGlError("Set up camera")
        gl.enable(gl.CULL_FACE)
        let frustum = Frustum.getFrustum()
        this.levelRenderer.updateDirtyChunks(this.player)
        this.checkGlError("Update chunks")
        this.setupFog(0)
        this.levelRenderer.render(this.player, 0)
        this.checkGlError("Rendered level")
        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i]
            if (entity.isLit() && frustum.isVisible(entity.bb)) {
                entity.render(a)
            }
        }
        this.checkGlError("Rendered entities")
        this.particleEngine.render(this.player, a, 0)
        this.checkGlError("Rendered particles")
        this.setupFog(1)
        this.particleEngine.render(this.player, a, 1)
        this.checkGlError("Rendered rest")
        if (this.hitResult != null) {
            this.levelRenderer.renderHit(this.hitResult, this.editMode, this.paintTexture)
        }
        this.checkGlError("Rendered hit")
        this.drawGui(a)
        this.checkGlError("Rendered gui")
        mouse.update()
        keyboard.update()
    }

    private drawGui(a: number): void {
        // TODO
    }

    private setupFog(i: number): void {
        // TODO
    }

    public static checkError(): void {
        // TODO
    }
}

export function main() {
    const canvas = document.createElement("canvas")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)

    let g = canvas.getContext("webgl")
    if (!g) throw new Error("Failed to get WebGL context")
    gl = g

    gl.getContextAttributes().antialias = false

    const minecraft = new Minecraft(canvas, canvas.width, canvas.height)
    minecraft.run()
}
