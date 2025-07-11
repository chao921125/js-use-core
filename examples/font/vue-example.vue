<template>
  <div class="font-checker-example">
    <h1>Vue 字体加载检查示例</h1>
    
    <!-- 使用组合式API示例 -->
    <div class="example-section">
      <h2>使用组合式API</h2>
      <div v-if="loading">检查中...</div>
      <div v-else>
        <div v-for="(font, index) in fontResults" :key="index" class="font-item">
          <span :style="{ fontFamily: font.name }" class="font-sample">Aa</span>
          <span class="font-name">{{ font.name }}</span>
          <span :class="['font-status', font.loaded ? 'loaded' : 'not-loaded']">
            {{ font.loaded ? '已加载' : '未加载' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 使用自定义检查示例 -->
    <div class="example-section">
      <h2>使用自定义检查</h2>
      <button @click="checkCustomFonts" class="check-button">检查自定义字体</button>
      <div class="custom-example" :class="{ 'fonts-loaded': customResults && allCustomFontsLoaded }">
        <div v-if="isCustomChecking">检查中...</div>
        <div v-else-if="customResults">
          <div v-for="(font, index) in customResults" :key="index" class="font-item">
            <span :style="{ fontFamily: font.name }" class="font-sample">Aa</span>
            <span class="font-name">{{ font.name }}</span>
            <span :class="['font-status', font.loaded ? 'loaded' : 'not-loaded']">
              {{ font.loaded ? '已加载' : '未加载' }}
            </span>
          </div>
        </div>
        <div v-else>点击按钮检查字体</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFontCheck, createFont } from 'js-use-core';

// 使用组合式API
const { results: fontResults, loading, error } = useFontCheck(['Arial', 'Helvetica', 'Times New Roman', 'NonExistentFont']);

// 自定义检查
const customResults = ref(null);
const isCustomChecking = ref(false);

// 计算所有自定义字体是否已加载
const allCustomFontsLoaded = computed(() => {
  if (!customResults.value) return false;
  return customResults.value.every(font => font.loaded);
});

// 检查自定义字体
async function checkCustomFonts() {
  isCustomChecking.value = true;
  const checker = createFont({ timeout: 3000 });
  try {
    customResults.value = await checker.check(['Arial', 'Times New Roman', 'NonExistentFont']);
  } catch (err) {
    console.error('字体检查失败:', err);
  } finally {
    isCustomChecking.value = false;
  }
}
</script>

<style scoped>
.font-checker-example {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.example-section {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.font-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.font-sample {
  font-size: 24px;
  margin-right: 15px;
  width: 40px;
  text-align: center;
}

.font-name {
  flex: 1;
  font-weight: 500;
}

.font-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.loaded {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.not-loaded {
  background-color: #ffebee;
  color: #c62828;
}

.custom-example {
  transition: background-color 0.3s ease;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.fonts-loaded {
  background-color: #e8f5e9;
}

.check-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 10px;
}

.check-button:hover {
  background-color: #1565c0;
}
</style>