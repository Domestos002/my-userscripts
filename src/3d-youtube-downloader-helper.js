import select from 'select-dom'
import createYoutubePlayerButton from './utils/create-youtube-player-button'
import tolerantElementReady from './utils/tolerant-element-ready'

// ==UserScript==
// @name        3D Youtube Downloader Helper
// @namespace   https://riophae.com/
// @version     0.1.7
// @description One click to send YouTube video url to 3D YouTube Downloader.
// @author      Riophae Lee
// @match       https://www.youtube.com/*
// @run-at      document-start
// @grant       GM_addStyle
// ==/UserScript==

const FALLBACK_LANG = 'en-US'
const ID_SUFFIX = '3d-youtube-downloader-helper'

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

const isWindowsOS = () => navigator.platform === 'Win32'
const isEmbeddedVideo = () => window.location.pathname.startsWith('/embed/')
const getLang = () => document.documentElement.getAttribute('lang')
const getVideoId = () => isEmbeddedVideo() // eslint-disable-line no-confusing-arrow
  ? window.location.pathname.split('/').pop()
  : select('[video-id]').getAttribute('video-id')

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

function insertStyle() {
  const css = `
#menu-${ID_SUFFIX} .ytp-panel-menu {
  min-width: 8em;
}
`

  // eslint-disable-next-line no-undef, new-cap
  GM_addStyle(css)
}

function setDownloadUrls() {
  const videoId = getVideoId()
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  getDownloadLink().href = `s3dyd://download=${videoUrl}`
  getConvertLink().href = `s3dyd://convert=${videoUrl}`
  getAnalyzeLink().href = `s3dyd://analyze=${videoUrl}`
}

async function init() {
  if (!isWindowsOS()) {
    return
  }

  const [ youtubeSettingsMenu, youtubeRightControls ] = await Promise.all([
    tolerantElementReady('.ytp-settings-menu'),
    tolerantElementReady('.ytp-right-controls'),
  ])

  if (!(youtubeSettingsMenu && youtubeRightControls)) {
    return
  }

  insertStyle()

  createYoutubePlayerButton({
    buttonTitle: i18n('buttonTitle'),
    buttonId: `button-${ID_SUFFIX}`,
    buttonSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459 459" style="transform: scale(0.45)"><path fill="#FFF" d="M446.25 56.1l-35.7-43.35C405.45 5.1 395.25 0 382.5 0h-306C63.75 0 53.55 5.1 45.9 12.75L12.75 56.1C5.1 66.3 0 76.5 0 89.25V408c0 28.05 22.95 51 51 51h357c28.05 0 51-22.95 51-51V89.25c0-12.75-5.1-22.95-12.75-33.15zM229.5 369.75L89.25 229.5h89.25v-51h102v51h89.25L229.5 369.75zM53.55 51l20.4-25.5h306L402.9 51H53.55z"/></svg>',

    hasMenu: true,
    menuId: `menu-${ID_SUFFIX}`,
    menuItemGenerator(key) {
      return `
<a id="${key}-link-${ID_SUFFIX}" class="ytp-menuitem" tabindex="0">
  <div class="ytp-menuitem-icon"></div>
  <div class="ytp-menuitem-label" style="white-space: nowrap">${i18n(key)}</div>
  <div class="ytp-menuitem-content"></div>
</a>
`
    },
    menuItems: [
      'download',
      'convert',
      'analyze',
    ],

    onRightClickButton() {
      setDownloadUrls()
      getDownloadLink().click()
    },

    onShowMenu() {
      setDownloadUrls()
    },
  })
}
init()
