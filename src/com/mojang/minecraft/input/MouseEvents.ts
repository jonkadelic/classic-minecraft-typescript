import { mouse } from "../Minecraft";
import { MouseEvent } from "./MouseEvent";

export class MouseEvents {
    private static mouseEventQueue: MouseEvent[] = []
    private static currentEvent: MouseEvent | null = null

    public static update(): void {
        for (let i: number = 0; i < mouse.keys.length; ++i) {
            if (mouse.buttonJustPressed(i)) {
                MouseEvents.mouseEventQueue.push(new MouseEvent(mouse.position.x, mouse.position.y, true, i, mouse.wheel))
            }
            if (mouse.buttonJustReleased(i)) {
                MouseEvents.mouseEventQueue.push(new MouseEvent(mouse.position.x, mouse.position.y, false, i, mouse.wheel))
            }
        }
        if (mouse.wheelUpdated) {
            MouseEvents.mouseEventQueue.push(new MouseEvent(mouse.position.x, mouse.position.y, false, -1, mouse.wheel))
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

    public static getDWheel(): number {
        return mouse.wheel
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
        if (!MouseEvents.currentEvent) return false
        return MouseEvents.currentEvent.button
    }

    public static getEventDWheel(): number {
        if (!MouseEvents.currentEvent) return -1
        return MouseEvents.currentEvent.wheel
    }
}