// ==UserScript==
// @name         Zhihu Userpage Activity First
// @namespace    https://riophae.com/
// @version      0.1
// @description  Show activity tab first when visiting user-page
// @author       Riophae Lee
// @match        https://www.zhihu.com/people/*
// @run-at       document-start
// ==/UserScript==

const waitFor = (checker, worker) =>
  setTimeout(() => {
    if (checker()) worker()
    else waitFor(checker, worker)
  }, 16)
const $ = document.querySelector.bind(document)

const re = /\/people\/[a-z0-9-]+$/i
if (re.test(window.location.pathname)) {
  waitFor(
    () => $('a.Tabs-link.is-active[href$="/answers"]'),
    () => $('.ProfileMain-tabs li a').click(),
  )
}
