import { mouse } from "../Minecraft";
import { MouseEvent } from "./MouseEvent";

export class MouseEvents {
    private static mouseEventQueue: MouseEvent[] = []
    private static currentEvent: MouseEvent | null = null
    public static wheelUpdated: boolean = false
    public static dWheel: number = 0
    public static wheel: number = 0

    public static update(): void {
        for (let i: number = 0; i < mouse.keys.length; ++i) {
            if (mouse.buttonJustPressed(i)) {
                MouseEvents.mouseEventQueue.push(new MouseEvent(mouse.position.x, mouse.position.y, true, i, 0))
            }
            if (mouse.buttonJustReleased(i)) {
                MouseEvents.mouseEventQueue.push(new MouseEvent(mouse.position.x, mouse.position.y, false, i, 0))
            }
        }
        if (MouseEvents.wheelUpdated) {
            MouseEvents.mouseEventQueue.push(new MouseEvent(mouse.position.x, mouse.position.y, false, -1, MouseEvents.wheel))
            MouseEvents.wheelUpdated = false
            MouseEvents.wheel = 0
        }
    }

    public static next(): boolean {
        let event = MouseEvents.mouseEventQueue.shift()
        if (event) {
            MouseEvents.currentEvent = event
            return true
        }
        return false
    }
    
    public static getX(): number {
        return mouse.position.x
    }
    
    public static getY(): number {
        return mouse.position.y
    }
    
    public static getDX(): number {
        return mouse.delta.x
    }
    
    public static getDY(): number {
        return mouse.delta.y
    }
    
    public static setGrabbed(grab: boolean): void {
        return mouse.setLock(grab)
    }

    public static getDWheel(): number {
        let w = MouseEvents.dWheel
        MouseEvents.dWheel = 0
        return w
    }
    
    public static getEventX(): number {
        if (!MouseEvents.currentEvent) return 0
        return MouseEvents.currentEvent.x
    }
    
    public static getEventY(): number {
        if (!MouseEvents.currentEvent) return 0
        return MouseEvents.currentEvent.y
    }
    
    public static getEventButtonState(): boolean {
        if (!MouseEvents.currentEvent) return false
        return MouseEvents.currentEvent.state
    }
    
    public static getEventButton(): number {
        if (!MouseEvents.currentEvent) return -1
        return MouseEvents.currentEvent.button
    }

    public static getEventDWheel(): number {
        if (!MouseEvents.currentEvent) return 0
        return MouseEvents.currentEvent.wheel
    }
}