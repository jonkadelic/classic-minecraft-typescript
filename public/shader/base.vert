// Uniforms
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

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
uniform mat4 uMVLightMatrix;
uniform mat4 uPLightMatrix;

// In
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute vec3 aNormal;

// Out
varying highp vec3 vPosition;
varying highp vec2 vTextureCoord;
varying highp vec4 vColor;
varying highp vec3 vNormal;

varying highp vec4 vDiffuseColor;

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
    if (uHasNormal) {
        vNormal = aNormal;
    } else {
        vNormal = vec3(0.0, 0.0, 0.0);
    }
    vPosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;

    if (uHasLight) {
        highp vec3 lightPosition = (uMVLightMatrix * vec4(uLightPosition, 1.0)).xyz;
        highp vec3 norm = normalize(vNormal);
        highp vec3 lightDir = normalize(lightPosition - vPosition);
        highp float diff = max(dot(norm, lightDir), 0.0);
        highp vec4 diffuse = vec4(diff * uLightDiffuse.rgb, uLightDiffuse.a);

        vDiffuseColor = diffuse;
    } else {
        vDiffuseColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
