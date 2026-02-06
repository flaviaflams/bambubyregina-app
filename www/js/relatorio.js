// relatorio.js

const API_URL = 'https://vendas-bambuby-regina-e2au.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    carregarFiltroProdutos();
    carregarRelatorio();
    
    // Adiciona event listeners aos campos de filtro
    const filtroProduto = document.getElementById('filtroProduto');
    const filtroDataInicio = document.getElementById('filtroDataInicio');
    const filtroDataFim = document.getElementById('filtroDataFim');
    
    // Chama a função de filtro sempre que um dos campos é alterado
    filtroProduto.addEventListener('change', carregarRelatorio);
    filtroDataInicio.addEventListener('change', carregarRelatorio);
    filtroDataFim.addEventListener('change', carregarRelatorio);
});

// Carrega a lista de produtos para o filtro de seleção
async function carregarFiltroProdutos() {
    const selectFiltro = document.getElementById('filtroProduto');
    selectFiltro.innerHTML = '<option value="">Todos</option>';
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/produtos`);
        const produtos = await response.json();
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = produto.nome;
            selectFiltro.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar filtro de produtos:', error);
        alert('Erro ao carregar filtro de produtos.');
    }
}

// Carrega o relatório com base nos filtros
async function carregarRelatorio() {
    const tabelaCorpo = document.getElementById('tabelaRelatorio');
    tabelaCorpo.innerHTML = '';
    
    const filtroProdutoId = document.getElementById('filtroProduto').value;
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    // CORREÇÃO: Adicionado o prefixo /api/
    let url = `${API_URL}/api/relatorio?`;
    if (filtroProdutoId) {
        url += `produtoId=${filtroProdutoId}&`;
    }
    if (dataInicio) {
        url += `dataInicio=${dataInicio}&`;
    }
    if (dataFim) {
        url += `dataFim=${dataFim}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor.');
        }
        const vendas = await response.json();
        let totalItens = 0;
        let totalValor = 0;

        vendas.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nome}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td>${item.quantidade}</td>
                <td>${new Date(item.data).toLocaleDateString()}</td>
                <td>R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
            `;
            tabelaCorpo.appendChild(tr);

            totalItens += item.quantidade;
            totalValor += item.preco * item.quantidade;
        });
        
        document.getElementById('totalItens').textContent = totalItens;
        document.getElementById('totalValor').textContent = totalValor.toFixed(2);
    } catch (error) {
        console.error('Erro ao carregar o relatório:', error);
        alert('Erro ao carregar dados do servidor.');
    }
}