varying highp vec2 vTextureCoord;
varying highp vec3 vColor;
varying highp vec3 vPosition;

uniform sampler2D uSampler;

uniform highp vec4 uFogColor;
uniform highp float uFogDensity;

uniform bool uHasTexture;
uniform bool uHasColor;

void main(void) {
    highp vec3 texelColor = vec3(1.0, 1.0, 1.0);
    if (uHasTexture) {
        texelColor = texture2D(uSampler, vTextureCoord).rgb; 
    }
    highp vec4 rgba = vec4(texelColor.rgb, 1.0);
    if (uHasColor) {
        rgba = vec4(texelColor.rgb * vColor.rgb, 1.0);
    }

    #define LOG2 1.442695

    highp float fogDistance = length(vPosition);
    highp float fogAmount = 1.0 - exp2(-uFogDensity * uFogDensity * fogDistance * fogDistance * LOG2);
    fogAmount = clamp(fogAmount, 0.0, 1.0);

    gl_FragColor = mix(rgba, uFogColor, fogAmount);

    gl_FragColor = rgba;
}