import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, matrix } from "../Minecraft";
import { Textures } from "../renderer/Textures";
import { Tesselator } from "../renderer/Tesselator";

export class Font {
    public charWidths: number[] = []
    public fontTexture: WebGLTexture = null
    private buffer: RenderBuffer

    public constructor(resourceName: string, textureManager: Textures) {
        this.buffer = new RenderBuffer(gl.DYNAMIC_DRAW)
        
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        
        let img: HTMLImageElement;
        const imageLoadPromise = new Promise(resolve => {
            img = new window.Image();
            img.onload = resolve;
            img.src = resourceName;
        });
        imageLoadPromise.then(() => {
            context.drawImage(img, 0, 0)
            
            let i4: number = img.width
            let i5: number = img.height
            let i6 = context.getImageData(0, 0, i4, i5)
            
            for (let i14: number = 0; i14 < 256; ++i14) {
                i5 = i14 % 16;
                let i7: number = Math.trunc(i14 / 16);
                let i8: number = 0
                
                for (let z9: boolean = false; i8 < 8 && !z9; ++i8) {
                    let i10: number = (i5 << 3) + i8
                    z9 = true
                    
                    for (let i11: number = 0; i11 < 8; ++i11) {
                        let i12: number = ((i7 << 3) + i11) * i4
                        if (i6.data[(i10 + i12) * 4 + 3] > 128) {
                            z9 = false
                        }
                    }
                }
                
                if (i14 == 32) {
                    i8 = 4
                }

                this.charWidths[i14] = i8
            }

            this.fontTexture = textureManager.loadTexture(resourceName, gl.NEAREST)
            
            console.log("Font loaded")
        })
    }
    
    public drawShadow(string: string, x: number, y: number, color: number): void {
        this.draw(string, x + 1, y + 1, color, true)
		this.draw(string, x, y, color, false)
    }
    
    public draw(string: string, x: number, y: number, color: number, darken: boolean): void {
        if (darken) {
			color = (color & 16579836) >> 2
		}
        
		gl.bindTexture(gl.TEXTURE_2D, this.fontTexture)
        let t = Tesselator.instance
        t.init()
        t.color_i(color)
        
        let i7: number = 0
        for (let i8: number = 0; i8 < string.length; ++i8) {
            let i9: number
            if(string.charAt(i8) == '&') {
                i9 = ((color = "0123456789abcdef".indexOf(string.charAt(i8))) & 8) << 3
                let i10: number = (color & 1) * 191 + i9
                let i11: number = ((color & 2) >> 1) * 191 + i9
                color = ((color & 4) >> 2) * 191 + i9 << 16 | i11 << 8 | i10
                i8 += 2
				if (darken) {
					color = (color & 16579836) >> 2
				}
				t.color_i(color);
            }
            let ch: number = string.charAt(i8).charCodeAt(0)
            color = ch % 16 << 3
			i9 = Math.trunc(ch / 16) << 3
            t.vertexUV((x + i7), (y + 8), 0.0, color / 128.0, (i9 + 8) / 128.0);
            t.vertexUV((x + i7 + 8), (y + 8), 0.0, (color + 8) / 128.0, (i9 + 8) / 128.0);
            t.vertexUV((x + i7 + 8), y, 0.0, (color + 8) / 128.0, i9 / 128.0);
            
            t.vertexUV((x + i7 + 8), y, 0.0, (color + 8) / 128.0, i9 / 128.0);
            t.vertexUV((x + i7), y, 0.0, color / 128.0, i9 / 128.0);
            t.vertexUV((x + i7), (y + 8), 0.0, color / 128.0, (i9 + 8) / 128.0);
			i7 += this.charWidths[ch]
        }
        
        t.flush(this.buffer)
        matrix.applyUniforms()
        this.buffer.draw()
    }
    
    public getWidth(string: string): number {
        let i2: number = 0
        
        for (let i3: number = 0; i3 < string.length; ++i3) {
            if(string.charAt(i3) == '&') {
				++i3
			} else {
				i2 += this.charWidths[string.charAt(i3).charCodeAt(0)]
			}
        }
        
        return i2
    }
}