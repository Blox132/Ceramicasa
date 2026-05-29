function deleteReceipt(receiptId) {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el pedido personalizado ${receiptId}? Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) {
        return; 
    }
    
    let receipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
    receipts = receipts.filter(receipt => receipt.id !== receiptId);
    localStorage.setItem('gestionPedidosPersonalizados', JSON.stringify(receipts));
    displayReceipts();
    
    alert('Pedido personalizado eliminado exitosamente.');
}

function updateElaborationStatus(receiptId, selectElement) {
    let receipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
    
    const hoy = new Date();
    const hoyFormateada = hoy.toISOString().split('T')[0];

    receipts = receipts.map(receipt => {
        if (receipt.id === receiptId) {
            receipt.estadoElaboracion = selectElement.value;
            receipt.ultimaActualizacionControl = hoyFormateada;
        }
        return receipt;
    });

    localStorage.setItem('gestionPedidosPersonalizados', JSON.stringify(receipts));
    alert('¡Estado de la cerámica actualizado exitosamente!');
    displayReceipts();
}

// Print Shipping Label (Reutiliza la lógica adaptada al contexto personalizado)
function imprimirEtiqueta(receiptId, storageKey) {
    const receipts = JSON.parse(localStorage.getItem(storageKey)) || [];
    const receipt = receipts.find(r => r.id === receiptId);

    if (!receipt) {
        alert("No se encontraron los datos del pedido.");
        return;
    }

    const ventanaImpresion = window.open('', '_blank', 'width=600,height=700');
    ventanaImpresion.document.write(`
        <html>
        <head>
            <title>Etiqueta de Envío - Personalizado ${receipt.id}</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; background: #fff; }
                .label-container { border: 4px dashed #000; padding: 20px; width: 100%; max-width: 450px; margin: 0 auto; box-sizing: border-box; }
                .header-label { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                .header-label h2 { margin: 5px 0; font-size: 22px; text-transform: uppercase; }
                .section { margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; font-size: 14px; }
                .section strong { font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 3px; }
                .destinatario-box { font-size: 16px; font-weight: bold; }
                .fragil-footer { border: 2px solid #000; text-align: center; padding: 10px; font-size: 20px; font-weight: bold; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px; }
                .barcode-sim { text-align: center; margin: 15px 0; font-size: 32px; letter-spacing: 5px; font-weight: normal; }
                @media print { body { padding: 0; } .label-container { border: 4px solid #000; } }
            </style>
        </head>
        <body>
            <div class="label-container">
                <div class="header-label">
                    <h2>Ceramicasa</h2>
                    <small>Estudio de Arte - Pedido Personalizado</small>
                </div>
                <div class="section">
                    <strong>Remitente:</strong>
                    Ceramicasa Estudio de Arte<br>
                    Tel: 573015690865<br>
                    Medellín, Antioquia, Colombia
                </div>
                <div class="section destinatario-box">
                    <strong>Destinatario:</strong>
                    ${receipt.usuario.nombre}<br>
                    Dirección: ${receipt.usuario.direccion}<br>
                    Ciudad: ${receipt.usuario.ciudad} (COL)<br>
                    Teléfono: ${receipt.usuario.telefono}
                </div>
                <div class="section">
                    <strong>Especificaciones Especiales:</strong>
                    Pedido ID: ${receipt.id}<br>
                    Material: ${receipt.material ? receipt.material.toUpperCase() : 'Y_M_C'}<br>
                    Descripción: ${receipt.descripcion || 'Diseño Especial'}<br>
                    Método Pago: ${receipt.metodoPago === 'transferencia' ? 'Transferencia (Pagado)' : 'Efectivo contra Entrega'}
                </div>
                <div class="barcode-sim">||||| | |||| ||| || ||||| | ||</div>
                <div class="fragil-footer">⚠️ ¡FRÁGIL! CERÁMICA PERSONALIZADA ⚠️</div>
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            <\/script>
        </body>
        </html>
    `);
    ventanaImpresion.document.close();
}

// Notify Client via Simulated Email/SMS
function notificarCliente(nombreCliente, contactoCliente, emailCliente, receiptId) {
    const opcion = prompt(
        `¿Cómo deseas notificar a ${nombreCliente} sobre su Pedido Personalizado ${receiptId}?\n\n` +
        `Escribe 1 para: Enviar Correo Electrónico (${emailCliente})\n` +
        `Escribe 2 para: Enviar Mensaje de Texto SMS (${contactoCliente})`
    );

    if (opcion === "1") {
        alert(
            `[Simulación API Correo] Enviando notificación...\n\n` +
            `De: envios@ceramicasa.com\n` +
            `Para: ${emailCliente}\n\n` +
            `Asunto: ¡Tu diseño personalizado (${receiptId}) ha sido enviado!\n\n` +
            `Mensaje: Hola ${nombreCliente}, excelentes noticias. Tu pieza artesanal personalizada ya fue finalizada y despachada hacia tu locación.`
        );
        alert(`¡Notificación por Correo Electrónico enviada con éxito a ${emailCliente}!`);
    } else if (opcion === "2") {
        alert(
            `📱 [Simulación API SMS Gateway] Enlazando con red móvil...\n\n` +
            `Para: +57 ${contactoCliente}\n\n` +
            `Mensaje: Ceramicasa: ¡Tu pedido de arte personalizado ${receiptId} va en camino a tu destino! Gracias por confiar en nuestro estudio.`
        );
        alert(`¡Notificación SMS enviada con éxito al número ${contactoCliente}!`);
    } else if (opcion !== null) {
        alert("Opción no válida. Inténtalo de nuevo seleccionando 1 o 2.");
    }
}

