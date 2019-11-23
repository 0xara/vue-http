// rollup.config.js
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from "rollup-plugin-terser";
import minimist from 'minimist';
import postcss from 'rollup-plugin-postcss'

const argv = minimist(process.argv.slice(2));

const config = {
  input: 'src/entry.js',
  output: {
    name: 'VueHttp',
    exports: 'named',
  },
  plugins: [
	  replace({
		  'process.env.NODE_ENV': JSON.stringify('production'),
	  }),
	  postcss(),
	  vue({
		  css: false,
		  compileTemplate: true,
		  template: {
			  isProduction: true,
		  },
	  }),
	  babel({
		  babelrc: false,
		  presets: [['env', { modules: false }]],
		  exclude: 'node_modules/**',
		  externalHelpersWhitelist: ['objectSpread'],
		  plugins: ["transform-vue-jsx","transform-es2015-parameters","transform-es2015-destructuring","transform-es2015-spread","transform-object-rest-spread","syntax-dynamic-import"]
	  }),
	  commonjs(),
  ],
};

// Only minify browser (iife) version
// rollup-plugin-uglify-es deprecated we use rollup-plugin-terser
if (argv.format === 'iife') {
  config.plugins.push(terser());
}

export default config;
