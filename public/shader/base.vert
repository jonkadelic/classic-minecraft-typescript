attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform bool uHasTexture;
uniform bool uHasColor;
uniform bool uHasFog;

uniform highp vec4 uFogColor;
uniform highp vec2 uFogPosition;

varying highp vec3 vPosition;
varying highp vec2 vTextureCoord;
varying highp vec4 vColor;
varying highp float vFogAmount;

float fogFactorLinear(const float dist, const float start, const float end) {
  return 1.0 - clamp((end - dist) / (end - start), 0.0, 1.0);
}

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    if (uHasTexture) {
        vTextureCoord = aTextureCoord;
    } else {
        vTextureCoord = vec2(0.0, 0.0);
    }
    if (uHasColor) {
        vColor = aColor;
    } else {
        vColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    if (uHasFog) {
        float fogDistance = length(gl_Position.xyz);
        vFogAmount = fogFactorLinear(fogDistance, uFogPosition.y, uFogPosition.x);
    } else {
        vFogAmount = 0.0;
    }

    vPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
}
