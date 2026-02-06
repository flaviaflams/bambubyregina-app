// vendas.js

const API_URL = 'https://vendas-bambuby-regina-e2au.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutosParaVenda();
    carregarVendas();
    
    const formVenda = document.getElementById('formVenda');
    formVenda.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataVenda = document.getElementById('dataVenda').value;
        const produtosSelecionados = [];
        const listaItens = document.getElementById('listaItens').children;
        
        for (let item of listaItens) {
            const produtoId = item.dataset.id;
            const nome = item.dataset.nome;
            const preco = parseFloat(item.dataset.preco);
            const quantidade = parseInt(item.querySelector('span').textContent);
            const valorTotal = preco * quantidade;

            produtosSelecionados.push({
                produtoId,
                nome,
                preco,
                quantidade,
                valorTotal
            });
        }

        if (produtosSelecionados.length === 0) {
            alert('Adicione pelo menos um produto à venda.');
            return;
        }

        try {
            // CORREÇÃO: Adicionado o prefixo /api/
            const response = await fetch(`${API_URL}/api/vendas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataVenda, produtosSelecionados }),
            });
            if (response.ok) {
                alert('Venda registrada com sucesso!');
                formVenda.reset();
                listaItens.innerHTML = '';
                calcularTotal();
                carregarVendas(); // Recarrega a lista de vendas
            } else {
                const errorData = await response.json();
                alert(`Erro ao registrar venda: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            alert('Erro ao registrar venda.');
        }
    });

    // Adiciona event listeners para os botões do modal de edição
    document.getElementById('saveEditBtn').addEventListener('click', salvarEdicaoTransacao);
    document.getElementById('cancelEditBtn').addEventListener('click', fecharModalEdicao);
    document.getElementById('addProdutoVendaModal').addEventListener('click', adicionarProdutoModal);

    window.excluirTransacao = excluirTransacao;
    window.abrirModalEdicao = abrirModalEdicao;
    window.removerItemModal = removerItemModal;
    window.adicionarProdutoModal = adicionarProdutoModal;
    window.selecionarProdutoModal = selecionarProdutoModal;
});

let produtosArray = [];
async function carregarProdutosParaVenda() {
    const select = document.getElementById('selectProduto');
    select.innerHTML = '';
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/produtos`);
        produtosArray = await response.json();
        
        produtosArray.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos.');
    }
}

async function carregarVendas() {
    const tabelaCorpo = document.getElementById('tabelaVendas');
    tabelaCorpo.innerHTML = '';
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/vendas`);
        const vendas = await response.json();

        // Agrupa as vendas pela transação
        const vendasAgrupadas = vendas.reduce((acc, venda) => {
            if (!acc[venda.transacao]) {
                acc[venda.transacao] = [];
            }
            acc[venda.transacao].push(venda);
            return acc;
        }, {});

        for (const transacaoId in vendasAgrupadas) {
            const transacao = vendasAgrupadas[transacaoId];
            const valorTotal = transacao.reduce((acc, item) => acc + item.valorTotal, 0);
            const quantidadeTotal = transacao.reduce((acc, item) => acc + item.quantidade, 0);
            const dataVenda = new Date(transacao[0].data).toLocaleDateString();

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transacaoId}</td>
                <td>
                    ${transacao.map(item => `${item.nome} (${item.quantidade})`).join(', ')}
                </td>
                <td>${quantidadeTotal}</td>
                <td>R$ ${valorTotal.toFixed(2)}</td>
                <td>${dataVenda}</td>
                <td>
                    <button onclick="abrirModalEdicao('${transacaoId}')">Editar</button>
                    <button onclick="excluirTransacao('${transacaoId}')">Excluir</button>
                </td>
            `;
            tabelaCorpo.appendChild(tr);
        }
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        alert('Erro ao carregar vendas do servidor.');
    }
}

async function excluirTransacao(transacaoId) {
    if (confirm(`Deseja excluir a transação #${transacaoId}?`)) {
        try {
            // CORREÇÃO: Adicionado o prefixo /api/
            const response = await fetch(`${API_URL}/api/vendas/${transacaoId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Transação excluída com sucesso.');
                carregarVendas(); // Recarrega a lista de vendas
            } else {
                const errorData = await response.json();
                alert(`Erro ao excluir transação: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            alert('Erro ao excluir transação.');
        }
    }
}

// Funções para o modal de edição
let produtosDaTransacaoNoModal = [];

