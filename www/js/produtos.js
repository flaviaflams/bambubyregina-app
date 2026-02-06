// produtos.js

let currentEditProductId = null;
const API_URL = 'https://vendas-bambuby-regina-e2au.vercel.app';
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();

    const form = document.getElementById('formProduto');
    const editModal = document.getElementById('editModal');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const descricao = document.getElementById('descricao').value.trim();
      const preco = parseFloat(document.getElementById('preco').value);

      if (!nome || isNaN(preco)) {
        alert('Preencha corretamente o nome e preço.');
        return;
      }

      const produto = { nome, descricao, preco };
      
      try {
          // CORREÇÃO: Adicionado o prefixo /api/
          await fetch(`${API_URL}/api/produtos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(produto),
          });
          form.reset();
          carregarProdutos();
      } catch (error) {
          console.error('Erro ao adicionar produto:', error);
          alert('Erro ao adicionar produto.');
      }
    });

    saveEditBtn.addEventListener('click', async () => {
      if (currentEditProductId === null) {
        console.error('Nenhum produto selecionado para edição.');
        return;
      }
      const nome = document.getElementById('edit-nome').value.trim();
      const descricao = document.getElementById('edit-descricao').value.trim();
      const preco = parseFloat(document.getElementById('edit-preco').value);

      if (!nome || isNaN(preco)) {
          alert('Preencha corretamente o nome e preço.');
          return;
      }

      const produtoAtualizado = { nome, descricao, preco };
      
      try {
          // CORREÇÃO: Adicionado o prefixo /api/
          await fetch(`${API_URL}/api/produtos/${currentEditProductId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(produtoAtualizado),
          });
          closeEditModal();
          carregarProdutos();
      } catch (error) {
          console.error('Erro ao salvar edição:', error);
          alert('Erro ao salvar edição do produto.');
      }
    });

    cancelEditBtn.addEventListener('click', closeEditModal);

    window.editarProduto = editarProduto;
    window.excluirProduto = excluirProduto;
});

async function carregarProdutos() {
    const lista = document.getElementById('listaProdutos');
    lista.innerHTML = '';
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/produtos`);
        const produtos = await response.json();
        
        produtos.forEach((p) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.nome}</td>
                <td>${p.descricao || ''}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td><button onclick="editarProduto(${p.id})">Editar</button></td>
                <td><button onclick="excluirProduto(${p.id}, '${p.nome}')">Excluir</button></td>
            `;
            lista.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos.');
    }
}

async function editarProduto(id) {
    try {
        // CORREÇÃO: Adicionado o prefixo /api/
        const response = await fetch(`${API_URL}/api/produtos/${id}`);
        const p = await response.json();
        currentEditProductId = p.id;
        document.getElementById('edit-nome').value = p.nome;
        document.getElementById('edit-descricao').value = p.descricao;
        document.getElementById('edit-preco').value = p.preco;
        document.getElementById('editModal').classList.add('active');
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        alert('Erro ao buscar produto para edição.');
    }
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  currentEditProductId = null;
  document.getElementById('edit-nome').value = '';
  document.getElementById('edit-descricao').value = '';
  document.getElementById('edit-preco').value = '';
}

async function excluirProduto(id, nomeProduto) {
  if (confirm(`Deseja excluir o produto "${nomeProduto}"?`)) {
    try {
      // CORREÇÃO: Adicionado o prefixo /api/
      await fetch(`${API_URL}/api/produtos/${id}`, { method: 'DELETE' });
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto.');
    }
  }
}