attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform bool uHasTexture;
uniform bool uHasColor;

uniform highp vec4 uFogColor;
uniform highp float uFogDensity;

varying highp vec2 vTextureCoord;
varying highp vec4 vColor;
varying highp vec3 vPosition;

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

    vPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
}
