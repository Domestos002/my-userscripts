import select from 'select-dom'
import domLoaded from 'dom-loaded'

// ==UserScript==
// @name        3D Youtube Downloader Helper
// @namespace   https://riophae.com/
// @version     0.1.6
// @description One click to send YouTube video url to 3D YouTube Downloader.
// @author      Riophae Lee
// @match       https://www.youtube.com/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

const FALLBACK_LANG = 'en-US'
const ID_SUFFIX = '3d-youtube-downloader-helper'

let isMenuOpen = false
let isTooltipShown = false
let justOpenedMenu = false

function memoize(fn) {
  let value

  return () => {
    if (fn) {
      value = fn()

      if (value != null) {
        fn = null
      }
    }

    return value
  }
}

const tolerantElementReady = (() => {
  let readyTime = 0

  domLoaded.then(() => readyTime = Date.now())

  return selector => new Promise(resolve => {
    const check = () => {
      const element = select(selector)

      if (element) {
        return resolve(element)
      }

      if (readyTime && readyTime - Date.now() > 15 * 1000) {
        return resolve()
      }

      requestAnimationFrame(check)
    }

    check()
  })
})()

const isWindowsOS = () => navigator.platform === 'Win32'
const isEmbeddedVideo = () => window.location.pathname.startsWith('/embed/')
const getLang = () => document.documentElement.getAttribute('lang')
const getVideoId = () => isEmbeddedVideo() // eslint-disable-line no-confusing-arrow
  ? window.location.pathname.split('/').pop()
  : select('[video-id]').getAttribute('video-id')

const getChromeBottom = memoize(() => select('.ytp-chrome-bottom'))
const getDownloadButton = memoize(() => select(`#button-${ID_SUFFIX}`))
const getSettingsButton = memoize(() => select('.ytp-button.ytp-settings-button'))
const getTooltip = memoize(() => select('.ytp-tooltip.ytp-bottom'))
const getTooltipText = memoize(() => select('.ytp-tooltip-text'))
const getMenu = memoize(() => select(`#menu-${ID_SUFFIX}`))
const getInnerMenu = memoize(() => select(`#inner-menu-${ID_SUFFIX}`))
const getDownloadLink = memoize(() => select(`#download-link-${ID_SUFFIX}`))
const getConvertLink = memoize(() => select(`#convert-link-${ID_SUFFIX}`))
const getAnalyzeLink = memoize(() => select(`#analyze-link-${ID_SUFFIX}`))

const dict = {
  'en-US': {
    buttonTitle: 'Download via 3D YouTube Downloader',
    download: 'Download',
    convert: 'Convert',
    analyze: 'Analyze',
  },
  'zh-CN': {
    buttonTitle: '通过 3D YouTube Downloader 下载',
    download: '下载',
    convert: '转换',
    analyze: '分析',
  },
}
dict.zh = dict['zh-CN']

function i18n(key) {
  let lang = getLang()

  // eslint-disable-next-line no-prototype-builtins
  if (!dict.hasOwnProperty(lang)) {
    lang = FALLBACK_LANG
  }

  const translated = dict[lang][key] || dict[FALLBACK_LANG][key]

  return translated
}

function insertControls(youtubeSettingsMenu, youtubeRightControls) {
  const createMenuItem = key => `
<a id="${key}-link-${ID_SUFFIX}" class="ytp-menuitem" tabindex="0">
  <div class="ytp-menuitem-icon"></div>
  <div class="ytp-menuitem-label" style="white-space: nowrap">${i18n(key)}</div>
  <div class="ytp-menuitem-content"></div>
</a>
`
  const buttonHtml = `
<button id="button-${ID_SUFFIX}" class="ytp-button">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459 459" style="transform: scale(0.45)">
    <path fill="#FFF" d="M446.25 56.1l-35.7-43.35C405.45 5.1 395.25 0 382.5 0h-306C63.75 0 53.55 5.1 45.9 12.75L12.75 56.1C5.1 66.3 0 76.5 0 89.25V408c0 28.05 22.95 51 51 51h357c28.05 0 51-22.95 51-51V89.25c0-12.75-5.1-22.95-12.75-33.15zM229.5 369.75L89.25 229.5h89.25v-51h102v51h89.25L229.5 369.75zM53.55 51l20.4-25.5h306L402.9 51H53.55z"/>
  </svg>
</button>
`
  const menuHtml = `
<div id="menu-${ID_SUFFIX}" class="ytp-popup ytp-settings-menu" style="display: none">
  <div class="ytp-panel">
    <div id="inner-menu-${ID_SUFFIX}" class="ytp-panel-menu" style="min-width: 8em" role="menu">
      ${createMenuItem('download')}
      ${createMenuItem('convert')}
      ${createMenuItem('analyze')}
    </div>
  </div>
</div>
`

  youtubeSettingsMenu.insertAdjacentHTML('beforebegin', menuHtml)
  youtubeRightControls.insertAdjacentHTML('afterbegin', buttonHtml)
}

