document.addEventListener("DOMContentLoaded", () => {
    cargarHistorialPedidos();
});

function cargarHistorialPedidos() {
    const contenedor = document.getElementById("historialPedidosContainer");
    
    const productosFigma = [
        {
            id: "FAC-1002",
            fecha: "2026-05-20",
            imagen: "/Pagina Principal/Imagenes/SagradaFamilia.png",
            nombre: "Sagrada Familia",
            alto: "38 cm",
            ancho: "16 cm",
            material: "Yeso",
            total: 60000,
            estado: "En camino"
        },
        {
            id: "FAC-0985",
            fecha: "2026-04-12",
            imagen: "/Pagina Principal/Imagenes/Elefantes.png",
            nombre: "Elefantes Hindúes x3",
            alto: "28 cm",
            ancho: "24 cm",
            material: "Yeso",
            total: 85000,
            estado: "Entregado"
        }
    ];

    const pedidosRealizados = JSON.parse(localStorage.getItem("historialPedidosClient")) || productosFigma;

    if (pedidosRealizados.length === 0) {
        contenedor.innerHTML = `<p class="no-pedidos">Aún no has realizado ninguna compra en Ceramicasa.</p>`;
        return;
    }

    contenedor.innerHTML = "";

    pedidosRealizados.forEach(pedido => {
        const pedidoCard = document.createElement("div");
        pedidoCard.classList.add("pedido-horizontal-card");
        
        const totalFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(pedido.total);

        let estadoClass = "estado-pendiente";
        if (pedido.estado === "En camino") estadoClass = "estado-camino";
        if (pedido.estado === "Entregado") estadoClass = "estado-entregado";

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