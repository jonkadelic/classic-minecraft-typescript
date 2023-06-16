import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, matrix } from "../Minecraft";
import { Textures } from "../renderer/Textures";
import { Tesselator } from "../renderer/Tesselator";

export class Font {
    public charWidths: number[] = []
    public fontTexture: WebGLTexture | null = null
    private buffer: RenderBuffer

    public constructor(name: string, textures: Textures) {
        this.buffer = new RenderBuffer(gl.DYNAMIC_DRAW)
        
        let canvas = document.createElement("canvas")
        let cn = canvas.getContext("2d")
        if (!cn) throw new Error("Failed to get 2D context")
        let context = cn as CanvasRenderingContext2D
        
        let img: HTMLImageElement;
        const imageLoadPromise = new Promise(resolve => {
            img = new window.Image();
            img.onload = resolve;
            img.src = name;
        });
        imageLoadPromise.then(() => {
            context.drawImage(img, 0, 0)
            
            let w: number = img.width
            let h: number = img.height
            let rawPixels = context.getImageData(0, 0, w, h)
            
            for (let i: number = 0; i < 256; ++i) {
                let xt = i % 16;
                let yt: number = Math.trunc(i / 16);
                let x: number = 0
                let emptyColumn: boolean = false

                for (; x < 8 && !emptyColumn; ++x) {
                    let xPixel: number = (xt << 3) + x
                    emptyColumn = true
                    
                    for (let y: number = 0; y < 8; ++y) {
                        let yPixel: number = ((yt << 3) + y) * w
                        if (rawPixels.data[(xPixel + yPixel) * 4 + 3] > 128) {
                            emptyColumn = false
                        }
                    }
                }
                
                if (i == 32) {
                    x = 4
                }

                this.charWidths[i] = x
            }

            this.fontTexture = textures.loadTexture(name)
            
            console.log("Font loaded")
        })
    }
    
    public drawShadow(str: string, x: number, y: number, color: number): void {
        this.draw(str, x + 1, y + 1, color, true)
		this.draw(str, x, y, color, false)
    }
    
    public draw(str: string, x: number, y: number, color: number, darken: boolean): void {
        if (!this.fontTexture) return

        if (darken) {
			color = (color & 0xFCFCFC) >> 2
		}
        
		gl.bindTexture(gl.TEXTURE_2D, this.fontTexture)
        let t = Tesselator.instance
        t.init()
        t.color_i(color)
        
        let xo: number = 0
        for (let i: number = 0; i < str.length; ++i) {
            if(str.charAt(i) == '&') {
                let cc = ((color = "0123456789abcdef".indexOf(str.charAt(i))) & 8) << 3
                let br = (cc & 8) * 8
                let b = (cc & 1) * 191 + br
                let g = ((cc & 2) >> 1) * 191 + br
                let r = ((cc & 4) >> 2) * 191 + br
                color = r << 16 | g << 8 | b
                i += 2
				if (darken) {
					color = (color & 0xFCFCFC) >> 2
				}
				t.color_i(color);
            }
            let ch: number = str.charAt(i).charCodeAt(0)
            let ix = ch % 16 << 3
			let iy = Math.trunc(ch / 16) << 3
            t.vertexUV((x + xo), (y + 8), 0.0, ix / 128.0, (iy + 8) / 128.0);
            t.vertexUV((x + xo + 8), (y + 8), 0.0, (ix + 8) / 128.0, (iy + 8) / 128.0);
            t.vertexUV((x + xo + 8), y, 0.0, (ix + 8) / 128.0, iy / 128.0);
            
            t.vertexUV((x + xo + 8), y, 0.0, (ix + 8) / 128.0, iy / 128.0);
            t.vertexUV((x + xo), y, 0.0, ix / 128.0, iy / 128.0);
            t.vertexUV((x + xo), (y + 8), 0.0, ix / 128.0, (iy + 8) / 128.0);
			xo += this.charWidths[ch]
        }
        
        t.flush(this.buffer)
        this.buffer.draw()
    }
    
    public width(str: string): number {
        let len: number = 0
        
        for (let i: number = 0; i < str.length; ++i) {
            if(str.charAt(i) == '&') {
				++i
			} else {
				len += this.charWidths[str.charAt(i).charCodeAt(0)]
			}
        }
        
        return len
    }
}