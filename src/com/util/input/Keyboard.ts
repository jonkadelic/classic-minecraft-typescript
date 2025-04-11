export type Key = string

export class Keyboard {

    public static readonly KEY_ESCAPE: Key = "ESCAPE"
    public static readonly KEY_1: Key = "1"
    public static readonly KEY_2: Key = "2"
    public static readonly KEY_3: Key = "3"
    public static readonly KEY_4: Key = "4"
    public static readonly KEY_5: Key = "5"
    public static readonly KEY_6: Key = "6"
    public static readonly KEY_7: Key = "7"
    public static readonly KEY_8: Key = "8"
    public static readonly KEY_9: Key = "9"
    public static readonly KEY_0: Key = "0"
    public static readonly KEY_MINUS: Key = "-"
    public static readonly KEY_EQUALS: Key = "="
    public static readonly KEY_BACK: Key = "BACKSPACE"
    public static readonly KEY_TAB: Key = "TAB"
    public static readonly KEY_Q: Key = "Q"
    public static readonly KEY_W: Key = "W"
    public static readonly KEY_E: Key = "E"
    public static readonly KEY_R: Key = "R"
    public static readonly KEY_T: Key = "T"
    public static readonly KEY_Y: Key = "Y"
    public static readonly KEY_U: Key = "U"
    public static readonly KEY_I: Key = "I"
    public static readonly KEY_O: Key = "O"
    public static readonly KEY_P: Key = "P"
    public static readonly KEY_LBRACKET: Key = "["
    public static readonly KEY_RBRACKET: Key = "]"
    public static readonly KEY_RETURN: Key = "ENTER"
    public static readonly KEY_CONTROL: Key = "CONTROL"
    public static readonly KEY_A: Key = "A"
    public static readonly KEY_S: Key = "S"
    public static readonly KEY_D: Key = "D"
    public static readonly KEY_F: Key = "F"
    public static readonly KEY_G: Key = "G"
    public static readonly KEY_H: Key = "H"
    public static readonly KEY_J: Key = "J"
    public static readonly KEY_K: Key = "K"
    public static readonly KEY_L: Key = "L"
    public static readonly KEY_SEMICOLON: Key = ";"
    public static readonly KEY_APOSTROPHE: Key = "'"
    public static readonly KEY_GRAVE: Key = "`"
    public static readonly KEY_SHIFT: Key = "SHIFT"
    public static readonly KEY_BACKSLASH: Key = "\\"
    public static readonly KEY_Z: Key = "Z"
    public static readonly KEY_X: Key = "X"
    public static readonly KEY_C: Key = "C"
    public static readonly KEY_V: Key = "V"
    public static readonly KEY_B: Key = "B"
    public static readonly KEY_N: Key = "N"
    public static readonly KEY_M: Key = "M"
    public static readonly KEY_COMMA: Key = ","
    public static readonly KEY_PERIOD: Key = "."
    public static readonly KEY_SLASH: Key = "/"
    public static readonly KEY_MULTIPLY: Key = "*"
    public static readonly KEY_LMENU: Key = "ALT"
    public static readonly KEY_SPACE: Key = " "
    public static readonly KEY_CAPITAL: Key = "CAPSLOCK"
    public static readonly KEY_F1: Key = "F1"
    public static readonly KEY_F2: Key = "F2"
    public static readonly KEY_F3: Key = "F3"
    public static readonly KEY_F4: Key = "F4"
    public static readonly KEY_F5: Key = "F5"
    public static readonly KEY_F6: Key = "F6"
    public static readonly KEY_F7: Key = "F7"
    public static readonly KEY_F8: Key = "F8"
    public static readonly KEY_F9: Key = "F9"
    public static readonly KEY_F10: Key = "F10"
    public static readonly KEY_NUMLOCK: Key = "NUMLOCK"
    public static readonly KEY_SCROLL: Key = "SCROLLLOCK"
    public static readonly KEY_F11: Key = "F11"
    public static readonly KEY_F12: Key = "F12"
    public static readonly KEY_F13: Key = "F13"
    public static readonly KEY_F14: Key = "F14"
    public static readonly KEY_F15: Key = "F15"
    public static readonly KEY_F16: Key = "F16"
    public static readonly KEY_F17: Key = "F17"
    public static readonly KEY_F18: Key = "F18"
    public static readonly KEY_F19: Key = "F19"
    public static readonly KEY_AT: Key = "@"
    public static readonly KEY_COLON: Key = ":"
    public static readonly KEY_UNDERLINE: Key = "_"
    public static readonly KEY_PAUSE: Key = "PAUSE"
    public static readonly KEY_HOME: Key = "HOME"
    public static readonly KEY_UP: Key = "ARROWUP"
    public static readonly KEY_PRIOR: Key = "PAGEUP"
    public static readonly KEY_LEFT: Key = "ARROWLEFT"
    public static readonly KEY_RIGHT: Key = "ARROWRIGHT"
    public static readonly KEY_END: Key = "END"
    public static readonly KEY_DOWN: Key = "ARROWDOWN"
    public static readonly KEY_NEXT: Key = "PAGEDOWN"
    public static readonly KEY_INSERT: Key = "INSERT"
    public static readonly KEY_DELETE: Key = "DELETE"

