import { keyboard } from "../Minecraft";
import { KeyboardEvent } from "./KeyboardEvent";

export class KeyboardEvents {
    private static keyboardEventQueue: KeyboardEvent[] = []
    private static currentEvent: KeyboardEvent | null = null

    public static update(): void {
        for (let i: number = 0; i < keyboard.keys.length; ++i) {
            if (keyboard.keyJustPressed(i)) {
                KeyboardEvents.keyboardEventQueue.push(new KeyboardEvent(true, i))
            }
            if (keyboard.keyJustReleased(i)) {
                KeyboardEvents.keyboardEventQueue.push(new KeyboardEvent(false, i))
            }
        }
    }

    public static next(): boolean {
        let event = KeyboardEvents.keyboardEventQueue.shift()
        if (event) {
            KeyboardEvents.currentEvent = event
            return true
        }
        return false
    }
    
    public static getEventKeyState(): boolean {
        if (!KeyboardEvents.currentEvent) return false
        return KeyboardEvents.currentEvent.state
    }
    
    public static getEventKey(): number {
        if (!KeyboardEvents.currentEvent) return -1
        return KeyboardEvents.currentEvent.key
    }
}