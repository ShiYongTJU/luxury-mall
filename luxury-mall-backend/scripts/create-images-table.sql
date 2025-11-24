-- 创建图片素材表
-- 如果表已存在，不会报错（使用了 IF NOT EXISTS）

CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    tags VARCHAR(200),
    width INTEGER,
    height INTEGER,
    size INTEGER, -- 文件大小（字节）
    format VARCHAR(20), -- 图片格式：jpg, png, gif, webp等
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_tags ON images(tags);
CREATE INDEX IF NOT EXISTS idx_images_upload_time ON images(upload_time);

