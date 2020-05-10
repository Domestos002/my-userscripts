import createYoutubePlayerButton from './utils/create-youtube-player-button'
import tolerantElementReady from './utils/tolerant-element-ready'

// ==UserScript==
// @name        Youtube Screenshot Button
// @namespace   https://riophae.com/
// @version     0.1.6
// @description Adds a button that enables you to take screenshots for YouTube videos.
// @author      Riophae Lee
// @match       https://www.youtube.com/*
// @run-at      document-start
// @grant       GM.openInTab
// @grant       GM_openInTab
// @license     MIT
// ==/UserScript==

// Based on work by Amio:
// https://github.com/amio/youtube-screenshot-button
// (c) MIT License

const BUTTON_ID = 'youtube-screenshot-button'

const anchorCacheMap = {}

function getAnchor(key, initializer) {
  // eslint-disable-next-line no-prototype-builtins
  if (anchorCacheMap.hasOwnProperty(key)) {
    return anchorCacheMap[key]
  }

  const anchor = anchorCacheMap[key] = document.createElement('a')

  anchor.hidden = true
  anchor.style.position = 'absolute'
  initializer && initializer(anchor)
  document.body.appendChild(anchor)

  return anchor
}

function createScreenshotBlobUrlForVideo(video) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = video.clientWidth
    canvas.height = video.clientHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(blob => {
      const blobUrl = URL.createObjectURL(blob)
      resolve(blobUrl)

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 60 * 1000)
    })
  })
}

function openInNewTab(blobUrl) {
  // Older versions of Greasemonkey (3.x) have both GM_openInTab and GM.openInTab.
  // Newer versions of Greasemonkey (4.x) seems have deleted GM_openInTab, which
  // allows opening blob: urls while GM.openInTab don't.
  // GM.openInTab is too strict even base64 urls are not allowed.
  // So we prefer GM_openInTab whenever available.

  // eslint-disable-next-line camelcase
  if (typeof GM_openInTab === 'function') {
    // eslint-disable-next-line new-cap
    GM_openInTab(blobUrl, false)
  } else {
    // eslint-disable-next-line no-shadow
    const anchor = getAnchor('open_in_new_tab', anchor => {
      anchor.target = '_blank'
    })

    anchor.href = blobUrl
    // A popup may be blocked by the browser. Make sure to allow it.
    anchor.click()
  }
}

function download(blobUrl) {
  const anchor = getAnchor('download')

  anchor.href = blobUrl
  anchor.download = 'youtube-screenshot.png'
  anchor.click()
}

async function main() {
  const existingButton = document.getElementById(BUTTON_ID)

  if (existingButton) {
    console.info('Screenshot button already injected.')
    return
  }

  const [ video, controls ] = await Promise.all([
    tolerantElementReady('.html5-main-video'),
    tolerantElementReady('.ytp-right-controls'),
  ])

  if (!(video && controls)) {
    return
  }

  createYoutubePlayerButton({
    buttonTitle: 'Take a screenshot',
    buttonId: BUTTON_ID,
    buttonSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff" style="transform: scale(0.45)"><path d="M512 107.275c-23.658-33.787-70.696-42.691-104.489-19.033L233.753 209.907l-63.183-44.246c23.526-40.618 12.46-93.179-26.71-120.603-41.364-28.954-98.355-18.906-127.321 22.45-28.953 41.358-18.913 98.361 22.452 127.327 28.384 19.874 64.137 21.364 93.129 6.982l77.388 54.185-77.381 54.179c-28.992-14.375-64.743-12.885-93.129 6.982-41.363 28.966-51.404 85.963-22.452 127.32 28.966 41.363 85.963 51.411 127.32 22.457 39.165-27.424 50.229-79.985 26.71-120.603l63.183-44.246L407.51 423.749c33.793 23.665 80.831 14.755 104.489-19.033l-212.41-148.715L512 107.275zM91.627 167.539c-26.173 0-47.392-21.219-47.392-47.392s21.22-47.392 47.392-47.392c26.179 0 47.392 21.219 47.392 47.392s-21.213 47.392-47.392 47.392zm0 271.714c-26.173 0-47.392-21.219-47.392-47.392 0-26.173 21.219-47.392 47.392-47.392 26.179 0 47.392 21.219 47.392 47.392 0 26.172-21.213 47.392-47.392 47.392z"/></svg>',

    async onClickButton() {
      openInNewTab(await createScreenshotBlobUrlForVideo(video))
    },

    async onRightClickButton() {
      download(await createScreenshotBlobUrlForVideo(video))
    },
  })
}
main()
