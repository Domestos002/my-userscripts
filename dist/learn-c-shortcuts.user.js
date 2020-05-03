// ==UserScript==
// @name         Learn C Shortcuts
// @namespace    https://riophae.com/
// @version      0.1.3
// @description  给 Learn C 网站的按钮添加快捷键
// @author       Riophae Lee
// @match        http://www.learn-c.org/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  

  /* eslint-disable unicorn/prefer-event-key */

  (function () {

    const $ = document.querySelector.bind(document);

    const $run = $('#run-button');
    const $reset = $('#reset-button');

    const KEYCODES = {
      ENTER: 13,
      R: 82,
    };

    if (![ $run, $reset ].every(Boolean)) return

    window.addEventListener('keydown', event => {
      if (
        event.metaKey &&
        event.keyCode === KEYCODES.ENTER
      ) {
        event.preventDefault();
        if (window.minimized) {
          window.toggleMinimize(true);
        } else {
          $run.click();
        }
      } else if (
        event.metaKey &&
        event.ctrlKey &&
        event.keyCode === KEYCODES.R
      ) {
        event.preventDefault();
        $reset.click();
      }
    });
  })();

}());
