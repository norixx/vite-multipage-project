import { defineConfig } from "vite";
import { resolve } from "path";
import { glob } from "glob";
// import vsharp from "vite-plugin-vsharp";
import imagemin from '@vheemstra/vite-plugin-imagemin'
import imageminWebp from 'imagemin-webp'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'


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
      input: getHtmlInputs(), //HTMLファイルの読み込み自動化
      output: {
        assetFileNames: (assetInfo) => {
          console.log(assetInfo);
          // Get the file name from assetInfo.names array
          const fileName = ('names' in assetInfo) ? assetInfo.names[0] : assetInfo.name;
          console.log(fileName);
          const extType = fileName.split('.').pop();
          
          // Check if the asset is a CSS file
          if (fileName.endsWith('.css')) {
            // return `${fileName}`;
            return 'style.css';
          }
          
          if (/^(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(extType)) {
            // Preserve the original path structure for images
            const filePath = assetInfo.originalFileNames?.[0];
            return filePath;
          }
          
          // For other assets, return them with their original names
          return `assets/${fileName}`;
        },
        // entryFileNames: 'main.js',
        // chunkFileNames: 'chunk.js'
      }
    },
    assetsInlineLimit: 0,
  },

  plugins: [
    // vsharp({
    //   include: ['**/*.{jpg,jpeg,png,gif,svg}'],
    //   options: {
    //     format: 'webp',
    //   }
    // }),
    imagemin({
      root: 'dist',
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
      mode: 'multiple',
      verbose: true,
      filter: /\.(jpe?g|png)$/i,
    })
  ]
})