async function abrirModalEdicao(transacaoId) {
    document.getElementById('idTransacaoModal').textContent = `#${transacaoId}`;
    document.getElementById('modalEdicaoTransacao').style.display = 'block';

    transacaoIdEmEdicao = transacaoId;
    produtosDaTransacaoNoModal = [];
    const listaItensModal = document.getElementById('listaItensModal');
    listaItensModal.innerHTML = '';

    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/vendas/${transacaoId}`);
        const transacaoItens = await response.json();

        // Preenche a data da venda
        const dataVenda = transacaoItens.length > 0 ? transacaoItens[0].data.split('T')[0] : '';
        document.getElementById('dataVendaModal').value = dataVenda;
        
        // Preenche a lista de produtos no modal
        transacaoItens.forEach(item => {
            adicionarItemAoModal(item.produtoId, item.nome, item.preco, item.quantidade);
        });
    } catch (error) {
        console.error('Erro ao carregar dados da transação para edição:', error);
        alert('Erro ao carregar dados da transação.');
        fecharModalEdicao();
    }
}

async function salvarEdicaoTransacao() {
    if (transacaoIdEmEdicao === null) return;

    const dataVenda = document.getElementById('dataVendaModal').value;
    const produtos = produtosDaTransacaoNoModal;
    
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/vendas`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transacaoId: transacaoIdEmEdicao,
                dataVenda,
                produtos
            }),
        });
        if (response.ok) {
            alert('Transação atualizada com sucesso!');
            fecharModalEdicao();
            carregarVendas();
        } else {
            const errorData = await response.json();
            alert(`Erro ao atualizar transação: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Erro ao salvar edição da transação:', error);
        alert('Erro ao salvar edição da transação.');
    }
}

function fecharModalEdicao() {
    document.getElementById('modalEdicaoTransacao').style.display = 'none';
    transacaoIdEmEdicao = null;
    produtosDaTransacaoNoModal = [];
    document.getElementById('listaItensModal').innerHTML = '';
}

function adicionarProdutoModal() {
    // Exibe a lista de produtos disponíveis
    document.getElementById('listaTodosProdutosModal').style.display = 'block';
    
    // Carrega os produtos se ainda não tiverem sido carregados
    const containerProdutos = document.getElementById('todosProdutosDisponiveis');
    if (containerProdutos.innerHTML === '') {
        produtosArray.forEach(produto => {
            const btn = document.createElement('button');
            btn.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
            btn.onclick = () => selecionarProdutoModal(produto.id, produto.nome, produto.preco);
            containerProdutos.appendChild(btn);
        });
    }
}

function selecionarProdutoModal(produtoId, nome, preco) {
    const quantidade = parseInt(prompt(`Quantos itens de "${nome}" deseja adicionar?`, '1'));
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Quantidade inválida.');
        return;
    }
    
    adicionarItemAoModal(produtoId, nome, preco, quantidade);
    document.getElementById('listaTodosProdutosModal').style.display = 'none';
}

function adicionarItemAoModal(produtoId, nome, preco, quantidade) {
    const listaItensModal = document.getElementById('listaItensModal');
    const existingItem = listaItensModal.querySelector(`[data-id="${produtoId}"]`);
    
    if (existingItem) {
        const spanQuantidade = existingItem.querySelector('span');
        const quantidadeAtual = parseInt(spanQuantidade.textContent);
        spanQuantidade.textContent = quantidadeAtual + quantidade;
        
        const itemNoArray = produtosDaTransacaoNoModal.find(item => item.produtoId === produtoId);
        if (itemNoArray) {
            itemNoArray.quantidade += quantidade;
            itemNoArray.valorTotal += preco * quantidade;
        }
    } else {
        const li = document.createElement('li');
        li.dataset.id = produtoId;
        li.dataset.nome = nome;
        li.dataset.preco = preco;
        li.innerHTML = `
            ${nome} - R$ ${preco.toFixed(2)} x <span>${quantidade}</span>
            <button onclick="removerItemModal(this)">Remover</button>
        `;
        listaItensModal.appendChild(li);
        
        produtosDaTransacaoNoModal.push({
            produtoId,
            nome,
            preco,
            quantidade,
            valorTotal: preco * quantidade,
        });
    }
}

function removerItemModal(button) {
    const li = button.parentElement;
    const produtoId = li.dataset.id;
    produtosDaTransacaoNoModal = produtosDaTransacaoNoModal.filter(item => item.produtoId != produtoId);
    li.remove();
}