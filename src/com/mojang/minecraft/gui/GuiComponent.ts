import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, shader } from "../Minecraft";
import { Tesselator } from "../renderer/Tesselator";
import { Font } from "./Font";

export class GuiComponent {
    protected blitOffset: number = 0

    public constructor() {}

    protected static fill(buffer: RenderBuffer, x0: number, y0: number, x1: number, y1: number, col: number): void {
        let a = (col >> 24 & 0xFF) / 255.0
		let r = (col >> 16 & 0xFF) / 255.0
		let g = (col >> 8 & 0xFF) / 255.0
		let b = (col & 0xFF) / 255.0
		let t = Tesselator.instance
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		t.begin()
        t.color_f(r, g, b, a)
		t.vertex(x0, y1, 0)
		t.vertex(x1, y1, 0)
		t.vertex(x1, y0, 0)

		t.vertex(x1, y0, 0)
		t.vertex(x0, y0, 0)
		t.vertex(x0, y1, 0)
		t.end(buffer)
        buffer.draw()
		gl.disable(gl.BLEND)
    }

    protected static fillGradient(buffer: RenderBuffer, x0: number, y0: number, x1: number, y1: number, col0: number, col1: number): void {
        let a0 = (col0 >>> 24) / 255.0
		let r0 = (col0 >> 16 & 0xFF) / 255.0
		let g0 = (col0 >> 8 & 0xFF) / 255.0
		let b0 = (col0 & 0xFF) / 255.0
		let a1 = (col1 >>> 24) / 255.0
		let r1 = (col1 >> 16 & 0xFF) / 255.0
		let g1 = (col1 >> 8 & 0xFF) / 255.0
		let b1 = (col1 & 0xFF) / 255.0
		let t = Tesselator.instance
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		t.begin();
		t.color_f(r0, g0, b0, a0)
		t.vertex(x1, y0, 0)
		t.vertex(x0, y0, 0)
		t.color_f(r1, g1, b1, a1)
		t.vertex(x0, y1, 0)

		t.vertex(x0, y1, 0)
		t.vertex(x1, y1, 0)
		t.color_f(r0, g0, b0, a0)
		t.vertex(x1, y0, 0)
		t.end(buffer)
        buffer.draw()
		gl.disable(gl.BLEND)
    }

    public static drawString(font: Font, text: string, x: number, y: number, color: number): void {
        font.drawShadow(text, x, y, color)
    }

    public static drawCenteredString(font: Font, text: string, x: number, y: number, color: number): void {
        font.drawShadow(text, x - Math.trunc(font.width(text) / 2), y, color)
    }

    public blit(buffer: RenderBuffer, x: number, y: number, u: number, v: number, width: number, height: number): void {
        let pw = 1 / 256
        let ph = 1 / 256
        let t = Tesselator.instance
        t.begin()
        t.vertexUV(x, y + height, this.blitOffset, u * pw, (v + height) * ph);
        t.vertexUV(x + width, y + height, this.blitOffset, (u + width) * pw, (v + height) * ph);
        t.vertexUV(x + width, y, this.blitOffset, (u + width) * pw, v * ph);

        t.vertexUV(x + width, y, this.blitOffset, (u + width) * pw, v * ph);
        t.vertexUV(x, y, this.blitOffset, u * pw, v * ph);
        t.vertexUV(x, y + height, this.blitOffset, u * pw, (v + height) * ph);
        t.end(buffer)
        buffer.draw()
    }
}