// ------------------------------------ //
// --------------VARIABLES------------- //
// ------------------------------------ //
let logueado = 0;
let idCompra = 0;
let usuario = "";
const arrayJuegosComprados = [];
const arrayJuegosCantidades = [];
const arrayJuegos = [];
let img_avatar = "";

// ------------------------------------------ //
// --------------Cargo Productos------------- //
// ----------------Cargo HTML---------------- //
// ------------------------------------------ //

const URLJSON = "productos.json";
$.getJSON(URLJSON, function (respuesta, estado) {
  if (estado === "success") {
    respuesta.forEach((jsonItem) => {
      const { id, titulo, precio, subtitulo, img } = jsonItem;
      arrayJuegos.push({
        id: id,
        titulo: titulo,
        precio: precio,
        subtitulo: subtitulo,
        img: img,
      });
    });
    //Cargo el HTML
    for (let index = 0; index < arrayJuegos.length - 1; index++) {
      $(".juego__titulo")[index].innerHTML = devuelvoTitulo(index);
      $(".juego__precio")[index].innerHTML = devuelvoPrecio(index) + " us$";
      $(".juego__img")[index].src = devuelvoImg(index);
    }
    $("#cant__Games").html(juegosEnLocalStorage());
    $("#SubTotal").html(totalGastado());

    //Cargo el carrito si habia datos
    if (localStorage.length != 0) {
      let claveMayor = 0;
      for (let index = 0; index < localStorage.length; index++) {
        let clave = localStorage.key(index);
        let valor = localStorage.getItem(clave);

        //Avatar
        if (clave === "avatar") {
          $(".avatar__img").attr("src", valor);
          $(".avatar__img").show();
        }
        //Usuario
        else if (clave === "usuario") {
          $("#LogIn").hide();
          $("#LogOut").show();
          $("#LogIn_nombre_valor").html(valor);
          $("#LogIn_nombre").show();
          logueado = 1;
        }
        //Productos
        else {
          clave = parseInt(clave);
          valor = parseInt(valor);
          agregoAlCarrito(valor, clave);
          //tomo la mayor clave
          clave > claveMayor ? (claveMayor = clave) : null;
        }
      }
      idCompra = claveMayor + 1;
    }

    //Creo eventos de los botones Comprar
    for (const game of arrayJuegos) {
      $(`#btn_game_${game.id}`).click(() => {
        agregoAlCarrito(game.id);
      });
    }
  }
});

// ------------------------------------ //
// --------------FUNCIONES------------- //
// ------------------------------------ //

//Agrego al carrito
const actualizarListadoCarrito = (idGame, idCompra) => {
  $(".carrito").append(
    `<div class="carrito__juego">  <img src="${devuelvoImg(
      idGame
    )}" alt="" class="carrito__juego--img">  <button class="carrito__juego--tacho" id="${idCompra}">🗑️</button></div>`
  );
};

//Comportamiento del boton comprar
const agregoAlCarrito = (idGame, local = 0) => {
  if (local === 0) {
    localStorage.setItem(idCompra, parseInt(idGame));
  } else {
    idCompra = local;
  }

  arrayJuegosComprados.push({ clave: idCompra, valor: parseInt(idGame) });
  juegosCantidades(idGame, 1);
  actualizarListadoCarrito(idGame, idCompra);

  $("#cant__Games").html(arrayJuegosComprados.length);
  $("#SubTotal").html(totalGastado());

  idCompra++;
};

//Creo array con conteo para la factura
const juegosCantidades = (idGame, use) => {
  //use --> 1=Add, --> 2=Remove
  let grabado = 0;

  for (let index = 0; index < arrayJuegosCantidades.length; index++) {
    if (arrayJuegosCantidades[index].valor == idGame) {
      if (use == 1) {
        arrayJuegosCantidades[index].cant++;
        grabado = 1;
      } else if (use == 2) {
        arrayJuegosCantidades[index].cant--;
        if (arrayJuegosCantidades[index].cant == 0) {
          arrayJuegosCantidades.splice(index, 1); //Si es 0 lo elimino
        }
      }
    }
  }

  if (grabado == 0 && use == 1) {
    arrayJuegosCantidades.push({
      valor: idGame,
      cant: 1,
    });
  }
};

const devuelvoPrecio = (id) => {
  for (const juego of arrayJuegos) {
    if (juego.id === id) {
      return juego.precio;
    }
  }
};

const devuelvoTitulo = (id) => {
  for (const juego of arrayJuegos) {
    if (juego.id === id) {
      return juego.titulo;
    }
  }
};

const devuelvoSubTitulo = (id) => {
  for (const juego of arrayJuegos) {
    if (juego.id === id) {
      return juego.subtitulo;
    }
  }
};

const devuelvoImg = (id) => {
  for (const juego of arrayJuegos) {
    if (juego.id === id) {
      return juego.img;
    }
  }
};

