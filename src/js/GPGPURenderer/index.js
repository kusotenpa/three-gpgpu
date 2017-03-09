/**
 *
 * GPGPURenderer, based on GPUComputationRenderer
 */

import vsPassThrough from './glsl/vs'
import fsPassThrough from './glsl/fs'
let THREE

export default class GPGPURenderer {

  variables = []
  currentTextureIndex = 0
  scene = null
  camera = null
  renderer = null
  width = null
  height = null
  mesh = null
  passThroughShaderMaterial = null
  passThroughUniforms = { texture: { value: null } }

  constructor(_THREE, width, height, renderer) {
    THREE = _THREE
    this.scene = new THREE.Scene()
    this.camera = new THREE.Camera()
    this.renderer = renderer
    this.width = width
    this.height = height
    this.passThroughShaderMaterial = this._createShaderMaterial(fsPassThrough, this.passThroughUniforms)
    this.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.passThroughShaderMaterial)
    this.scene.add(this.mesh)
  }

  init() {
    this.variables.forEach(variable => {
      for (let i = 0; i < 2; i++) {
        variable.renderTargets[ i ] = this._createRenderTarget()
        this._initialRender(variable.initialTexture, variable.renderTargets[ i ])
      }
      const uniforms = variable.material.uniforms
      variable.dependencies.forEach(depVar => {
        uniforms[ depVar.name ] = { value: null }
      })
    })
  }

  addVariable({ name, fs, texture }) {
    const material = this._createShaderMaterial(fs)
    const variable = {
      initialTexture: texture,
      name,
      material,
      dependencies: [],
      renderTargets: [],
    }
    this.variables.push(variable)
    return variable
  }

  setVariableDependencies(variable, dependencies) {
    variable.dependencies = dependencies
  }

  createTexture() {
    const data = new Float32Array(this.width * this.height * 4)
    const texture = new THREE.DataTexture(data, this.width, this.height, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return texture
  }

  render() {
    const currentTextureIndex = this.currentTextureIndex
    const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0

    this.variables.forEach(variable => {
      const uniforms = variable.material.uniforms
      variable.dependencies.forEach(depVar => {
        uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture
      })
      this._offScreenRender(variable.material, variable.renderTargets[ nextTextureIndex ])
    })

    this.currentTextureIndex = nextTextureIndex
  }

  getCurrentRenderTarget(variable) {
    return variable.renderTargets[ this.currentTextureIndex ]
  }

  getAlternateRenderTarget(variable) {
    return variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ]
  }

  addResolutionDefine(materialShader) {
    materialShader.defines.resolution = `vec2(${this.width.toFixed(1)}, ${this.height.toFixed(1)})`
  }

  _createShaderMaterial(computeFragmentShader, uniforms = {}) {
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vsPassThrough,
      fragmentShader: computeFragmentShader,
    })
    this.addResolutionDefine(material)
    return material
  }

  _createRenderTarget() {
    return new THREE.WebGLRenderTarget(this.width, this.height, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? THREE.HalfFloatType : THREE.FloatType,
      stencilBuffer: false,
    })
  }

  _initialRender(input, output) {
    this.passThroughUniforms.texture.value = input
    this._offScreenRender(this.passThroughShaderMaterial, output)
    this.passThroughUniforms.texture.value = null
  }

  _offScreenRender(material, output) {
    this.mesh.material = material
    this.renderer.render(this.scene, this.camera, output)
    this.mesh.material = this.passThroughShaderMaterial
  }

}
