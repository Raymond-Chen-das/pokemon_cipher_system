# 🏗️ 技術架構與實作說明

## 📐 系統架構

### 整體架構圖
```
┌─────────────────────────────────────────────────┐
│              寶可夢密文系統                          │
├─────────────────────────────────────────────────┤
│  index.html (主程式 + UI 框架)                     │
├──────────────┬──────────────┬───────────────────┤
│   畫面一        │   畫面二        │   畫面三           │
│ (明文輸入)      │ (寶可夢選擇)     │ (密文視覺化)        │
└──────────────┴──────────────┴───────────────────┘
        ↓               ↓               ↓
┌─────────────────────────────────────────────────┐
│              JavaScript 模組                      │
├──────────────┬──────────────┬───────────────────┤
│   app.js     │ encryption.js│  decryption.js    │
│ (主控制邏輯)   │  (加密演算法)  │  (解密演算法)       │
└──────────────┴──────────────┴───────────────────┘
        ↓               ↓               ↓
┌─────────────────────────────────────────────────┐
│                utils.js (工具函數)                 │
│  • CSV 讀取 (PapaParse)                          │
│  • 資料驗證                                       │
│  • 格式化工具                                     │
└─────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────┐
│              外部資源                              │
├──────────────┬──────────────┬───────────────────┤
│ pokemon_stats│   assets/    │  CDN Libraries    │
│    .csv      │  (圖檔)       │ • PapaParse       │
│              │              │ • Plotly.js       │
└──────────────┴──────────────┴───────────────────┘
```

---

## 🖼️ 圖檔說明

### 圖檔命名規則
- 小圖示：`assets/icons/001.png`, `025.png` 等
- 大圖：`assets/images/001.png`, `025.png` 等
- 使用三位數字編號（例如 001, 025）

### Fallback 機制
- 如果圖檔載入失敗，自動顯示 emoji icon
- 確保系統在無圖檔情況下仍可運作

## 📊 CSV 資料格式

```csv
id,name,name_zh,hp,atk,def,spa,spd,spe,icon_emoji
1,Bulbasaur,妙蛙種子,45,49,49,65,65,45,🌱
25,Pikachu,皮卡丘,35,55,40,50,50,90,⚡
```

## 🔧 核心模組說明

### 1. index.html - 主程式框架

**職責：**
- 定義三個畫面的結構
- 整合 CSS 樣式
- 引入 JavaScript 模組

**關鍵功能：**
```html
<!-- 畫面切換機制 -->
<div class="page active" id="page1">...</div>
<div class="page" id="page2">...</div>
<div class="page" id="page3">...</div>

<!-- 進度指示器 -->
<div class="progress-steps">
  <div class="step active" id="step1">1</div>
  <div class="step" id="step2">2</div>
  <div class="step" id="step3">3</div>
</div>
```

---

### 2. app.js - 主控制邏輯

**職責：**
- 頁面流程控制
- 寶可夢選擇管理
- 密文視覺化渲染

**核心函數：**

#### `goToPage2()` - 前往畫面二
```javascript
function goToPage2() {
    plaintext = document.getElementById('plaintext-input').value;
    requiredCount = calculateRequiredPokemons(plaintext);
    renderPokemonGrid();
    showPage(2);
}
```

#### `togglePokemonSelection()` - 選擇寶可夢
```javascript
function togglePokemonSelection(pokemon, element) {
    if (已選擇) {
        取消選擇
    } else if (未達上限) {
        新增選擇
    }
    updateSelectionCounter();
}
```

#### `renderCipherResult()` - 渲染密文視覺化
```javascript
function renderCipherResult() {
    encryptedResults.forEach((result, index) => {
        // 建立寶可夢卡片
        // 顯示 RGB 色塊
        // 繪製 Plotly 長條圖
    });
}
```

---

### 3. encryption.js - 加密演算法

**職責：**
- 實作 XOR 代換
- 實作循環平移換位
- 計算能力值

**核心函數：**

