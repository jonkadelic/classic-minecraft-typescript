export abstract class DynamicTexture {
    public pixels: Uint8Array = new Uint8Array(1024)
    public tex: number

    public constructor(tex: number) {
        this.tex = tex
    }

    public abstract tick(): void
}