//Devuelve cuanto se lleva gastado
const totalGastado = () => {
  gastoTotal = 0;
  for (const juego of arrayJuegosComprados) {
    gastoTotal = gastoTotal + devuelvoPrecio(juego.valor);
  }
  return gastoTotal;
};

//Funcion calcula un descuento en el costo
const costoConDescuento = (suma, porcentaje) => {
  return (suma * (100 - porcentaje)) / 100;
};

//Funcion calcula un aumento en el costo
const costoConAumento = (suma, porcentaje) => {
  return (suma * (100 + porcentaje)) / 100;
};

//Devuelvo cantidad de juegos local storage
function juegosEnLocalStorage() {
  cont = 0;
  for (let index = 0; index < localStorage.length; index++) {
    let clave = localStorage.key(index);
    let valor = localStorage.getItem(clave);
    if (clave != "usuario") {
      cont++;
    }
  }
}

//Devuelvo nombreUsuario
function devuelvoUsuario() {
  cont = 0;
  usuario = "";
  for (let index = 0; index < localStorage.length; index++) {
    let clave = localStorage.key(index);
    let valor = localStorage.getItem(clave);
    if (clave === "usuario") {
      usuario = valor;
    }
  }
  return usuario;
}

// ------------------------------------ //
// ------------- EVENTOS -------------- //
// ------------------------------------ //

///////////////////////////
//////////Carrito//////////
///////////////////////////
$(".carrito").hide();

$(".carrito__cruz--btn").click(() => {
  $(".carrito").hide();
});

$("#btn_carrito").click(() => {
  $(".carrito").show();
});

// //Boton eliminar uno
$(".carrito").on("click", ".carrito__juego--tacho", function () {
  let idGame = this.id;
  //Elimino de la pantalla
  $(this).parent().remove();

  //Quito elemento de Array
  cont = 0;
  for (const iterator of arrayJuegosComprados) {
    if (iterator.clave == parseInt(idGame)) {
      elementoBorrar = cont;
      valorBorrar = iterator.valor;
    }
    cont++;
  }
  arrayJuegosComprados.splice(elementoBorrar, 1);

  //Quito de localStorage
  localStorage.removeItem(idGame);

  //Completo array para factura
  juegosCantidades(valorBorrar, 2);

  //Mod variable Cant__Games
  $("#cant__Games").html(arrayJuegosComprados.length);

  //Mod SubTotal
  $("#SubTotal").html(totalGastado());
});

//Boton Limpiar carrito
$("#btn_limpiar").click(() => {
  arrayJuegosComprados.length = 0;
  arrayJuegosCantidades.length = 0;
  SubTotal.innerHTML = 0;
  cant__Games.innerHTML = 0;
  $(".carrito__juego").remove();

  valorUsuario = localStorage.getItem("usuario");
  valorAvatar = localStorage.getItem("avatar");
  console.log(valorUsuario);
  console.log(valorAvatar);
  localStorage.clear();
  if (valorUsuario != null) {
    console.log("User");
    localStorage.setItem("usuario", valorUsuario);
  }
  if (valorAvatar != null) {
    console.log("Avatar");
    localStorage.setItem("avatar", valorAvatar);
  }
});

///////////////////////////
//////////Logueo///////////
///////////////////////////

//Estado inicial de los elementos:
//LogIn show - Logout hide - LoginNombre hide
if (logueado == 0) {
  $("#LogIn").show();
  $("#LogOut").hide();
  $("#LogIn_nombre").hide();
  $(".avatar__img").hide();
}

//Seleccion de Avatar
const URLGET = "http://hp-api.herokuapp.com/api/characters";
$("#btn_hp").click(() => {
  $.get(URLGET, function (respuesta, estado) {
    if (estado === "success") {
      let misDatos = respuesta;
      let indice = Math.floor(Math.random() * misDatos.length);
      $("#avatar__img").show();
      $("#avatar__img").attr("src", misDatos[indice].image);
      img_avatar = misDatos[indice].image;
    }
  });
});

//CARTEl DE LOGIN
//Oculto cartel
$(".logueo").hide();

//El cierre del logueo
$(".logueo__cruz--btn").click(() => {
  $(".logueo").hide();
  $("#user").val("");
});

//Botonn de login muestro cartel
$("#btn_LogIn").click(() => {
  if (logueado == 0) {
    $(".logueo").show();
    $("#avatar__img").hide();
  }
});

//Envio de formulario
$("#Logueando").submit((e) => {
  e.preventDefault();

  if (e.target.children[0].value.trim() == "") {
    console.log("Vacio"); // Mostrar mensaje de error
  } else {
    $("#LogIn_nombre_valor").html(e.target.children[0].value.trim());
    $("#LogIn_nombre").show();
    $("#LogIn").hide();
    $("#LogOut").show();
    logueado = 1;
    $(".logueo").hide();
    localStorage.setItem("usuario", e.target.children[0].value.trim());
    if (img_avatar != "") {
      localStorage.setItem("avatar", img_avatar);
      $(".avatar__img").attr("src", img_avatar);
      $(".avatar__img").show();
      img_avatar = "";
    }
    $("#user").val("");
  }
});

