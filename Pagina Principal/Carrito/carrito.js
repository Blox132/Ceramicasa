let cart = JSON.parse(localStorage.getItem('cart')) || [];

function displayCart() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-message">Tu carrito está vacío. <a href="/Pagina Principal/Catálogo/catalog.html">Volver al catálogo</a></p>';
        subtotalEl.textContent = '$0';
        totalEl.textContent = '$0';
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-row">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                </div>
                <div class="item-price">
                    <p>$${item.price.toLocaleString()}</p>
                </div>
                <div class="item-quantity">
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${index}, this.value)">
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
                <div class="item-total">
                    <p>$${itemTotal.toLocaleString()}</p>
                </div>
                <div class="item-remove">
                    <button onclick="removeItem(${index})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = cartHTML;
    
    const envio = 10000; // Fixed shipping cost
    const total = subtotal + envio;
    
    subtotalEl.textContent = '$' + subtotal.toLocaleString();
    document.getElementById('envio').textContent = '$' + envio.toLocaleString();
    totalEl.textContent = '$' + total.toLocaleString();
}

function increaseQuantity(index) {
    cart[index].quantity++;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        removeItem(index);
        return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function changeQuantity(index, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity <= 0) {
        removeItem(index);
    } else {
        cart[index].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function continuarCompra() {
    window.location.href = '/Pagina Principal/Catálogo/catalog.html';
}

// Generate random receipt ID
function generateReceiptId() {
    return 'RCP-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

// Get current logged in user info
function getCurrentUserInfo() {
    const email = localStorage.getItem('ceramicasa_currentUser');
    if (!email) return null;
    
    // Check if admin
    if (email === 'admin@ceramicasa.com') {
        return { email: email, isAdmin: true };
    }
    
    // Get regular user info
    const users = JSON.parse(localStorage.getItem('ceramicasa_users')) || [];
    const user = users.find(u => u.email === email);
    return user ? { ...user, isAdmin: false } : null;
}

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('ceramicasa_currentUser') !== null;
}

// Separate catalog items from custom designs
function separateItems(cartItems) {
    const catalogItems = [];
    const customItems = [];
    
    cartItems.forEach(item => {
        if (item.name.startsWith('Diseño Personalizado -')) {
            customItems.push(item);
        } else {
            catalogItems.push(item);
        }
    });
    
    return { catalogItems, customItems };
}

// Create and save receipt to storage
function createReceipt(type, items, billingInfo, userInfo) {
    const receipt = {
        id: generateReceiptId(),
        type: type, // 'catalog' or 'custom'
        fecha: new Date().toLocaleString('es-CO'),
        usuario: {
            nombre: billingInfo.nombre,
            email: billingInfo.email,
            telefono: billingInfo.telefono,
            direccion: billingInfo.direccion,
            ciudad: billingInfo.ciudad
        },
        items: items,
        metodoPago: billingInfo.metodoPago,
        subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        envio: 10000,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 10000
    };
    
    // For custom items, add material and description
    if (type === 'custom' && items.length > 0) {
        const customData = JSON.parse(localStorage.getItem('customDesignData')) || {};
        receipt.material = customData.material;
        receipt.descripcion = customData.descripcion;
    }
    
    return receipt;
}

// Save receipts to appropriate storage
function saveReceipts(catalogItems, customItems, billingInfo) {
    const receipts = {
        catalog: [],
        custom: []
    };
    
    if (catalogItems.length > 0) {
        const catalogReceipt = createReceipt('catalog', catalogItems, billingInfo);
        let catalogReceipts = JSON.parse(localStorage.getItem('gestionFacturas')) || [];
        catalogReceipts.push(catalogReceipt);
        localStorage.setItem('gestionFacturas', JSON.stringify(catalogReceipts));
        receipts.catalog = [catalogReceipt];
    }
    
    if (customItems.length > 0) {
        const customReceipt = createReceipt('custom', customItems, billingInfo);
        let customReceipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
        customReceipts.push(customReceipt);
        localStorage.setItem('gestionPedidosPersonalizados', JSON.stringify(customReceipts));
        receipts.custom = [customReceipt];
    }
    
    return receipts;
}

// Handle form submission
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate billing form
    const nombre = document.getElementById('factNombre').value.trim();
    const email = document.getElementById('factEmail').value.trim();
    const telefono = document.getElementById('factTelefono').value.trim();
    const direccion = document.getElementById('factDireccion').value.trim();
    const ciudad = document.getElementById('factCiudad').value; 
    const metodoPago = document.querySelector('input[name="payment"]:checked');
    
    if (!nombre || !email || !telefono || !direccion || !ciudad || !metodoPago) {
        alert('Por favor completa todos los campos de la facturación.');
        return;
    }
    
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(telefono)) {
        alert('El número de teléfono no es válido. Debe contener exactamente 10 dígitos numéricos (Ejemplo: 3015690865).');
        document.getElementById('factTelefono').focus();
        return;
    }
    
    if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }
    
    const billingInfo = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        direccion: direccion,
        ciudad: ciudad,
        metodoPago: metodoPago.value
    };
    
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        // Save order and billing info for later
        localStorage.setItem('pendingOrder', JSON.stringify({
            cart: cart,
            billingInfo: billingInfo,
            timestamp: new Date().getTime()
        }));
        
        alert('Necesitas iniciar sesión para completar tu compra. Te redirigiremos a la página de inicio de sesión.');
        window.location.href = '/Pagina Principal/RegistroEInicioDeSesión/iniciarsesion.html';
        return;
    }
    
    // User is logged in, process the order
    const { catalogItems, customItems } = separateItems(cart);
    
    // Save receipts
    saveReceipts(catalogItems, customItems, billingInfo);
    
    // Clear cart
    localStorage.removeItem('cart');
    cart = [];
    
    // Clear custom design data if any
    localStorage.removeItem('customDesignData');
    localStorage.removeItem('material');
    localStorage.removeItem('descripcion');
    
    // Clear pending order if any
    localStorage.removeItem('pendingOrder');
    
    alert('¡Compra realizada exitosamente! Nos pondremos en contacto pronto.');
    window.location.href = '/Pagina Principal/index.html';
});

// Initialize on page load
displayCart();
