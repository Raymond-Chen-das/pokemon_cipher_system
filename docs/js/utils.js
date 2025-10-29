/**
 * 寶可夢密碼系統 - 工具函數
 * 包含：CSV讀取、資料驗證、格式化等
 */

/**
 * 使用 PapaParse 讀取 CSV 檔案
 * @param {string} filePath - CSV 檔案路徑
 * @returns {Promise<Array>} 解析後的資料陣列
 */
async function loadPokemonCSV(filePath) {
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error('CSV 解析錯誤:', results.errors);
                    reject(results.errors);
                } else {
                    // 格式化資料
                    const pokemons = results.data.map(row => ({
                        id: row.id,
                        name_zh: row.name_zh,
                        stats: [
                            row.hp,
                            row.atk,
                            row.def,
                            row.spa,
                            row.spd,
                            row.spe
                        ],
                        icon: row.icon_emoji || '❓',
                        role: row.role || ''
                    }));
                    resolve(pokemons);
                }
            },
            error: (error) => {
                console.error('CSV 載入失敗:', error);
                reject(error);
            }
        });
    });
}


/**
 * 計算明文需要的寶可夢數量
 * @param {string} plaintext - 明文字串
 * @returns {number} 需要的寶可夢數量（1-6）
 */
function calculateRequiredPokemons(plaintext) {
    const blockSize = 6;
    const length = plaintext.length;
    if (length === 0) return 1;
    return Math.ceil(length / blockSize);
}


/**
 * 驗證明文是否合法（ASCII 範圍）
 * @param {string} text - 輸入文字
 * @returns {Object} {valid: boolean, message: string}
 */
function validatePlaintext(text) {
    if (text.length === 0) {
        return { valid: false, message: '請輸入明文' };
    }
    
    if (text.length > 36) {
        return { valid: false, message: '明文長度超過限制（最多36個字元）' };
    }
    
    // 檢查是否全為 ASCII 字元（0-127）
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > 127) {
            return { 
                valid: false, 
                message: `字元 "${text[i]}" 不在 ASCII 範圍內（位置 ${i+1}）` 
            };
        }
    }
    
    return { valid: true, message: '' };
}


/**
 * 格式化 byte 陣列為易讀格式
 * @param {Array<number>} bytes - byte 陣列
 * @returns {string} 格式化字串
 */
function formatBytes(bytes) {
    return '[' + bytes.map(b => b.toString().padStart(3, ' ')).join(', ') + ']';
}


/**
 * RGB 轉為 HEX 色碼
 * @param {Array<number>} rgb - RGB 陣列 [R, G, B]
 * @returns {string} HEX 色碼（如 #FF0000）
 */
function rgbToHex(rgb) {
    return '#' + rgb.map(c => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}


/**
 * 將文字複製到剪貼簿
 * @param {string} text - 要複製的文字
 * @returns {Promise<boolean>} 是否成功
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('複製失敗:', err);
        return false;
    }
}


/**
 * 顯示通知訊息
 * @param {string} message - 訊息內容
 * @param {string} type - 類型 ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


/**
 * 產生隨機測試明文
 * @param {number} length - 明文長度（1-36）
 * @returns {string} 隨機明文
 */
function generateRandomPlaintext(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !?';
    let result = '';
    for (let i = 0; i < Math.min(length, 36); i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


// CSS 動畫（需在 <style> 中定義）
const notificationStyles = `
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}
`;


// 匯出函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadPokemonCSV,
        calculateRequiredPokemons,
        validatePlaintext,
        formatBytes,
        rgbToHex,
        copyToClipboard,
        showNotification,
        generateRandomPlaintext
    };
}