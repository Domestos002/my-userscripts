/* eslint unicorn/consistent-function-scoping:0 */

import select from 'select-dom'
import noop from 'noop2'

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

function generateButtonHtml(buttonId, buttonSvg) {
  return `<button id="${buttonId}" class="ytp-button">${buttonSvg}</button>`
}

function generateMenuHtml(menuId, menuItemGenerator, menuItems) {
  return `
<div id="${menuId}" class="ytp-popup ytp-settings-menu" style="display: none">
  <div class="ytp-panel">
    <div class="ytp-panel-menu" role="menu">
      ${menuItems.map(menuItemGenerator).join('')}
    </div>
  </div>
</div>
`
}

function getEdgePosition() {
  return Number.parseInt(getChromeBottom().style.left, 10)
}

function triggerMouseEvent(element, eventType) {
  const event = new MouseEvent(eventType)

  element.dispatchEvent(event)
}

const getChromeBottom = memoize(() => select('.ytp-chrome-bottom'))
const getSettingsButton = memoize(() => select('.ytp-button.ytp-settings-button'))
const getTooltip = memoize(() => select('.ytp-tooltip.ytp-bottom'))
const getTooltipText = memoize(() => select('.ytp-tooltip-text'))

export default opts => {
  const {
    buttonTitle,
    buttonId,
    buttonSvg,

    hasMenu = false,
    menuId,
    menuItemGenerator,
    menuItems,

    onClickButton = noop, // optional
    onRightClickButton = noop, // optional
    onShowMenu = noop, // optional
    onHideMenu = noop, // optional
  } = opts

  const isRightClickButtonBound = onRightClickButton !== noop

  let isMenuOpen = false
  let justOpenedMenu = false
  let isTooltipShown = false

  const controls = select('.ytp-right-controls')
  controls.insertAdjacentHTML('afterbegin', generateButtonHtml(buttonId, buttonSvg))

  if (hasMenu) {
    const settingsMenu = select('.ytp-settings-menu')
    const menuHtml = generateMenuHtml(menuId, menuItemGenerator, menuItems)

    settingsMenu.insertAdjacentHTML('beforebegin', menuHtml)
  }

  const button = document.getElementById(buttonId)
  const menu = hasMenu ? document.getElementById(menuId) : null
  const innerMenu = hasMenu ? select(`#${menuId} .ytp-panel-menu`) : null

  button.addEventListener('click', () => {
    if (hasMenu && !isMenuOpen) {
      justOpenedMenu = true

      hideTooltip(true)
      showMenu()
    }

    onClickButton()
  })

  button.addEventListener('contextmenu', event => {
    if (hasMenu) {
      hideMenu()
    }

    if (isRightClickButtonBound) {
      event.preventDefault()
      event.stopPropagation()

      showTooltip()
      onRightClickButton()
    } else {
      hideTooltip()
    }
  })

  button.addEventListener('mouseenter', () => {
    if (!(hasMenu && isMenuOpen)) {
      showTooltip()
    }
  })

  button.addEventListener('mouseleave', () => {
    if (!(hasMenu && isMenuOpen)) {
      hideTooltip()
    }
  })

  if (hasMenu) {
    window.addEventListener('click', () => {
      if (!justOpenedMenu) {
        hideMenu()
      }

      justOpenedMenu = false
    })

    window.addEventListener('blur', () => {
      hideMenu()
    })
  }

  function showTooltip() {
    if (isTooltipShown) return
    isTooltipShown = true

    triggerMouseEvent(getSettingsButton(), 'mouseover')
    getTooltipText().textContent = buttonTitle
    adjustTooltipPosition()
  }

  function adjustTooltipPosition() {
    const calculateNormal = () => {
      getTooltip().style.left = '0'

      const offsetParentRect = getTooltip().offsetParent.getBoundingClientRect()
      const tooltipRect = getTooltip().getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()

      const tooltipHalfWidth = tooltipRect.width / 2
      const buttonCenterX = buttonRect.x + buttonRect.width / 2
      const normal = buttonCenterX - offsetParentRect.x - tooltipHalfWidth

      return normal
    }

    const calculateEdge = () => {
      const offsetParentRect = getTooltip().offsetParent.getBoundingClientRect()
      const tooltipRect = getTooltip().getBoundingClientRect()
      const edge = offsetParentRect.width - getEdgePosition() - tooltipRect.width

      return edge
    }

    getTooltip().style.left = Math.min(calculateNormal(), calculateEdge()) + 'px'
  }

  function hideTooltip(immediate = false) {
    if (!isTooltipShown) return
    isTooltipShown = false

    triggerMouseEvent(getSettingsButton(), 'mouseout')

    if (immediate) {
      getTooltip().style.display = 'none'
    }
  }

  function showMenu() {
    if (isMenuOpen) return
    isMenuOpen = true

    menu.style.opacity = '1'
    menu.style.display = ''

    const { offsetWidth: width, offsetHeight: height } = innerMenu

    setMenuSize(width, height)
    adjustMenuPosition()

    onShowMenu()
  }

  function setMenuSize(width, height) {
    width += 'px'
    height += 'px'

    Object.assign(innerMenu.parentElement.style, { width, height })
    Object.assign(menu.style, { width, height })
  }

  function adjustMenuPosition() {
    menu.style.right = '0'

    const menuRect = menu.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()

    const menuCenterX = menuRect.x + menuRect.width / 2
    const buttonCenterX = buttonRect.x + buttonRect.width / 2
    const diff = menuCenterX - buttonCenterX

    menu.style.right = Math.max(diff, getEdgePosition()) + 'px'
  }

  function hideMenu() {
    if (!isMenuOpen) return
    isMenuOpen = false

    menu.style.opacity = '0'
    menu.addEventListener(
      'transitionend',
      event => {
        if (event.propertyName === 'opacity' && menu.style.opacity === '0') {
          menu.style.display = 'none'
          menu.style.opacity = ''
        }
      },
      { once: true },
    )

    onHideMenu()
  }
}