function triggerMouseEvent(element, eventType) {
  const event = new MouseEvent(eventType)

  element.dispatchEvent(event)
}

function getEdgePosition() {
  return parseInt(getChromeBottom().style.left, 10)
}

function adjustTooltipPosition() {
  const calculateNormal = () => {
    getTooltip().style.left = '0'

    const offsetParentRect = getTooltip().offsetParent.getBoundingClientRect()
    const tooltipRect = getTooltip().getBoundingClientRect()
    const downloadButtonRect = getDownloadButton().getBoundingClientRect()

    const tooltipHalfWidth = tooltipRect.width / 2
    const buttonCenterX = downloadButtonRect.x + downloadButtonRect.width / 2
    const normal = buttonCenterX - offsetParentRect.x - tooltipHalfWidth

    return normal
  }

  const calculateEdge = () => {
    const offsetParentRect = getTooltip().offsetParent.getBoundingClientRect()
    const tooltipRect = getTooltip().getBoundingClientRect()
    const edge = offsetParentRect.width - getEdgePosition() - tooltipRect.width

    return edge
  }

  getTooltip().style.left = Math.min(calculateNormal(), calculateEdge()) + 'px'
}

function showTooltip() {
  if (isTooltipShown) return
  isTooltipShown = true

  triggerMouseEvent(getSettingsButton(), 'mouseover')
  getTooltipText().textContent = i18n('buttonTitle')
  adjustTooltipPosition()
}

function hideTooltip() {
  if (!isTooltipShown) return
  isTooltipShown = false

  triggerMouseEvent(getSettingsButton(), 'mouseout')
}

function immediatelyHideTooltip() {
  if (!isTooltipShown) return

  hideTooltip()
  getTooltip().style.display = 'none'
}

function setDownloadUrls() {
  const videoId = getVideoId()
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  getDownloadLink().href = `s3dyd://download=${videoUrl}`
  getConvertLink().href = `s3dyd://convert=${videoUrl}`
  getAnalyzeLink().href = `s3dyd://analyze=${videoUrl}`
}

function setMenuSize(width, height) {
  width += 'px'
  height += 'px'

  Object.assign(getInnerMenu().parentElement.style, { width, height })
  Object.assign(getMenu().style, { width, height })
}

function showMenu() {
  if (isMenuOpen) return
  isMenuOpen = true

  getMenu().style.opacity = '1'
  getMenu().style.display = ''

  const { offsetWidth: width, offsetHeight: height } = getInnerMenu()

  setMenuSize(width, height)
  setDownloadUrls()
  adjustMenuPosition()
}

function adjustMenuPosition() {
  getMenu().style.right = '0'

  const menuRect = getMenu().getBoundingClientRect()
  const downloadButtonRect = getDownloadButton().getBoundingClientRect()

  const menuCenterX = menuRect.x + menuRect.width / 2
  const buttonCenterX = downloadButtonRect.x + downloadButtonRect.width / 2
  const diff = menuCenterX - buttonCenterX

  getMenu().style.right = Math.max(diff, getEdgePosition()) + 'px'
}

function hideMenu() {
  if (!isMenuOpen) return
  isMenuOpen = false

  getMenu().style.opacity = '0'
  getMenu().addEventListener(
    'transitionend',
    event => {
      if (event.propertyName === 'opacity' && getMenu().style.opacity === '0') {
        getMenu().style.display = 'none'
        getMenu().style.opacity = ''
      }
    },
    { once: true },
  )
}

function bindEventHandlers() {
  getDownloadButton().addEventListener('click', () => {
    if (isMenuOpen) {
      return
    }

    justOpenedMenu = true

    immediatelyHideTooltip()
    showMenu()
  })

  getDownloadButton().addEventListener('contextmenu', event => {
    event.preventDefault()
    event.stopPropagation()

    hideTooltip()
    hideMenu()

    setDownloadUrls()
    getDownloadLink().click()
  })

  getDownloadButton().addEventListener('mouseenter', () => {
    if (!isMenuOpen) {
      showTooltip()
    }
  })

  getDownloadButton().addEventListener('mouseleave', () => {
    if (!isMenuOpen) {
      hideTooltip()
    }
  })

  window.addEventListener('click', () => {
    if (isMenuOpen && !justOpenedMenu) {
      hideMenu()
    }

    justOpenedMenu = false
  })

  window.addEventListener('blur', () => {
    if (isMenuOpen) {
      hideMenu()
    }
  })
}

async function init() {
  if (!isWindowsOS()) {
    return
  }

  const [ youtubeSettingsMenu, youtubeRightControls ] = await Promise.all([
    tolerantElementReady('.ytp-settings-menu'),
    tolerantElementReady('.ytp-right-controls'),
  ])

  if (youtubeSettingsMenu && youtubeRightControls) {
    insertControls(youtubeSettingsMenu, youtubeRightControls)
    bindEventHandlers()
  }
}
init()
