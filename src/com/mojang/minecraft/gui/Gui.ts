import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, shader } from "../Minecraft";
import { Tesselator } from "../renderer/Tesselator";
import { Font } from "./Font";

export class Gui {
    protected imgZ: number = 0

    public constructor() {}

    protected static fill(buffer: RenderBuffer, x0: number, y0: number, x1: number, y1: number, color: number): void {
        let a = (col >> 24 & 0xFF) / 255.0
		let r = (col >> 16 & 0xFF) / 255.0
		let g = (col >> 8 & 0xFF) / 255.0
		let b = (col & 0xFF) / 255.0
		let t = Tesselator.instance
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		t.init()
        t.color_f(r, g, b, a)
		t.vertex(x0, y1, 0)
		t.vertex(x1, y1, 0)
		t.vertex(x1, y0, 0)

		t.vertex(x1, y0, 0)
		t.vertex(x0, y0, 0)
		t.vertex(x0, y1, 0)
		t.flush(buffer)
        buffer.draw()
		gl.disable(gl.BLEND)
    }

    protected static fillGradient(buffer: RenderBuffer, x0: number, y0: number, x1: number, y1: number, color0: number, color1: number): void {
        let a0 = (n5 >>> 24) / 255.0
		let r0 = (n5 >> 16 & 0xFF) / 255.0
		let g0 = (n5 >> 8 & 0xFF) / 255.0
		let b0 = (n5 & 0xFF) / 255.0
		let a1 = (n6 >>> 24) / 255.0
		let r1 = (n6 >> 16 & 0xFF) / 255.0
		let g1 = (n6 >> 8 & 0xFF) / 255.0
		let b1 = (n6 & 0xFF) / 255.0
		let t = Tesselator.instance
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		t.init();
		t.color_f(r0, g0, b0, a0)
		t.vertex(x1, y0, 0)
		t.vertex(x0, y0, 0)
		t.color_f(r1, g1, b1, a1)
		t.vertex(x0, y1, 0)

		t.vertex(x0, y1, 0)
		t.vertex(x1, y1, 0)
		t.color_f(r0, g0, b0, a0)
		t.vertex(x1, y0, 0)
		t.flush(buffer)
        buffer.draw()
		gl.disable(gl.BLEND)
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
        t.vertexUV(x, y + h, this.imgZ, imgX * pw, (imgY + h) * ph);
        t.vertexUV(x + w, y + h, this.imgZ, (imgX + w) * pw, (imgY + h) * ph);
        t.vertexUV(x + w, y, this.imgZ, (imgX + w) * pw, imgY * ph);

        t.vertexUV(x + w, y, this.imgZ, (imgX + w) * pw, imgY * ph);
        t.vertexUV(x, y, this.imgZ, imgX * pw, imgY * ph);
        t.vertexUV(x, y + h, this.imgZ, imgX * pw, (imgY + h) * ph);
        t.flush(buffer)
        buffer.draw()
    }
}