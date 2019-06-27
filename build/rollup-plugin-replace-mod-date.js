const fs = require('fs')
const MagicString = require('magic-string')
const formatDate = require('tinydate')('{YYYY}.{MM}.{DD}.{HH}.{mm}.{ss}')

const PLACEHOLDER = '%MOD_DATE%'

function getMtime(f) {
  const stats = fs.statSync(f)
  return formatDate(stats.mtime)
}

module.exports = function moddatePlugin() {
  let f

  return {
    name: 'replace-mod-date',

    options(options) {
      f = options.input
    },

    renderChunk(code, { map }) {
      if (!f) return

      const ms = new MagicString(code)
      const index = code.indexOf(PLACEHOLDER)
      if (index === -1) return
      const mtime = getMtime(f)
      ms.overwrite(index, index + PLACEHOLDER.length, mtime)

      return {
        code: ms.toString(),
        map: map ? ms.generateMap({ hires: true }) : void 0,
      }
    },
  }
}
