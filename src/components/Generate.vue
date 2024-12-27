<script setup>
import { ref } from "vue";
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import copyIcon from '@/assets/icons/copy.svg'

// 定义状态
const mnemonic = ref("");
const btcAddress = ref("");
const copyStatus = ref(""); // 用于显示复制状态

// 初始化 BIP32
const bip32 = BIP32Factory(ecc);

// 复制功能
async function copyToClipboard(text, type) {
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.value = `${type}已复制`;
    setTimeout(() => {
      copyStatus.value = "";
    }, 2000);
  } catch (err) {
    copyStatus.value = "复制失败";
  }
}

async function generateMnemonic() {
  // 生成助记词
  // console.log(bip39);
  mnemonic.value = bip39.generateMnemonic();
  const seed = await bip39.mnemonicToSeed(mnemonic.value);
  
  // 生成比特币钱包
  // const bitcoinNetwork = bitcoin.networks.bitcoin; // 主网络，测试网络用 bitcoin.networks.testnet
  const bitcoinNetwork = bitcoin.networks.testnet;
  const root = bip32.fromSeed(seed, bitcoinNetwork);

  // 使用 BIP44 路径：m/44'/0'/0'/0/0 (比特币)
  const path = "m/44'/0'/0'/0/0";
  const child = root.derivePath(path);

  // 生成地址
  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network: bitcoinNetwork,
  });
  // 更新状态
  btcAddress.value = address;
}
</script>

<template>
  <div class="container">
    <h2>生成钱包</h2>
    <div class="button-container">
      <button class="primary-button" @click="generateMnemonic">随机生成助记词及对应地址</button>
    </div>
    <div class="info-box" v-if="mnemonic">
      <div class="info-item">
        <label>助记词:</label>
        <div class="copy-container">
          <div class="mnemonic">{{ mnemonic }}</div>
          <button class="copy-button" @click="copyToClipboard(mnemonic, '助记词')" title="复制助记词">
            <img :src="copyIcon" alt="copy" class="icon" />
          </button>
        </div>
      </div>
      <div class="info-item">
        <label>地址:</label>
        <div class="copy-container">
          <div class="address">{{ btcAddress }}</div>
          <button class="copy-button" @click="copyToClipboard(btcAddress, '地址')" title="复制地址">
            <img :src="copyIcon" alt="copy" class="icon" />
          </button>
        </div>
      </div>
      <div v-if="copyStatus" class="copy-status">
        {{ copyStatus }}
      </div>
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

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.primary-button {
  min-width: 200px;
  padding: 14px 28px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.info-box {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info-item {
  margin-bottom: 15px;
}

.info-item label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #666;
}

.copy-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: all 0.3s ease;
  height: 100%;
}

.icon {
  width: 16px;
  height: 16px;
}

.copy-button:hover {
  background-color: #f0f0f0;
}

.copy-button:hover .icon {
  filter: invert(53%) sepia(68%) saturate(434%) hue-rotate(78deg) brightness(95%) contrast(89%);
}

.copy-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mnemonic, .address {
  flex: 1;
  word-break: break-all;
  padding: 10px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-height: 24px;
  display: flex;
  align-items: center;
}
</style>
