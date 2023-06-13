varying highp vec2 vTextureCoord;
varying highp vec3 vColor;

uniform sampler2D uSampler;

void main(void) {
    highp vec3 texelColor = texture2D(uSampler, vTextureCoord).rgb;
    gl_FragColor = vec4(texelColor.rgb * vColor, 1.0);
}