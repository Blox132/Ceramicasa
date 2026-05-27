let previousButton = document.getElementById("previousButton");
let nextButton = document.getElementById("nextButton");

previousButton.addEventListener("click", devolverse)

function devolverse() {
    location.href = 'paso1.html'
}

nextButton.addEventListener("click", guardarDescripcion);

function guardarDescripcion() {
    let descripcion = document.getElementById("descripcion").value;
    if (descripcion.length >= 20) {
        localStorage.setItem("descripcion", descripcion);
        location.href = 'paso3.html';
    } else {
        alert("La descripción debe tener al menos 20 caracteres.");
    }
}