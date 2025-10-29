/**
 * 寶可夢密碼系統 - 解密核心演算法
 * 反向執行：換位還原 → XOR 還原
 */

/**
 * 解密函數：對單一區塊進行解密
 * @param {Array<number>} cipherBytes - 密文 bytes（6個）
 * @param {Array<number>} speciesStrength - 種族值陣列 [HP, Atk, Def, SpA, SpD, Spe]
 * @param {number} pokemonIndex - 寶可夢圖鑑編號
 * @param {boolean} isLastBlock - 是否為最後一個區塊（預設 true，用於向後兼容）
 * @returns {string} 解密後的明文
 */
function decryptBlock(cipherBytes, speciesStrength, pokemonIndex, isLastBlock = true) {
    // 1. 反向換位 (Reverse Transposition)
    const shift = pokemonIndex % 6;
    const reverseShift = (6 - shift) % 6;
    
    const detransposedBytes = [
        ...cipherBytes.slice(reverseShift),
        ...cipherBytes.slice(0, reverseShift)
    ];

    // 2. 反向代換 (Reverse Substitution)：再次 XOR 還原
    let plaintextBytes = [];
    for (let i = 0; i < 6; i++) {
        plaintextBytes.push(detransposedBytes[i] ^ speciesStrength[i]);
    }

    // 3. 轉回字串
    let plaintext = '';
    for (let byte of plaintextBytes) {
        plaintext += String.fromCharCode(byte);
    }
    
    // 🔧 修正：只在最後一個區塊移除補位的空格
    if (isLastBlock) {
        return plaintext.trimEnd();
    } else {
        return plaintext;
    }
}


/**
 * 從 RGB 色塊反推密文 bytes
 * @param {Array<number>} rgb1 - 第一個 RGB [HP, Def, SpD]
 * @param {Array<number>} rgb2 - 第二個 RGB [Atk, SpA, Spe]
 * @returns {Array<number>} 密文 bytes [HP, Atk, Def, SpA, SpD, Spe]
 */
function rgbToCipherBytes(rgb1, rgb2) {
    return [
        rgb1[0], // HP
        rgb2[0], // Atk
        rgb1[1], // Def
        rgb2[1], // SpA
        rgb1[2], // SpD
        rgb2[2]  // Spe
    ];
}


/**
 * 解密完整密文（多個區塊）
 * @param {Array<Object>} encryptedBlocks - 加密結果陣列
 * @param {Array<Object>} pokemons - 對應的寶可夢陣列
 * @returns {string} 完整明文
 */
function decryptFullText(encryptedBlocks, pokemons) {
    let fullPlaintext = '';
    
    for (let i = 0; i < encryptedBlocks.length; i++) {
        const block = encryptedBlocks[i];
        const pokemon = pokemons[i];
        
        // 🔧 修正：傳入 isLastBlock 參數
        const isLastBlock = (i === encryptedBlocks.length - 1);
        
        const plaintext = decryptBlock(
            block.cipherBytes,
            pokemon.stats,
            pokemon.id,
            isLastBlock  // 只有最後一個區塊才移除補位空格
        );
        
        fullPlaintext += plaintext;
    }
    
    return fullPlaintext;
}


/**
 * 從視覺化資料解密（駭客視角）
 * 駭客只能看到 RGB 色塊，需要反推密文
 * @param {Array<Object>} visualData - 視覺化資料，包含 rgb1, rgb2
 * @param {Array<Object>} pokemons - 寶可夢資料（若已知）
 * @returns {string} 解密明文
 */
function decryptFromVisualization(visualData, pokemons) {
    let fullPlaintext = '';
    
    for (let i = 0; i < visualData.length; i++) {
        const data = visualData[i];
        const pokemon = pokemons[i];
        
        // 從 RGB 反推密文 bytes（即 EV 值）
        const cipherBytes = rgbToCipherBytes(data.rgb1, data.rgb2);
        
        // 🔧 修正：判斷是否為最後一個區塊
        const isLastBlock = (i === visualData.length - 1);
        
        // 解密
        const plaintext = decryptBlock(
            cipherBytes,
            pokemon.stats,
            pokemon.id,
            isLastBlock
        );
        
        fullPlaintext += plaintext;
    }
    
    return fullPlaintext;
}


// 匯出函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        decryptBlock,
        rgbToCipherBytes,
        decryptFullText,
        decryptFromVisualization
    };
}