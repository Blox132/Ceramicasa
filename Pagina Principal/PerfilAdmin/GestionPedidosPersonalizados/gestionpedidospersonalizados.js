// Delete receipt with confirmation
function deleteReceipt(receiptId) {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el pedido personalizado ${receiptId}? Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) {
        return; // User cancelled
    }
    
    // Get current receipts
    let receipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
    
    // Filter out the receipt to delete
    receipts = receipts.filter(receipt => receipt.id !== receiptId);
    
    // Update localStorage
    localStorage.setItem('gestionPedidosPersonalizados', JSON.stringify(receipts));
    
    // Refresh display
    displayReceipts();
    
    alert('Pedido personalizado eliminado exitosamente.');
}

// Load and display custom design receipts
function displayReceipts() {
    const container = document.getElementById('pedidosContainer');
    const receipts = JSON.parse(localStorage.getItem('gestionPedidosPersonalizados')) || [];
    
    if (receipts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #FFD700; padding: 40px;">No hay pedidos personalizados registrados aún.</p>';
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
                <p class="materialFactura">
                    <strong>Material Seleccionado:</strong> ${receipt.material ? receipt.material.charAt(0).toUpperCase() + receipt.material.slice(1) : 'N/A'}
                </p>
                <p class="descripcionFactura">
                    <strong>Descripción del Diseño:</strong><br>
                    ${receipt.descripcion || 'Sin descripción'}<br><br>
                    <strong>Productos:</strong><br>
                    ${itemsList}<br><br>
                    <strong>Subtotal:</strong> $${receipt.subtotal.toLocaleString()}<br>
                    <strong>Envío:</strong> $${receipt.envio.toLocaleString()}<br>
                    <strong>Total:</strong> $${receipt.total.toLocaleString()}
                </p>
                <button class="btn-delete" onclick="deleteReceipt('${receipt.id}')">🗑️ Eliminar Pedido</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayReceipts();
});
