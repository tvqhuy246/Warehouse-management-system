# 1. Chọn môi trường Node.js
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json vào trước để cài thư viện
COPY package.json .

# 4. Cài đặt thư viện
RUN npm install

# 5. Copy toàn bộ code còn lại vào container
COPY . .

# 6. Mở cổng 8081 (Để khớp với code index.js)
EXPOSE 8081

# 7. Lệnh chạy server
CMD ["node", "src/index.js"]