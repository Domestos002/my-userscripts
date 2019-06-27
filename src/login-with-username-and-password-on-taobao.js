// ==UserScript==
// @name         Log-in with username & password on Taobao
// @namespace    https://riophae.com/
// @version      0.1.0
// @description  在淘宝登录页面，自动切换到使用用户名、密码登录
// @author       riophae
// @match        https://login.taobao.com/member/login.jhtml*
// @grant        none
// ==/UserScript==

const $ = document.querySelector.bind(document)
const waitFor = function (checker, worker) {
  if (checker()) {
    worker()
  } else {
    setTimeout(() => {
      waitFor(checker, worker)
    }, 16)
  }
}

waitFor(() => {
  return $('.login-box.no-longlogin.module-quick')
}, () => {
  $('#J_Quick2Static').click()
})
