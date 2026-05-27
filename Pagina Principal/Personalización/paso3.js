let previousButton = document.getElementById("previousButton");
let confirmButton = document.getElementById("confirmButton");

let materialToDisplay = "/Pagina Principal/Imagenes/" + localStorage.getItem("material") + ".png"

previousButton.addEventListener("click", devolverse)

function devolverse() {
    location.href = 'paso2.html'
}

confirmButton.addEventListener("click", terminar);

function terminar() {
    alert("Artesania personalizada creada y añadida a su carrito con éxito!");
    location.href = '/Pagina Principal/index.html'
}

document.getElementById("contenedorPaso3").querySelector("h3").textContent = localStorage.getItem("material");
document.getElementById("contenedorPaso3").querySelector("p").textContent = localStorage.getItem("descripcion");
document.getElementById("contenedorPaso3").querySelector("img").src = materialToDisplay;