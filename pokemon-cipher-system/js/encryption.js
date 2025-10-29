/**
 * 寶可夢密碼系統 - 加密核心演算法
 * 包含：代換(XOR)、換位(Transposition)、能力值計算
 */

/**
 * 加密函數：對單一區塊（最多6 bytes）進行加密
 * @param {string} plaintext - 明文字串（最多6字元）
 * @param {Array<number>} speciesStrength - 種族值陣列 [HP, Atk, Def, SpA, SpD, Spe]
 * @param {number} pokemonIndex - 寶可夢圖鑑編號
 * @returns {Object} 加密結果
 */
function encryptBlock(plaintext, speciesStrength, pokemonIndex) {
    // 1. 將明文轉為 bytes，不足6個則補空格(ASCII 32)
    let plaintextBytes = [];
    for (let i = 0; i < 6; i++) {
        if (i < plaintext.length) {
            plaintextBytes.push(plaintext.charCodeAt(i));
        } else {
            plaintextBytes.push(32); // 補空格
        }
    }

    // 2. 代換 (Substitution)：XOR 運算
    let cipherBytes = [];
    for (let i = 0; i < 6; i++) {
        cipherBytes.push(plaintextBytes[i] ^ speciesStrength[i]);
    }

    // 3. 換位 (Transposition)：根據圖鑑編號進行循環平移
    const shift = pokemonIndex % 6;
    const transposedBytes = [
        ...cipherBytes.slice(shift),
        ...cipherBytes.slice(0, shift)
    ];

    // 4. 產生努力值 EV（換位後的 bytes 即為 EV）
    const evValues = [...transposedBytes];

    return {
        cipherBytes: transposedBytes,  // 最終密文
        evValues: evValues,             // 努力值（用於視覺化）
        shift: shift                    // 換位量（用於解密）
    };
}


/**
 * 計算寶可夢能力值
 * @param {number} baseStat - 種族值
 * @param {number} ev - 努力值（0-255）
 * @param {boolean} isHP - 是否為HP
 * @returns {number} 能力值
 */
function calculateStat(baseStat, ev, isHP = false) {
    const iv = 31;      // 個體值固定31
    const level = 50;   // 等級固定50
    const nature = 1.0; // 性格修正固定1.0（中性）

    if (isHP) {
        // HP 能力值公式
        return Math.floor((2 * baseStat + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
    } else {
        // 其他能力值公式
        return Math.floor((Math.floor((2 * baseStat + iv + Math.floor(ev / 4)) * level / 100) + 5) * nature);
    }
}


/**
 * 計算完整能力值組
 * @param {Array<number>} speciesStrength - 種族值 [HP, Atk, Def, SpA, SpD, Spe]
 * @param {Array<number>} evValues - 努力值 [HP, Atk, Def, SpA, SpD, Spe]
 * @returns {Array<number>} 能力值陣列
 */
function calculateAllStats(speciesStrength, evValues) {
    return [
        calculateStat(speciesStrength[0], evValues[0], true),  // HP
        calculateStat(speciesStrength[1], evValues[1], false), // Atk
        calculateStat(speciesStrength[2], evValues[2], false), // Def
        calculateStat(speciesStrength[3], evValues[3], false), // SpA
        calculateStat(speciesStrength[4], evValues[4], false), // SpD
        calculateStat(speciesStrength[5], evValues[5], false)  // Spe
    ];
}


/**
 * 加密完整明文（可處理多個區塊）
 * @param {string} plaintext - 完整明文（最多36字元）
 * @param {Array<Object>} pokemons - 寶可夢陣列，每個包含 {id, stats: [HP, Atk, Def, SpA, SpD, Spe]}
 * @returns {Array<Object>} 加密結果陣列
 */
function encryptFullText(plaintext, pokemons) {
    const results = [];
    const blockSize = 6;
    
    // 將明文分割為每6個字元一組
    for (let i = 0; i < pokemons.length; i++) {
        const start = i * blockSize;
        const end = Math.min(start + blockSize, plaintext.length);
        const block = plaintext.substring(start, end);
        
        // 加密此區塊
        const encrypted = encryptBlock(
            block,
            pokemons[i].stats,
            pokemons[i].id
        );
        
        // 計算能力值
        const statValues = calculateAllStats(
            pokemons[i].stats,
            encrypted.evValues
        );
        
        results.push({
            pokemonId: pokemons[i].id,
            pokemonName: pokemons[i].name,
            plaintext: block,
            cipherBytes: encrypted.cipherBytes,
            evValues: encrypted.evValues,
            statValues: statValues,
            shift: encrypted.shift,
            // RGB 色塊
            rgb1: [encrypted.evValues[0], encrypted.evValues[2], encrypted.evValues[4]], // HP, Def, SpD
            rgb2: [encrypted.evValues[1], encrypted.evValues[3], encrypted.evValues[5]]  // Atk, SpA, Spe
        });
    }
    
    return results;
}


// 匯出函數（如果在 Node.js 環境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        encryptBlock,
        calculateStat,
        calculateAllStats,
        encryptFullText
    };
}