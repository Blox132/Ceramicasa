// Logout function
function logout() {
    localStorage.removeItem('ceramicasa_currentUser');
    window.location.href = '/Pagina Principal/RegistroEInicioDeSesión/iniciarsesion.html';
}

// Process pending order after login
function processPendingOrder() {
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
    
    if (!pendingOrder) {
        return; // No pending order
    }
    
    // Get user email
    const userEmail = localStorage.getItem('ceramicasa_currentUser');
    if (!userEmail) {
        return;
    }
    
    const cart = pendingOrder.cart;
    const billingInfo = pendingOrder.billingInfo;
    
    // Function to separate catalog items from custom designs
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
    
    // Function to generate receipt ID
    function generateReceiptId() {
        return 'RCP-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    }
    
    // Function to create receipt
    function createReceipt(type, items, billingInfo) {
        const receipt = {
            id: generateReceiptId(),
            type: type,
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
        
        if (type === 'custom' && items.length > 0) {
            const customData = JSON.parse(localStorage.getItem('customDesignData')) || {};
            receipt.material = customData.material;
            receipt.descripcion = customData.descripcion;
        }
        
        return receipt;
    }
    
    // Separate items
    const { catalogItems, customItems } = separateItems(cart);
    
    // Save receipts
    if (catalogItems.length > 0) {
        const catalogReceipt = createReceipt('catalog', catalogItems, billingInfo);
        let catalogReceipts = JSON.parse(localStorage.getItem('gestionFacturas')) || [];
        catalogReceipts.push(catalogReceipt);
        localStorage.setItem('gestionFacturas', JSON.stringify(catalogReceipts));
    }
    
    if (customItems.length > 0) {
        const customReceipt = createReceipt('custom', customItems, billingInfo);
        let customReceipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
        customReceipts.push(customReceipt);
        localStorage.setItem('gestionPedidosPersonalizados', JSON.stringify(customReceipts));
    }
    
    // Clear cart and pending order
    localStorage.removeItem('cart');
    localStorage.removeItem('pendingOrder');
    localStorage.removeItem('customDesignData');
    localStorage.removeItem('material');
    localStorage.removeItem('descripcion');
    
    // Notify user
    alert('¡Tu orden pendiente ha sido procesada exitosamente! Nos pondremos en contacto pronto.');
}

// Check for pending order after login
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after login if redirected from checkout
    const currentPage = window.location.pathname;
    if (currentPage.includes('usuario.html') || currentPage.includes('admin.html')) {
        // Process pending order if exists
        setTimeout(processPendingOrder, 500);
    }
});
