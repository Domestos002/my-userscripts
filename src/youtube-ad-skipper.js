// ==UserScript==
// @name         YouTube Ad Skipper
// @namespace    https://riophae.com/
// @version      0.1
// @description  Automatically skip YouTube ads.
// @author       Riophae Lee
// @match        https://www.youtube.com/*
// @run-at       document-idle
// ==/UserScript==

const $ = document.querySelector.bind(document)

function skipAd() {
  const $skipBtn = $('.videoAdUiSkipButton')
  if ($skipBtn) $skipBtn.click()
}

function closeAdBanner() {
  const $closeBtn = $('.adDisplay .close-padding')
  if ($closeBtn) $closeBtn.click()
}

setInterval(() => {
  skipAd()
  closeAdBanner()
}, 200)
