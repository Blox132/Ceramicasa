// Admin credentials
const ADMIN_EMAIL = "admin@ceramicasa.com";
const ADMIN_PASSWORD = "aD7$mIn*Ky@2024!Sec%Re&t#Pass";

// Process pending order and redirect
function processPendingOrderBeforeRedirect(redirectUrl) {
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
    
    if (!pendingOrder) {
        window.location.href = redirectUrl;
        return;
    }
    
    const cart = pendingOrder.cart;
    const billingInfo = pendingOrder.billingInfo;
    
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
    
    function generateReceiptId() {
        return 'RCP-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    }
    
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
    
    const { catalogItems, customItems } = separateItems(cart);
    
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
    
    localStorage.removeItem('cart');
    localStorage.removeItem('pendingOrder');
    localStorage.removeItem('customDesignData');
    localStorage.removeItem('material');
    localStorage.removeItem('descripcion');
    
    window.location.href = redirectUrl;
}

// Initialize users from localStorage
function getUsers() {
    const users = localStorage.getItem('ceramicasa_users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('ceramicasa_users', JSON.stringify(users));
}

// Get current logged in user
function getCurrentUser() {
    return localStorage.getItem('ceramicasa_currentUser');
}

function setCurrentUser(email) {
    localStorage.setItem('ceramicasa_currentUser', email);
}

function logout() {
    localStorage.removeItem('ceramicasa_currentUser');
}

// Registration form handler
function handleRegistration(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const ciudad = document.getElementById('ciudad').value;
    const password = document.getElementById('password').value;
    
    // 1. Validation of empty fields
    if (!nombre || !email || !telefono || !ciudad || !password) {
        alert('Por favor completa todos los campos, incluyendo la ciudad.');
        return;
    }
    
    // 2. Strict Phone Validation (10 digits only - COL)
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(telefono)) {
        alert('El número de teléfono no es válido. Debe contener exactamente 10 dígitos numéricos (Ejemplo: 3015690865).');
        document.getElementById('telefono').focus();
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    const users = getUsers();
    if (users.some(user => user.email === email)) {
        alert('Este correo ya está registrado. Por favor intenta con otro.');
        return;
    }
    
    if (email === ADMIN_EMAIL) {
        alert('Este correo no está disponible para registro.');
        return;
    }
    
    // Create new user including city
    const newUser = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        ciudad: ciudad,
        password: password,
        isAdmin: false,
        fechaRegistro: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    setCurrentUser(email);
    
    alert(`¡Bienvenido ${nombre}! Tu cuenta ha sido creada exitosamente.`);
    processPendingOrderBeforeRedirect('/Pagina Principal/PerfilUsuario/usuario.html');
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Por favor completa todos los campos.');
        return;
    }
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setCurrentUser(email);
        alert('¡Bienvenido Admin!');
        processPendingOrderBeforeRedirect('/Pagina Principal/PerfilAdmin/admin.html');
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        setCurrentUser(email);
        alert(`¡Bienvenido ${user.nombre}!`);
        processPendingOrderBeforeRedirect('/Pagina Principal/PerfilUsuario/usuario.html');
        return;
    }
    
    alert('Correo o contraseña incorrectos. Por favor intenta de nuevo.');
}

function checkUserSession() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        if (currentUser === ADMIN_EMAIL) {
            return { isLoggedIn: true, isAdmin: true, email: currentUser };
        } else {
            const users = getUsers();
            const user = users.find(u => u.email === currentUser);
            if (user) {
                return { isLoggedIn: true, isAdmin: false, email: currentUser, user: user };
            }
        }
    }
    
    return { isLoggedIn: false, isAdmin: false };
}

// Initialize forms on page load
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    if (form) {
        const isRegistroPage = document.querySelector('h2') && 
                               document.querySelector('h2').textContent.includes('Registrarse');
        
        if (isRegistroPage) {
            form.addEventListener('submit', handleRegistration);
        } else {
            form.addEventListener('submit', handleLogin);
        }
    }
});