// ==UserScript==
// @name         Replace Gdajie Links
// @namespace    http://riophae.com/
// @version      0.1.1
// @description  将 gdajie.com 页面的下载链接替换为真正的 ed2k:// 链接
// @author       Riophae Lee
// @match        http://www.verycd.gdajie.com/topics/*
// @grant        none
// ==/UserScript==

(function () {
const DEBUG = false

const log = function (...args) {
  if (!DEBUG) return
  console.log(...args)
}

const pipe = function (fns) {
  return function (initialVal) {
    return fns.reduce((val, fn) => {
      return fn(val)
    }, initialVal)
  }
}
const toArray = Function.call.bind([].slice)
const $ = document.querySelector.bind(document)
const $$ = pipe([
  document.querySelectorAll.bind(document),
  toArray,
])

const rawLinkElements = $$('[href^="http://www.verycd.gdajie.com/detail.htm?id="]')
if (!rawLinkElements.length) return

const re = /下载地址： (ed2k:\/\/.+\/)<\/span>/
let resolved = 0
const realEd2kLinks = []

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function copyText(text) {
  const temp = document.createElement('textarea')
  temp.textContent = text
  Object.assign(temp.style, {
    overflow: 'hidden',
    display: 'block',
    width: 0,
    height: 0,
  })
  document.body.appendChild(temp)
  temp.select()
  document.execCommand('copy')
  document.body.removeChild(temp)
  log('Text has been copied to clipboard!\n' + text)
}

function fetchRealLink(rawLinkElement) {
  Object.assign(rawLinkElement.style, {
    display: 'inline-block',
    width: 'auto',
    marginRight: '5px',
    float: 'left',
  })
  const tip = document.createElement('span')
  tip.textContent = '…'
  Object.assign(tip.style, {
    color: 'rgba(0, 0, 0, .25)',
    fontSize: '12px',
  })
  insertAfter(tip, rawLinkElement)

  return fetch(rawLinkElement.href)
    .then(resp => {
      if (resp.ok) return resp
      throw new Error('Failed to fetch')
    })
    .then(resp => {
      return resp.text()
    })
    .then(html => {
      const result = html.match(re)
      if (result) return result[1]
      throw new Error('ed2k link not found!')
    })
    .then(ed2kLink => {
      log('Found ed2k link: ', ed2kLink)
      rawLinkElement.href = ed2kLink
      realEd2kLinks.push(ed2kLink)
      tip.textContent = '✔'
      resolved++
    })
    .catch(err => {
      log('Error occured while processing item `' +
          rawLinkElement.textContent + '`: ' + err.message)
    })
}

function addCopyAllButton() {
  const btn = document.createElement('button')
  btn.textContent = '拷贝所有下载链接'
  btn.addEventListener('click', evt => {
    evt.preventDefault()
    copyText(realEd2kLinks.join('\n'))
  })
  insertAfter(btn, $('#emuleFile'))
}

rawLinkElements
  .reduce((p, rawLinkElement) => {
    return p.then(() => {
      return fetchRealLink(rawLinkElement)
    })
  }, Promise.resolve())
  .then(() => {
    log('Done. ' + resolved + ' link(s) have been successfully resolved.')
    addCopyAllButton()
  })
})()