#### `encryptBlock()` - 加密單一區塊
```javascript
function encryptBlock(plaintext, speciesStrength, pokemonIndex) {
    // 1. 明文轉 bytes（補空格至 6 bytes）
    // 2. XOR 代換
    // 3. 循環平移（shift = pokemonIndex % 6）
    // 4. 回傳密文 bytes
}
```

**流程圖：**
```
明文 "Hello!"
   ↓ 轉 ASCII
[72, 101, 108, 108, 111, 33]
   ↓ XOR 種族值 [35, 55, 40, 50, 50, 90]
[107, 82, 68, 94, 93, 123]
   ↓ 循環平移 (shift = 25 % 6 = 1)
[82, 68, 94, 93, 123, 107]  ← 密文
```

#### `calculateAllStats()` - 計算能力值
```javascript
function calculateAllStats(speciesStrength, evValues) {
    return [
        calculateStat(speciesStrength[0], evValues[0], true),  // HP
        calculateStat(speciesStrength[1], evValues[1], false), // Atk
        // ... 其他能力值
    ];
}
```

**能力值公式：**
```javascript
// HP 能力值
HP = ⌊(2×種族值 + 31 + ⌊EV/4⌋) × 50/100⌋ + 50 + 10

// 其他能力值
Stat = ⌊(⌊(2×種族值 + 31 + ⌊EV/4⌋) × 50/100⌋ + 5) × 1.0⌋
```

---

### 4. decryption.js - 解密演算法

**職責：**
- 反向循環平移
- 反向 XOR 代換
- 從 RGB 還原密文

**核心函數：**

#### `decryptBlock()` - 解密單一區塊
```javascript
function decryptBlock(cipherBytes, speciesStrength, pokemonIndex, isLastBlock) {
    // 1. 反向循環平移
    // 2. 反向 XOR（XOR 自身反函數）
    // 3. 轉回字串
    // 4. 移除補位空格（僅最後一個區塊）
}
```

**流程圖：**
```
密文 [82, 68, 94, 93, 123, 107]
   ↓ 反向平移 (reverseShift = (6 - 1) % 6 = 5)
[107, 82, 68, 94, 93, 123]
   ↓ 反向 XOR [35, 55, 40, 50, 50, 90]
[72, 101, 108, 108, 111, 33]
   ↓ 轉 ASCII
"Hello!"
```

#### `rgbToCipherBytes()` - RGB 還原密文
```javascript
function rgbToCipherBytes(rgb1, rgb2) {
    return [
        rgb1[0],  // HP
        rgb2[0],  // Atk
        rgb1[1],  // Def
        rgb2[1],  // SpA
        rgb1[2],  // SpD
        rgb2[2]   // Spe
    ];
}
```

---

### 5. utils.js - 工具函數

**職責：**
- CSV 讀取與解析
- 資料驗證
- 格式化工具

**核心函數：**

#### `loadPokemonCSV()` - 載入 CSV
```javascript
async function loadPokemonCSV(filePath) {
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            complete: (results) => {
                // 格式化資料並回傳
            }
        });
    });
}
```

#### `validatePlaintext()` - 驗證明文
```javascript
function validatePlaintext(text) {
    if (text.length === 0) return { valid: false, ... };
    if (text.length > 36) return { valid: false, ... };
    
    // 檢查 ASCII 範圍 (0-127)
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) > 127) {
            return { valid: false, ... };
        }
    }
    
    return { valid: true };
}
```

---

## 🎨 視覺化機制

### RGB 色塊對應

**密文 bytes → EV 值 → RGB 顏色**

```javascript
// 6 個 EV 值分為 2 組 RGB
rgb1 = [EV_HP, EV_Def, EV_SpD]    // 色塊 1
rgb2 = [EV_Atk, EV_SpA, EV_Spe]   // 色塊 2
```

**範例：**
```
密文 bytes: [142, 89, 156, 198, 121, 203]
         ↓
rgb1: RGB(142, 89, 156)   - 紫色系
rgb2: RGB(198, 121, 203)  - 粉紫色系
```

### Plotly 長條圖

