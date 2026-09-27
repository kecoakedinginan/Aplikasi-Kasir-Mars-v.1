let appData = {
    outletName: "Outlet Utama",
    cashierName: "Admin",
    date: new Date().toISOString().split('T')[0],
    timeIn: "08:00",
    timeOut: "21:00",
    categories: [
        { id: 'cat1', name: 'Makanan', color: '#f59e0b' },
        { id: 'cat2', name: 'Minuman', color: '#3b82f6' }
    ],
    menuItems: [
        { id: 'm1', name: 'Nasi Goreng Special', category: 'Makanan', price: 25000, isNew: true },
        { id: 'm2', name: 'Es Teh Manis', category: 'Minuman', price: 5000, isNew: true }
    ],
    cart: [],
    transactions: [],
    openUang: 0,
    expenses: [{ item: '', price: 0, qty: 1 }]
};

window.onload = function() {
    document.getElementById('inputDate').value = appData.date;
    document.getElementById('inputTimeIn').value = appData.timeIn;
    document.getElementById('inputTimeOut').value = appData.timeOut;
    updateHeaderDisplay();
    renderCategories();
    renderMasterGroupedList();
    renderPosCategoryFilter();
    renderPosMenuGrid();
    renderCart();
    renderExpenses();
    updateDashboardSummaries();
    generateReportText();
    
    document.getElementById('settingOutletName').value = appData.outletName;
    document.getElementById('settingCashierName').value = appData.cashierName;
};

function updateHeaderDisplay() {
    document.getElementById('headerDateDisplay').innerText = appData.date;
    document.getElementById('headerTimeIn').innerText = appData.timeIn;
    document.getElementById('headerTimeOut').innerText = appData.timeOut;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(el => el.classList.remove('text-emerald-400', 'bg-slate-800/40'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`nav-${tabId}`).classList.add('text-emerald-400', 'bg-slate-800/40');
    
    if(tabId === 'export') generateReportText();
    if(tabId === 'home') updateDashboardSummaries();
}

function showNotification(msg) {
    const notif = document.getElementById('appNotification');
    document.getElementById('notificationText').innerText = msg;
    notif.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => { notif.classList.add('translate-y-20', 'opacity-0'); }, 2500);
}

function saveHeaderInfo() {
    appData.outletName = document.getElementById('inputOutletName').value;
    appData.cashierName = document.getElementById('inputCashierName').value;
    appData.date = document.getElementById('inputDate').value;
    appData.timeIn = document.getElementById('inputTimeIn').value;
    appData.timeOut = document.getElementById('inputTimeOut').value;

    document.getElementById('headerOutletName').innerText = appData.outletName;
    document.getElementById('headerCashierName').innerText = appData.cashierName;
    updateHeaderDisplay();
    showNotification("Informasi shift & tanggal berhasil disimpan!");
}

function saveSettings() {
    appData.outletName = document.getElementById('settingOutletName').value;
    appData.cashierName = document.getElementById('settingCashierName').value;
    document.getElementById('inputOutletName').value = appData.outletName;
    document.getElementById('inputCashierName').value = appData.cashierName;
    document.getElementById('headerOutletName').innerText = appData.outletName;
    document.getElementById('headerCashierName').innerText = appData.cashierName;
    showNotification("Pengaturan dasar berhasil disimpan!");
}

function renderCategories() {
    const catSelect = document.getElementById('newMenuCategory');
    catSelect.innerHTML = '';
    appData.categories.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });
}

function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const color = document.getElementById('newCategoryColor').value;
    if(!name) return;
    appData.categories.push({ id: 'cat_' + Date.now(), name, color });
    document.getElementById('newCategoryName').value = '';
    renderCategories();
    renderMasterGroupedList();
    renderPosCategoryFilter();
    showNotification("Kategori baru berhasil ditambahkan!");
}

