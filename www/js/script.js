// script.js

const API_URL = 'https://vendas-bambuby-regina-e2au.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    carregarMetricasDoMes();
});

async function carregarMetricasDoMes() {
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/vendas`);
        const vendas = await response.json();

        // Obter o mês e ano atuais
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth();
        const anoAtual = dataAtual.getFullYear();

        let totalItensMes = 0;
        let totalFaturadoMes = 0;
        const rankingQuantidade = {};
        const rankingValor = {};

        // Filtrar vendas do mês atual e calcular totais e rankings
        vendas.forEach(venda => {
            const dataVenda = new Date(venda.data);
            if (dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual) {
                totalItensMes += venda.quantidade;
                totalFaturadoMes += venda.valorTotal;

                // Calcular ranking de quantidade
                if (!rankingQuantidade[venda.nome]) {
                    rankingQuantidade[venda.nome] = { quantidade: 0, valor: 0 };
                }
                rankingQuantidade[venda.nome].quantidade += venda.quantidade;
                rankingQuantidade[venda.nome].valor += venda.valorTotal;

                // Calcular ranking de valor
                if (!rankingValor[venda.nome]) {
                    rankingValor[venda.nome] = { quantidade: 0, valor: 0 };
                }
                rankingValor[venda.nome].valor += venda.valorTotal;
                rankingValor[venda.nome].quantidade += venda.quantidade;
            }
        });

        // Preencher as métricas
        document.getElementById('totalItens').textContent = totalItensMes;
        document.getElementById('totalFaturado').textContent = `R$ ${totalFaturadoMes.toFixed(2)}`;

        // Preencher o ranking por quantidade
        const rankingQuantidadesOrdenado = Object.entries(rankingQuantidade)
            .sort(([, a], [, b]) => b.quantidade - a.quantidade)
            .slice(0, 3);
        
        const rankingQuantidadesLista = document.getElementById('rankingQuantidade');
        rankingQuantidadesLista.innerHTML = '';
        rankingQuantidadesOrdenado.forEach(([nome, dados]) => {
            const li = document.createElement('li');
            li.textContent = `${nome}: ${dados.quantidade} itens (R$ ${dados.valor.toFixed(2)})`;
            rankingQuantidadesLista.appendChild(li);
        });

        // Preencher o ranking por valor
        const rankingValoresOrdenado = Object.entries(rankingValor)
            .sort(([, a], [, b]) => b.valor - a.valor)
            .slice(0, 3);
        
        const rankingValoresLista = document.getElementById('rankingValor');
        rankingValoresLista.innerHTML = '';
        rankingValoresOrdenado.forEach(([nome, dados]) => {
            const li = document.createElement('li');
            li.textContent = `${nome}: R$ ${dados.valor.toFixed(2)} (${dados.quantidade} itens)`;
            rankingValoresLista.appendChild(li);
        });

    } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        alert('Erro ao carregar métricas do servidor.');
    }
}