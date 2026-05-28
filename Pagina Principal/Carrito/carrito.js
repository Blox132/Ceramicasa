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

// Handle form submission
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('¡Compra realizada exitosamente! Nos pondremos en contacto pronto.');
    localStorage.removeItem('cart');
    cart = [];
    window.location.href = '/Pagina Principal/index.html';
});

// Initialize on page load
displayCart();
