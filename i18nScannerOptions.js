

module.exports = {
    // 自定义哈希生成函数
    generateStableHash(str) {
        // 用户可以实现自己的哈希算法
        const crypto = require('crypto');
        return 'im_' + crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
    },

    // 自定义忽略文件列表
    ignoreFiles: [],
};
