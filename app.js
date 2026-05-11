
// 1. Firebase 資料庫設定 (你需要去 Firebase 網站免費申請這段代碼)
const firebaseConfig = {
    apiKey: "你的_API_KEY",
    authDomain: "你的_專案ID.firebaseapp.com",
    projectId: "你的_專案ID",
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. 點餐系統變數
let currentOrder = [];
let totalAmount = 0;

// 3. 加入購物車功能
function addToCart(itemName, price) {
    currentOrder.push({ name: itemName, price: price });
    totalAmount += price;
    document.getElementById('cart-text').innerText = `共 ${currentOrder.length} 件，總計 $${totalAmount}`;
}

// 4. 送出訂單至資料庫
function submitOrder() {
    if (currentOrder.length === 0) {
        alert("購物車是空的喔！");
        return;
    }

    // 將資料寫入 Firebase 的 'orders' 資料表
    db.collection("orders").add({
        items: currentOrder,
        total: totalAmount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("訂單已送出！老闆準備中！");
        currentOrder = []; // 清空購物車
        totalAmount = 0;
        document.getElementById('cart-text').innerText = "購物車空空的";
    })
    .catch((error) => {
        alert("發生錯誤：" + error.message);
    });
}

// 5. 後台：即時監聽資料庫的新訂單
function listenForOrders() {
    let totalRevenue = 0;
    let totalOrders = 0;
    const orderListDiv = document.getElementById('order-list');

    // 監聽 'orders' 資料表，只要有新資料就會自動執行這裡
    db.collection("orders").orderBy("timestamp", "desc")
      .onSnapshot((querySnapshot) => {
        orderListDiv.innerHTML = ''; // 清空舊畫面
        totalRevenue = 0;
        totalOrders = 0;

        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            totalRevenue += orderData.total;
            totalOrders += 1;

            // 把訂單品項變成文字
            let itemsText = orderData.items.map(item => item.name).join('、 ');

            // 產生畫面上的卡片
            orderListDiv.innerHTML += `
                <div class="order-card">
                    <strong>單號：${doc.id.substring(0,5)}...</strong><br>
                    品項：${itemsText}<br>
                    金額：$${orderData.total}
                </div>
            `;
        });

        // 更新總計數字
        document.getElementById('total-revenue').innerText = totalRevenue;
        document.getElementById('total-orders').innerText = totalOrders;
    });
}
