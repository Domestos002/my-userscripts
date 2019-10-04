import tolerantElementReady from './utils/tolerant-element-ready'

// ==UserScript==
// @name        Youtube Screenshot Button
// @namespace   https://riophae.com/
// @version     0.1.2
// @description Adds a button that enables you to take screenshots for YouTube videos.
// @author      Riophae Lee
// @match       https://www.youtube.com/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

// Based on work by Amio:
// https://github.com/amio/youtube-screenshot-button
// (c) MIT License

let anchor
let blobUrl

function createScreenshotBlobUrlForVideo(video) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = video.clientWidth
    canvas.height = video.clientHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(blob => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }

      blobUrl = URL.createObjectURL(blob)
      resolve()
    })
  })
}

async function main() {
  const existingButton = document.getElementById('ss-btn')

  if (existingButton) {
    console.info('Screenshot button already exists.')
    return
  }

  const video = await tolerantElementReady('.html5-main-video')
  const controls = await tolerantElementReady('.ytp-right-controls')

  if (!(video && controls)) {
    return
  }

  const buttonHTML = `
    <button id="ss-btn" class="ytp-button ytp-screenshot" title="Take a screenshot">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff" style="transform: scale(0.45)"><path d="M512 107.275c-23.658-33.787-70.696-42.691-104.489-19.033L233.753 209.907l-63.183-44.246c23.526-40.618 12.46-93.179-26.71-120.603-41.364-28.954-98.355-18.906-127.321 22.45-28.953 41.358-18.913 98.361 22.452 127.327 28.384 19.874 64.137 21.364 93.129 6.982l77.388 54.185-77.381 54.179c-28.992-14.375-64.743-12.885-93.129 6.982-41.363 28.966-51.404 85.963-22.452 127.32 28.966 41.363 85.963 51.411 127.32 22.457 39.165-27.424 50.229-79.985 26.71-120.603l63.183-44.246L407.51 423.749c33.793 23.665 80.831 14.755 104.489-19.033l-212.41-148.715L512 107.275zM91.627 167.539c-26.173 0-47.392-21.219-47.392-47.392s21.22-47.392 47.392-47.392c26.179 0 47.392 21.219 47.392 47.392s-21.213 47.392-47.392 47.392zm0 271.714c-26.173 0-47.392-21.219-47.392-47.392 0-26.173 21.219-47.392 47.392-47.392 26.179 0 47.392 21.219 47.392 47.392 0 26.172-21.213 47.392-47.392 47.392z"/></svg>
    </button>
  `

  controls.insertAdjacentHTML('afterbegin', buttonHTML)

  const screenshotButton = document.getElementById('ss-btn')

  screenshotButton.addEventListener('click', async () => {
    await createScreenshotBlobUrlForVideo(video)

    window.open(blobUrl, 'large')
  })

  screenshotButton.addEventListener('contextmenu', async event => {
    event.preventDefault()
    event.stopPropagation()

    await createScreenshotBlobUrlForVideo(video)

    if (!anchor) {
      anchor = document.createElement('a')
    }

    anchor.href = blobUrl
    anchor.download = 'youtube-screenshot.png'
    anchor.click()
  })
}
main()
