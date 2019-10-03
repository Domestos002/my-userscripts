import domLoaded from 'dom-loaded'

const TIMEOUT = 15 * 1000

let readyTime = 0

domLoaded.then(() => readyTime = Date.now())

export default selector => new Promise(resolve => {
  const check = () => {
    const element = document.querySelector(selector)

    if (element) {
      return resolve(element)
    }

    if (readyTime && readyTime - Date.now() > TIMEOUT) {
      return resolve()
    }

    requestAnimationFrame(check)
  }

  check()
})
