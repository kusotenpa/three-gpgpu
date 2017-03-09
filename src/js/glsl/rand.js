export default `
  float rand(vec2 p) {
    return fract(sin(dot(p, vec2(12.0909, 78.233))) * 43758.5453);
  }
`