function deleteCategory(catName) {
    appData.categories = appData.categories.filter(c => c.name !== catName);
    appData.menuItems = appData.menuItems.filter(m => m.category !== catName);
    renderCategories();
    renderMasterGroupedList();
    renderPosCategoryFilter();
    renderPosMenuGrid();
    showNotification("Kategori berhasil dihapus.");
}

function renderMasterGroupedList() {
    const container = document.getElementById('masterCategoryGroupedList');
    container.innerHTML = '';

    appData.categories.forEach(cat => {
        const itemsInCat = appData.menuItems.filter(m => m.category === cat.name);
        
        let itemsHtml = itemsInCat.length === 0 ? '<p class="text-xs text-slate-500 italic">Belum ada menu dalam kategori ini.</p>' : '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">';
        
        itemsInCat.forEach(item => {
            itemsHtml += `
                <div class="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-md flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-[10px] px-2 py-0.5 rounded-lg text-white font-medium" style="background-color: ${cat.color}">${item.category}</span>
                            ${item.isNew ? '<span class="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-lg font-bold">BARU</span>' : ''}
                        </div>
                        <h4 class="font-bold text-slate-200 text-sm mb-1">${item.name}</h4>
                        <p class="text-xs text-emerald-400 font-semibold">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button onclick="deleteMenuItem('${item.id}')" class="mt-3 text-rose-400 hover:text-rose-300 text-xs text-left font-medium">Hapus Menu</button>
                </div>
            `;
        });
        if(itemsInCat.length > 0) itemsHtml += '</div>';

        container.innerHTML += `
            <div class="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl shadow-lg">
                <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-700">
                    <h3 class="font-bold text-sm text-slate-200 flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full inline-block" style="background-color: ${cat.color}"></span> ${cat.name}
                    </h3>
                    <button onclick="deleteCategory('${cat.name}')" class="text-xs text-rose-400 hover:text-rose-300">Hapus Kategori</button>
                </div>
                ${itemsHtml}
            </div>
        `;
    });
}

function addMenuItem() {
    const name = document.getElementById('newMenuName').value.trim();
    const category = document.getElementById('newMenuCategory').value;
    const price = parseFloat(document.getElementById('newMenuPrice').value) || 0;
    if(!name) return;

    appData.menuItems.push({ id: 'm_' + Date.now(), name, category, price, isNew: true });
    document.getElementById('newMenuName').value = '';
    document.getElementById('newMenuPrice').value = '';
    renderMasterGroupedList();
    renderPosMenuGrid();
    showNotification("Menu baru berhasil ditambahkan!");
}

function deleteMenuItem(id) {
    appData.menuItems = appData.menuItems.filter(m => m.id !== id);
    renderMasterGroupedList();
    renderPosMenuGrid();
    showNotification("Menu berhasil dihapus.");
}

let activePosCategory = 'All';

function renderPosCategoryFilter() {
    const filterContainer = document.getElementById('posCategoryFilter');
    filterContainer.innerHTML = `<button onclick="filterPosCat('All')" class="px-3 py-1.5 rounded-xl text-xs font-medium transition ${activePosCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}">Semua</button>`;
    
    appData.categories.forEach(cat => {
        const isActive = activePosCategory === cat.name;
        filterContainer.innerHTML += `<button onclick="filterPosCat('${cat.name}')" class="px-3 py-1.5 rounded-xl text-xs font-medium transition ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}">${cat.name}</button>`;
    });
}

function filterPosCat(catName) {
    activePosCategory = catName;
    renderPosCategoryFilter();
    renderPosMenuGrid();
}

function renderPosMenuGrid() {
    const grid = document.getElementById('posMenuGrid');
    grid.innerHTML = '';
    const filtered = activePosCategory === 'All' ? appData.menuItems : appData.menuItems.filter(m => m.category === activePosCategory);
    
    filtered.forEach(item => {
        grid.innerHTML += `
            <div onclick="addToCart('${item.id}')" class="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl shadow-md cursor-pointer hover:border-emerald-500 transition flex flex-col justify-between">
                <div>
                    <h5 class="text-xs font-bold text-slate-200 mb-1">${item.name}</h5>
                    <p class="text-[11px] text-emerald-400 font-medium">Rp ${item.price.toLocaleString('id-ID')}</p>
                </div>
                <span class="mt-2 text-[10px] bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded-xl text-center font-medium">+ Tambah</span>
            </div>
        `;
    });
}

