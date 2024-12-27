<script setup>
import { ref } from "vue";
import * as bitcoin from 'bitcoinjs-lib'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
const ECPair = ECPairFactory(ecc)
// const network = bitcoin.networks.bitcoin // 主网，测试网使用 bitcoin.networks.testnet
const network = bitcoin.networks.testnet
const fromAddress = ref('')
const toAddress = ref('')
const amount = ref('')  
const privateKey = ref('')
const txStatus = ref('')

async function sendBitcoin() {
  try {
    // 1. 验证输入
    if (!fromAddress.value || !toAddress.value || !amount.value || !privateKey.value) {
      txStatus.value = '请填写所有必要信息'
      return
    }

    // 2. 创建交易
    const keyPair = ECPair.fromWIF(privateKey.value, network)
    const txb = new bitcoin.TransactionBuilder(network) 

    // 3. 获取UTXO (这里需要通过API获取)
    const utxos = await getUTXOs(fromAddress.value)
    
    // 4. 添加输入
    let totalAmount = 0
    utxos.forEach(utxo => {
      txb.addInput(utxo.txid, utxo.vout)
      totalAmount += utxo.value
    })

    // 5. 添加输出
    const amountInSatoshis = Math.floor(amount.value * 100000000)
    txb.addOutput(toAddress.value, amountInSatoshis)
    
    // 找零地址
    const change = totalAmount - amountInSatoshis - 1000 // 减去手续费
    if (change > 0) {
      txb.addOutput(fromAddress.value, change)
    }

    // 6. 签名交易
    for (let i = 0; i < utxos.length; i++) {
      txb.sign(i, keyPair)
    }

    // 7. 广播交易
    const tx = txb.build()
    const txHex = tx.toHex()
    await broadcastTransaction(txHex)

    txStatus.value = '交易已发送'
  } catch (error) {
    console.error(error)
    txStatus.value = '交易失败: ' + error.message
  }
}

// 获取UTXO的函数
async function getUTXOs(address) {
  const response = await fetch(`https://blockstream.info/api/address/${address}/utxo`)
  return await response.json()
}

// 广播交易的函数
async function broadcastTransaction(txHex) {
  const response = await fetch('https://blockstream.info/api/tx', {
    method: 'POST',
    body: txHex
  })
  return await response.json()
}
</script>
<template>
  <div class="container">
    <h2>比特币转账</h2>
    <div class="form-group">
      <label>发送地址：</label>
      <input v-model="fromAddress" placeholder="输入发送地址" />
    </div>
    
    <div class="form-group">
      <label>接收地址：</label>
      <input v-model="toAddress" placeholder="输入接收地址" />
    </div>
    
    <div class="form-group">
      <label>金额(BTC)：</label>
      <input v-model="amount" type="number" step="0.00000001" placeholder="输入转账金额" />
    </div>
    
    <div class="form-group">
      <label>私钥(WIF格式)：</label>
      <input v-model="privateKey" type="password" placeholder="输入私钥" />
    </div>
    
    <div class="button-container">
      <button @click="sendBitcoin">发送交易</button>
    </div>
    
    <div v-if="txStatus" class="status-message" :class="{ error: txStatus.includes('失败') }">
      {{ txStatus }}
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.2);
}

input::placeholder {
  color: #999;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  min-width: 150px;
  padding: 14px 28px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(1px);
}

.status-message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-message.error {
  background-color: #ffebee;
  color: #c62828;
}

@media (max-width: 768px) {
  .container {
    margin: 10px;
    padding: 15px;
  }
  
  input {
    padding: 10px;
  }
  
  button {
    padding: 12px 24px;
    min-width: 120px;
  }
}
</style>