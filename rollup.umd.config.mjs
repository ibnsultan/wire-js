import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { minify } from 'terser';

function terserPlugin() {
  return {
    name: 'terser-minify',
    async renderChunk(code) {
      const result = await minify(code, {
        compress: true,
        mangle: true,
        format: {
          comments: false
        }
      });

      return {
        code: result.code,
        map: result.map || null
      };
    }
  };
}

const plugins = [
  nodeResolve({ browser: true, preferBuiltins: false }),
  commonjs()
];

export default [
  {
    input: 'src/wire.js',
    plugins,
    output: {
      file: 'lib/umd/wire.js',
      format: 'umd',
      name: 'Wire',
      exports: 'default'
    }
  },
  {
    input: 'src/wire.js',
    plugins: [...plugins, terserPlugin()],
    output: {
      file: 'lib/umd/wire.min.js',
      format: 'umd',
      name: 'Wire',
      exports: 'default'
    }
  }
];
