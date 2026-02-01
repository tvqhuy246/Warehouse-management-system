const axios = require('axios');

// CONFIGURATION
const GATEWAY_URL = 'http://localhost';
const AUTH_URL = `${GATEWAY_URL}/api/auth`;
const PRODUCT_URL = `${GATEWAY_URL}/api/products`;
const CATEGORY_URL = `${GATEWAY_URL}/api/categories`;
const PARTNER_URL = `${GATEWAY_URL}/api/partners`;
const INBOUND_URL = `${GATEWAY_URL}/api/inbound`; // Nginx mapped to /api/nhapkho
const OUTBOUND_URL = `${GATEWAY_URL}/api/outbound`; // Nginx mapped to /api/xuatkho

// ADMIN CREDENTIALS
const ADMIN_USER = {
    username: 'qhuyadmin',
    password: 'xaydunghethong09'
};

// HELPERS FOR RANDOM DATA
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CATEGORY_NAMES = ['Điện tử', 'Gia dụng', 'Thời trang', 'Thực phẩm', 'Sách', 'Đồ chơi', 'Nội thất', 'Mỹ phẩm', 'Thể thao', 'Công cụ'];
const PRODUCT_ADJECTIVES = ['Pro', 'Max', 'Ultra', 'Mini', 'Air', 'Gaming', 'Smart', 'Eco', 'Office', 'Home'];
const PRODUCT_NOUNS = ['Monitor', 'Keyboard', 'Mouse', 'Chair', 'Desk', 'Lamp', 'Phone', 'Tablet', 'Headset', 'Camera', 'Speaker', 'Watch'];

