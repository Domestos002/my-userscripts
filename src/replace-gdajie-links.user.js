// ==UserScript==
// @name         Replace Gdajie Links
// @namespace    http://riophae.com/
// @version      0.1.0
// @description  将 gdajie.com 页面的下载链接替换为真正的 ed2k:// 链接
// @author       Riophae Lee
// @match        http://www.verycd.gdajie.com/topics/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var DEBUG = true;
  var log = function () {
    if (DEBUG) console.log.apply(console, arguments);
  };

  var pipe = function (fns) {
    return function (initialVal) {
      return fns.reduce(function (val, fn) { return fn(val); }, initialVal);
    };
  };
  var toArray = Function.call.bind([].slice);
  var $ = pipe([
    document.querySelectorAll.bind(document),
    toArray,
  ]);

  var rawLinkElements = $('[href^="http://www.verycd.gdajie.com/detail.htm?id="]');
  if (!rawLinkElements.length) return;

  var re = /下载地址： (ed2k:\/\/.+\/)<\/span>/;
  var resolved = 0;

  function fetchRealLink(rawLinkElement) {
    return fetch(rawLinkElement.href)
      .then(function (resp) {
        if (resp.ok) return resp;
        throw new Error('Failed to fetch');
      })
      .then(function (resp) {
        return resp.text();
      })
      .then(function (html) {
        var result = html.match(re);
        if (result) return result[1];
        throw new Error('ed2k link not found!');
      })
      .then(function (ed2kLink) {
        log('Found ed2k link: ', ed2kLink);
        rawLinkElement.href = ed2kLink;
        resolved++;
      })
      .catch(function (err) {
        log('Error occured while processing item `' +
          rawLinkElement.textContent + '`: ' + err.message);
      });
  }

  rawLinkElements
    .reduce(function (p, rawLinkElement) {
      return p.then(function () { return fetchRealLink(rawLinkElement); });
    }, Promise.resolve())
    .then(function () {
      log('Done. ' + resolved + ' link(s) have been successfully resolved.');
    });
})();
