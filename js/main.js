
$(document).ready(function(){
    //funcion para obtener datos
    obtenerProdJSON();
    //controlo que existan datos guardados en el local Storage con respondientes a la clave "carrito"
    if(localStorage.getItem("carrito")){
        carrito = JSON.parse(localStorage.getItem("carrito"));
        //creo el carrito con los datos recuperados del local Storage
        crearCarrito();
    }
    //llamo a funcion para que se vea el mensaje de que el carrito esta vacio
    crearFooter();
});

function obtenerProdJSON() {
    //determino la url del archivo local
    const URLJSON = "./data/productos.json";
    //solicito los datos
    $.getJSON(URLJSON, function(respuesta,estado){
        console.log(estado);
        if(estado === "success"){
            let productos = respuesta.productos;
            //del array recuperado renderizo los productos
            for (const producto of productos){
                $('#products').append(` <div class="product">
                                            <div class="product__icons">
                                                <a href="#" class="fas fa-heart icons__item"></a>
                                                <a href="#" class="fas fa-share icons__item"></a>
                                                <a href="#" class="fas fa-eye icons__item"></a>
                                            </div>
                                            <img src=${producto.imgsrc} alt=${producto.nombre} class="product__img">
                                            <div class="content">
                                                <h3 class="content__title">${producto.nombre}</h3>
                                                <div class="content__price">${producto.precio}</div>
                                                <a  class="content__btn" id="btn${producto.id}" data-id="${producto.id}">add to cart</a>
                                            </div>
                                        </div> `)

            }
        }
    })
}

//accedo al elemento que contiene los productos
let products = document.getElementById("products");
//establezco el evento que llama a la funcion addCarrito, a través de una delegacion 
products.addEventListener('click', e => {
    addCarrito(e);

})

//accedo al elemento que contiene a los productos en el carrito
let item = document.getElementById("item");
///establezco el evento que llama a la funcion accionarBotones(e)
item.addEventListener('click', e => {
    accionarBotones(e);
})

//creo un objeto vacio, para luego crear una coleccion de objetos a partir de este, y asi poder acceder a cada uno de los objetos que contenga
let carrito = {};

const addCarrito = e => {
    //if para determinar si el e.target que dispara la funcion contiene la clase que quiero usar para agregar al carrito
    if(e.target.classList.contains("content__btn")){
        //tomo todos los datos del producto (uso dos veces .parentElement para poder tomar toda la informacion y usarla nuevo en su representacion dentro del carrito)
        setCarrito(e.target.parentElement.parentElement);
        //alerta para indicar que se agrego el item al carrito
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Item added to cart',
            showConfirmButton: false,
            timer: 1500
        });
    }
    //detengo eventos del contenedor padre
    e.stopPropagation();
}
//funcion para tomar los elementos que envida la funcion addCarrito()
const setCarrito = objeto => {
    // console.log(objeto);
    //creo un objeto
    const producto = {
        //accedo a los distintos elementos
        id: objeto.querySelector(".content__btn").dataset.id, // el id lo obtengo del data-id="${producto.id}" establecido en la renderizacion
        nombre: objeto.querySelector(".content__title").textContent,
        precio: objeto.querySelector(".content__price").textContent,
        imgsrc: objeto.querySelector(".product__img").getAttribute("src"),
        cantidad: 1

    }
    // uso el metodo hasOwnProperty() y paso la propiedaqd del id para consultar si el elemento ya esta en el carrito, en el caso de que sea true, significa que se estaria repitiendo, por lo que deberia aumentar la cantidad
    //si no existe, por defecto la cantidad es 1
    if (carrito.hasOwnProperty(producto.id)){
        //accedo a la propiedad cantidad , y aumento la misma pero del objeto que consulte
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }
    //el carrito en la propiedad producto.id le asigno la copia del producto con el spread operator
    carrito[producto.id] = {...producto}
    // console.log(producto);
    //console.log(carrito);
    //llamo a la funcion porque agregue un objeto al carrito
    crearCarrito();
    //llamo a la funcion para que figure en el carrito
    crearFooter();


    calcularCantItems();
}

