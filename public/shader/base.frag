varying highp vec3 vPosition;
varying highp vec2 vTextureCoord;
varying highp vec4 vColor;
varying highp float vFogAmount;

uniform sampler2D uSampler;

uniform highp vec4 uFogColor;
uniform highp vec2 uFogPosition;

uniform bool uHasTexture;
uniform bool uHasColor;
uniform bool uHasFog;

uniform highp vec4 uColor;

void main(void) {
    highp vec4 texelColor = vec4(1.0, 1.0, 1.0, 1.0);
    if (uHasTexture) {
        texelColor = texture2D(uSampler, vTextureCoord).rgba; 
        if (texelColor.a <= 0.0) {
            discard;
        }
    }
    if (uHasColor) {
        texelColor = texelColor * vColor;
    }
    texelColor = texelColor * uColor;

    if (uHasFog) {
        gl_FragColor = vFogAmount * texelColor + (1.0 - vFogAmount) * uFogColor;
    } else {
        gl_FragColor = texelColor;
    }
}