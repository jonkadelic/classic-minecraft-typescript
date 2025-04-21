// Uniforms
uniform sampler2D uSampler;

uniform highp vec4 uColor;

uniform bool uHasTexture;
uniform bool uHasColor;
uniform bool uHasNormal;

uniform bool uAlphaTest;
uniform int uAlphaFunc;
uniform highp float uAlphaRef;

uniform bool uHasFog;
uniform highp int uFogMode;
uniform highp vec4 uFogColor;
uniform highp vec2 uFogPosition;
uniform highp float uFogDensity;

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

// Constants
const int GL_NEVER = 0x200;
const int GL_LESS = 0x201;
const int GL_EQUAL = 0x202;
const int GL_LEQUAL = 0x203;
const int GL_GREATER = 0x204;
const int GL_NOTEQUAL = 0x205;
const int GL_GEQUAL = 0x206;
const int GL_ALWAYS = 0x207;

highp float fogFactorLinear(const highp float dist, const highp float start, const highp float end) {
  return clamp((end - dist) / (end - start), 0.0, 1.0);
}

highp float fogFactorExp(const highp float dist, const highp float density) {
    return clamp(exp(-density * dist), 0.0, 1.0);
}

highp float fogFactorExp2(const highp float dist, const highp float density) {
    const highp float LOG2 = -1.442695;
    highp float d = density * dist;
    return clamp(exp2(d * d * LOG2), 0.0, 1.0);
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
        highp float fogAmount = 0.0;
        if (uFogMode == 0) { // Linear
            fogAmount = fogFactorLinear(fogDistance, uFogPosition.x, uFogPosition.y);
        } else if (uFogMode == 1) { // Exp
            fogAmount = fogFactorExp(fogDistance, uFogDensity);
        } else if (uFogMode == 2) { // Exp2
            fogAmount = fogFactorExp2(fogDistance, uFogDensity);
        }
        gl_FragColor = fogAmount * texelColor + (1.0 - fogAmount) * uFogColor;
    } else {
        gl_FragColor = texelColor;
    }

    if (uAlphaTest) {
        if ((uAlphaFunc == GL_NEVER) ||
            (uAlphaFunc == GL_LESS && !(gl_FragColor.a < uAlphaRef)) ||
            (uAlphaFunc == GL_EQUAL && !(gl_FragColor.a == uAlphaRef)) ||
            (uAlphaFunc == GL_LEQUAL && !(gl_FragColor.a <= uAlphaRef)) ||
            (uAlphaFunc == GL_GREATER && !(gl_FragColor.a > uAlphaRef)) ||
            (uAlphaFunc == GL_NOTEQUAL && !(gl_FragColor.a != uAlphaRef)) ||
            (uAlphaFunc == GL_GEQUAL && !(gl_FragColor.a >= uAlphaRef))
        ) {
            discard;
        }
    }
}