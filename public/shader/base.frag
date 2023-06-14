varying highp vec2 vTextureCoord;
varying highp vec3 vColor;
varying highp vec3 vPosition;

uniform sampler2D uSampler;

uniform highp vec4 uFogColor;
uniform highp float uFogDensity;

uniform bool uHasTexture;
uniform bool uHasColor;

void main(void) {
    highp vec4 texelColor = vec4(1.0, 1.0, 1.0, 1.0);
    if (uHasTexture) {
        texelColor = texture2D(uSampler, vTextureCoord).rgba; 
        if (texelColor.a <= 0.0) {
            discard;
        }
    }
    if (uHasColor) {
        texelColor = vec4(texelColor.rgb * vColor.rgb, texelColor.a);
    }

    #define LOG2 1.442695

    highp float fogDistance = length(vPosition);
    highp float fogAmount = 1.0 - exp2(-uFogDensity * uFogDensity * fogDistance * fogDistance * LOG2);
    fogAmount = clamp(fogAmount, 0.0, 1.0);

    gl_FragColor = mix(texelColor, uFogColor, fogAmount);

    gl_FragColor = texelColor;
}