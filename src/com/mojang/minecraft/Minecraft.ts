import { Mouse, MouseButton } from "syncinput";
import { Timer } from "./Timer";
import { Level } from "./level/Level";
import { LevelRenderer } from "./level/LevelRenderer";
import { Player } from "./player/Player";
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
import { Vec3 } from "./character/Vec3";
import { RenderBuffer } from "../../util/RenderBuffer";
import { Tesselator } from "./renderer/Tesselator";
import { Font } from "./gui/Font";
import { Zombie } from "./character/Zombie";
import { Screen } from "./gui/Screen";
import { PauseScreen } from "./gui/PauseScreen";
import { MouseEvents } from "./input/MouseEvents";
import { KeyboardInput } from "./player/KeyboardInput";
import { SelectBlockScreen } from "./gui/BlockSelectScreen";
import { GameRenderer } from "./renderer/GameRenderer";
import { User } from "./User";
import { Gui } from "./gui/Gui";
import { Options } from "./Options";
import { Key, Keyboard } from "../../util/input/Keyboard";
import { LevelGenerator } from "./level/levelgen/RandomLevelSource";

export let gl: WebGLRenderingContext
export let mouse: any
export let keyboard: Keyboard
export let matrix = new Matrix()
export let shader: Shader = new Shader()
export let clickedElement: HTMLElement | null = null

export class Minecraft {
    public static readonly VERSION_STRING = "0.30"
    public width: number
    public height: number
    private fogColor: number[] = new Array(4)
    private timer: Timer = new Timer(20)
    // @ts-ignore
    public level: Level
    // @ts-ignore
    private levelRenderer: LevelRenderer
    // @ts-ignore
    public player: Player
    // @ts-ignore
    private particleEngine: ParticleEngine
    private entities: Entity[] = []
    private parent: HTMLCanvasElement
    public paused: boolean = false
    private yMouseAxis: number = -1
    public textures: Textures
    // @ts-ignore
    public font: Font
    public screen: Screen | null = null
    public gameRenderer: GameRenderer = new GameRenderer(this)
    // @ts-ignore
    public gui: Gui
    private running: boolean = false
    private fpsString: string = ""
    private mouseGrabbed: boolean = false
    private hitResult: HitResult | null = null
    // @ts-ignore
    public options: Options
    
    private frames: number = 0
    private lastTime: number = 0

