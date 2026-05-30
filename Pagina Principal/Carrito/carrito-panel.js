const initialStock = {
    "Mascaras De La Prudencia": 3,
    "Figura De Batman": 1,
    "Sagrada Familia En Tronco": 2
};

if (!localStorage.getItem('productsStock')) {
    localStorage.setItem('productsStock', JSON.stringify(initialStock));
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function toggleCartPanel(event) {
    event.preventDefault();
    const cartPanel = document.getElementById('cartPanel');
    if (cartPanel) {
        cartPanel.classList.toggle('active');
    }
}

function addToCart(name, price, image) {
    const stockDB = JSON.parse(localStorage.getItem('productsStock')) || {};
    const availableStock = stockDB[name] !== undefined ? stockDB[name] : 0;

    const existingItem = cart.find(item => item.name === name);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    if (availableStock <= 0 || currentQuantityInCart >= availableStock) {
        alert(`¡Producto agotado! Lo sentimos, no quedan más unidades disponibles de "${name}".`);
        return;
    }

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
    checkCatalogStockButtons();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPanel();
    checkCatalogStockButtons();
}

function updateQuantity(name, quantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        if (quantity > item.quantity) {
            const stockDB = JSON.parse(localStorage.getItem('productsStock')) || {};
            const availableStock = stockDB[name] !== undefined ? stockDB[name] : 0;
            if (quantity > availableStock) {
                alert(`No puedes agregar más unidades. El stock disponible de este producto es de ${availableStock} unidades.`);
                return;
            }
        }

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
    if (!cartPanel) return; 
    
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
                        <p class="item-price">$${item.price.toLocaleString()}</p>
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
    cartHTML += '<button class="btn-checkout" onclick="goToCheckout()">Simular Pago (Descontar Stock)</button>';
    cartHTML += '</div>';
    
    cartPanel.innerHTML = cartHTML;
}

function goToCheckout() {
    if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let stockDB = JSON.parse(localStorage.getItem('productsStock')) || {};

    cart.forEach(item => {
        if (stockDB[item.name] !== undefined) {
            stockDB[item.name] = Math.max(0, stockDB[item.name] - item.quantity);
        }
    });

    localStorage.setItem('productsStock', JSON.stringify(stockDB));

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));

    alert("¡Pago Procesado Exitosamente!\nEl inventario se ha actualizado de forma automática.");
    
    updateCartPanel();
    checkCatalogStockButtons();
}

function checkCatalogStockButtons() {
    const stockDB = JSON.parse(localStorage.getItem('productsStock')) || {};
    const tarjetas = document.querySelectorAll('.tarjeta-producto');

    tarjetas.forEach(tarjeta => {
        const titleElement = tarjeta.querySelector('.bloque-detalles h3');
        if (!titleElement) return;

        const productName = titleElement.textContent.trim();
        const stockDisponible = stockDB[productName] !== undefined ? stockDB[productName] : 0;
        
        const btnCarrito = tarjeta.querySelector('.btn-carrito');
        const btnComprar = tarjeta.querySelector('.btn-comprar');

        if (stockDisponible <= 0) {
            if (btnCarrito) {
                btnCarrito.textContent = "AGOTADO";
                btnCarrito.disabled = true;
                btnCarrito.style.backgroundColor = "#555555";
                btnCarrito.style.color = "#aaaaaa";
                btnCarrito.style.cursor = "not-allowed";
                btnCarrito.style.transform = "none";
            }
            if (btnComprar) {
                btnComprar.style.display = "none";
            }
        } else {
            if (btnCarrito && btnCarrito.textContent === "AGOTADO") {
                btnCarrito.textContent = "AGREGAR AL CARRITO";
                btnCarrito.disabled = false;
                btnCarrito.style.backgroundColor = "#f0e68c";
                btnCarrito.style.color = "#000000";
                btnCarrito.style.cursor = "pointer";
            }
            if (btnComprar) {
                btnComprar.style.display = "block";
            }
        }
    });
}

document.addEventListener('click', function(e) {
    const cartPanel = document.getElementById('cartPanel');
    if (!cartPanel) return;
    
    const cartIcon = document.getElementById('cartIconBtn');
    if (cartIcon && !cartPanel.contains(e.target) && !cartIcon.contains(e.target)) {
        cartPanel.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    updateCartPanel();
    checkCatalogStockButtons();

    const currentUser = localStorage.getItem('ceramicasa_currentUser');
    if (currentUser) {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes('iniciarsesion.html') || link.textContent.trim() === '👤')) {
                const onClickAttr = link.getAttribute('onclick');
                if (!onClickAttr || !onClickAttr.includes('logout')) {
                    if (currentUser === 'admin@ceramicasa.com') {
                        link.setAttribute('href', '/Pagina Principal/PerfilAdmin/admin.html');
                    } else {
                        link.setAttribute('href', '/Pagina Principal/PerfilUsuario/usuario.html');
                    }
                }
            }
        });

        const currentPath = window.location.pathname;
        if (currentPath.includes('iniciarsesion.html') || currentPath.includes('registrarse.html')) {
            if (currentUser === 'admin@ceramicasa.com') {
                window.location.href = '/Pagina Principal/PerfilAdmin/admin.html';
            } else {
                window.location.href = '/Pagina Principal/PerfilUsuario/usuario.html';
            }
        }
    }
});