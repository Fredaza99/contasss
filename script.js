// script.js atualizado com funcionalidades solicitadas
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

const form = document.getElementById("transacao-form");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const categoria = document.getElementById("tipo");
const listaTransacoes = document.getElementById("lista-transacoes");

const saldoSpan = document.getElementById("saldo");
const totalFixo = document.getElementById("total-fixo");
totalVariavel = document.getElementById("total-variavel");
totalPoupanca = document.getElementById("total-poupanca");
totalEmergencia = document.getElementById("total-emergencia");
const metaEmergencia = document.getElementById("meta-emergencia");
const totalObjetivos = document.getElementById("total-objetivo");
const totalSalario = document.getElementById("total-salario");

totalLazer = document.getElementById("total-lazer");

const resetBtn = document.getElementById("resetar");

let metaEmergenciaValor = 0;

function atualizarTela() {
    let saldo = 0, fixo = 0, variavel = 0, poupanca = 0, emergencia = 0, objetivo = 0, lazer = 0, salarioBase = 0;
;
    listaTransacoes.innerHTML = "";

    transacoes.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.descricao} - R$ ${item.valor.toFixed(2)} (${item.categoria})`;
        const btn = document.createElement("button");
        btn.textContent = "Excluir";
        btn.onclick = () => {
            transacoes.splice(index, 1);
            salvar();
            atualizarTela();
            atualizarGrafico();

        };
        li.appendChild(btn);
        listaTransacoes.appendChild(li);

        switch (item.categoria) {
            case "salario":
                saldo += item.valor;
                salarioBase += item.valor;
                break;
            case "fixo":
                saldo -= item.valor;
                fixo += item.valor;
                break;
            case "variavel":
                saldo -= item.valor;
                variavel += item.valor;
                break;
            case "poupanca":
                saldo -= item.valor;
                poupanca += item.valor;
                break;
            case "emergencia":
                saldo -= item.valor;
                emergencia += item.valor;
                break;
            case "objetivo":
                saldo -= item.valor;
                objetivo += item.valor;
                break;
            case "lazer":
                saldo -= item.valor;
                lazer += item.valor;
                break;
        }
    });

    metaEmergenciaValor = salarioBase * 0.1;
    const porcentagemEmergencia = metaEmergenciaValor > 0 ? ((emergencia / metaEmergenciaValor) * 100).toFixed(0) : 0;

    saldoSpan.textContent = saldo.toFixed(2);
    totalFixo.textContent = fixo.toFixed(2);
    totalVariavel.textContent = variavel.toFixed(2);
    totalPoupanca.textContent = poupanca.toFixed(2);
    totalEmergencia.textContent = emergencia.toFixed(2);
    totalSalario.textContent = salarioBase.toFixed(2);

    metaEmergencia.textContent = `${porcentagemEmergencia}%`;
    totalObjetivos.textContent = objetivo.toFixed(2);
    totalLazer.textContent = lazer.toFixed(2);

    if (fixo > salarioBase * 0.5) {
        alert("⚠️ Você está gastando mais de 50% do seu salário com gastos fixos!");
    }
}

function salvar() {
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const novaTransacao = {
        descricao: descricao.value,
        valor: parseFloat(valor.value),
        categoria: categoria.value
    };
    transacoes.push(novaTransacao);
    salvar();
    atualizarTela();
    atualizarGrafico();

    form.reset();
});

resetBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja resetar todos os dados?")) {
        localStorage.clear();
        transacoes = [];
        salarioBase = 0;
        atualizarTela();
    }
});



// ------------------------- //
//      METAS PERSONALIZADAS
// ------------------------- //
const metas = JSON.parse(localStorage.getItem("metas")) || [];
const metaForm = document.getElementById("meta-form");
const nomeMetaInput = document.getElementById("nome-meta");
const valorMetaInput = document.getElementById("valor-meta");
const listaMetas = document.getElementById("lista-metas");

function atualizarListaDeMetas() {
    listaMetas.innerHTML = "";
    metas.forEach((meta, index) => {
        const valorGuardado = calcularTotalPorTipo("objetivo");
        const percentual = Math.min((valorGuardado / meta.valor) * 100, 100).toFixed(1);

        const li = document.createElement("li");
        li.innerHTML = `
      <strong>${meta.nome}</strong> - R$${meta.valor.toFixed(2)}  
      <br>
      <progress value="${percentual}" max="100"></progress>
      ${percentual}% completo
      <button onclick="removerMeta(${index})">Remover</button>
    `;
        listaMetas.appendChild(li);
    });
}

function removerMeta(index) {
    metas.splice(index, 1);
    salvarMetas();
    atualizarListaDeMetas();
}

function salvarMetas() {
    localStorage.setItem("metas", JSON.stringify(metas));
    atualizarListaDeMetas();
    atualizarTela(); // ✅ adicionado!
}


metaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = nomeMetaInput.value.trim();
    const valor = parseFloat(valorMetaInput.value);
    if (nome && valor > 0) {
        metas.push({ nome, valor });
        salvarMetas();
        atualizarListaDeMetas();
        nomeMetaInput.value = "";
        valorMetaInput.value = "";
    }
});

atualizarListaDeMetas();

// --------------------------- //
//        GRÁFICO (Chart.js)
// --------------------------- //
const ctx = document.getElementById("grafico-distribuicao").getContext("2d");

let grafico = new Chart(ctx, {
    type: "pie",
    data: {
        labels: [
            "Gastos Fixos",
            "Gastos Variáveis",
            "Emergência",
            "Poupança",
            "Lazer",
            "Objetivos"
        ],
        datasets: [{
            data: [],
            backgroundColor: [
                "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#f67019"
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom"
            },
            title: {
                display: false
            }
        }
    }
});

function atualizarGrafico() {
    grafico.data.datasets[0].data = [
        calcularTotalPorTipo("fixo"),
        calcularTotalPorTipo("variavel"),
        calcularTotalPorTipo("emergencia"),
        calcularTotalPorTipo("poupanca"),
        calcularTotalPorTipo("lazer"),
        calcularTotalPorTipo("objetivo"),
    ];
    grafico.update();
}
atualizarGrafico();


function calcularTotalPorTipo(tipo) {
    return transacoes
        .filter((item) => item.categoria === tipo)
        .reduce((total, item) => total + item.valor, 0);
}


atualizarTela();
