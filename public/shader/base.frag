varying highp vec3 vPosition;
varying highp vec2 vTextureCoord;
varying highp vec4 vColor;

uniform sampler2D uSampler;

uniform highp vec4 uFogColor;
uniform highp float uFogDensity;

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
        #define LOG2 1.442695

        highp float fogDistance = length(vPosition);
        highp float fogAmount = 1.0 - exp2(-uFogDensity * uFogDensity * fogDistance * fogDistance * LOG2);
        fogAmount = clamp(fogAmount, 0.0, 1.0);

        gl_FragColor = mix(texelColor, uFogColor, fogAmount);
    } else {
        gl_FragColor = texelColor;
    }
}