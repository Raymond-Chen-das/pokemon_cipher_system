/**
 * 寶可夢密碼系統 - 主控制邏輯
 */

// 全域變數
let pokemonData = [];          // 所有寶可夢資料
let plaintext = '';            // 明文
let selectedPokemons = [];     // 選擇的寶可夢
let encryptedResults = [];     // 加密結果
let requiredCount = 0;         // 需要的寶可夢數量

// 🎁 隱藏彩蛋設定
const HIDDEN_POKEMON_IDS = [25];  // 皮卡丘的 ID
const HIDDEN_APPEAR_RATE = 0.15;  // 15% 的出現機率
let currentVisiblePokemons = [];  // 當前顯示的寶可夢列表

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 載入寶可夢資料
    try {
        pokemonData = await loadPokemonCSV('data/pokemon_stats.csv');
        console.log(`✓ 成功載入寶可夢資料: ${pokemonData.length} 隻`);
        
        // 為每隻寶可夢添加圖檔路徑與隱藏標記
        pokemonData.forEach(pokemon => {
            const idStr = String(pokemon.id).padStart(3, '0');
            pokemon.iconPath = `assets/icons/${idStr}.jpg`;
            pokemon.imagePath = `assets/images/${idStr}.jpg`;
            
            // 🎁 標記隱藏彩蛋
            pokemon.isHidden = HIDDEN_POKEMON_IDS.includes(pokemon.id);
        });
        
        // 初始化可見寶可夢列表
        updateVisiblePokemons();
        
    } catch (error) {
        console.error('❌ 載入寶可夢資料失敗:', error);
        showNotification('載入寶可夢資料失敗，請確認 data/pokemon_stats.csv 存在', 'error');
    }
    
    // 監聽明文輸入
    const plaintextInput = document.getElementById('plaintext-input');
    plaintextInput.addEventListener('input', onPlaintextChange);
});


/**
 * 明文輸入變更時的處理
 */
function onPlaintextChange() {
    const input = document.getElementById('plaintext-input');
    const text = input.value;
    const info = document.getElementById('plaintext-info');
    const errorDiv = document.getElementById('plaintext-error');
    const nextBtn = document.getElementById('next-btn-1');
    
    // 驗證明文
    const validation = validatePlaintext(text);
    
    // 計算需要的寶可夢數量
    requiredCount = text.length > 0 ? calculateRequiredPokemons(text) : 0;
    
    // 更新資訊
    info.innerHTML = `字元數：<strong style="color: #667eea;">${text.length}</strong> / 36 | 需要寶可夢：<strong style="color: #e74c3c;">${requiredCount}</strong> 隻`;
    
    // 顯示錯誤或清空
    if (!validation.valid && text.length > 0) {
        errorDiv.innerHTML = `<div class="error-box"><strong>⚠️ 輸入錯誤</strong><br>${validation.message}</div>`;
        nextBtn.disabled = true;
    } else {
        errorDiv.innerHTML = '';
        nextBtn.disabled = text.length === 0;
    }
}


/**
 * 生成隨機明文
 */
function generateRandom() {
    const length = Math.floor(Math.random() * 18) + 6; // 6-24 個字元
    const randomText = generateRandomPlaintext(length);
    document.getElementById('plaintext-input').value = randomText;
    onPlaintextChange();
    showNotification(`已生成 ${length} 個字元的隨機明文`, 'success');
}


/**
 * 切換到指定頁面
 */
function showPage(pageNum) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 顯示指定頁面
    document.getElementById(`page${pageNum}`).classList.add('active');
    
    // 更新進度指示器
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed');
        if (i < pageNum) {
            step.classList.add('completed');
        } else if (i === pageNum) {
            step.classList.add('active');
        }
    }
    
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


/**
 * 前往畫面二：選擇寶可夢
 */