$("#LogOut").click(() => {
  if (logueado == 1) {
    $("#LogIn_nombre").hide();
    $("#LogIn").show();
    $("#LogOut").hide();
    logueado = 0;
    localStorage.removeItem("usuario");
    localStorage.removeItem("avatar");
    $(".avatar__img").hide();
  }
});

///////////////////////////
//////////Resumen//////////
///////////////////////////

$(".resumen").hide();
$(".resumenFinal").hide();

//El cierro resumen
$(".resumen__cruz--btn").click(() => {
  $(".resumen").hide();
  $("#advertencia_resumen--opcionPago").hide();
  $("#advertencia_resumen--cartVacio").hide();
  $(".resumenFinal").hide();
});

//Boton de resumen muestro cartel
$("#btn_fin").click(() => {
  $(".resumen").show();
  $(".resumen__formulario").show();
  $("#advertencia_resumen--opcionPago").hide();
  $("#advertencia_resumen--cartVacio").hide();
  $("#resumen__form").show();
  $("input[name=formaPago]").val([""]);
});

//Envio de formulario
$("#resumen__form").submit((e) => {
  e.preventDefault();
  $("#advertencia_resumen--opcionPago").hide();
  $("#advertencia_resumen--cartVacio").hide();
  $("#fac_items").html("");

  if ($("input[name='formaPago']:radio").is(":checked")) {
    if (arrayJuegosCantidades.length > 0) {
      let opcion = $("input:radio[name=formaPago]:checked").val();
      let tableEncabezado = `<div class="row header">
      <div class="cell">
          Cantidad
      </div>
      <div class="cell">
          Descripción
      </div>
      <div class="cell">
          Precio Unitario
      </div>
      <div class="cell">
          Precio Total
      </div></div>`;
      let tableResumen = "";
      let tableFooter = "";

      for (const iterator of arrayJuegosCantidades) {
        tableResumen =
          tableResumen +
          `<div class="row"> <div class="cell" data-title="Cant">
          ${iterator.cant}
          </div>
          <div class="cell" data-title="Descripción">
          ${devuelvoTitulo(iterator.valor)}
          </div>
          <div class="cell" data-title="Precio Unitario">
          ${devuelvoPrecio(iterator.valor)}
          </div>
          <div class="cell" data-title="Precio Total">
          ${devuelvoPrecio(iterator.valor) * iterator.cant}
          </div></div>`;
      }
      let gasto = totalGastado();
      tableFooter =
        tableFooter +
        `<div class="row header">
      <div class="cell">
      Total Juegos:
      </div>
      <div class="cell">
      ${arrayJuegosComprados.length}
      </div>
      <div class="cell">
        Sumatoria Precio:
      </div>
      <div class="cell">
          ${gasto} U$S
      </div></div>`;
      $("#fac_items").append(tableEncabezado);
      $("#fac_items").append(tableResumen);
      $("#fac_items").append(tableFooter);

      $("#fac_nro").html(Math.floor(Math.random() * (5562 - 3562)) + 3562);
      console.log("Logueado:");
      console.log(logueado);
      console.log("User:");
      console.log(devuelvoUsuario());
      logueado == 1
        ? $("#fac_user").html(devuelvoUsuario())
        : $("#fac_user").html("Cliente Anónimo");

      let textoAmostrar = "";
      if (opcion == "efectivo") {
        textoAmostrar =
          textoAmostrar +
          `Como usted paga en Efectivo tiene un descuento del 20% <br> Pagará:<span class="fac_totalPagar"> ${costoConDescuento(
            gasto,
            20
          )} U$S </span><br>`;
      } else if (opcion == "debito") {
        textoAmostrar =
          textoAmostrar +
          `Como usted paga con Tarjeta de Débito tiene un descuento del 5%  <br> Pagará: <span class="fac_totalPagar">${costoConDescuento(
            gasto,
            5
          )} U$S </span><br>`;
      } else if (opcion == "credito") {
        textoAmostrar =
          textoAmostrar +
          `Como usted paga con Tarjeta de Crédito tiene un recargo del 15% <br> Pagará:<span class="fac_totalPagar">${costoConAumento(
            gasto,
            15
          )} U$S </span><br>`;
      }
      $("#fac_beneficio").html(textoAmostrar);
      $(".resumenFinal").show();
      $("#resumen__form").hide();
    } else {
      $("#advertencia_resumen--cartVacio").show();
    }
  } else {
    $("#advertencia_resumen--opcionPago").show();
  }
});