    private static readonly MAX_EVENTS = 32
    private repeatEnabled = false
    private eventQueue: KeyEvent[] = []
    private currentEvent: KeyEvent | null = null

    constructor() {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            event.preventDefault()
            if (!this.repeatEnabled && event.repeat) {
                return
            }
            while (this.eventQueue.length >= Keyboard.MAX_EVENTS) {
                this.eventQueue.shift()
            }
            this.eventQueue.push(new KeyEvent(event.key.toLocaleUpperCase(), true, event.repeat))
        }, true)

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            event.preventDefault()
            while (this.eventQueue.length >= Keyboard.MAX_EVENTS) {
                this.eventQueue.shift()
            }
            this.eventQueue.push(new KeyEvent(event.key.toLocaleUpperCase(), false, false))
        }, true)
    }

    public areRepeatEventsEnabled(): boolean {
        return this.repeatEnabled
    }

    public enableRepeatEvents(enable: boolean): void {
        this.repeatEnabled = enable
    }

    public getEventCharacter(): string | null {
        if (this.currentEvent == null) {
            return null
        }
        let c = this.currentEvent.getKey()
        if (c.length == 1) {
            return c
        }
        return null
    }

    public getEventKey(): Key | null {
        if (this.currentEvent == null) {
            return null
        }
        if (this.currentEvent.getKey().length == 1) {
            return this.currentEvent.getKey()
        }
        return this.currentEvent.getKey()
    }

    public getEventKeyState(): boolean | null {
        if (this.currentEvent == null) {
            return null
        }
        return this.currentEvent.getState()
    }

    public getKeyName(key: Key): string {
        return key
    }

    public getNumKeyboardEvents(): number {
        return this.eventQueue.length + (this.currentEvent == null ? 0 : 1)
    }

    public isKeyDown(key: Key): boolean {
        let down = false
        for (let event of this.eventQueue) {
            if (event.getKey() == key) {
                down = event.getState()
            }
        }
        if (this.currentEvent != null && this.currentEvent.getKey() == key) {
            down = this.currentEvent.getState()
        }
        return down
    }

    public isRepeatEvent(): boolean {
        if (this.currentEvent == null) {
            return false
        }
        return this.currentEvent.isRepeat()
    }

    public next(): boolean {
        if (this.eventQueue.length > 0) {
            this.currentEvent = this.eventQueue.shift() as KeyEvent
            return true
        }
        return false
    }
}

class KeyEvent {
    private key: Key
    private repeat: boolean
    private state: boolean

    constructor(key: Key, state: boolean, repeat: boolean) {
        this.key = key
        this.state = state
        this.repeat = repeat
    }

    public getKey(): string {
        return this.key
    }

    public getState(): boolean {
        return this.state
    }

    public isRepeat(): boolean {
        return this.repeat
    }
}