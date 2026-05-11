// 5. 後台：即時監聽資料庫的新訂單，並統計品項總量
function listenForOrders() {
    const orderListDiv = document.getElementById('order-list');
    const itemStatsDiv = document.getElementById('item-stats'); // 你需要在 admin.html 加這個區塊

    db.collection("orders").orderBy("timestamp", "desc")
      .onSnapshot((querySnapshot) => {
        orderListDiv.innerHTML = ''; 
        let totalRevenue = 0;
        let totalOrders = 0;
        
        // 建立一個物件來統計「所有訂單的品項總和」
        let globalItemCounts = {};

        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            totalRevenue += orderData.total;
            totalOrders += 1;

            // 統計「單筆」訂單的品項 (給明細列表用)
            let singleOrderCounts = {};
            orderData.items.forEach(item => {
                // 單筆統計
                singleOrderCounts[item.name] = (singleOrderCounts[item.name] || 0) + 1;
                // 全域總量統計 (給品項總計用)
                globalItemCounts[item.name] = (globalItemCounts[item.name] || 0) + 1;
            });
            
            // 產生單筆明細卡片文字
            let itemsText = Object.keys(singleOrderCounts).map(name => `${name} x${singleOrderCounts[name]}`).join('<br>');

            orderListDiv.innerHTML += `
                <div class="order-card">
                    <div style="color: #e63946; font-weight: bold;">顧客：${orderData.nickname}</div>
                    <div>${itemsText}</div>
                    <div style="text-align: right; font-weight: bold; margin-top: 5px;">總額：$${orderData.total}</div>
                </div>
            `;
        });

        // 更新營收數字
        document.getElementById('total-revenue').innerText = totalRevenue;
        document.getElementById('total-orders').innerText = totalOrders;

        // --- 產生「各品項總量」的排行榜 ---
        // 如果你的 admin.html 有一個 <div id="item-stats"></div> 就可以顯示在這裡
        if (itemStatsDiv) {
            let statsHtml = '<ul>';
            for (const [itemName, count] of Object.entries(globalItemCounts)) {
                statsHtml += `<li>${itemName}：共 <strong>${count}</strong> 份</li>`;
            }
            statsHtml += '</ul>';
            itemStatsDiv.innerHTML = statsHtml;
        }
    });
}
