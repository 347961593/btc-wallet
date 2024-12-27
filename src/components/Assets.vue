<script setup>
import { ref } from "vue";
import axios from "axios";

const address = ref("")
const allAssets = ref("")
async function adressToAssets() {
  if (!address.value) return;
  try {
    // 连接到比特币公共节点
    const nodeUrl = "https://blockstream.info/api";

    // 获取地址的UTXO (未花费的交易输出)
    const utxos = await axios.get(`${nodeUrl}/address/${address.value}/utxo`);
    console.log(utxos);

    // 计算总余额
    const balance = utxos.data.reduce((total, utxo) => total + utxo.value, 0);
    const balanceInBTC = balance / 100000000;

    allAssets.value = `${balanceInBTC} BTC`;
  } catch (error) {
    console.error("查询出错:", error);
    allAssets.value = "查询失败";
  }
}
</script>
<template>
  <div class="container">
    <h2>资产查询</h2>
    <div class="input-group">
      <input
        type="text"
        v-model.trim="address"
        @blur="adressToAssets"
        placeholder="请输入地址"
        class="address-input"
      />
    </div>
    <div class="assets-display" v-if="allAssets">
      <label>对应资产:</label>
      <div class="amount">{{ allAssets }}</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: var(--text-color);
  margin-bottom: 20px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.address-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.address-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.2);
}

.assets-display {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.assets-display label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #666;
}

.amount {
  font-size: 18px;
  color: var(--primary-color);
  font-weight: 600;
}
</style>
