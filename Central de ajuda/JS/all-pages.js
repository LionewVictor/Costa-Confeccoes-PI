// ==========================
// AO CLICAR NA FRASE "Central de ajuda Costa Confecções" RETORNARA PARA O CENTRAL.HTML
// ==========================

const central = document.getElementById("central");

 if(central){ 
    central.addEventListener("click", function () {
      window.location.href = "central.html";
});
 }