function goToPage2() {
    plaintext = document.getElementById('plaintext-input').value;
    
    // 驗證明文
    const validation = validatePlaintext(plaintext);
    if (!validation.valid) {
        showNotification(validation.message, 'error');
        return;
    }
    
    // 計算需要的寶可夢數量
    requiredCount = calculateRequiredPokemons(plaintext);
    
    // 更新資訊
    document.getElementById('required-count').textContent = requiredCount;
    document.getElementById('total-needed').textContent = requiredCount;
    document.getElementById('selected-count').textContent = 0;
    
    // 重置選擇
    selectedPokemons = [];
    
    // 生成寶可夢選項
    renderPokemonGrid();
    
    // 切換頁面
    showPage(2);
    
    console.log(`📝 明文: "${plaintext}" (${plaintext.length} bytes, 需要 ${requiredCount} 隻寶可夢)`);
}


/**
 * 渲染寶可夢選擇網格
 */
function renderPokemonGrid() {
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';
    
    if (currentVisiblePokemons.length === 0) {
        grid.innerHTML = '<div class="error-box">無法載入寶可夢資料，請重新整理頁面</div>';
        return;
    }
    
    // 🎁 添加重新整理按鈕提示（修正：先移除舊的提示框）
    const existingHint = grid.parentElement.querySelector('.refresh-hint');
    if (existingHint) {
        existingHint.remove();
    }
    
    const refreshHint = document.createElement('div');
    refreshHint.className = 'info-box refresh-hint';  // 添加 class 方便移除
    refreshHint.style.marginBottom = '20px';
    refreshHint.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>💡 提示：部分稀有寶可夢可能不會出現，試試重新整理列表！</span>
            <button class="btn btn-secondary" onclick="refreshPokemonList()" style="padding: 8px 15px;">
                🔄 重新整理
            </button>
        </div>
    `;
    grid.parentElement.insertBefore(refreshHint, grid);
    
    // 渲染寶可夢卡片
    currentVisiblePokemons.forEach(pokemon => {
        const item = document.createElement('div');
        item.className = 'pokemon-item';
        
        // 🎁 隱藏彩蛋添加特殊樣式
        if (pokemon.isHidden) {
            item.classList.add('hidden-pokemon');
            item.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.6)';
            item.style.border = '3px solid gold';
        }
        
        item.onclick = () => togglePokemonSelection(pokemon, item);
        
        // ✅ 修正：使用圖片替代 emoji，移除種族值顯示
        item.innerHTML = `
            <div class="pokemon-icon">
                <img src="${pokemon.iconPath}" 
                     alt="${pokemon.name_zh}" 
                     style="width: 100%; height: 100%; object-fit: contain;"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='${pokemon.icon}';">
            </div>
            <div class="pokemon-name">
                ${pokemon.name_zh}
                ${pokemon.isHidden ? '<span style="color: gold; font-size: 12px;">⭐ 稀有</span>' : ''}
            </div>
            <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        `;
        
        grid.appendChild(item);
    });
}


/**
 * 切換寶可夢選擇狀態
 */
function togglePokemonSelection(pokemon, element) {
    const index = selectedPokemons.findIndex(p => p.id === pokemon.id);
    
    if (index >= 0) {
        // 取消選擇
        selectedPokemons.splice(index, 1);
        element.classList.remove('selected');
        console.log(`❌ 取消選擇: ${pokemon.name_zh}`);
    } else {
        // 檢查是否已達上限
        if (selectedPokemons.length >= requiredCount) {
            showNotification(`只需要選擇 ${requiredCount} 隻寶可夢！`, 'warning');
            return;
        }
        
        // 新增選擇（按照點擊順序）
        selectedPokemons.push(pokemon);
        element.classList.add('selected');
        console.log(`✓ 選擇: ${pokemon.name_zh} (第 ${selectedPokemons.length} 隻)`);
    }
    
    // 更新計數器
    updateSelectionCounter();
    
    // 更新按鈕狀態
    const nextBtn = document.getElementById('next-btn-2');
    nextBtn.disabled = selectedPokemons.length !== requiredCount;
}


/**
 * 更新選擇計數器
 */
function updateSelectionCounter() {
    const selectedCount = document.getElementById('selected-count');
    selectedCount.textContent = selectedPokemons.length;
    
    // 視覺回饋
    if (selectedPokemons.length === requiredCount) {
        selectedCount.style.color = '#27ae60';
    } else {
        selectedCount.style.color = '#e74c3c';
    }
}


/**
 * 前往畫面三：產生密文
 */
function goToPage3() {
    if (selectedPokemons.length !== requiredCount) {
        showNotification(`請選擇 ${requiredCount} 隻寶可夢！`, 'error');
        return;
    }
    
    console.log('🔐 開始加密...');
    console.log('選擇的寶可夢:', selectedPokemons.map(p => p.name_zh).join(', '));
    
    // 執行加密
    encryptedResults = encryptFullText(plaintext, selectedPokemons);
    
    console.log('✓ 加密完成，產生', encryptedResults.length, '個加密區塊');
    
    // 渲染密文視覺化
    renderCipherResult();
    
    // 切換頁面
    showPage(3);
}


/**
 * 渲染密文視覺化
 */
function renderCipherResult() {
    const container = document.getElementById('cipher-result');
    container.innerHTML = '';
    
    encryptedResults.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        
        // RGB 色塊
        const rgb1 = `rgb(${result.rgb1.join(',')})`;
        const rgb2 = `rgb(${result.rgb2.join(',')})`;
        
        // 寶可夢資訊
        const pokemon = selectedPokemons[index];
        const idStr = String(pokemon.id).padStart(3, '0');
        
        // 嘗試載入大圖，失敗則使用 emoji
        const imageHtml = `
            <div class="pokemon-image-container">
                <img class="pokemon-image-img" 
                     src="${pokemon.imagePath}" 
                     alt="${pokemon.name_zh}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="pokemon-image-emoji" style="display:none;">${pokemon.icon || '❓'}</div>
            </div>
        `;
        
        card.innerHTML = `
            <div class="pokemon-header">
                ${imageHtml}
                <div class="pokemon-info">
                    <div class="pokemon-title">
                        ${pokemon.name_zh} <span style="color: #7f8c8d; font-size: 20px;">${pokemon.role}</span>
                    </div>
                    <div class="pokemon-subtitle">
                        圖鑑編號: #${idStr} | 處理區塊: ${index + 1} | 字元數: ${result.plaintext.length}
                    </div>
                </div>
            </div>
            
            <div class="rgb-section">
                <div class="rgb-title">🎨 密文色彩編碼（RGB）</div>
                <div class="rgb-blocks">
                    <div class="rgb-block" style="background: ${rgb1};">
                        <div class="rgb-label">色塊 1 (HP, Def, SpD)</div>
                        <div class="rgb-value">RGB(${result.rgb1.join(', ')})</div>
                    </div>
                    <div class="rgb-block" style="background: ${rgb2};">
                        <div class="rgb-label">色塊 2 (Atk, SpA, Spe)</div>
                        <div class="rgb-value">RGB(${result.rgb2.join(', ')})</div>
                    </div>
                </div>
            </div>
            
            <div id="chart-${index}" style="margin-top: 25px;"></div>
        `;
        
        container.appendChild(card);
        
        // 使用 Plotly 繪製能力值長條圖
        setTimeout(() => renderStatChart(index, result, rgb1, rgb2), 100);
    });
    
    console.log('✓ 密文視覺化渲染完成');
}


/**
 * 使用 Plotly 繪製能力值長條圖
 */
function renderStatChart(index, result, rgb1, rgb2) {
    const statNames = ['HP', '攻擊', '防禦', '特攻', '特防', '速度'];
    const statValues = result.statValues;
    
    // 使用密文 RGB 作為長條顏色（交替使用兩種顏色）
    const colors = [rgb1, rgb2, rgb1, rgb2, rgb1, rgb2];
    
    const data = [{
        x: statNames,
        y: statValues,
        type: 'bar',
        marker: {
            color: colors,
            line: {
                color: '#2c3e50',
                width: 2
            }
        },
        text: statValues.map(v => v.toString()),
        textposition: 'outside',
        textfont: {
            size: 14,
            color: '#2c3e50',
            weight: 'bold'
        }
    }];
    
    const layout = {
        title: {
            text: '📊 能力值分布（用於視覺化）',
            font: { 
                size: 18, 
                color: '#34495e',
                family: 'Microsoft JhengHei, Arial'
            }
        },
        xaxis: { 
            title: '',
            tickfont: {
                size: 14,
                family: 'Microsoft JhengHei, Arial'
            }
        },
        yaxis: { 
            title: '能力值',
            titlefont: {
                size: 14,
                family: 'Microsoft JhengHei, Arial'
            },
            range: [0, Math.max(...statValues) + 30] 
        },
        margin: { t: 60, b: 50, l: 60, r: 30 },
        plot_bgcolor: '#fafafa',
        paper_bgcolor: 'transparent',
        font: {
            family: 'Microsoft JhengHei, Arial'
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot(`chart-${index}`, data, layout, config);
}


/**
 * 解密密文
 */
function decryptCipher() {
    console.log('🔓 開始解密...');
    
    const decrypted = decryptFullText(encryptedResults, selectedPokemons);
    
    console.log(`✓ 解密完成: "${decrypted}"`);
    
    const resultDiv = document.getElementById('decrypted-result');
    const isCorrect = plaintext === decrypted;
    
    resultDiv.innerHTML = `
        <div class="decrypt-result">
            <h3 class="decrypt-title">🔓 解密結果</h3>
            <div class="decrypt-content">
                ${decrypted}
            </div>
            <div class="decrypt-info">
                <strong>📝 原始明文：</strong>${plaintext}<br>
                <strong>🔐 解密結果：</strong>${decrypted}<br>
                <strong>✓ 驗證狀態：</strong>${isCorrect ? '<span style="font-size: 18px;">✅ 完全正確！</span>' : '<span style="font-size: 18px;">❌ 不一致</span>'}
            </div>
        </div>
    `;
    
    // 滾動到結果
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    showNotification(isCorrect ? '解密成功！' : '解密失敗，結果不一致', isCorrect ? 'success' : 'error');
}


/**
 * 返回畫面一
 */
function goToPage1() {
    // 清空解密結果
    document.getElementById('decrypted-result').innerHTML = '';
    
    // 重置變數
    selectedPokemons = [];
    encryptedResults = [];
    
    showPage(1);
    
    console.log('🔄 返回畫面一');
}

/**
 * 🎲 更新可見寶可夢列表（隱藏彩蛋隨機出現）
 */
function updateVisiblePokemons() {
    currentVisiblePokemons = pokemonData.filter(pokemon => {
        if (pokemon.isHidden) {
            // 隱藏彩蛋：按機率出現
            return Math.random() < HIDDEN_APPEAR_RATE;
        } else {
            // 一般寶可夢：總是顯示
            return true;
        }
    });
    
    // 檢查是否有隱藏寶可夢出現
    const hiddenAppeared = currentVisiblePokemons.some(p => p.isHidden);
    if (hiddenAppeared) {
        console.log('🎁 隱藏彩蛋出現了！');
    }
}


/**
 * 🔄 重新整理寶可夢列表
 */
function refreshPokemonList() {
    // 清空當前選擇
    selectedPokemons = [];
    document.querySelectorAll('.pokemon-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 重新抽取可見寶可夢
    updateVisiblePokemons();
    
    // 重新渲染
    renderPokemonGrid();
    
    // 更新計數器
    document.getElementById('selected-count').textContent = 0;
    document.getElementById('next-btn-2').disabled = true;
    
    showNotification('已重新整理寶可夢列表', 'info');
}
