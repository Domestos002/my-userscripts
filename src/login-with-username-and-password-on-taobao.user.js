// ==UserScript==
// @name         Log-in with username & password on Taobao
// @namespace    http://riophae.com/
// @version      0.1.0
// @description  在淘宝登录页面，自动切换到使用用户名、密码登录
// @author       riophae
// @match        https://login.taobao.com/member/login.jhtml*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var $ = document.querySelector.bind(document);
  var waitFor = function (checker, worker) {
    if (checker()) {
      worker();
    } else {
      setTimeout(function () {
        waitFor(checker, worker);
      }, 16);
    }
  };

  waitFor(function () {
    return $('.login-box.no-longlogin.module-quick');
  }, function () {
    $('#J_Quick2Static').click();
  });
})();
