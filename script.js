
document.addEventListener("DOMContentLoaded", function() {
    // this function runs when the DOM is ready, i.e. when the document has been parsed
    // aqui se ponen las cosas que se ejectuan cuando el resto del html está cargado
    pieFoto = document.getElementById("fotoTitle")
    
    parrafo_intro = document.getElementById("parrafo")

    foto = document.getElementById("divFoto")
    foto.addEventListener("click", pis)

    showPic()
});


arrayFotos = document.getElementsByClassName("foto")
arrayMarcas = document.getElementsByClassName("square")
arrayTextos = ["Viaje a Roma", "foto 2", "foto 3"]
var i_slider = 0
var i_trans= 0

function pis(e){
    // e es el evento. getbounding devuelve alas coord del objeto
    // hay que poner true en el listener para que funcione con evento
    var rect = e.offsetX;
    var rect2 = document.getElementById("divFoto").offsetWidth
    let proporcion = rect/rect2
    
    if (proporcion<0.3){
        i_slider--
        showPic(i_slider)
    }else if (proporcion>0.7){
        i_slider++
        showPic(i_slider)
    }

}

function showPic(){
    i_trans=0
    if (i_slider<0){
        i_slider = arrayFotos.length-1
    }else if(i_slider>=arrayFotos.length){
        i_slider=0
    }
    for (let i=0; i<arrayFotos.length;i++){
        arrayFotos[i].style.opacity=0
        arrayMarcas[i].style.opacity = 0.3
        //arrayMarcas[i].style.width = '28%'
    }
    timeO = setTimeout(transitionStories, 50)
    pieFoto.innerHTML = arrayTextos[i_slider]
    console.log(i_slider)
}

function transitionStories(){
    arrayMarcas[i_slider].style.opacity =  0.2 + i_trans*0.8/20;
    //arrayMarcas[i_slider].style.width = `${28 + i_trans*4/20}` + '%';
    arrayFotos[i_slider].style.opacity = 0.5 + i_trans*0.5/20;
    i_trans++;
    var timeO = setTimeout(transitionStories, 10)
    if(i_trans>=20){
        clearTimeout(timeO)
        i_trans=20
    }
    console.log(i_trans)
}