const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
import util from './util'
import GPGPURenderer from './GPGPURenderer'
import vsParticle from './glsl/particle/vs'
import fsParticle from './glsl/particle/fs'
import fsPosition from './glsl/position/fs'
import fsVelocity from './glsl/velocity/fs'

const WIDTH = 2000
const PARTICLES = WIDTH ** 2

class App {

  constructor() {
    this.time = 0
    this.scene = new THREE.Scene()
    // this.scene.add(new THREE.AxisHelper(100))
    this.camera = new THREE.PerspectiveCamera()
    this.camera.fov = 70
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.near = 0.1
    this.camera.far = 15000
    this.camera.updateProjectionMatrix()
    this.camera.position.set(0, 120, 1500)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x1d394e)
    document.body.appendChild(this.renderer.domElement)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableZoom = true

    this._onResize()
    this._initGPGPURenderer()
    this._initParticle()
    requestAnimationFrame(::this.render)
  }

  _initGPGPURenderer() {
    const gpgpu = this.gpgpu = new GPGPURenderer(THREE, WIDTH, WIDTH, this.renderer)
    const texturePosition = gpgpu.createTexture()
    const textureVelocity = gpgpu.createTexture()

    this._fillTextures(texturePosition, textureVelocity)

    const positionVariable = this.positionVariable = gpgpu.addVariable({
      name: 'texturePosition',
      fs: fsPosition,
      texture: texturePosition,
    })

    positionVariable.material.uniforms.time = { value: 0.0 }
    positionVariable.material.uniforms.velocity = { value: 1.0 }
    positionVariable.material.uniforms.targetPoint = { value: new THREE.Vector2(-1, -1) }

    const velocityVariable = this.velocityVariable = gpgpu.addVariable({
      name: 'textureVelocity',
      fs: fsVelocity,
      texture: textureVelocity,
    })

    gpgpu.setVariableDependencies(positionVariable, [ positionVariable, velocityVariable ])
    gpgpu.setVariableDependencies(velocityVariable, [ positionVariable, velocityVariable ])
    gpgpu.init()
  }

  _initParticle() {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(PARTICLES * 3).fill(0)
    const uvs = new Float32Array(PARTICLES * 2)
    let p = 0

    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < WIDTH; y++) {
        uvs[ p++ ] = x / (WIDTH - 1)
        uvs[ p++ ] = y / (WIDTH - 1)
      }
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    this.particleUniforms = {
      texturePosition: { value: null },
      time: { value: null },
      cameraConstant: { value: this.getCameraConstant(this.camera) },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: this.particleUniforms,
      vertexShader: vsParticle,
      fragmentShader: fsParticle,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    material.extensions.drawBuffers = true
    const particles = new THREE.Points(geometry, material)
    particles.matrixAutoUpdate = false
    particles.updateMatrix()

    this.scene.add(particles)
  }

  _fillTextures(texturePosition, textureVelocity) {
    const posArray = texturePosition.image.data
    const velArray = textureVelocity.image.data

    for (let i = 0, length = posArray.length; i < length; i += 4) {
      posArray[ i ] = Math.random() * WIDTH -WIDTH / 2
      posArray[ i + 1 ] = Math.random() * WIDTH -WIDTH / 2
      posArray[ i + 2 ] = 0
      posArray[ i + 3 ] = 0

      velArray[ i ] = Math.random() * 2 - 1
      velArray[ i + 1 ] = Math.random() * 2 - 1
      velArray[ i + 2 ] = Math.random() * 2 - 1
      velArray[ i + 3 ] = Math.random() * 2 - 1
    }
  }

  getCameraConstant(camera) {
    return window.innerHeight / (Math.tan(THREE.Math.DEG2RAD * 0.5 * camera.fov) / camera.zoom)
  }

  render(time) {
    this.updateUniforms(time)
    this.gpgpu.render()
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(::this.render)
  }

  updateUniforms(time) {
    const positionUniforms = this.positionVariable.material.uniforms
    positionUniforms.time.value = time / 10000
    positionUniforms.velocity.value = 1.0 + Math.random() * 100.0 - 45
    positionUniforms.targetPoint.value = new THREE.Vector2(Math.random() * WIDTH*2 - WIDTH, Math.random() * WIDTH*2 - WIDTH)
    this.particleUniforms.texturePosition.value = this.gpgpu.getCurrentRenderTarget(this.positionVariable).texture
    this.particleUniforms.time.value = time / 1000
  }

  _onResize() {
    window.addEventListener('resize', () => {
      util.resize({ camera: this.camera, renderer: this.renderer })
    })
  }
}

new App()
