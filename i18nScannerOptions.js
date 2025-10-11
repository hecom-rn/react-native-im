// 简单的免费翻译（MyMemory）后台缓存实现：
// 设计原则：
// 1. 不引入额外依赖；使用 https 发起请求。
// 2. 保持函数同步签名：第一次调用立即返回原文，后台异步获取翻译并写入缓存；第二次及以后命中缓存直接返回翻译。
// 3. 缓存持久化到项目根目录下 .i18n-translation-cache.json，避免重复请求浪费免费额度。
// 4. 失败静默，不影响扫描流程。
// 如果以后允许改为 async，只需把 translate 改为 async 并 await fetchMyMemory 即可。

const fs = require('fs');
const path = require('path');
const https = require('https');

const CACHE_FILE = path.join(__dirname, '.i18n-translation-cache.json');
let __i18nCache = {};
try {
    __i18nCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) || {};
} catch (e) {
    // ignore read error – cache file may not exist yet
}

let __saveTimer = null;   
function saveCacheDebounced() {
    if (__saveTimer) return;
    __saveTimer = setTimeout(() => {
        __saveTimer = null;
        try {
            fs.writeFileSync(CACHE_FILE, JSON.stringify(__i18nCache, null, 2), 'utf8');
        } catch (e) {
            // ignore write error
        }
    }, 500);
}

function fetchMyMemory(text, from = 'zh-CN', to = 'en') {
    return new Promise((resolve, reject) => {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            text
        )}&langpair=${from}|${to}`;
        const req = https.get(url, (res) => {
            let raw = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                raw += chunk;
            });
            res.on('end', () => {
                try {
                    const data = JSON.parse(raw);
                    let translated = null;
                    if (data && data.responseData) {
                        translated = data.responseData.translatedText;
                    }
                    resolve(translated || null);
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(5000, function onTimeout() {
            this.destroy();
            reject(new Error('timeout'));
        });
    });
}

module.exports = {
   // 自定义翻译函数（同步接口 + 后台异步填充）
    translate(text) {
        if (!text || typeof text !== 'string') return text;
        const from = 'zh-CN';
        const to = 'en';
        const key = `${from}|${to}|${text}`;

        // 命中缓存直接返回
        if (__i18nCache[key]) return __i18nCache[key];

        // 先返回原文占位，避免阻塞；同时触发后台请求
        __i18nCache[key] = text; // 预填原文，保证二次命中有值
        saveCacheDebounced();

        fetchMyMemory(text, from, to)
            .then((result) => {
                if (result && typeof result === 'string' && result.trim()) {
                    __i18nCache[key] = result;
                    saveCacheDebounced();
                }
            })
            .catch(() => {
                /* 静默失败：保持原文缓存 */
            });

        return __i18nCache[key];
    },

    // 自定义哈希生成函数
    generateStableHash(str) {
        // 用户可以实现自己的哈希算法
        const crypto = require('crypto');
        return 'im_' + crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
    },

    // 自定义忽略文件列表
    ignoreFiles: [],
};
