import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl } from "../Minecraft";
import { Tesselator } from "../renderer/Tesselator";

export class GuiComponent {
    protected blitOffset: number = 0
    protected static renderBuffer: RenderBuffer = new RenderBuffer()

    protected static fill(x0: number, y0: number, x1: number, y1: number, color: number): void {
        let a = (color >> 24 & 0xff) / 255
        let r = (color >> 16 & 0xff) / 255
        let g = (color >> 8 & 0xff) / 255
        let b = (color & 0xff) / 255
        let t = Tesselator.instance
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        t.init()
        t.color_f(r, g, b, a)

        t.vertex(x0, y1, 0.0)
        t.vertex(x1, y1, 0.0)
        t.vertex(x1, y0, 0.0)
        
        t.vertex(x1, y0, 0.0)
        t.vertex(x0, y0, 0.0)
        t.vertex(x0, y1, 0.0)

        t.flush(GuiComponent.renderBuffer)
        GuiComponent.renderBuffer.draw()
        gl.disable(gl.BLEND)
    }

    protected static fillGradient(x0: number, y0: number, x1: number, y1: number, color0: number, color1: number): void {
        
    }
}