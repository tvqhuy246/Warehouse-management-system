# API Gateway – Warehouse Management System

## Công nghệ
- Nginx
- Docker Compose

## Chức năng
- Định tuyến request đến các backend service
- Bảo vệ hệ thống thông qua Auth Service
- Hỗ trợ CORS cho Frontend
- Phân tách service theo kiến trúc microservice

## Danh sách route
- /api/auth → Auth Service
- /api/products → Product Service
- /api/inbound → Inventory Service
- /api/outbound → Inventory Service
- /api/inventory → inbound outbound Service
- /api/statistics → inbound outbound Service
- /api/export → inbound outbound Service
#