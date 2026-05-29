const campoCep = document.querySelector("#campo-cep")
const btnCep = document.querySelector("#botao-cep")
const resultado = document.querySelector(".resultado")

async function mostrarCep() {
    const cep = pegarCep()

    if (cep.length !== 8) {
        mostrarNaTela("<p>Digite um CEP valido.</p>")
        return
    }

    const dados = await buscarCep(cep)

    mostrarResultado(dados)
}

function pegarCep() {
    return campoCep.value
}

async function buscarCep(cep) {
    const resposta = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`)
    return await resposta.json()
}

function mostrarResultado(dados) {
    mostrarNaTela(`
        <p>Endereco: ${dados.address}</p>
        <p>Cidade: ${dados.city}</p>
        <p>Bairro: ${dados.district}</p>
        <p>Estado: ${dados.state}</p>
    `)
}

function mostrarNaTela(conteudo) {
    resultado.innerHTML = conteudo
    resultado.classList.add("aparecer")
}

btnCep.addEventListener("click", mostrarCep)
