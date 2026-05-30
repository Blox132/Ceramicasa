document.addEventListener("DOMContentLoaded", () => {
    const currentUserEmail = localStorage.getItem('ceramicasa_currentUser');
    if (!currentUserEmail) {
        window.location.href = '/Pagina Principal/RegistroEInicioDeSesión/iniciarsesion.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('ceramicasa_users')) || [];
    const currentUser = users.find(u => u.email.toLowerCase() === currentUserEmail.toLowerCase());
    
    const userName = currentUser ? currentUser.nombre : (currentUserEmail === 'admin@ceramicasa.com' ? 'Administrador' : 'Usuario');
    const userEmail = currentUserEmail;
    const userCity = currentUser ? currentUser.ciudad : '';

    const nombreEl = document.querySelector('.nombre-usuario');
    if (nombreEl) {
        nombreEl.textContent = userName;
    }

    const nombreUsuarioEl = document.querySelector('.nombre-usuario');
    if (nombreUsuarioEl) {
        let emailEl = document.getElementById('userProfileEmail');
        if (!emailEl) {
            emailEl = document.createElement('p');
            emailEl.id = 'userProfileEmail';
            emailEl.className = 'email-usuario';
            nombreUsuarioEl.insertAdjacentElement('afterend', emailEl);
        }
        emailEl.textContent = userEmail;
    }

    const descripcionEl = document.querySelector('.descripcion-usuario');
    if (descripcionEl) {
        descripcionEl.textContent = `Cliente de Ceramicasa${userCity ? ` desde ${userCity}` : ''}. Amante de las artesanías hechas a mano.`;
    }

    cargarHistorialPedidos(currentUserEmail);
});

function obtenerEspecificacionesProducto(nombre) {
    const specs = {
        "Mascaras De La Prudencia": { alto: "19 cm", ancho: "12 cm", material: "Yeso" },
        "Figura De Batman": { alto: "38 cm", ancho: "24 cm", material: "Yeso" },
        "Sagrada Familia En Tronco": { alto: "40 cm", ancho: "26 cm", material: "Yeso" },
        "Sagrada Familia": { alto: "38 cm", ancho: "16 cm", material: "Yeso" },
        "Elefantes Hindúes x3": { alto: "28 cm", ancho: "24 cm", material: "Yeso" }
    };
    
    const foundKey = Object.keys(specs).find(key => nombre.toLowerCase().includes(key.toLowerCase()));
    if (foundKey) {
        return specs[foundKey];
    }
    return { alto: "Variable", ancho: "Variable", material: "Yeso" };
}

function cargarHistorialPedidos(userEmail) {
    const contenedor = document.getElementById("historialPedidosContainer");
    if (!contenedor) return;

    const catalogReceipts = JSON.parse(localStorage.getItem('gestionFacturas')) || [];
    const customReceipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];

    const userCatalog = catalogReceipts.filter(r => r.usuario && r.usuario.email && r.usuario.email.toLowerCase() === userEmail.toLowerCase());
    const userCustom = customReceipts.filter(r => r.usuario && r.usuario.email && r.usuario.email.toLowerCase() === userEmail.toLowerCase());

    const pedidos = [];

    userCatalog.forEach(receipt => {
        receipt.items.forEach(item => {
            const specs = obtenerEspecificacionesProducto(item.name);
            pedidos.push({
                id: receipt.id,
                fecha: receipt.fecha.split(',')[0],
                imagen: item.image || '/Pagina Principal/Imagenes/LogoCeramicasa.jpg',
                nombre: item.name,
                alto: specs.alto,
                ancho: specs.ancho,
                material: specs.material,
                total: item.price * item.quantity,
                estado: receipt.estado || 'Pendiente',
                timestamp: parseDate(receipt.fecha)
            });
        });
    });

    userCustom.forEach(receipt => {
        const items = receipt.items && receipt.items.length > 0 ? receipt.items : [{ name: receipt.descripcion || "Diseño Personalizado", price: receipt.total - 5000, quantity: 1 }];
        items.forEach(item => {
            const specs = obtenerEspecificacionesProducto(item.name);
            
            let imagenCustom = '/Pagina Principal/Imagenes/LogoCeramicasa.jpg';
            if (receipt.material) {
                const materialName = receipt.material.toLowerCase();
                imagenCustom = `/Pagina Principal/Imagenes/${materialName}.png`;
            } else if (item.image) {
                imagenCustom = item.image;
            }

            const rawMaterial = receipt.material || specs.material || 'Yeso';
            const capitalizedMaterial = rawMaterial.charAt(0).toUpperCase() + rawMaterial.slice(1).toLowerCase();

            pedidos.push({
                id: receipt.id,
                fecha: receipt.fecha.split(',')[0],
                imagen: imagenCustom,
                nombre: item.name.startsWith('Diseño Personalizado') ? item.name : `Diseño Personalizado - ${item.name}`,
                alto: specs.alto,
                ancho: specs.ancho,
                material: capitalizedMaterial,
                total: receipt.total,
                estado: receipt.estadoElaboracion || 'En proceso',
                timestamp: parseDate(receipt.fecha)
            });
        });
    });

    pedidos.sort((a, b) => b.timestamp - a.timestamp);

    if (pedidos.length === 0) {
        contenedor.innerHTML = `<p class="no-pedidos">Aún no tienes pedidos realizados en tu cuenta.</p>`;
        return;
    }

    contenedor.innerHTML = "";

    pedidos.forEach(pedido => {
        const pedidoCard = document.createElement("div");
        pedidoCard.classList.add("pedido-horizontal-card");
        
        const totalFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(pedido.total);

        let estadoClass = "estado-pendiente";
        if (pedido.estado === "En camino" || pedido.estado === "En proceso") estadoClass = "estado-camino";
        if (pedido.estado === "Entregado" || pedido.estado === "Cerámica terminada") estadoClass = "estado-entregado";

        pedidoCard.innerHTML = `
            <div class="pedido-imagen-wrapper">
                <img src="${pedido.imagen}" alt="${pedido.nombre}" onerror="this.src='/Pagina Principal/Imagenes/LogoCeramicasa.jpg';">
            </div>
            <div class="pedido-info-wrapper">
                <div class="pedido-meta-top">
                    <span class="pedido-codigo-txt">Pedido: <strong>${pedido.id}</strong></span>
                    <span class="pedido-fecha-txt">${pedido.fecha}</span>
                </div>
                <h3 class="producto-nombre-txt">${pedido.nombre}</h3>
                <div class="producto-detalles-tecnicos">
                    <p><strong>Dimensiones:</strong> ${pedido.alto} de alto x ${pedido.ancho} de ancho</p>
                    <p><strong>Material:</strong> ${pedido.material}</p>
                    <p class="precio-destacado"><strong>Valor:</strong> ${totalFormateado}</p>
                </div>
                <div class="pedido-status-container">
                    <span class="badge-estado-figma ${estadoClass}">${pedido.estado}</span>
                </div>
            </div>
        `;
        
        contenedor.appendChild(pedidoCard);
    });
}

function parseDate(dateStr) {
    if (!dateStr) return 0;
    try {
        const t = Date.parse(dateStr);
        if (!isNaN(t)) return t;
        
        const datePart = dateStr.split(',')[0].trim();
        const parts = datePart.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            
            const timePart = dateStr.split(',')[1];
            if (timePart) {
                const cleanTime = timePart.trim().replace(/\s*[aApP]\.?[mM]\.?\s*/g, '');
                const timeComponents = cleanTime.split(':');
                if (timeComponents.length >= 2) {
                    let hour = parseInt(timeComponents[0], 10);
                    const minute = parseInt(timeComponents[1], 10);
                    const second = timeComponents[2] ? parseInt(timeComponents[2], 10) : 0;
                    
                    const isPM = dateStr.toLowerCase().includes('p');
                    const isAM = dateStr.toLowerCase().includes('a');
                    if (isPM && hour < 12) hour += 12;
                    if (isAM && hour === 12) hour = 0;
                    
                    return new Date(year, month, day, hour, minute, second).getTime();
                }
            }
            return new Date(year, month, day).getTime();
        }
    } catch (e) {
        console.error("Error parsing date:", e);
    }
    return 0;
}