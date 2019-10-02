// ==UserScript==
// @name        3D Youtube Downloader Helper
// @namespace   https://riophae.com/
// @version     0.1.3
// @description One click to send YouTube video url to 3D YouTube Downloader.
// @author      Riophae Lee
// @match       https://www.youtube.com/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

(function () {
    'use strict';

    // Types inspired by
    // https://github.com/Microsoft/TypeScript/blob/9d3707d/src/lib/dom.generated.d.ts#L10581
    // Type predicate for TypeScript
    function isQueryable(object) {
        return typeof object.querySelectorAll === 'function';
    }
    function select(selectors, baseElement) {
        // Shortcut with specified-but-null baseElement
        if (arguments.length === 2 && !baseElement) {
            return null;
        }
        return (baseElement || document).querySelector(selectors);
    }
    function selectLast(selectors, baseElement) {
        // Shortcut with specified-but-null baseElement
        if (arguments.length === 2 && !baseElement) {
            return null;
        }
        const all = (baseElement || document).querySelectorAll(selectors);
        return all[all.length - 1];
    }
    /**
     * @param selectors      One or more CSS selectors separated by commas
     * @param [baseElement]  The element to look inside of
     * @return               Whether it's been found
     */
    function selectExists(selectors, baseElement) {
        if (arguments.length === 2) {
            return Boolean(select(selectors, baseElement));
        }
        return Boolean(select(selectors));
    }
    function selectAll(selectors, baseElements) {
        // Shortcut with specified-but-null baseElements
        if (arguments.length === 2 && !baseElements) {
            return [];
        }
        // Can be: select.all('selectors') or select.all('selectors', singleElementOrDocument)
        if (!baseElements || isQueryable(baseElements)) {
            const elements = (baseElements || document).querySelectorAll(selectors);
            return Array.apply(null, elements);
        }
        const all = [];
        for (let i = 0; i < baseElements.length; i++) {
            const current = baseElements[i].querySelectorAll(selectors);
            for (let ii = 0; ii < current.length; ii++) {
                all.push(current[ii]);
            }
        }
        // Preserves IE11 support and performs 3x better than `...all` in Safari
        const arr = [];
        all.forEach(function (v) {
            arr.push(v);
        });
        return arr;
    }
    select.last = selectLast;
    select.exists = selectExists;
    select.all = selectAll;
    var selectDom = select;

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var manyKeysMap = createCommonjsModule(function (module) {

    const getInternalKeys = Symbol('getInternalKeys');
    const getPrivateKey = Symbol('getPrivateKey');
    const publicKeys = Symbol('publicKeys');
    const objectHashes = Symbol('objectHashes');
    const symbolHashes = Symbol('symbolHashes');
    const nullKey = Symbol('null'); // `objectHashes` key for null

    let keyCounter = 0;
    function checkKeys(keys) {
    	if (!Array.isArray(keys)) {
    		throw new TypeError('The keys parameter must be an array');
    	}
    }

    module.exports = class ManyKeysMap extends Map {
    	constructor() {
    		super();

    		this[objectHashes] = new WeakMap();
    		this[symbolHashes] = new Map(); // https://github.com/tc39/ecma262/issues/1194
    		this[publicKeys] = new Map();

    		// eslint-disable-next-line prefer-rest-params
    		const [pairs] = arguments; // Map compat
    		if (pairs === null || pairs === undefined) {
    			return;
    		}

    		if (typeof pairs[Symbol.iterator] !== 'function') {
    			throw new TypeError(typeof pairs + ' is not iterable (cannot read property Symbol(Symbol.iterator))');
    		}

    		for (const [keys, value] of pairs) {
    			this.set(keys, value);
    		}
    	}

    	[getInternalKeys](keys, create = false) {
    		const privateKey = this[getPrivateKey](keys, create);

    		let publicKey;
    		if (privateKey && this[publicKeys].has(privateKey)) {
    			publicKey = this[publicKeys].get(privateKey);
    		} else if (create) {
    			publicKey = [...keys]; // Regenerate keys array to avoid external interaction
    			this[publicKeys].set(privateKey, publicKey);
    		}

    		return {privateKey, publicKey};
    	}

    	[getPrivateKey](keys, create = false) {
    		const privateKeys = [];
    		for (let key of keys) {
    			if (key === null) {
    				key = nullKey;
    			}

    			const hashes = typeof key === 'object' || typeof key === 'function' ? objectHashes : typeof key === 'symbol' ? symbolHashes : false;

    			if (!hashes) {
    				privateKeys.push(key);
    			} else if (this[hashes].has(key)) {
    				privateKeys.push(this[hashes].get(key));
    			} else if (create) {
    				const privateKey = `@@mkm-ref-${keyCounter++}@@`;
    				this[hashes].set(key, privateKey);
    				privateKeys.push(privateKey);
    			} else {
    				return false;
    			}
    		}

    		return JSON.stringify(privateKeys);
    	}

    	set(keys, value) {
    		checkKeys(keys);
    		const {publicKey} = this[getInternalKeys](keys, true);
    		return super.set(publicKey, value);
    	}

    	get(keys) {
    		checkKeys(keys);
    		const {publicKey} = this[getInternalKeys](keys);
    		return super.get(publicKey);
    	}

    	has(keys) {
    		checkKeys(keys);
    		const {publicKey} = this[getInternalKeys](keys);
    		return super.has(publicKey);
    	}

    	delete(keys) {
    		checkKeys(keys);
    		const {publicKey, privateKey} = this[getInternalKeys](keys);
    		return Boolean(publicKey && super.delete(publicKey) && this[publicKeys].delete(privateKey));
    	}

    	clear() {
    		super.clear();
    		this[symbolHashes].clear();
    		this[publicKeys].clear();
    	}

    	get [Symbol.toStringTag]() {
    		return 'ManyKeysMap';
    	}

    	get size() {
    		return super.size;
    	}
    };
    });

    const pDefer = () => {
    	const deferred = {};

    	deferred.promise = new Promise((resolve, reject) => {
    		deferred.resolve = resolve;
    		deferred.reject = reject;
    	});

    	return deferred;
    };

    var pDefer_1 = pDefer;

    const cache = new manyKeysMap();
    const isDomReady = () => document.readyState === 'interactive' || document.readyState === 'complete';

    const elementReady = (selector, {
    	target = document,
    	stopOnDomReady = true,
    	timeout = Infinity
    } = {}) => {
    	const cacheKeys = [target, selector, stopOnDomReady, timeout];
    	const cachedPromise = cache.get(cacheKeys);
    	if (cachedPromise) {
    		return cachedPromise;
    	}

    	let rafId;
    	const deferred = pDefer_1();
    	const {promise} = deferred;

    	cache.set(cacheKeys, promise);

    	const stop = () => {
    		cancelAnimationFrame(rafId);
    		cache.delete(cacheKeys, promise);
    		deferred.resolve();
    	};

    	if (timeout !== Infinity) {
    		setTimeout(stop, timeout);
    	}

    	// Interval to keep checking for it to come into the DOM.
    	(function check() {
    		const element = target.querySelector(selector);

    		if (element) {
    			deferred.resolve(element);
    			stop();
    		} else if (stopOnDomReady && isDomReady()) {
    			stop();
    		} else {
    			rafId = requestAnimationFrame(check);
    		}
    	})();

    	return Object.assign(promise, {stop});
    };

    var elementReady_1 = elementReady;

    

    const FALLBACK_LANG = 'en-US';
    const ID_SUFFIX = '3d-youtube-downloader-helper';

    let isMenuOpen = false;
    let isTooltipShown = false;
    let justOpenedMenu = false;

    function memoize(fn) {
      let value;

      return () => {
        if (fn) {
          value = fn();

          if (value != null) {
            fn = null;
          }
        }

        return value
      }
    }

    const isWindowsOS = () => navigator.platform === 'Win32';
    const isEmbeddedVideo = () => window.location.pathname.startsWith('/embed/');
    const getLang = () => document.documentElement.getAttribute('lang');
    const getVideoId = () => isEmbeddedVideo() // eslint-disable-line no-confusing-arrow
      ? window.location.pathname.split('/').pop()
      : selectDom('[video-id]').getAttribute('video-id');

    const getButton = memoize(() => selectDom(`#button-${ID_SUFFIX}`));
    const getTooltip = memoize(() => selectDom(`#tooltip-${ID_SUFFIX}`));
    const getMenu = memoize(() => selectDom(`#menu-${ID_SUFFIX}`));
    const getInnerMenu = memoize(() => selectDom(`#inner-menu-${ID_SUFFIX}`));
    const getDownloadLink = memoize(() => selectDom(`#download-link-${ID_SUFFIX}`));
    const getConvertLink = memoize(() => selectDom(`#convert-link-${ID_SUFFIX}`));
    const getAnalyzeLink = memoize(() => selectDom(`#analyze-link-${ID_SUFFIX}`));

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
    };
    dict.zh = dict['zh-CN'];

    function i18n(key) {
      let lang = getLang();

      // eslint-disable-next-line no-prototype-builtins
      if (!dict.hasOwnProperty(lang)) {
        lang = FALLBACK_LANG;
      }

      const translated = dict[lang][key] || dict[FALLBACK_LANG][key];

      return translated
    }

    function insertControls(youtubeSettingsMenu, youtubeRightControls) {
      const createMenuItem = key => `
<a id="${key}-link-${ID_SUFFIX}" class="ytp-menuitem" tabindex="0">
  <div class="ytp-menuitem-label" style="white-space: nowrap">${i18n(key)}</div>
  <div class="ytp-menuitem-content"></div>
</a>
`;
      const buttonHtml = `
<button id="button-${ID_SUFFIX}" class="ytp-button">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459 459" style="transform: scale(0.45)">
    <path fill="#FFF" d="M446.25 56.1l-35.7-43.35C405.45 5.1 395.25 0 382.5 0h-306C63.75 0 53.55 5.1 45.9 12.75L12.75 56.1C5.1 66.3 0 76.5 0 89.25V408c0 28.05 22.95 51 51 51h357c28.05 0 51-22.95 51-51V89.25c0-12.75-5.1-22.95-12.75-33.15zM229.5 369.75L89.25 229.5h89.25v-51h102v51h89.25L229.5 369.75zM53.55 51l20.4-25.5h306L402.9 51H53.55z"/>
  </svg>
</button>
`;
      const tooltipHtml = `
<div id="tooltip-${ID_SUFFIX}" class="ytp-tooltip ytp-bottom" style="opacity: 0">
  <div class="ytp-tooltip-bg">
    <div class="ytp-tooltip-duration"></div>
  </div>
  <div class="ytp-tooltip-text-wrapper">
    <div class="ytp-tooltip-image"></div>
    <div class="ytp-tooltip-title"></div>
    <span class="ytp-tooltip-text">${i18n('buttonTitle')}</span>
  </div>
</div>
`;
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
`;

      youtubeSettingsMenu.insertAdjacentHTML('beforebegin', menuHtml);
      youtubeSettingsMenu.insertAdjacentHTML('beforebegin', tooltipHtml);
      youtubeRightControls.insertAdjacentHTML('afterbegin', buttonHtml);
    }

    function adjustPosition(element) {
      element.style.right = '0';

      const elementRect = element.getBoundingClientRect();
      const buttonRect = getButton().getBoundingClientRect();
      const youtubeSettingsMenuStyle = getComputedStyle(selectDom('.ytp-settings-menu[id^="ytp-"]'));

      const elementCenterX = elementRect.x + elementRect.width / 2;
      const buttonCenterX = buttonRect.x + buttonRect.width / 2;
      const diff = elementCenterX - buttonCenterX;
      const youtubeSettingsMenuRight = parseInt(youtubeSettingsMenuStyle.right, 10);

      element.style.right = Math.max(diff, youtubeSettingsMenuRight) + 'px';
    }

    function showTooltip() {
      if (isTooltipShown) return
      isTooltipShown = true;

      getTooltip().style.opacity = '1';
      adjustPosition(getTooltip());

      getMenu().style.display = '';
      getTooltip().style.bottom = getComputedStyle(getMenu()).bottom;
      getMenu().style.display = 'none';
    }

    function hideTooltip() {
      if (!isTooltipShown) return
      isTooltipShown = false;

      getTooltip().style.opacity = '0';
    }

    function setDownloadUrls() {
      const videoId = getVideoId();
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      getDownloadLink().href = `s3dyd://download=${videoUrl}`;
      getConvertLink().href = `s3dyd://convert=${videoUrl}`;
      getAnalyzeLink().href = `s3dyd://analyze=${videoUrl}`;
    }

    function setMenuSize(width, height) {
      width += 'px';
      height += 'px';

      Object.assign(getInnerMenu().parentElement.style, { width, height });
      Object.assign(getMenu().style, { width, height });
    }

    function showMenu() {
      if (isMenuOpen) return
      isMenuOpen = true;

      getMenu().style.opacity = '1';
      getMenu().style.display = '';

      const { offsetWidth: width, offsetHeight: height } = getInnerMenu();

      setMenuSize(width, height);
      setDownloadUrls();
      adjustMenuPosition();
    }

    function adjustMenuPosition() {
      adjustPosition(getMenu());
    }

    function hideMenu() {
      if (!isMenuOpen) return
      isMenuOpen = false;

      getMenu().style.opacity = '0';
      getMenu().addEventListener(
        'transitionend',
        event => {
          if (event.propertyName === 'opacity' && getMenu().style.opacity === '0') {
            getMenu().style.display = 'none';
            getMenu().style.opacity = '';
          }
        },
        { once: true },
      );
    }

    function bindEventHandlers() {
      getButton().addEventListener('click', () => {
        if (isMenuOpen) {
          return
        }

        justOpenedMenu = true;

        hideTooltip();
        showMenu();
      });

      getButton().addEventListener('contextmenu', event => {
        event.preventDefault();
        event.stopPropagation();

        hideTooltip();
        hideMenu();

        setDownloadUrls();
        getDownloadLink().click();
      });

      getButton().addEventListener('mouseenter', () => {
        if (!isMenuOpen) {
          showTooltip();
        }
      });

      getButton().addEventListener('mouseleave', () => {
        if (!isMenuOpen) {
          hideTooltip();
        }
      });

      window.addEventListener('click', () => {
        if (isMenuOpen && !justOpenedMenu) {
          hideMenu();
        }

        justOpenedMenu = false;
      });

      window.addEventListener('blur', () => {
        if (isMenuOpen) {
          hideMenu();
        }
      });
    }

    async function init() {
      if (!isWindowsOS()) {
        return
      }

      const [ youtubeSettingsMenu, youtubeRightControls ] = await Promise.all([
        elementReady_1('.ytp-settings-menu'),
        elementReady_1('.ytp-right-controls'),
      ]);

      if (youtubeSettingsMenu && youtubeRightControls) {
        insertControls(youtubeSettingsMenu, youtubeRightControls);
        bindEventHandlers();
      }
    }
    init();

}());
