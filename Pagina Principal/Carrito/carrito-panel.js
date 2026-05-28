// Shopping Cart Panel - Global Script
// Include this script on all pages where you want the cart panel to appear

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function toggleCartPanel(event) {
    event.preventDefault();
    const cartPanel = document.getElementById('cartPanel');
    cartPanel.classList.toggle('active');
}

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPanel();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPanel();
}

function updateQuantity(name, quantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartPanel();
        }
    }
}

function updateCartPanel() {
    const cartPanel = document.getElementById('cartPanel');
    if (!cartPanel) return; // Exit if cart panel doesn't exist on this page
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let cartHTML = '<div class="cart-header"><h3>🛒 Carrito</h3><button class="close-cart" onclick="toggleCartPanel(event)">✕</button></div><div class="cart-items">';
    
    if (cart.length === 0) {
        cartHTML += '<p class="empty-cart">Carrito vacío</p>';
    } else {
        cart.forEach(item => {
            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <p class="item-name">${item.name}</p>
                        <p class="item-price">${item.price.toLocaleString()}</p>
                        <div class="quantity-control">
                            <button onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${item.name}')">Eliminar</button>
                    </div>
                </div>
            `;
        });
    }
    
    cartHTML += '</div><div class="cart-footer">';
    cartHTML += `<p class="total">Total: $${total.toLocaleString()}</p>`;
    cartHTML += '<button class="btn-checkout" onclick="goToCheckout()">Ir a Pagar</button>';
    cartHTML += '</div>';
    
    cartPanel.innerHTML = cartHTML;
}

function goToCheckout() {
    window.location.href = '/Pagina Principal/Carrito/carrito.html';
}

// Close cart panel when clicking outside
document.addEventListener('click', function(e) {
    const cartPanel = document.getElementById('cartPanel');
    if (!cartPanel) return;
    
    const cartIcon = document.getElementById('cartIconBtn');
    if (!cartPanel.contains(e.target) && !cartIcon.contains(e.target)) {
        cartPanel.classList.remove('active');
    }
});

// Initialize cart panel on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartPanel();
});
