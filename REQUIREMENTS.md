# 班级宠物屋 - 项目需求文档

## 项目概述
一比一复刻"班级宠物屋"——面向小学老师的班级积分管理工具，用养宠物的方式激励学生。

## 技术栈
- 前端：Vue3 + Vite + TailwindCSS
- 后端：Node.js + Express + Sequelize ORM
- 数据库：MySQL
- 认证：JWT

## 已有资源
- `assets/pets/` 目录下有50种宠物的10阶段成长图片（webp格式）
- 宠物文件夹命名格式：`{宠物名}十阶段图片/{1-10}.webp`

## API 路由（从原站分析得到）
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- POST /api/auth/activate - 卡密激活
- POST /api/auth/logout - 退出
- GET /api/auth/me - 获取当前用户
- GET /api/auth/check - 检查登录状态
- PUT /api/auth/change-password - 修改密码
- POST /api/auth/reset-password - 重置密码（用卡密）
- PUT /api/auth/settings - 更新用户设置
- POST /api/auth/verify-password - 验证密码

- GET /api/classes - 获取班级列表
- POST /api/classes - 创建班级
- PUT /api/classes/:id - 更新班级
- DELETE /api/classes/:id - 删除班级

- GET /api/students/class/:classId - 获取班级学生
- POST /api/students - 添加学生
- PUT /api/students/:id - 更新学生
- DELETE /api/students/:id - 删除学生

- GET /api/groups/class/:classId - 获取班级分组
- POST /api/groups - 创建分组
- PUT /api/groups/:id - 更新分组
- DELETE /api/groups/:id - 删除分组

- GET /api/history/class/:classId - 获取班级操作历史
- POST /api/history - 创建操作记录（加分/扣分）
- POST /api/history/revoke - 撤回操作
- POST /api/history/revoke-batch - 批量撤回
- POST /api/history/batch-delete - 批量删除历史

- GET /api/sync/stream - SSE 实时同步

## 数据库设计

### users 表
- id, username, password_hash, activation_code, is_activated, settings(JSON), created_at, updated_at

### classes 表
- id, user_id, name, system_name, settings(JSON含主题/成长阶段配置), sort_order, created_at, updated_at

### students 表
- id, class_id, name, pet_type, pet_name, food_count, stage, badges(JSON), sort_order, group_id, created_at, updated_at

### groups 表
- id, class_id, name, sort_order, created_at, updated_at

### score_rules 表
- id, class_id, name, icon, value, sort_order, created_at, updated_at

### history 表
- id, class_id, student_id, rule_id, rule_name, value, type(score/graduate/exchange), created_at

### shop_items 表
- id, class_id, name, description, icon, price(徽章数), stock, created_at, updated_at

### exchange_records 表
- id, class_id, student_id, item_id, item_name, cost, created_at

### licenses 表（管理后台用）
- id, code, is_used, used_by, created_at, used_at

## 核心功能模块

### 1. 用户系统
- 注册（用户名+密码）
- 卡密激活（注册后需输入卡密激活）
- 登录/退出
- 修改密码
- 找回密码（用卡密重置）

### 2. 班级管理
- 创建/切换/重命名/删除班级
- 班级配置复用（从其他班级复制积分规则/商品/等级配置）
- 全班进度重置

### 3. 学生管理
- 单个/批量添加学生
- 编辑/删除学生
- 自定义排序
- 分组管理（创建/编辑/删除/随机分组）

### 4. 积分系统
- 加分/扣分规则配置（名称+图标+分值）
- 单个学生加分/扣分
- 批量加分/扣分
- 撤回操作（最近一次）

### 5. 宠物系统
- 50种宠物可选
- 一键随机分配 / 单个自选
- 10级成长阶段（默认 [0,5,10,20,30,45,60,75,90,100]）
- 宠物起名
- 满级毕业 → 获得徽章 → 进度重置

### 6. 小卖部
- 商品管理（增删改）
- 徽章兑换商品
- 兑换记录

### 7. 数据展示
- 光荣榜（按食物/徽章排行）
- 成长记录（操作历史）
- 徽章墙

### 8. 导出功能
- 荣誉证书导出（PDF/PNG）
- 徽章贴纸导出
- 批量导出（ZIP）

### 9. 设置
- 界面主题切换（多种颜色主题）
- 系统名称/班级名称修改
- 成长阶段配置
- 多种排序方式（手动/姓名/排行榜/进度）

## 50种宠物列表
white-cat(白猫), bichon(比熊), border-collie(边牧), ragdoll(布偶), shiba(柴犬),
french-bulldog(法斗), black-cat(黑猫), tabby(虎斑), garfield(加菲猫), golden-shaded(金渐层),
golden-retriever(金毛), orange-cat(橘猫), corgi(柯基), labrador(拉布拉多), blue-cat(蓝猫),
samoyed(萨摩耶), calico(三花), teddy(泰迪), siamese(暹罗猫), silver-shaded(银渐层),
rabbit(小兔子), squirrel(松鼠), panda(熊猫), turtle(乌龟), hamster(仓鼠),
polar-bear(大白熊), monkey(猴子), piglet(小猪仔), duck(鸭子), lihua-cat(狸花猫),
nine-tailed-fox(九尾狐), capybara(卡皮巴拉), schnauzer(雪瑞纳), chinese-rural-dog(中华田园犬),
chihuahua(吉娃娃), westie(西高地), lamb(小羊羔), horse(马), penguin(企鹅), tiger(老虎),
leopard(豹子), dinosaur(恐龙), chick(小黄鸡), parrot(鹦鹉), fox(狐狸), frog(青蛙),
crocodile(鳄鱼), elephant(大象), sika-deer(梅花鹿), chameleon(变色龙)