//funcion para representar cada objeto en el carrito
const crearCarrito = () => {
    //borro el contenido de la seccion para que no se repitan los productos
    $('#item').empty();
    //uso el método Object.values() para que me devuleva un array con los valores correspondientes a las propiedades del objeto, y asi poder usar el forEach
    Object.values(carrito).forEach(producto => {
        //creo variable para calcular el subtotal (precio unitario por cantidad)
        let subtotal = producto.precio * producto.cantidad;
                //accedo a la seccion item, la que va a contener a cada producto agregado al carrito
                $('#item').append(`<div class="prod" id="fila${producto.id}">
                                        <img src=${producto.imgsrc} alt="" class="prod__img">
                                        <div class="prod__content">
                                            <span class="prod__content__title">${producto.nombre}</span>
                                            <span class="prod__content__price" >$${subtotal}</span>
                                        </div>
                                        <div class="prod__quantity">
                                            <i class="fas fa-chevron-up prod__quantity__btn" data-id="${producto.id}"></i>
                                            <span class="prod__quantity__num">${producto.cantidad}</span>
                                            <i class="fas fa-chevron-down prod__quantity__btn" data-id="${producto.id}"></i>
                                        </div>
                                        <i class="fas fa-trash-alt prod__remove remove" data-id="${producto.id}"></i>
                                    </div>`)
    })

    //llamo a la funcion para ver el total
    crearFooter();


    //almaceno la informacion en el local Storage
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

const crearFooter = () => {
    //borro la seccion para que no se repita la informacion
    $('#cart-footer').empty();
    //consulto con el método Object.keys(), que devuelve un array con las propiedades del objeto
    //si esta vacio agrego el h3
    if(Object.keys(carrito).length === 0){
        $('#cart-footer').append(`<h3 class="cart-text">Your cart is empty</h3>`);
        //return para que salga de la funcion
        return
    }

    //creo variable de la cantidad de todos los items dentro del carrito
    //uso Object.values() para que me devuelva un array, y asi usar el método reduce()
    //creo variable de la suma de todos los subtotales, para tener el total del carrito
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad,precio}) => acc + cantidad * precio ,0);
    //muestro el numero de items en el carrito
    calcularCantItems();
    //creo el footer con la informacion obtenida
    $('#cart-footer').append(`<div class="details">
                                <span class="details__text">Total</span>
                                <span class="details__total">$${nPrecio}</span>
                            </div>
                            <div class="btn-footer">
                                <button id="btn-clear" class="btn-footer__item">Clear Shopping Cart</button>
                                <button class="btn-footer__item" id="btn-checkout">Checkout</button>
                            </div>`)

    //accedo al boton y establezco la funcion para que "borre" al objeto carrito; asignando a la variable carrito un objeto vacio "{}"; y nuevamente llamo a la funcion crearCarrito(), para representar el carrito vacio
    $('#btn-clear').on("click", () => {
        carrito = {};
        crearCarrito();
        //muestro el numero de items en el carrito
        calcularCantItems();
    })
    //simulo que al comprar el carrito queda vacio y devuelve un mensaje de que la compra fue realizada con éxito
    $("#btn-checkout").on("click",() =>{
        carrito = {};
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Your purchase was succesful!',
            showConfirmButton: false,
            timer: 1500
        });
        crearCarrito();
        //muestro el numero de items en el carrito
        calcularCantItems();
    })
}

const calcularCantItems = () =>{
    //accedo a la cantidad; y fijo que me devuelva un numero
    const nCantidad = Object.values(carrito).reduce((acc, {cantidad} ) => acc + cantidad ,0);
    //accedo al elemento para mostrar el resultado
    $('.num-items').html(nCantidad);
}

const accionarBotones = e => {
    //console.log(e.target);
    //consulto si el e.target contiene la clase 'fa-chevron-up'
    if(e.target.classList.contains('fa-chevron-up')){
        //accedo al producto con el mismo id
        const producto = carrito[e.target.dataset.id];
        //modifico la cantidad
        producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
        //asigno la copia
        carrito[e.target.dataset.id] ={...producto};
        //represento nuevamente el carrito modificado
        crearCarrito();

    }
    //consulto si el e.target contiene la clase 'fa-chevron-down'
    if(e.target.classList.contains('fa-chevron-down')){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;

        //consulto si la propiedad cantidad es igual a 0
        if(producto.cantidad == 0){
            //en ese caso, elimino el objeto
            delete carrito[e.target.dataset.id]
        }

        //represento nuevamente el carrito modificado
        crearCarrito();

    }

    //consulto si el e.target contiene la clase 'remove'
    if(e.target.classList.contains('remove')){
        const producto = carrito[e.target.dataset.id];
        //elimino el objeto
        delete carrito[e.target.dataset.id]
        //represento nuevamente el carrito modificado
        crearCarrito();     
        //muestro el numero de items en carrito  
        calcularCantItems();
    }

    e.stopPropagation();
}


