const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

// 1. 请在这里填入你的腾讯云 COS 密钥信息
const SECRET_ID = '你的 SecretId';
const SECRET_KEY = '你的 SecretKey';
const BUCKET = 'pet-1310518898';     // 替换为你的 Bucket 名称
const REGION = 'ap-guangzhou';       // 替换为你的所属地域

const cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY,
});

// 需要上传的本地文件夹绝对路径
const LOCAL_DIR = '/Users/mango/Documents/class-pet-house/assets/pets';

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dirPath, filesArray = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, filesArray);
        } else {
            // 过滤掉隐藏文件比如 .DS_Store
            if (!file.startsWith('.')) {
                filesArray.push(fullPath);
            }
        }
    });

    return filesArray;
}

/**
 * 上传单个文件
 */
function uploadFile(localFilePath) {
    // 算出该文件相对于 LOCAL_DIR 的相对路径，作为云端的 Key (也是去除了第一个 / 的路径)
    const relativePath = path.relative(LOCAL_DIR, localFilePath);

    // 因为 Windows 系统的路径分隔符是反斜杠，COS 需要正斜杠，所以统一替换
    const cosKey = relativePath.split(path.sep).join('/');

    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: BUCKET,
            Region: REGION,
            Key: cosKey,
            StorageClass: 'STANDARD',
            Body: fs.createReadStream(localFilePath),
            onProgress: function (progressData) {
                // 如果文件很大可以看进度，这里文件小就注释掉了
                // console.log(`[${cosKey}] 上传中... ${JSON.stringify(progressData)}`);
            }
        }, function (err, data) {
            if (err) {
                console.error(`❌ 上传失败: ${cosKey}`, err.Message || err);
                reject(err);
            } else {
                console.log(`✅ 上传成功: ${cosKey}`);
                resolve(data);
            }
        });
    });
}

/**
 * 主执行函数：并发限制上传
 */
async function startUpload() {
    console.log(`🔍 开始扫描目录: ${LOCAL_DIR}`);
    if (!fs.existsSync(LOCAL_DIR)) {
        console.error('❌ 本地目录不存在，请检查路径！');
        return;
    }

    const allFiles = getAllFiles(LOCAL_DIR);
    console.log(`📦 扫描完毕，共发现 ${allFiles.length} 个文件需要上传\n`);

    // 为了防止一次性发起几百个请求导致内存溢出或网络堵塞，我们使用批量并发控制 (例如每次传 10 个)
    const CONCURRENCY = 10;

    for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
        const chunk = allFiles.slice(i, i + CONCURRENCY);
        // 等待这一批次的文件全部上传完成
        await Promise.all(chunk.map(file => uploadFile(file)));
    }

    console.log(`\n🎉 全部 ${allFiles.length} 个文件上传完毕！`);
    console.log(`现在的 CDN 基础路径是: https://${BUCKET}.cos.${REGION}.myqcloud.com/`);
}

startUpload();
