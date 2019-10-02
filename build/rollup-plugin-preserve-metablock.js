const fs = require('fs')
const MagicString = require('magic-string')

const OPENING_NOTATION = '// ==UserScript=='
const CLOSING_NOTATION = '// ==/UserScript=='

function findRange(code) {
  const start = code.indexOf(OPENING_NOTATION)

  if (start !== -1) {
    let end = code.indexOf(CLOSING_NOTATION, start)

    if (end !== -1) {
      end += CLOSING_NOTATION.length

      return { matched: true, start, end }
    }
  }

  return { matched: false, start: -1, end: -1 }
}

module.exports = function metablockPlugin() {
  let metablock

  return {
    name: 'preserve-metablock',

    options(options) {
      const entry = options.input

      if (entry) {
        const contents = fs.readFileSync(entry, 'utf8')
        const { matched, start, end } = findRange(contents)

        if (matched) metablock = contents.substring(start, end)
      }

      return options
    },

    renderChunk(code, { map }) {
      if (!metablock) return

      const ms = new MagicString(code)
      const { matched, start, end } = findRange(code)

      if (matched) ms.overwrite(start, end, '')
      ms.prepend(metablock + '\n\n')

      return {
        code: ms.toString(),
        map: map ? ms.generateMap({ hires: true }) : void 0,
      }
    },
  }
}
