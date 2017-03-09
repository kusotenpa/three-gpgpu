import rand from '../rand'

export default `

  varying vec4 vColor;

  uniform float time;

  ${rand}

  void main() {
    vec2 p = gl_PointCoord.xy * 2.0 - 1.0 ;
    float l = 0.1 / length(p);

    if (l < 0.3) {
      discard;
    }

    gl_FragColor = vec4(vec3(l), 1.0) * vColor;
  }

`
