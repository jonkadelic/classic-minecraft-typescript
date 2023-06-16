import { RenderBuffer } from "../../../util/RenderBuffer";
import { Tesselator } from "../renderer/Tesselator";
import { Font } from "./Font";

export class Gui {
    protected imgZ: number

    protected static drawBox(buffer: RenderBuffer, x0: number, y0: number, x1: number, y1: number, color: number): void {
        // TODO
    }

    protected static drawFadingBox(buffer: RenderBuffer, x0: number, y0: number, x1: number, y1: number, color0: number, color1: number): void {
        // TODO
    }

    public static text(font: Font, text: string, x: number, y: number, color: number): void {
        font.drawShadow(text, x, y, color)
    }

    public static textCentered(font: Font, text: string, x: number, y: number, color: number): void {
        font.drawShadow(text, x - Math.trunc(font.width(text) / 2), y, color)
    }

    public image(buffer: RenderBuffer, x: number, y: number, imgX: number, imgY: number, w: number, h: number): void {
        let pw = 1 / 256
        let ph = 1 / 256
        let t = Tesselator.instance
        t.init()
        t.vertexUV(x, y + h, this.imgZ, imgX / pw, (imgY + h) / ph)
        t.vertexUV(x + w, y + h, this.imgZ, (imgX + w) / pw, (imgY + h) / ph)
        t.vertexUV(x + w, y, this.imgZ, (imgX + w) / pw, imgY / ph)
        
        t.vertexUV(x + w, y, this.imgZ, (imgX + w) / pw, imgY / ph)
        t.vertexUV(x, y, this.imgZ, imgX / pw, imgY / ph)
        t.vertexUV(x, y + h, this.imgZ, imgX / pw, (imgY + h) / ph)
        t.flush(buffer)
        buffer.draw()
    }
}