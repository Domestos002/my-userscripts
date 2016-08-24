// ==UserScript==
// @name         Redirect VeryCD Pages
// @namespace    http://riophae.com/
// @version      0.1.0
// @description  由于 VeryCD 不再提供资源下载链接，跳转到 gdajie.com
// @author       Riophae Lee
// @match        http://www.verycd.com/topics/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  location.href = location.href.replace('verycd.com', 'verycd.gdajie.com');
})();