async function seed() {
    try {
        console.log('🚀 Bắt đầu tạo dữ liệu mẫu (Phiên bản đầy đủ In/Out)...');

        // 1. LOGIN
        console.log('🔑 Đang đăng nhập...');
        const loginRes = await axios.post(`${AUTH_URL}/login`, ADMIN_USER);
        const token = loginRes.data.token || loginRes.data.accessToken;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'x-role': 'admin' // Legacy bypass just in case, though we fixed JWT verification
        };
        console.log('✅ Đăng nhập thành công!');

        // 2. CREATE CATEGORIES
        console.log('📂 Đang tạo danh mục...');
        const catIds = [];
        for (const name of CATEGORY_NAMES) {
            try {
                const payload = {
                    name: `${name} ${randomInt(1, 100)}`,
                    description: `Danh mục ${name} các loại sản phẩm chất lượng cao`,
                    vat_rate: randomElement([0, 5, 8, 10]), // VAT rates in Vietnam
                    profit_margin: randomInt(10, 30) // Profit margin 10-30%
                };
                const res = await axios.post(CATEGORY_URL, payload, { headers });
                catIds.push(res.data.id);
            } catch (err) {
                if (err.response && err.response.status === 500) {
                    // Likely duplicate
                } else {
                    console.error(`   x Lỗi tạo danh mục ${name}:`, err.message);
                }
            }
        }

        // Fetch all categories to get valid IDs
        const cats = await axios.get(CATEGORY_URL);
        const validCatIds = cats.data.map(c => c.id);
        console.log(`✅ Đã có ${validCatIds.length} danh mục.`);

        // 3. CREATE PRODUCTS
        console.log('📦 Đang tạo sản phẩm...');
        const productIds = [];
        for (let i = 0; i < 150; i++) {
            try {
                const noun = randomElement(PRODUCT_NOUNS);
                const adj = randomElement(PRODUCT_ADJECTIVES);
                const payload = {
                    sku: `SKU-${Date.now()}-${i}`,
                    name: `${noun} ${adj} ${i}`,
                    price: randomInt(100, 10000) * 1000,
                    unit: randomElement(['Cái', 'Bộ', 'Chiếc', 'Hộp']),
                    min_stock: randomInt(5, 50),
                    category_id: randomElement(validCatIds),
                    status: 'ACTIVE'
                };
                const res = await axios.post(PRODUCT_URL, payload, { headers });
                productIds.push(res.data.id);
                if (i % 20 === 0) process.stdout.write('.');
            } catch (err) {
                console.error(`x Lỗi SP ${i}:`, err.message);
            }
        }
        console.log(`\n✅ Đã tạo ${productIds.length} sản phẩm mới.`);

        // 4. CREATE PARTNERS
        console.log('🤝 Đang tạo đối tác...');
        for (let i = 0; i < 50; i++) {
            try {
                const type = randomElement([1, 2]); // 1-Supplier, 2-Customer
                const payload = {
                    name: `Đối tác ${type === 1 ? 'Cung cấp' : 'Khách hàng'} ${i}`,
                    type: type,
                    description: 'Tạo tự động',
                    phone: `09${randomInt(10000000, 99999999)}`,
                    email: `partner${i}@example.com`,
                    address: `Địa chỉ số ${i}, Đường ABC, Quận XYZ`
                };
                await axios.post(PARTNER_URL, payload, { headers });
                if (i % 10 === 0) process.stdout.write('.');
            } catch (e) { }
        }
        console.log('\n✅ Đã tạo xong đối tác.');

        // Fetch valid partners
        const partnersRes = await axios.get(PARTNER_URL, { headers });
        const data = partnersRes.data.data || partnersRes.data; // Handle pagination structure if any
        const suppliers = data.filter(p => p.type === 1).map(p => p.id);
        const customers = data.filter(p => p.type === 2).map(p => p.id);

        console.log(`✅ Tìm thấy ${suppliers.length} NCC và ${customers.length} Khách hàng.`);

        // 5. CREATE INBOUND RECEIPTS
        if (suppliers.length > 0) {
            console.log('📥 Đang tạo 200 phiếu nhập kho...');
            for (let i = 0; i < 200; i++) {
                try {
                    const receiptDetails = [];
                    const numProds = randomInt(1, 5);
                    for (let j = 0; j < numProds; j++) {
                        receiptDetails.push({
                            product_id: randomElement(productIds),
                            quantity: randomInt(10, 100),
                            price: randomInt(50000, 5000000)
                        });
                    }

                    const payload = {
                        partner_id: randomElement(suppliers),
                        warehouse_id: 1,
                        note: `Nhập kho tự động #${i}`,
                        created_by: ADMIN_USER.username,
                        details: receiptDetails
                    };

                    await axios.post(INBOUND_URL, payload, { headers });
                    if (i % 20 === 0) process.stdout.write('.');
                    await new Promise(r => setTimeout(r, 20)); // throttle
                } catch (err) {
                    console.error(`x Lỗi PN ${i}:`, err.message);
                }
            }
            console.log('\n✅ Hoàn tất nhập kho!');
        }

        // 6. CREATE OUTBOUND RECEIPTS
        if (customers.length > 0) {
            console.log('📤 Đang tạo 100 phiếu xuất kho...');
            for (let i = 0; i < 100; i++) {
                try {
                    const receiptDetails = [];
                    const numProds = randomInt(1, 3);
                    for (let j = 0; j < numProds; j++) {
                        receiptDetails.push({
                            product_id: randomElement(productIds),
                            quantity: randomInt(1, 5), // Keep small to avoid stock error
                            price: randomInt(60000, 6000000)
                        });
                    }

                    const payload = {
                        partner_id: randomElement(customers),
                        warehouse_id: 1,
                        note: `Xuất kho tự động #${i}`,
                        created_by: ADMIN_USER.username,
                        details: receiptDetails
                    };

                    await axios.post(OUTBOUND_URL, payload, { headers });
                    if (i % 20 === 0) process.stdout.write('.');
                    await new Promise(r => setTimeout(r, 20));
                } catch (err) {
                    // console.error(`x Lỗi PX ${i}:`, err.message);
                }
            }
            console.log('\n✅ Hoàn tất xuất kho!');
        }

        console.log('\n🎉 SCRIPT COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

seed();
