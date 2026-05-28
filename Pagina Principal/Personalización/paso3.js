let previousButton = document.getElementById("previousButton");
let confirmButton = document.getElementById("confirmButton");

let material = localStorage.getItem("material");
let descripcion = localStorage.getItem("descripcion");
let materialToDisplay = "/Pagina Principal/Imagenes/" + material + ".png";

previousButton.addEventListener("click", devolverse);

function devolverse() {
    location.href = 'paso2.html'
}

confirmButton.addEventListener("click", terminar);

function terminar() {
    // Ask for price
    let precio = prompt("Ingresa el precio de tu diseño personalizado:", "50000");
    
    if (precio === null) {
        return; // User cancelled
    }
    
    precio = parseInt(precio);
    
    if (isNaN(precio) || precio <= 0 || precio <= 50000) {
        alert("Por favor ingresa un precio válido (minimo $50,000).");
        return;
    }
    
    // Create custom design item name
    let materialCapitalizado = material.charAt(0).toUpperCase() + material.slice(1);
    let itemName = "Diseño Personalizado - " + materialCapitalizado;
    
    // Add to cart using global function from carrito-panel.js
    addToCart(itemName, precio, materialToDisplay);
    
    alert("¡Artesanía personalizada añadida a su carrito con éxito!");
    
    // Clear personalization data
    localStorage.removeItem("material");
    localStorage.removeItem("descripcion");
    
    location.href = '/Pagina Principal/index.html'
}

// Display the design confirmation
document.getElementById("contenedorPaso3").querySelector("h3").textContent = material;
document.getElementById("contenedorPaso3").querySelector("p").textContent = descripcion;
document.getElementById("contenedorPaso3").querySelector("img").src = materialToDisplay;