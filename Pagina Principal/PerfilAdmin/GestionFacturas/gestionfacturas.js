// Delete receipt with confirmation
function deleteReceipt(receiptId) {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la factura ${receiptId}? Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) {
        return; // User cancelled
    }
    
    let receipts = JSON.parse(localStorage.getItem('gestionFacturas')) || [];
    receipts = receipts.filter(receipt => receipt.id !== receiptId);
    localStorage.setItem('gestionFacturas', JSON.stringify(receipts));
    displayReceipts();
    
    alert('Factura eliminada exitosamente.');
}

// Print Shipping Label
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
            <title>Etiqueta de Envío - ${receipt.id}</title>
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
                    <small>Estudio de Arte - Envío Nacional</small>
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
                    <strong>Detalles Logisticos:</strong>
                    Orden ID: ${receipt.id}<br>
                    Método Pago: ${receipt.metodoPago === 'transferencia' ? 'Transferencia (Pagado)' : 'Efectivo contra Entrega'}<br>
                    Fecha Impresión: ${new Date().toLocaleDateString('es-CO')}
                </div>
                <div class="barcode-sim">||||| | |||| ||| || ||||| | ||</div>
                <div class="fragil-footer">⚠️ ¡FRÁGIL! CERÁMICA ⚠️</div>
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
        `¿Cómo deseas notificar a ${nombreCliente} sobre el despacho del pedido ${receiptId}?\n\n` +
        `Escribe 1 para: Enviar Correo Electrónico (${emailCliente})\n` +
        `Escribe 2 para: Enviar Mensaje de Texto SMS (${contactoCliente})`
    );

    if (opcion === "1") {
        alert(
            `[Simulación API Correo] Enviando notificación...\n\n` +
            `De: envios@ceramicasa.com\n` +
            `Para: ${emailCliente}\n\n` +
            `Asunto: ¡Tu pedido ${receiptId} de Ceramicasa ya va en camino!\n\n` +
            `Mensaje: Hola ${nombreCliente}, nos alegra informarte que tu pedido ha sido entregado a la transportadora. Llegará pronto a tu dirección.`
        );
        alert(`¡Notificación por Correo Electrónico enviada con éxito a ${emailCliente}!`);
    } else if (opcion === "2") {
        alert(
            `📱 [Simulación API SMS Gateway] Enlazando con red móvil...\n\n` +
            `Para: +57 ${contactoCliente}\n\n` +
            `Mensaje: Ceramicasa Informa: Hola ${nombreCliente}, tu pedido ${receiptId} ha sido despachado hacia ${contactoCliente}. ¡Gracias por tu compra!`
        );
        alert(`¡Notificación SMS enviada con éxito al número ${contactoCliente}!`);
    } else if (opcion !== null) {
        alert("Opción no válida. Inténtalo de nuevo seleccionando 1 o 2.");
    }
}

// Load and display catalog receipts
function displayReceipts() {
    const container = document.getElementById('facturasContainer');
    const receipts = JSON.parse(localStorage.getItem('gestionFacturas')) || [];
    
    if (receipts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #FFD700; padding: 40px;">No hay facturas registradas aún.</p>';
        return;
    }
    
    let html = '';
    receipts.forEach(receipt => {
        const itemsList = receipt.items.map(item => 
            `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}`
        ).join('<br>');
        
        html += `
            <div class="factura">
                <h3 class="idFactura">ID: ${receipt.id}</h3>
                <h4 class="fechaHora">${receipt.fecha}</h4>
                <h5 class="usuarioPidioFactura">
                    <strong>Nombre:</strong> ${receipt.usuario.nombre}<br>
                    <strong>Email:</strong> ${receipt.usuario.email}<br>
                    <strong>Teléfono:</strong> ${receipt.usuario.telefono}<br>
                    <strong>Dirección:</strong> ${receipt.usuario.direccion}<br>
                    <strong>Ciudad:</strong> ${receipt.usuario.ciudad}<br>
                    <strong>Método de Pago:</strong> ${receipt.metodoPago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo en Entrega'}
                </h5><br>
                <p class="descripcionFactura">
                    <strong>Productos:</strong><br>
                    ${itemsList}<br><br>
                    <strong>Subtotal:</strong> $${receipt.subtotal.toLocaleString()}<br>
                    <strong>Envío:</strong> $${receipt.envio.toLocaleString()}<br>
                    <strong>Total:</strong> $${receipt.total.toLocaleString()}
                </p>
                
                <div class="acciones-despacho" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="imprimirEtiqueta('${receipt.id}', 'gestionFacturas')" style="background-color: #4CAF50; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🖨️ Imprimir Etiqueta de Envío</button>
                    <button onclick="notificarCliente('${receipt.usuario.nombre}', '${receipt.usuario.telefono}', '${receipt.usuario.email}', '${receipt.id}')" style="background-color: #008CBA; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📣 Notificar Cliente</button>
                </div>
                
                <button class="btn-delete" onclick="deleteReceipt('${receipt.id}')" style="margin-top: 15px;">🗑️ Eliminar Factura</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayReceipts();
});