// Seleciona todos os checkboxes dos filtros
const checkboxes = document.querySelectorAll(".sidebar input[type='checkbox']");

// Seleciona todos os produtos
const cards = document.querySelectorAll(".card");

// Sempre que algum filtro mudar
checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", filtrarProdutos);
});

function filtrarProdutos(){

    // Guarda os filtros marcados
    const filtros = {
        marca: [],
        tamanho: [],
        genero: [],
        produto: [],
        cor: [],
        material: [],
        modelagem: [],
        preco: []
    };

    // Percorre todos os checkboxes marcados
    checkboxes.forEach(check => {

        if (!check.checked) return;
    }
