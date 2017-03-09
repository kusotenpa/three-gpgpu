import rand from '../rand'

export default `

  #define delta ( 1.0 / 60.0 )

  uniform sampler2D texturePosition;
  uniform sampler2D textureVelocity;
  uniform float time;
  uniform float velocity;
  uniform vec2 targetPoint;

  ${rand}

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec2 targetDirection = normalize(targetPoint - pos.xy) * 0.2;
    vec2 direction = normalize(targetDirection + pos.zw);
    vec4 destColor = vec4(pos.xy + direction * velocity * 2.0, direction);

    gl_FragColor = vec4(destColor);
  }

`