function displayReceipts() {
    const container = document.getElementById('pedidosContainer');
    
    if (!localStorage.getItem('gestionPedidosPersonalizados')) {
        const pedidosSemilla = [
            {
                id: "FAC-1002",
                fecha: "2026-05-25",
                ultimaActualizacionControl: "2026-05-25",
                estadoElaboracion: "En proceso",
                usuario: { nombre: "Carlos Mendoza", email: "carlos@mail.com", telefono: "3001234567", direccion: "Calle 10 #20-30", ciudad: "Envigado" },
                metodoPago: "transferencia",
                material: "yeso",
                descripcion: "Sagrada Familia pintada con bordes dorados",
                items: [{ name: "Sagrada Familia", quantity: 1, price: 60000 }],
                subtotal: 60000, envio: 5000, total: 65000
            },
            {
                id: "FAC-0985",
                fecha: "2026-05-10",
                ultimaActualizacionControl: "2026-05-10",
                estadoElaboracion: "En proceso",
                usuario: { nombre: "María Gómez", email: "maria@mail.com", telefono: "3119876543", direccion: "Cra 43 #50-11", ciudad: "Sabaneta" },
                metodoPago: "efectivo",
                material: "yeso",
                descripcion: "Elefantes Hindúes decorados con tonos plateados",
                items: [{ name: "Elefantes Hindúes x3", quantity: 1, price: 85000 }],
                subtotal: 85000, envio: 5000, total: 90000
            }
        ];
        localStorage.setItem('gestionPedidosPersonalizados', JSON.stringify(pedidosSemilla));
    }

    const receipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
    
    if (receipts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #FFD700; padding: 40px;">No hay pedidos personalizados registrados aún.</p>';
        return;
    }
    
    let html = '';
    const fechaActual = new Date();

    receipts.forEach(receipt => {
        if (!receipt.estadoElaboracion) receipt.estadoElaboracion = "En proceso";
        if (!receipt.ultimaActualizacionControl) receipt.ultimaActualizacionControl = receipt.fecha;

        const fechaControl = new Date(receipt.ultimaActualizacionControl);
        const diferenciaTiempo = fechaActual - fechaControl;
        const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

        let alertaHtml = '';
        if (diferenciaDias > 15 && receipt.estadoElaboracion === "En proceso") {
            alertaHtml = `<div class="alerta-retraso">⚠️ Pedido Retrasado (${diferenciaDias} días sin cambios)</div>`;
        }

        const itemsList = receipt.items.map(item => 
            `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}`
        ).join('<br>');
        
        html += `
            <div class="factura">
                ${alertaHtml}
                <h3 class="idFactura">ID: ${receipt.id}</h3>
                <h4 class="fechaHora">Última act: ${receipt.ultimaActualizacionControl}</h4>
                <h5 class="usuarioPidioFactura">
                    <strong>Nombre:</strong> ${receipt.usuario.nombre}<br>
                    <strong>Email:</strong> ${receipt.usuario.email}<br>
                    <strong>Teléfono:</strong> ${receipt.usuario.telefono}<br>
                    <strong>Dirección:</strong> ${receipt.usuario.direccion}<br>
                    <strong>Ciudad:</strong> ${receipt.usuario.ciudad}<br>
                    <strong>Método de Pago:</strong> ${receipt.metodoPago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo en Entrega'}
                </h5><br>
                <p class="materialFactura">
                    <strong>Material Seleccionado:</strong> ${receipt.material ? receipt.material.charAt(0).toUpperCase() + receipt.material.slice(1) : 'N/A'}
                </p>
                <p class="descripcionFactura">
                    <strong>Descripción del Diseño:</strong><br>
                    ${receipt.descripcion || 'Sin descripción'}<br><br>
                    <strong>Productos:</strong><br>
                    ${itemsList}<br><br>
                    <strong>Total:</strong> $${receipt.total.toLocaleString()}
                </p>

                <div class="control-elaboracion-block">
                    <label><strong>Estado de Elaboración:</strong></label>
                    <select class="select-estado-admin" onchange="updateElaborationStatus('${receipt.id}', this)">
                        <option value="En proceso" ${receipt.estadoElaboracion === 'En proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="Cerámica terminada" ${receipt.estadoElaboracion === 'Cerámica terminada' ? 'selected' : ''}>Cerámica terminada</option>
                    </select>
                </div>

                <div class="acciones-despacho" style="margin-top: 15px; margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="imprimirEtiqueta('${receipt.id}', 'gestionPedidosPersonalizados')" style="background-color: #4CAF50; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🖨️ Imprimir Etiqueta de Envío</button>
                    <button onclick="notificarCliente('${receipt.usuario.nombre}', '${receipt.usuario.telefono}', '${receipt.usuario.email}', '${receipt.id}')" style="background-color: #008CBA; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📣 Notificar Cliente</button>
                </div>

                <button class="btn-delete" onclick="deleteReceipt('${receipt.id}')">🗑️ Eliminar Pedido</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    displayReceipts();
});