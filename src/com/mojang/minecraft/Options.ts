import { Keyboard } from "../../util/input/Keyboard";
import { KeyMapping } from "./KeyMapping";
import { Minecraft } from "./Minecraft";

export class Options {
    private static readonly renderDistanceNames: string[] = ["FAR", "NORMAL", "SHORT", "TINY"]
    public music: boolean = true
    public sound: boolean = true
    public invertYMouse: boolean = false
    public showFrameRate: boolean = false
    public viewDistance: number = 0
    public bobView: boolean = true
    public limitFramerate: boolean = false
    public keyUp: KeyMapping = new KeyMapping("Forward", Keyboard.KEY_W)
    public keyLeft: KeyMapping = new KeyMapping("Left", Keyboard.KEY_A)
    public keyDown: KeyMapping = new KeyMapping("Back", Keyboard.KEY_S)
    public keyRight: KeyMapping = new KeyMapping("Right", Keyboard.KEY_D)
    public keyJump: KeyMapping = new KeyMapping("Jump", Keyboard.KEY_SPACE)
    public keyBuild: KeyMapping = new KeyMapping("Build", Keyboard.KEY_B)
    public keyChat: KeyMapping = new KeyMapping("Chat", Keyboard.KEY_T)
    public keyToggleFog: KeyMapping = new KeyMapping("Toggle fog", Keyboard.KEY_F)
    public keySaveLocation: KeyMapping = new KeyMapping("Save location", Keyboard.KEY_RETURN)
    public keyLoadLocation: KeyMapping = new KeyMapping("Load location", Keyboard.KEY_R)
    public keyMappings: KeyMapping[] = [
        this.keyUp, 
        this.keyLeft, 
        this.keyDown, 
        this.keyRight, 
        this.keyJump, 
        this.keyBuild, 
        this.keyChat, 
        this.keyToggleFog, 
        this.keySaveLocation, 
        this.keyLoadLocation
    ]
    private minecraft: Minecraft
    public numOptions: number = 7

    constructor(minecraft: Minecraft) {
        this.minecraft = minecraft
        this.load()
    }

    public getKeyString(key: number): string {
        return this.keyMappings[key].name + ": " + this.keyMappings[key].defaultKey
    }

    public setKey(key: number, value: string): void {
        this.keyMappings[key].defaultKey = value
        this.save()
    }

    public setValue(i: number, value: number): void {
        switch (i) {
            case 0:
                this.music = !this.music
                break
            case 1:
                this.sound = !this.sound
                break
            case 2:
                this.invertYMouse = !this.invertYMouse
                break
            case 3:
                this.showFrameRate = !this.showFrameRate
                break
            case 4:
                this.viewDistance = this.viewDistance + value & 3
                break
            case 5:
                this.bobView = !this.bobView
                break
            case 6:
                this.limitFramerate = !this.limitFramerate
                break
        }
        this.save()
    }

    public getMessage(i: number): string {
        switch (i) {
            case 0:
                return "Music: " + (this.music ? "ON" : "OFF")
            case 1:
                return "Sound: " + (this.sound ? "ON" : "OFF")
            case 2:
                return "Invert mouse: " + (this.invertYMouse ? "ON" : "OFF")
            case 3:
                return "Show FPS: " + (this.showFrameRate ? "ON" : "OFF")
            case 4:
                return "Render distance: " + Options.renderDistanceNames[this.viewDistance]
            case 5:
                return "View bobbing: " + (this.bobView ? "ON" : "OFF")
            case 6:
                return "Limit framerate: " + (this.limitFramerate ? "ON" : "OFF")
            default:
                return ""
        }
    }

    private load(): void {
        let str = localStorage.getItem("options")
        if (str == null) {
            return
        }
        let obj = JSON.parse(str)
        if ("music" in obj) {
            this.music = obj["music"]
        }
        if ("sound" in obj) {
            this.sound = obj["sound"]
        }
        if ("invertYMouse" in obj) {
            this.invertYMouse = obj["invertYMouse"]
        }
        if ("showFrameRate" in obj) {
            this.showFrameRate = obj["showFrameRate"]
        }
        if ("viewDistance" in obj) {
            this.viewDistance = obj["viewDistance"]
        }
        if ("bobView" in obj) {
            this.bobView = obj["bobView"]
        }
        if ("limitFramerate" in obj) {
            this.limitFramerate = obj["limitFramerate"]
        }
        for (let i = 0; i < this.keyMappings.length; i++) {
            if ("key_" + this.keyMappings[i].name in obj) {
                this.keyMappings[i].defaultKey = obj["key_" + this.keyMappings[i].name]
            }
        }
    }

    private save(): void {
        let obj = {
            "music": this.music,
            "sound": this.sound,
            "invertYMouse": this.invertYMouse,
            "showFrameRate": this.showFrameRate,
            "viewDistance": this.viewDistance,
            "bobView": this.bobView,
            "limitFramerate": this.limitFramerate,
        }
        for (let i = 0; i < this.keyMappings.length; i++) {
            // @ts-ignore
            obj["key_" + this.keyMappings[i].name] = this.keyMappings[i].defaultKey
        }
        let str = JSON.stringify(obj)
        localStorage.setItem("options", str)
    }
}