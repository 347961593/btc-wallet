<script setup>
import { ref } from 'vue'
import axios from 'axios'

const address = ref('')
const transactions = ref([])
const loading = ref(false)
const error = ref('')

async function getTransactionHistory() {
  if (!address.value) {
    error.value = '请输入比特币地址'
    return
  }

  loading.value = true
  error.value = ''
  transactions.value = []

  try {
    // 获取交易历史
    const response = await axios.get(`https://blockstream.info/api/address/${address.value}/txs`)
    
    // 处理每笔交易的详细信息
    transactions.value = await Promise.all(response.data.map(async tx => {
      const txDetails = await axios.get(`https://blockstream.info/api/tx/${tx.txid}`)
      
      // 计算交易类型（收入/支出）和金额
      let type = 'unknown'
      let amount = 0
      
      // 遍历输入输出来确定交易类型和金额
      txDetails.data.vout.forEach(output => {
        if (output.scriptpubkey_address === address.value) {
          type = 'received'
          amount += output.value
        }
      })
      
      txDetails.data.vin.forEach(input => {
        if (input.prevout.scriptpubkey_address === address.value) {
          type = 'sent'
          amount += input.prevout.value
        }
      })

      return {
        txid: tx.txid,
        type,
        amount: amount / 100000000, // 转换为 BTC
        timestamp: new Date(tx.status.block_time * 1000),
        confirmations: tx.status.confirmed ? txDetails.data.status.block_height : 0
      }
    }))
  } catch (e) {
    error.value = '获取交易历史失败：' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h2>比特币交易历史</h2>
    
    <div class="search-box">
      <input 
        v-model="address"
        placeholder="输入比特币地址"
        @keyup.enter="getTransactionHistory"
      />
      <button 
        @click="getTransactionHistory"
        :disabled="loading"
        class="search-button"
      >
        {{ loading ? '查询中...' : '查询' }}
      </button>
    </div>

    <div class="error-message" v-if="error">
      {{ error }}
    </div>

    <div class="loading" v-if="loading">
      加载中...
    </div>

    <div class="transactions" v-if="transactions.length > 0">
      <div v-for="tx in transactions" :key="tx.txid" class="transaction-item">
        <div class="transaction-header">
          <span :class="['type-badge', tx.type === 'received' ? 'received' : 'sent']">
            {{ tx.type === 'received' ? '收入' : '支出' }}
          </span>
          <span :class="['amount', tx.type === 'received' ? 'received' : 'sent']">
            {{ tx.type === 'received' ? '+' : '-' }} {{ tx.amount.toFixed(8) }} BTC
          </span>
        </div>
        
        <div class="transaction-details">
          <div class="detail-item">
            时间: {{ tx.timestamp.toLocaleString() }}
          </div>
          <div class="detail-item">
            确认数: {{ tx.confirmations }}
          </div>
          <div class="detail-item">
            交易ID: 
            <a 
              :href="`https://blockstream.info/tx/${tx.txid}`" 
              target="_blank"
              class="txid-link"
            >
              {{ tx.txid.substring(0, 8) }}...
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading && !error">
      暂无交易记录
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

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-box input {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.search-button {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.transaction-item {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-badge.received {
  background-color: #e8f5e9;
  color: var(--success-color);
}

.type-badge.sent {
  background-color: #ffebee;
  color: var(--error-color);
}

.amount {
  font-weight: 600;
}

.amount.received {
  color: var(--success-color);
}

.amount.sent {
  color: var(--error-color);
}

.transaction-details {
  font-size: 14px;
  color: #666;
}

.detail-item {
  margin-bottom: 5px;
}

.txid-link {
  color: var(--primary-color);
  text-decoration: none;
}

.txid-link:hover {
  text-decoration: underline;
}

.error-message {
  color: var(--error-color);
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 10px;
}

.loading, .empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }
  
  .search-button {
    width: 100%;
  }
}
</style>