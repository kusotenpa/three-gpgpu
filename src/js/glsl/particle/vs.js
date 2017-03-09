export default `

  uniform sampler2D texturePosition;
  uniform float cameraConstant;
  uniform float density;
  varying vec4 vColor;

  void main() {
    vec4 posTemp = texture2D( texturePosition, uv );
    vec3 pos = posTemp.xyz;
    // vColor = vec4(0.0, 0.9, 0.3, 1.0);
    vColor = vec4(1.0, 1.0, 1.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    gl_PointSize = 1.5 * cameraConstant / ( - mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;
  }

`
