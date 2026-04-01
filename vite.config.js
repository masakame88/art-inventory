import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite の設定ファイルです。
 * このファイルは、React のプログラムを Web ブラウザで
 * 実行可能な形式に組み立てる（ビルドする）際のルールを定義します。
 */
export default defineConfig({
  plugins: [react()],
})
