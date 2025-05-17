// Elementos
const formulario = document.getElementById('formulario');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const categoriaSelect = document.getElementById('categoria');
const tabelaBody = document.querySelector('#tabela tbody');
const saldoElement = document.querySelector('.saldo');
const gastosMesElement = document.querySelector('.gastos-mes');
const graficoPizzaCanvas = document.getElementById('graficoPizza').getContext('2d');
const formContainer = document.getElementById('formContainer');
const adicionarDespesaButton = document.getElementById('adicionarDespesa');
const adicionarReceitaButton = document.getElementById('adicionarReceita');
const cancelarButton = document.getElementById('cancelar');

let movimentos = JSON.parse(localStorage.getItem('movimentos')) || [];
let graficoPizza = null;

// Função para formatação
function formatarReal(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para atualizar a tabela
function atualizarTabela() {
  tabelaBody.innerHTML = '';
  if (movimentos.length === 0) {
    tabelaBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: #888;">Nenhum movimento encontrado.</td></tr>`;
    return;
  }
  movimentos.forEach((mov, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mov.descricao}</td>
      <td>${formatarReal(mov.valor)}</td>
      <td><button onclick="removerMovimento(${index})">❌</button></td>
    `;
    tabelaBody.appendChild(tr);
  });
}

// Função para atualizar gráficos
function atualizarGraficos() {
  const categoriasFiltradas = [...new Set(movimentos.map(m => m.categoria))];
  const dadosCategoria = categoriasFiltradas.map(cat =>
    movimentos.filter(m => m.categoria === cat)
             .reduce((acc, cur) => acc + (cur.tipo === 'Despesa' ? cur.valor : -cur.valor), 0)
  );

  if (graficoPizza) graficoPizza.destroy();
  graficoPizza = new Chart(graficoPizzaCanvas, {
    type: 'pie',
    data: {
      labels: categoriasFiltradas,
      datasets: [{
        label: 'Despesas e Receitas por Categoria',
        data: dadosCategoria,
        backgroundColor: [
          '#4caf50', '#2196f3', '#ff9800', '#f44336'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        }
      }
    }
  });

  atualizarResumo();
}

// Função para atualizar resumo financeiro
function atualizarResumo() {
  const totalReceitas = movimentos.filter(m => m.tipo === 'Receita').reduce((acc, cur) => acc + cur.valor, 0);
  const totalDespesas = movimentos.filter(m => m.tipo === 'Despesa').reduce((acc, cur) => acc + cur.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  saldoElement.textContent = formatarReal(saldo);
  gastosMesElement.textContent = `Gastos deste mês: ${formatarReal(totalDespesas)}`;
}

// Função para adicionar movimento
function adicionarMovimento(movimento) {
  movimentos.push(movimento);
  localStorage.setItem('movimentos', JSON.stringify(movimentos));
  atualizarTabela();
  atualizarGraficos();
  formContainer.style.display = 'none'; // Oculta o formulário após adicionar
}

// Função para remover movimento
function removerMovimento(index) {
  movimentos.splice(index, 1);
  localStorage.setItem('movimentos', JSON.stringify(movimentos));
  atualizarTabela();
  atualizarGraficos();
}

// Evento de clicar no botão de adicionar despesa
adicionarDespesaButton.addEventListener('click', () => {
  formContainer.style.display = 'block';
  descricaoInput.value = '';
  valorInput.value = '';
  categoriaSelect.value = 'Água'; // Define categoria padrão
});

// Evento de clicar no botão de adicionar receita
adicionarReceitaButton.addEventListener('click', () => {
  formContainer.style.display = 'block';
  descricaoInput.value = '';
  valorInput.value = '';
  categoriaSelect.value = 'Outros'; // Define categoria padrão
});

// Evento de cancelamento do formulário
cancelarButton.addEventListener('click', () => {
  formContainer.style.display = 'none';
});

// Evento de submissão do formulário
formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  const categoria = categoriaSelect.value;
  const tipo = adicionarDespesaButton.style.display === 'block' ? 'Despesa' : 'Receita';

  if (!descricao || valor <= 0) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  adicionarMovimento({ descricao, valor, categoria, tipo });
  formulario.reset();
});

// Inicialização
function init() {
  atualizarTabela();
  atualizarGraficos();
}
init();