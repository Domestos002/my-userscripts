const path = require('path')
const ls = require('ls')
const nr = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const builtins = require('rollup-plugin-node-builtins')
const globals = require('rollup-plugin-node-globals')
const userScriptCss = require('rollup-plugin-userscript-css')
const metablock = require('./rollup-plugin-preserve-metablock')
const moddate = require('./rollup-plugin-replace-mod-date')

function resolve(p) {
  return path.join(__dirname, '..', p)
}

function genConfig(name) {
  return {
    input: resolve(`src/${name}.js`),
    output: {
      file: resolve(`dist/${name}.user.js`),
      format: 'iife',
    },
    plugins: [
      nr(),
      commonjs(),
      builtins(),
      globals(),
      userScriptCss({
        exclude: '!',
      }),
      metablock(),
      moddate(),
    ],
  }
}

function getAllBuilds() {
  return ls(resolve('src/*.js')).map(file => file.name).map(genConfig)
}

module.exports = getAllBuilds()