**能力值對應顏色：**
```javascript
const colors = [rgb1, rgb2, rgb1, rgb2, rgb1, rgb2];
// HP(rgb1), Atk(rgb2), Def(rgb1), SpA(rgb2), SpD(rgb1), Spe(rgb2)
```

---

## 🖼️ 圖檔處理機制

### 自動路徑對應
```javascript
pokemon.iconPath = `assets/icons/${id.padStart(3, '0')}.png`;
pokemon.imagePath = `assets/images/${id.padStart(3, '0')}.png`;
```

### Fallback 機制
```html
<img src="${pokemon.iconPath}" 
     onerror="this.style.display='none'; 
              this.nextElementSibling.style.display='block';">
<div class="pokemon-icon-emoji" style="display:none;">
    ${pokemon.icon}
</div>
```

**處理流程：**
```
1. 嘗試載入 assets/icons/025.png
   ↓
2. 載入失敗 (onerror)
   ↓
3. 隱藏 <img> 元素
   ↓
4. 顯示 <div> 中的 emoji (⚡)
```

---

## 🔒 安全性考量

### 1. 輸入驗證
- 僅接受 ASCII 字元（0-127）
- 限制明文長度（最多 36 bytes）
- 防止注入攻擊

### 2. XOR 屬性
- **自身反函數**：`A XOR B XOR B = A`
- **可逆性**：加密和解密使用相同運算
- **無隨機性**：相同輸入產生相同輸出

### 3. 限制
- **Known Plaintext Attack**：若知道明文與密文，可反推密鑰
- **Ciphertext Only Attack**：若有足夠密文，可統計分析
- **教學用途**：不適合實際安全應用

---

## 📊 效能分析

### 時間複雜度
- **加密**：O(n)，n = 明文長度
- **解密**：O(n)
- **視覺化渲染**：O(m)，m = 寶可夢數量

### 空間複雜度
- **記憶體**：O(m)，儲存 m 個加密結果

### 瓶頸分析
1. **CSV 載入**：約 100ms（PapaParse）
2. **Plotly 渲染**：約 50ms/圖表
3. **DOM 操作**：約 10ms/卡片

---

## 🔄 資料流程

```
使用者輸入明文
    ↓
驗證明文 (utils.js)
    ↓
選擇 N 隻寶可夢
    ↓
加密 (encryption.js)
    ├─ 代換 (XOR)
    ├─ 換位 (循環平移)
    └─ 計算能力值
    ↓
視覺化 (app.js + Plotly)
    ├─ RGB 色塊
    └─ 長條圖
    ↓
解密驗證 (decryption.js)
    ├─ 反向換位
    └─ 反向代換
    ↓
顯示結果
```

---

## 🎯 設計模式

### 1. 模組化設計
- 每個 JS 檔案負責單一職責
- 函數職責明確，易於測試

### 2. 事件驅動
```javascript
document.addEventListener('DOMContentLoaded', init);
input.addEventListener('input', onPlaintextChange);
element.onclick = () => toggleSelection();
```

### 3. 狀態管理
```javascript
let pokemonData = [];      // 全域狀態
let selectedPokemons = []; // 選擇狀態
let encryptedResults = []; // 加密結果
```

---

## 🧪 測試策略

### 單元測試範例
```javascript
// 測試加密/解密
const plaintext = "Hello!";
const pokemon = { id: 25, stats: [35, 55, 40, 50, 50, 90] };
const encrypted = encryptBlock(plaintext, pokemon.stats, pokemon.id);
const decrypted = decryptBlock(encrypted.cipherBytes, pokemon.stats, pokemon.id);
assert(plaintext === decrypted);
```

### 整合測試
1. 輸入明文 → 選擇寶可夢 → 加密 → 解密
2. 驗證：原始明文 === 解密結果

---

## 📚 延伸閱讀

- **密碼學基礎**：代換密碼、換位密碼
- **XOR 加密**：對稱加密原理
- **寶可夢能力值計算**：官方公式
- **Plotly.js 文件**：圖表客製化

---

**技術文件版本**：1.0.0  
**最後更新**：2025-10-29
