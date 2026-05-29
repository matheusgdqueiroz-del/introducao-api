const botao = document.querySelector("#buscaCotacao")
const resultado = document.querySelector("#resultado")
const valorInput = document.querySelector("#user-input")

function buscaCotacao() {
    const dolar = Number(valorInput.value.replace(",", "."))

    if (Number.isNaN(dolar) || dolar <= 0) {
        resultado.textContent = "Digite um valor válido em dólar."
        return
    }

    fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL")
    .then(function (resposta) {
        return resposta.json()
    })
    .then(function(dados) {
        const cotacao = Number(dados.USDBRL.bid)
        const dolarParaReal = cotacao * dolar
        const realFormatado = dolarParaReal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        resultado.textContent = `US$ ${dolar} em reais é ${realFormatado}`
    })
   
}

botao.addEventListener("click", buscaCotacao)
