export class Input {
    public xxa: number = 0
    public yya: number = 0
    public jumping: boolean = false

    public tick(): void {}
    public releaseAllKeys(): void {}
    public setKeyState(key: string, state: boolean): void {}
}