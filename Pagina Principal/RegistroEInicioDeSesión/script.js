// Admin credentials
const ADMIN_EMAIL = "admin@ceramicasa.com";
const ADMIN_PASSWORD = "aD7$mIn*Ky@2024!Sec%Re&t#Pass";

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
    window.location.href = '/Pagina Principal/PerfilUsuario/usuario.html';
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
        window.location.href = '/Pagina Principal/PerfilAdmin/admin.html';
        return;
    }
    
    // Check regular users
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        setCurrentUser(email);
        alert(`¡Bienvenido ${user.nombre}!`);
        window.location.href = '/Pagina Principal/PerfilUsuario/usuario.html';
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
