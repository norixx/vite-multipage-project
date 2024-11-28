import { defineConfig } from "vite";
import { resolve } from "path";
import { glob } from "glob";
// import vsharp from "vite-plugin-vsharp";
import imagemin from '@vheemstra/vite-plugin-imagemin'
import imageminWebp from 'imagemin-webp'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import handlebars from 'vite-plugin-handlebars';
import handlebarsConfig from './handlebars.config.js';
import { ViteMinifyPlugin } from 'vite-plugin-minify';// プラグイン名は必須:ViteMinifyPlugin

// console.log(handlebarsConfig);


/**
 * srcフォルダにあるHTMLファイルを全て取得してビルドの対象とするためにパスを返す
 *
 * @returns {Object} An object with file names as keys and resolved file paths as values.
 */
function getHtmlInputs() {
  const htmlFiles = glob.sync('src/**/*.html');

  const inputs = {};
  htmlFiles.forEach(file => {
    // name for key name {index(←これがkey): '/path/to/your/file.html'}
    const name = file.replace(/^src\/|\.html$/g, '');
    inputs[name] = resolve(__dirname, file);
  });
  // console.log(inputs);
  return inputs;
}

export default defineConfig({
  root: './src',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: getHtmlInputs(), //HTMLファイルの読み込みをビルドの起点として、HTMLファイルの増減を自動的に検知する
      output: {
        assetFileNames: (assetInfo) => {
          console.log(assetInfo);
          // ファイル名と拡張子を取得する
          const fileName = ('names' in assetInfo) ? assetInfo.names[0] : assetInfo.name;
          console.log(fileName);
          const extType = fileName.split('.').pop();
          
          // CSSファイルの場合、style.cssとして出力する
          if (fileName.endsWith('.css')) {
            // return `${fileName}`;
            return 'assets/css/style.css';
          }
          
          // 画像は元のフォルダ構造をキープする
          if (/^(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(extType)) {
            const filePath = assetInfo.originalFileNames?.[0];
            return filePath;
          }
          
          // その他のファイルは元のファイル名をキープする
          return `assets/${fileName}`;
        },
        // entryFileNames: 'main.js',
        // chunkFileNames: 'chunk.js'
      }
    },
    assetsInlineLimit: 0, //全てのファイルは独立したファイルとして扱われる（base64エンコードをしてインライン画像として挿入しない）
  },

  plugins: [
    // vsharp({
    //   include: ['**/*.{jpg,jpeg,png,gif,svg}'],
    //   options: {
    //     format: 'webp',
    //   }
    // }),
    // 画像圧縮
    imagemin({
      root: './',
      plugins: {
        jpg: imageminMozjpeg(),
        png: imageminPngquant(),
      },
      makeWebp: {
        plugins: {
          jpg: imageminWebp({
            quality: 75,
            effort: 4, // 0 - 6
            preset: 'photo'
            // lossless: true,
          }),
          png: imageminWebp({
            quality: 75,
            effort: 4, // 0 - 6
            preset: 'photo'
            // lossless: true,
          }),
        },
      },
      formatFilePath: (filePath) => {
        console.log('PATH: ', filePath);
        return filePath.replace(/^src\//, '');
      },
      verbose: true,
      // mode: 'multiple',
      // filter: /\.(jpe?g|png)$/i,
    }),
    // handlebars
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
      context: (pagePath) => {
        // src/フォルダ内のhtmlファイル名のみを抽出する
        const pageName = pagePath
          .replace(/^src\//, '')
          .replace(/\.html$/, '')
          .replace(/^\/+|\/+$/g, '');

          console.log(pageName)

        // 各ページごとの設定を読み込む(handlebars.config.js)
        return {
          ...handlebarsConfig.global,
          ...handlebarsConfig.pages[pageName]
        };
      },
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true
      }
    }),
    // HTML圧縮
    ViteMinifyPlugin({}),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'  // This fixes the deprecation warning
      }
    }
  }
})