function addToCart(menuId) {
    const item = appData.menuItems.find(m => m.id === menuId);
    if(!item) return;
    const existing = appData.cart.find(c => c.id === menuId);
    if(existing) { existing.qty++; } else { appData.cart.push({ ...item, qty: 1 }); }
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '';
    let total = 0;

    if(appData.cart.length === 0) {
        cartList.innerHTML = '<p class="text-xs text-slate-500 italic">Keranjang kosong.</p>';
    }

    appData.cart.forEach((item, index) => {
        total += item.price * item.qty;
        cartList.innerHTML += `
            <div class="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs">
                <div>
                    <p class="font-semibold text-slate-200">${item.name}</p>
                    <p class="text-[10px] text-emerald-400">Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="updateCartQty(${index}, 1)" class="bg-slate-800 px-2 py-1 rounded-lg text-slate-200">+</button>
                    <button onclick="updateCartQty(${index}, -1)" class="bg-slate-800 px-2 py-1 rounded-lg text-slate-200">-</button>
                </div>
            </div>
        `;
    });
    document.getElementById('cartTotalText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function updateCartQty(index, delta) {
    appData.cart[index].qty += delta;
    if(appData.cart[index].qty <= 0) { appData.cart.splice(index, 1); }
    renderCart();
}

function checkoutOrder() {
    if(appData.cart.length === 0) return;
    const channel = document.getElementById('paymentChannel').value;
    let totalAmount = appData.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let isKOL = (channel === 'KOL');

    appData.transactions.push({
        id: 'trx_' + Date.now(),
        items: [...appData.cart],
        total: totalAmount,
        channel: channel,
        isKOL: isKOL,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    appData.cart = [];
    renderCart();
    renderTransactionsList();
    updateDashboardSummaries();
    showNotification("Transaksi berhasil diproses!");
}

function deleteTransaction(trxId) {
    appData.transactions = appData.transactions.filter(t => t.id !== trxId);
    renderTransactionsList();
    updateDashboardSummaries();
    showNotification("Transaksi berhasil dihapus.");
}

function renderTransactionsList() {
    const salesContainer = document.getElementById('salesListContainer');
    const kolContainer = document.getElementById('kolListContainer');
    salesContainer.innerHTML = '';
    kolContainer.innerHTML = '';

    let salesCount = 1;
    let kolCount = 1;
    let hasSales = false;
    let hasKOL = false;

    appData.transactions.slice().reverse().forEach(trx => {
        if(trx.isKOL) {
            hasKOL = true;
            kolContainer.innerHTML += `
                <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
                    <div>
                        <p class="font-bold text-pink-300">KOL ${kolCount++}</p>
                        <p class="text-[10px] text-slate-400">${trx.items.map(i => i.name + ' (' + i.qty + ')').join(', ')}</p>
                        <p class="text-[9px] text-slate-500">${trx.time}</p>
                    </div>
                    <button onclick="deleteTransaction('${trx.id}')" class="text-rose-400 hover:text-rose-300 text-[10px]">Hapus</button>
                </div>
            `;
        } else {
            hasSales = true;
            salesContainer.innerHTML += `
                <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
                    <div>
                        <p class="font-bold text-emerald-300">Penjualan ${salesCount++} (${trx.channel})</p>
                        <p class="text-[10px] text-slate-400">Rp ${trx.total.toLocaleString('id-ID')} | ${trx.items.map(i => i.name + ' (' + i.qty + ')').join(', ')}</p>
                        <p class="text-[9px] text-slate-500">${trx.time}</p>
                    </div>
                    <button onclick="deleteTransaction('${trx.id}')" class="text-rose-400 hover:text-rose-300 text-[10px]">Hapus</button>
                </div>
            `;
        }
    });

    if(!hasSales) salesContainer.innerHTML = '<p class="text-xs text-slate-500 italic">Belum ada penjualan.</p>';
    if(!hasKOL) kolContainer.innerHTML = '<p class="text-xs text-slate-500 italic">Belum ada data KOL.</p>';
}

function formatRupiahInput(input) {
    let val = input.value.replace(/[^,\d]/g, '').toString();
    appData.openUang = parseFloat(val) || 0;
    updateDashboardSummaries();
}

function renderExpenses() {
    const container = document.getElementById('expenseRows');
    container.innerHTML = '';
    appData.expenses.forEach((exp, idx) => {
        container.innerHTML += `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="Nama Pengeluaran" value="${exp.item}" oninput="updateExpense(${idx}, 'item', this.value)" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
                <input type="number" placeholder="Nominal (Rp)" value="${exp.price || ''}" oninput="updateExpense(${idx}, 'price', this.value)" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none">
                <button onclick="removeExpenseRow(${idx})" class="text-rose-400 hover:text-rose-300 text-xs font-medium">Hapus</button>
            </div>
        `;
    });
}

function addExpenseRow() {
    appData.expenses.push({ item: '', price: 0, qty: 1 });
    renderExpenses();
}

function removeExpenseRow(idx) {
    appData.expenses.splice(idx, 1);
    renderExpenses();
    updateDashboardSummaries();
}

function updateExpense(idx, field, val) {
    if(field === 'price') {
        appData.expenses[idx][field] = parseFloat(val) || 0;
    } else {
        appData.expenses[idx][field] = val;
    }
    updateDashboardSummaries();
}

function updateDashboardSummaries() {
    let validSalesTrx = appData.transactions.filter(t => !t.isKOL);
    let totalSales = validSalesTrx.reduce((sum, t) => sum + t.total, 0);
    let offlineSales = validSalesTrx.filter(t => ['Cash', 'QRIS'].includes(t.channel)).reduce((sum, t) => sum + t.total, 0);
    let onlineSales = validSalesTrx.filter(t => ['Grab', 'Shopee', 'Gofood'].includes(t.channel)).reduce((sum, t) => sum + t.total, 0);
    let totalExpense = appData.expenses.reduce((sum, e) => sum + (e.price * e.qty), 0);
    let cashSales = validSalesTrx.filter(t => t.channel === 'Cash').reduce((sum, t) => sum + t.total, 0);
    let closeMoney = (cashSales + appData.openUang) - totalExpense;

    document.getElementById('homeTotalSales').innerText = `Rp ${totalSales.toLocaleString('id-ID')}`;
    document.getElementById('homeBreakdownSales').innerText = `Off: Rp ${offlineSales.toLocaleString('id-ID')} | On: Rp ${onlineSales.toLocaleString('id-ID')}`;
    document.getElementById('homeTotalExpense').innerText = `Rp ${totalExpense.toLocaleString('id-ID')}`;
    document.getElementById('homeCloseMoney').innerText = `Rp ${closeMoney.toLocaleString('id-ID')}`;

    let menuCountMap = {};
    validSalesTrx.forEach(trx => {
        trx.items.forEach(i => {
            menuCountMap[i.name] = (menuCountMap[i.name] || 0) + i.qty;
        });
    });
    let sortedMenus = Object.entries(menuCountMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    let topMenusEl = document.getElementById('homeTopMenus');
    topMenusEl.innerHTML = sortedMenus.length === 0 ? '<li class="text-slate-500 italic">Belum ada penjualan.</li>' : sortedMenus.map(([name, qty], idx) => `<li>${idx + 1}. <b>${name}</b> (${qty} terjual)</li>`).join('');

    let channelMap = {};
    validSalesTrx.forEach(trx => {
        channelMap[trx.channel] = (channelMap[trx.channel] || 0) + trx.total;
    });
    let sortedChannels = Object.entries(channelMap).sort((a, b) => b[1] - a[1]);
    let topChannelEl = document.getElementById('homeTopChannel');
    topChannelEl.innerHTML = sortedChannels.length === 0 ? '<p class="text-slate-500 italic">Belum ada data kanal.</p>' : sortedChannels.map(([ch, amt], idx) => `<p>${idx + 1}. <b>${ch}</b>: Rp ${amt.toLocaleString('id-ID')}</p>`).join('');
}

function generateReportText() {
    let validSalesTrx = appData.transactions.filter(t => !t.isKOL);
    let kolTrx = appData.transactions.filter(t => t.isKOL);

    let totalSales = validSalesTrx.reduce((sum, t) => sum + t.total, 0);
    let offlineSales = validSalesTrx.filter(t => ['Cash', 'QRIS'].includes(t.channel)).reduce((sum, t) => sum + t.total, 0);
    let onlineSales = validSalesTrx.filter(t => ['Grab', 'Shopee', 'Gofood'].includes(t.channel)).reduce((sum, t) => sum + t.total, 0);
    let totalExpense = appData.expenses.reduce((sum, e) => sum + (e.price * e.qty), 0);
    let cashSales = validSalesTrx.filter(t => t.channel === 'Cash').reduce((sum, t) => sum + t.total, 0);
    let closeMoney = (cashSales + appData.openUang) - totalExpense;

    let report = `📊 LAPORAN HARIAN - ${appData.outletName}\n`;
    report += `📅 Tanggal: ${appData.date}\n`;
    report += `👤 Kasir: ${appData.cashierName} (Masuk: ${appData.timeIn} | Closing: ${appData.timeOut})\n\n`;
    
    report += `💰 RINGKASAN OMSET:\n`;
    report += `• Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}\n`;
    report += `  - Offline (Cash/QRIS): Rp ${offlineSales.toLocaleString('id-ID')}\n`;
    report += `  - Online (Grab/Shopee/Gofood): Rp ${onlineSales.toLocaleString('id-ID')}\n\n`;

    report += `📝 RINCIAN PENJUALAN (${validSalesTrx.length} transaksi):\n`;
    if(validSalesTrx.length === 0) {
        report += `- Belum ada transaksi\n`;
    } else {
        validSalesTrx.forEach((t, i) => {
            report += `${i + 1}. [${t.channel}] Rp ${t.total.toLocaleString('id-ID')} (${t.items.map(it => it.name + ' x' + it.qty).join(', ')}) - ${t.time}\n`;
        });
    }

    report += `\n🎁 RINCIAN KOL (${kolTrx.length} item):\n`;
    if(kolTrx.length === 0) {
        report += `- Tidak ada KOL\n`;
    } else {
        kolTrx.forEach((k, i) => {
            report += `${i + 1}. ${k.items.map(it => it.name + ' x' + it.qty).join(', ')} - ${k.time}\n`;
        });
    }

    report += `\n💸 PENGELUARAN:\n`;
    if(appData.expenses.length === 0 || !appData.expenses[0].item) {
        report += `- Tidak ada pengeluaran\n`;
    } else {
        appData.expenses.forEach(e => {
            if(e.item) report += `• ${e.item}: Rp ${(e.price * e.qty).toLocaleString('id-ID')}\n`;
        });
        report += `Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}\n`;
    }

    report += `\n🔒 CLOSE UANG OUTLET:\n`;
    report += `(Cash Sales Rp ${cashSales.toLocaleString('id-ID')} + Open Uang Rp ${appData.openUang.toLocaleString('id-ID')}) - Pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}\n`;
    report += `= Rp ${closeMoney.toLocaleString('id-ID')}\n`;

    document.getElementById('exportReportText').value = report;
}

function copyReportText() {
    const textarea = document.getElementById('exportReportText');
    textarea.select();
    navigator.clipboard.writeText(textarea.value);
    showNotification("Laporan rinci berhasil disalin ke clipboard!");
}
