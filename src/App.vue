<script setup lang="ts">
import Generate from "./components/Generate.vue";
import Trade from "./components/Trade.vue";
import Assets from "./components/Assets.vue";
import TransactionHistory from "./components/TransactionHistory.vue";
</script>

<template>
  <div class="app-container">
    <header>
      <h1>比特币钱包工具</h1>
    </header>

    <main>
      <div class="section">
        <Generate />
      </div>
      <div class="section">
        <Trade />
      </div>
      <div class="section">
        <Assets />
      </div>
      <div class="section">
        <TransactionHistory />
      </div>
    </main>
  </div>
</template>

<style>
/* 全局样式 */
:root {
  --primary-color: #4CAF50;
  --error-color: #c62828;
  --success-color: #2e7d32;
  --background-color: #f5f5f5;
  --card-background: #ffffff;
  --text-color: #333333;
  --border-color: #dddddd;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

header h1 {
  color: var(--text-color);
  font-size: 32px;
  font-weight: 600;
}

.section {
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  header h1 {
    font-size: 24px;
  }
}
</style>
