attribute vec2 aTextureCoord;
attribute vec3 aColor;
attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vColor;
varying highp vec3 vPosition;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vColor = aColor;

    vPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
}
