<!--
  file Vue 示例
  
  这个示例展示了如何在Vue应用中使用file库
  注意：这只是一个示例组件，需要在Vue项目中使用
-->

<template>
  <div class="file-demo">
    <h1>file Vue 示例</h1>

    <div class="demo-section">
      <h2>文件转Base64</h2>
      <input type="file" @change="handleFileToBase64" />
      <div v-if="base64Result" class="result">
        <h3>Base64结果:</h3>
        <div class="base64-preview">
          {{ base64Result.substring(0, 50) }}...
        </div>
        <button @click="handleBase64ToFile">转换回文件并下载</button>
      </div>
      <div v-if="fileResult" class="result">
        <h3>文件信息:</h3>
        <p>名称: {{ fileResult.name }}</p>
        <p>大小: {{ fileResult.size }} 字节</p>
        <p>类型: {{ fileResult.type }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h2>图片处理</h2>
      <div class="image-tools">
        <div>
          <h3>图片压缩</h3>
          <input type="file" accept="image/*" ref="compressInput" @change="handleImageCompress" />
          <button @click="$refs.compressInput.click()">选择图片压缩</button>
        </div>
        <div>
          <h3>图片格式转换</h3>
          <input type="file" accept="image/*" ref="convertInput" @change="handleImageConvert" />
          <button @click="$refs.convertInput.click()">选择图片转换为WebP</button>
        </div>
      </div>

      <div v-if="originalImage || processedImage" class="image-preview">
        <div v-if="originalImage" class="preview-item">
          <h3>原图</h3>
          <img :src="originalImage" alt="原图" />
        </div>
        <div v-if="processedImage" class="preview-item">
          <h3>处理后</h3>
          <img :src="processedImage" alt="处理后" />
          <p>{{ processInfo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fileToBase64,
  base64ToFile,
  imgCompress,
  imgConvert,
  checkFileType
} from 'js-use-core'; // 假设已经安装了js-use-core包

export default {
  name: 'FileUtilDemo',
  data() {
    return {
      base64Result: '',
      fileResult: null,
      originalImage: null,
      processedImage: null,
      processInfo: ''
    };
  },
  methods: {
    // 文件转Base64
    async handleFileToBase64(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const base64 = await fileToBase64(file);
        this.base64Result = base64;
      } catch (error) {
        console.error('文件转Base64失败:', error);
        alert(`转换失败: ${error.message}`);
      }
    },

    // Base64转文件
    handleBase64ToFile() {
      if (!this.base64Result) {
        alert('请先转换文件为Base64');
        return;
      }

      try {
        const file = base64ToFile(this.base64Result);
        this.fileResult = file;

        // 创建下载链接
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Base64转文件失败:', error);
        alert(`转换失败: ${error.message}`);
      }
    },

    // 图片压缩
    async handleImageCompress(event) {
      const file = event.target.files[0];
      if (!file) return;

      const fileType = checkFileType(file);
      if (!fileType.isImage) {
        alert('请选择图片文件');
        return;
      }

      // 显示原图
      this.originalImage = URL.createObjectURL(file);
      this.processedImage = null;
      this.processInfo = '';

      try {
        // 压缩图片
        const compressedFile = await imgCompress(file, {
          quality: 0.7,
          maxWidth: 800,
          maxHeight: 800
        });

        // 显示压缩后的图片
        this.processedImage = URL.createObjectURL(compressedFile);
        this.processInfo = `压缩后大小: ${(compressedFile.size / 1024).toFixed(2)} KB (原大小: ${(file.size / 1024).toFixed(2)} KB)`;
      } catch (error) {
        console.error('图片压缩失败:', error);
        alert(`压缩失败: ${error.message}`);
      }
    },

    // 图片格式转换
    async handleImageConvert(event) {
      const file = event.target.files[0];
      if (!file) return;

      const fileType = checkFileType(file);
      if (!fileType.isImage) {
        alert('请选择图片文件');
        return;
      }

      // 显示原图
      this.originalImage = URL.createObjectURL(file);
      this.processedImage = null;
      this.processInfo = '';

      try {
        // 转换图片格式为WebP
        const convertedFile = await imgConvert(file, {
          format: 'webp',
          quality: 0.9
        });

        // 显示转换后的图片
        this.processedImage = URL.createObjectURL(convertedFile);
        this.processInfo = `转换为WebP格式，大小: ${(convertedFile.size / 1024).toFixed(2)} KB (原大小: ${(file.size / 1024).toFixed(2)} KB)`;
      } catch (error) {
        console.error('图片格式转换失败:', error);
        alert(`转换失败: ${error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.file-demo {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.demo-section {
  margin-bottom: 30px;
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 5px;
}
h1 {
  color: #333;
}
h2 {
  color: #555;
  margin-top: 0;
}
button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}
input[type="file"] {
  margin: 10px 0;
}
.result {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
.base64-preview {
  word-break: break-all;
  font-family: monospace;
  margin: 10px 0;
}
.image-tools {
  display: flex;
  gap: 20px;
}
.image-preview {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.preview-item {
  flex: 1;
}
img {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>