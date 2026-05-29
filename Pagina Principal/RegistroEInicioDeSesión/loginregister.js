// Admin credentials
const ADMIN_EMAIL = "admin@ceramicasa.com";
const ADMIN_PASSWORD = "aD7$mIn*Ky@2024!Sec%Re&t#Pass";

// Process pending order and redirect
function processPendingOrderBeforeRedirect(redirectUrl) {
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
    
    if (!pendingOrder) {
        // No pending order, just redirect
        window.location.href = redirectUrl;
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
    
    // Redirect
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
    const password = document.getElementById('password').value;
    
    // Validation
    if (!nombre || !email || !telefono || !password) {
        alert('Por favor completa todos los campos.');
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    // Check if email already exists
    const users = getUsers();
    if (users.some(user => user.email === email)) {
        alert('Este correo ya está registrado. Por favor intenta con otro.');
        return;
    }
    
    // Check if email is admin email
    if (email === ADMIN_EMAIL) {
        alert('Este correo no está disponible para registro.');
        return;
    }
    
    // Create new user
    const newUser = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        password: password,
        isAdmin: false,
        fechaRegistro: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Log in the new user
    setCurrentUser(email);
    
    alert(`¡Bienvenido ${nombre}! Tu cuenta ha sido creada exitosamente.`);
    // Process pending order before redirect
    processPendingOrderBeforeRedirect('/Pagina Principal/PerfilUsuario/usuario.html');
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
        alert('Por favor completa todos los campos.');
        return;
    }
    
    // Check if it's admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setCurrentUser(email);
        alert('¡Bienvenido Admin!');
        // Process pending order for admin if any
        processPendingOrderBeforeRedirect('/Pagina Principal/PerfilAdmin/admin.html');
        return;
    }
    
    // Check regular users
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        setCurrentUser(email);
        alert(`¡Bienvenido ${user.nombre}!`);
        // Process pending order before redirect
        processPendingOrderBeforeRedirect('/Pagina Principal/PerfilUsuario/usuario.html');
        return;
    }
    
    alert('Correo o contraseña incorrectos. Por favor intenta de nuevo.');
}

// Check if user is logged in
function checkUserSession() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // User is logged in
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
    // Handle registration form
    const registroForm = document.querySelector('form');
    
    if (registroForm) {
        const isRegistroPage = document.querySelector('h2') && 
                               document.querySelector('h2').textContent.includes('Registrarse');
        
        if (isRegistroPage) {
            registroForm.addEventListener('submit', handleRegistration);
        } else {
            // It's login page
            registroForm.addEventListener('submit', handleLogin);
        }
    }
});
