// Uniforms
uniform sampler2D uSampler;

uniform highp vec4 uColor;

uniform bool uHasTexture;
uniform bool uHasColor;
uniform bool uHasNormal;

uniform bool uHasFog;
uniform highp vec4 uFogColor;
uniform highp vec2 uFogPosition;

uniform bool uHasLight;
uniform highp vec3 uLightPosition;
uniform highp vec4 uLightAmbient;
uniform highp vec4 uLightDiffuse;
uniform highp vec4 uSceneAmbient;

// In
varying highp vec3 vPosition;
varying highp vec2 vTextureCoord;
varying highp vec4 vColor;
varying highp vec3 vNormal;

varying highp vec4 vDiffuseColor;

highp float fogFactorLinear(const highp float dist, const highp float start, const highp float end) {
  return 1.0 - clamp((end - dist) / (end - start), 0.0, 1.0);
}

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
    if (uHasLight) {
        highp vec4 oldTexelColor = texelColor;
        texelColor = texelColor * uSceneAmbient + (vDiffuseColor + uLightAmbient);
        if (texelColor.r > oldTexelColor.r) texelColor.r = oldTexelColor.r;
        if (texelColor.g > oldTexelColor.g) texelColor.g = oldTexelColor.g;
        if (texelColor.b > oldTexelColor.b) texelColor.b = oldTexelColor.b;
    }
    texelColor = texelColor * uColor;

    if (uHasFog) {
        highp float fogDistance = length(vPosition.xyz);
        highp float fogAmount = fogFactorLinear(fogDistance, uFogPosition.y, uFogPosition.x);
        gl_FragColor = fogAmount * texelColor + (1.0 - fogAmount) * uFogColor;
    } else {
        gl_FragColor = texelColor;
    }
}