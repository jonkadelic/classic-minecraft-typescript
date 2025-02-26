import { gl } from "../Minecraft";
import { DynamicTexture } from "./ptexture/DynamicTexture";

export class Textures {
    public idMap: Map<string, WebGLTexture> = new Map();
    public dynamicTextures: DynamicTexture[] = []
    public pixels: Uint8Array = new Uint8Array(256 * 256 * 4)

    public preloadTextures(): void {
        this.loadTexture("./terrain.png")
        this.loadTexture("./char.png")
        this.loadTexture("./gui/gui.png")
        this.loadTexture("./gui/icons.png")
        this.loadTexture("./default.png")
    }

    public loadTexture(resourceName: string): WebGLTexture {
        if (this.idMap.has(resourceName)) {
            return this.idMap.get(resourceName) as WebGLTexture;
        }

        const texture = gl.createTexture();
        if (!texture) throw new Error("Failed to create texture");
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        };
        image.src = resourceName;

        this.idMap.set(resourceName, texture);

        return texture;
    }

    public addDynamicTexture(dynamicTexture: DynamicTexture): void {
        this.dynamicTextures.push(dynamicTexture)
        dynamicTexture.tick()
    }

    public tick(): void {
        for (let i: number = 0; i < this.dynamicTextures.length; i++) {
            let dynamicTexture: DynamicTexture = this.dynamicTextures[i]
            dynamicTexture.tick()
            gl.texSubImage2D(
                gl.TEXTURE_2D, 
                0, 
                Math.trunc(dynamicTexture.tex % 16 << 4),
                Math.trunc(dynamicTexture.tex / 16 << 4),
                16,
                16,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                dynamicTexture.pixels
            )
        }
    }
}