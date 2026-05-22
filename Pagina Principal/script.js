//slider part
let sliderButton = document.getElementsByClassName("sliderButton");

let leftButton = sliderButton[0];
let rightButton = sliderButton[1];

let currentImage = document.getElementById("sliderImage");
let images = ["Imagenes/Ceramica1.png", "Imagenes/Ceramica2.png", "Imagenes/Ceramica3.png"];
let imageIndex = 0;


leftButton.addEventListener("click", function() {
    imageIndex -= 1;
    if(imageIndex < 0)
    {
        imageIndex = images.length - 1;
    }
    currentImage.src = images[imageIndex];
    
});

rightButton.addEventListener("click", function() {
    imageIndex += 1;
    if(imageIndex >= images.length)
    {
        imageIndex = 0;
    }
    currentImage.src = images[imageIndex];
});