    private guiBuffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)

    public constructor(parent: HTMLCanvasElement, width: number, height: number) {
        this.parent = parent
        this.width = width
        this.height = height
        this.textures = new Textures()
        this.textures.preloadTextures()

        mouse = new Mouse(parent)
        mouse.setCanvas(parent)
        keyboard = new Keyboard()
    }

    public init(): void {
        fetch("shader/base.vert")
            .then(response => response.text())
            .then(text => {
                fetch("shader/base.frag")
                    .then(response => response.text())
                    .then(text2 => {
                        shader.init(text, text2)
                    })
            })

        this.fogColor = [0xFF / 0xFF, 0xFF / 0xFF, 0xFF / 0xFF, 1.0]
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
        this.options = new Options(this)
        this.level = new LevelGenerator().create("default", 256, 256, 64)
        this.levelRenderer = new LevelRenderer(this.level, this.textures)
        this.player = new Player(this.level)
        this.player.input = new KeyboardInput(this.options)
        // TODO make GameMode classes and move this to the creative gamemode apply(Player)
        for (let i: number = 0; i < 9; ++i) {
            this.player.inventory.count[i] = 1
            if (this.player.inventory.slots[i] <= 0) {
                this.player.inventory.slots[i] = User.tiles[i].id
            }
        }
        this.particleEngine = new ParticleEngine(this.level, this.textures)
        this.font = new Font("./default.png", this.textures)
        for (let i = 0; i < 10; i++) {
            let zombie = new Zombie(this.level, this.textures, 128, 0, 128)
            zombie.resetPos()
            this.entities.push(zombie)
        }
        this.checkGlError("Post startup")
        this.gui = new Gui(this)

        window.onunload = () => {
            this.destroy()
        }
    }

    public updateSize(width: number, height: number): void {
        this.width = width
        this.height = height
        if (this.screen !== null) {
            let screenWidth = Math.trunc(this.width * 240 / this.height)
            let screenHeight = Math.trunc(this.height * 240 / this.height)
            this.screen.init(this, screenWidth, screenHeight)
        }
    }

    public setScreen(screen: Screen | null): void {
        if (this.screen !== null) {
            this.screen.removed()
        }
        // survival death screen would go here
        this.screen = screen
        if (screen !== null) {
            if (this.mouseGrabbed) {
                this.mouseGrabbed = false
                MouseEvents.setGrabbed(false)
            }
            let screenWidth = Math.trunc(this.width * 240 / this.height)
            let screenHeight = Math.trunc(this.height * 240 / this.height)
            screen.init(this, screenWidth, screenHeight)
            // this.online = false;
        } else {
            this.grabMouse()
        }
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
            mouse.update()
            if (this.paused) {
                requestAnimationFrame(() => this.loop())
                return
            }
            MouseEvents.update() // lwjgl
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
        MouseEvents.setGrabbed(true)
    }

    public pause(): void {
        if (this.screen == null) {
            this.setScreen(new PauseScreen())
        }
    }

    private handleMouseClick(click: number): void {
        let selected = this.player.inventory.getSelected()
        if (click == 0) {
            if (this.hitResult != null) {
                let oldTile: Tile = Tile.tiles[this.level.getTile(this.hitResult.x, this.hitResult.y, this.hitResult.z)]
                let changed = this.level.setTile(this.hitResult.x, this.hitResult.y, this.hitResult.z, 0)
                if (oldTile != null && changed) {
                    oldTile.destroy(this.level, this.hitResult.x, this.hitResult.y, this.hitResult.z, this.particleEngine)
                }
            }
        } else if (click == 1 && this.hitResult != null && selected > 0) {
            let aabb: AABB | null
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
            aabb = Tile.tiles[selected].getAABB(x, y, z)
            if (aabb == null || this.isFree(aabb)) {
                this.level.setTile(x, y, z, selected)
            }
        }
    }

    public tick(): void {
        let oldGrabbed = this.mouseGrabbed
        this.mouseGrabbed = document.pointerLockElement == this.parent
        //mouse.setLock(this.mouseGrabbed) // this wasn't actually doing anything
        /*if (this.screen == null && !this.mouseGrabbed && clickedElement == this.parent && (mouse.buttonPressed(MouseButton.LEFT) || mouse.buttonPressed(MouseButton.RIGHT))) {
            this.grabMouse()
            this.mouse0 = true
            this.mouse1 = true
        } else if (this.mouseGrabbed) {
            
        }*/
        if (this.screen == null || this.screen.passEvents) {
            // Mouse
            if (this.screen == null) {
                while (MouseEvents.next()) {
                    if (MouseEvents.getEventDWheel() != 0) {
                        this.player.inventory.swapPaint(MouseEvents.getEventDWheel())
                    }
                    if (!this.mouseGrabbed && MouseEvents.getEventButtonState() && clickedElement == this.parent) {
                        this.grabMouse();
                    } else {
                        if (MouseEvents.getEventButton() == MouseButton.LEFT && MouseEvents.getEventButtonState()) {
                            this.handleMouseClick(0)
                        }
                        if (MouseEvents.getEventButton() == MouseButton.RIGHT && MouseEvents.getEventButtonState()) {
                            this.handleMouseClick(1)
                        }
                    }
                }
                /*if (mouse.buttonPressed(MouseButton.LEFT)) {
                    if (!this.mouse0) {
                        this.mouse0 = true
                        this.handleMouseClick(this.editMode)
                    }
                } else {
                    this.mouse0 = false
                }
                if (mouse.buttonPressed(MouseButton.RIGHT)) {
                    if (!this.mouse1) {
                        this.mouse1 = true
                        this.editMode = (this.editMode + 1) % 2
                    }
                } else {
                    this.mouse1 = false
                }*/
            }

            // Keyboard
            if (!this.mouseGrabbed && this.mouseGrabbed != oldGrabbed) {
                this.pause()
            }
            while (keyboard.next()) {
                this.player.setKey(keyboard.getEventKey() as Key, keyboard.getEventKeyState() as boolean)
                if (this.screen != null) {
                    this.screen.keyboardEvent()
                }
                if (keyboard.getEventKeyState()) {
                    if (this.screen == null) {
                        if (keyboard.getEventKey() == Keyboard.KEY_RETURN) {
                            this.level.save()
                        }
                        if (keyboard.getEventKey() == Keyboard.KEY_Y) {
                            this.yMouseAxis *= -1
                        }
                        if (keyboard.getEventKey() == Keyboard.KEY_G) {
                            this.entities.push(new Zombie(this.level, this.textures, this.player.x, this.player.y, this.player.z))
                        }
                        if (keyboard.getEventKey() == Keyboard.KEY_B) {
                            this.setScreen(new SelectBlockScreen())
                        }
                    }
                    for (let i: number = 0; i < 9; ++i) {
                        if (keyboard.getEventKey() == (i + 1).toString()) {
                            this.player.inventory.selected = i
                        }
                    }
                }
                // toggle fog key here
            }
        }
        if (this.screen != null) {
            this.screen.updateEvents()
            if (this.screen != null) {
                this.screen.tick()
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

    private pick(a: number): void {
        let yRot = this.player.yRot
        let xRot = this.player.xRot
        let cosY = Math.cos(-yRot * Math.PI / 180 - Math.PI)
        let sinY = Math.sin(-yRot * Math.PI / 180 - Math.PI)
        let cosX = Math.cos(-xRot * Math.PI / 180)
        let sinX = Math.sin(-xRot * Math.PI / 180)
        let pickRange = 5.0
        let offsetX = sinY * cosX
        let offsetY = sinX
        let offsetZ = cosY * cosX
        let playerVec = new Vec3(this.player.x, this.player.y, this.player.z)
        let endVec = playerVec.add(offsetX * pickRange, offsetY * pickRange, offsetZ * pickRange)
        this.hitResult = this.level.clip(playerVec, endVec)
    }

    public render(a: number): void {
        if (!shader.isLoaded()) return
        let screenWidth = Math.trunc(this.width * 240 / this.height)
        let screenHeight = Math.trunc(this.height * 240 / this.height)
        let mx = MouseEvents.getX() * screenWidth / this.width
        let my = MouseEvents.getY() * screenHeight / this.height
        if (this.level != null) {
            gl.viewport(0, 0, this.width, this.height)
            if (this.mouseGrabbed && document.pointerLockElement === this.parent) {
                let xo = 0.0
                let yo = 0.0
                xo = MouseEvents.getDX()
                yo = MouseEvents.getDY()
                if (Math.abs(xo) < 500)
                {
                    this.player.turn(xo, yo * this.yMouseAxis)
                }
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
            this.setupFog()
            gl.uniform1f(shader.getUniformLocation("uHasFog"), 1)
            this.levelRenderer.render(this.player, 0)
            this.checkGlError("Rendered level")
            for (let i = 0; i < this.entities.length; i++) {
                let entity = this.entities[i]
                if (frustum.isVisible(entity.bb)) {
                    entity.render(a)
                }
            }
            this.checkGlError("Rendered entities")
            this.particleEngine.render(this.player, a, 0)
            this.checkGlError("Rendered particles")
            gl.uniform1f(shader.getUniformLocation("uHasFog"), 0)
            if (this.hitResult != null) {
                this.levelRenderer.renderHit(this.hitResult)
            }
            this.checkGlError("Rendered hit")
            this.gui.render(this.guiBuffer, a, this.screen != null, mx, my)
        } else {
            gl.viewport(0, 0, this.width, this.height)
            gl.clearColor(0.0, 0.0, 0.0, 0.0)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            matrix.setActive(Matrix.PROJECTION)
            matrix.loadIdentity()
            matrix.setActive(Matrix.MODELVIEW)
            matrix.loadIdentity()
            this.gameRenderer.setupGuiCamera()
        }
        if (this.screen != null) {
            this.screen.render(this.guiBuffer, mx, my)
        }
        this.checkGlError("Rendered gui")
    }

    private setupFog(): void {
        if (!shader.isLoaded()) return
        shader.use()
        gl.uniform1f(shader.getUniformLocation("uFogDensity"), 0.001)
        gl.uniform4fv(shader.getUniformLocation("uFogColor"), this.fogColor)
        shader.setColor(1, 1, 1, 1)
    }

    public static checkError(): void {
        // TODO
    }
}

export function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    let g = canvas.getContext("webgl", {antialias: false})
    if (!g) throw new Error("Failed to get WebGL context")
    gl = g

    window.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).code == "Space" && clickedElement == canvas) {
            e.preventDefault()
        }
    })

    window.addEventListener("mousedown", (e) => {
        clickedElement = e.target as HTMLElement
    })

    window.addEventListener("wheel", (e) => {
        if (e.deltaY == 0) return
        MouseEvents.wheelUpdated = true
        MouseEvents.wheel -= (e.deltaY > 0 ? 1 : -1)
        MouseEvents.dWheel -= (e.deltaY > 0 ? 1 : -1)
    })

    window.addEventListener("resize", () => {
        if (window.innerHeight == screen.height) {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            canvas.style.position = "fixed"
            canvas.style.left = "0px"
            canvas.style.top = "0px"
        } else {
            canvas.width = 854
            canvas.height = 480
            canvas.style.position = "static"
        }
        console.log("Resized to " + canvas.width + "x" + canvas.height)
        minecraft.updateSize(canvas.width, canvas.height)
    })

    const minecraft = new Minecraft(canvas, canvas.width, canvas.height)
    minecraft.run()
}
