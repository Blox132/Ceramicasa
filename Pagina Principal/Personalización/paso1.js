let nextButton = document.getElementById("nextButton");

nextButton.addEventListener("click", guardarMaterial);

function guardarMaterial() {
    let materialSeleccionado = document.querySelector('input[type="radio"]:checked');
    if (materialSeleccionado) {
        localStorage.setItem("material", materialSeleccionado.value);
        location.href = 'paso2.html';
    } else {
        alert("Por favor selecciona un material antes de continuar.");
    }
}