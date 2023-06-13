import { EventQueue } from "./EventQueue";

export class Keyboard {
    private static queue: EventQueue = new EventQueue()
    
    private static keyEvents: string[] = new Array(this.queue.getMaxEvents())
    private static keyEventStates: boolean[] = new Array(this.queue.getMaxEvents())
    private static nanoTimeEvents: number[] = new Array(this.queue.getMaxEvents())

    private static keysDown: string[] = []

    private static repeatEvents = false

    public static readonly KEYBOARD_SIZE = 256

    public static addKeyDownEvent(key: string) {
        if (this.repeatEvents) return
        this.keyEvents[this.queue.getNextPos()] = key
        this.keyEventStates[this.queue.getNextPos()] = true

        this.nanoTimeEvents[this.queue.getNextPos()] = Date.now()

        if (!this.keysDown.includes(key)) this.keysDown.push(key)

        this.queue.add()
    }

    public static addKeyUpEvent(key: string) {
        this.keyEvents[this.queue.getNextPos()] = key
        this.keyEventStates[this.queue.getNextPos()] = false

        this.nanoTimeEvents[this.queue.getNextPos()] = Date.now()

        if (this.keysDown.includes(key)) this.keysDown.splice(this.keysDown.indexOf(key), 1)

        this.queue.add()
    }

    public static addKeyPressEvent(key: string) {
        if (!this.repeatEvents) return
        this.keyEvents[this.queue.getNextPos()] = key
        this.keyEventStates[this.queue.getNextPos()] = true

        this.nanoTimeEvents[this.queue.getNextPos()] = Date.now()

        if (!this.keysDown.includes(key)) this.keysDown.push(key)

        this.queue.add()
    }

    public static areRepeatEventsEnabled(): boolean {
        return this.repeatEvents
    }

    public static create(): void {
    }

    public static isKeyDown(key: string): boolean {
        return this.keysDown.includes(key)
    }

    public static poll(): void {
    }

    public static enableRepeatEvents(enable: boolean) {
        this.repeatEvents = enable
    }

    public static isRepeatEvent() {
        return this.repeatEvents
    }

    public static next(): boolean {
        return this.queue.next()
    }

    public static getEventKey(): string {
        return this.keyEvents[this.queue.getCurrentPos()]
    }

    public static getEventKeyState(): boolean {
        return this.keyEventStates[this.queue.getCurrentPos()]
    }

    public static getEventNanoseconds(): number {
        return this.nanoTimeEvents[this.queue.getCurrentPos()]
    }
}