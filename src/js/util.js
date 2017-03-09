class util {
  static resize({ camera, renderer }) {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  static getRandomInt(min, max) {
    return Math.floor((Math.random() * (max - min)) + min)
  }
}

export default util
