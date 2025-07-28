import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

// 外部依赖配置
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'tslib'
];

// 基础插件配置
const basePlugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
    exportConditions: ['browser', 'module', 'import', 'default']
  }),
  commonjs({
    include: ['node_modules/**']
  }),
  json(),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: false,
    declarationMap: false,
    sourceMap: !isProduction,
    inlineSources: !isProduction,
    noEmitOnError: false
  })
];

// 生产环境插件
const productionPlugins = isProduction ? [
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug']
    },
    mangle: {
      reserved: ['BaseManager', 'ErrorHandler', 'EventEmitter', 'Logger', 'Cache']
    },
    format: {
      comments: false
    }
  }),
  visualizer({
    filename: 'dist/stats.html',
    open: false,
    gzipSize: true,
    brotliSize: true,
    template: 'treemap'
  })
] : [];

// 主要构建配置
const mainConfig = {
  input: 'index.ts',
  output: [
    // CommonJS 格式
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'named',
      interop: 'auto'
    },
    // ES Module 格式
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: !isProduction,
      exports: 'named'
    },
    // UMD 格式 (浏览器兼容)
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'JSUseCore',
      sourcemap: !isProduction,
      exports: 'named',
      globals: {}
    },
    // IIFE 格式 (直接在浏览器中使用)
    {
      file: 'dist/index.iife.js',
      format: 'iife',
      name: 'JSUseCore',
      sourcemap: !isProduction,
      exports: 'named'
    }
  ],
  plugins: [
    ...basePlugins,
    ...productionPlugins
  ],
  external: (id) => {
    // 对于 UMD 和 IIFE 格式，不排除任何依赖
    return false;
  },
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  }
};

// 模块化构建配置 (支持 tree shaking)
const moduleConfig = {
  input: 'index.ts',
  output: [
    // ES Module 格式 (优化的模块化版本)
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: !isProduction,
      exports: 'named'
    }
  ],
  plugins: [
    ...basePlugins,
    ...productionPlugins
  ],
  external,
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  }
};

// 类型定义构建配置
const dtsConfig = {
  input: 'index.ts',
  output: [
    { file: 'dist/index.d.ts', format: 'es' }
  ],
  plugins: [
    dts({
      tsconfig: './tsconfig.build.json',
      respectExternal: true
    })
  ],
  external
};

// 分模块构建配置 (支持按需导入)
const moduleBuilds = [
  'core',
  'clipboard', 
  'device',
  'file',
  'font',
  'fullscreen',
  'image',
  'ua',
  'url',
  'utils'
].map(moduleName => ({
  input: `src/${moduleName}/index.ts`,
  output: [
    {
      file: `dist/${moduleName}.js`,
      format: 'esm',
      sourcemap: !isProduction,
      exports: 'named'
    },
    {
      file: `dist/${moduleName}.cjs.js`,
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'named'
    }
  ],
  plugins: [
    ...basePlugins,
    ...productionPlugins
  ],
  external,
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  }
}));

// 导出配置
export default [
  mainConfig,
  moduleConfig,
  dtsConfig,
  ...moduleBuilds
]; 