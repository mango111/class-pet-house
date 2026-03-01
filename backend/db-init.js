require('dotenv').config();
const { sequelize } = require('./src/models');

async function initDB() {
    try {
        console.log('⏳ 正在连接数据库并同步表结构...');
        await sequelize.authenticate();

        // 强制同步所有模型到数据库 (创建所有缺失的表)
        // 注意：alter: true 会安全地修改现有表以匹配模型，不会删除数据
        await sequelize.sync({ alter: true });

        console.log('✅ 数据库同步完成，所有必要表结构已创建！');
        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库同步失败:', error.message);
        process.exit(1);
    }
}

initDB();
