document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('#itemForm');
    const itemId = document.getElementById('itemID');
    const itemNome = document.getElementById('itemNome');
    const descricao = document.getElementById('itemDescricao');
    const botao = document.getElementById('submitBotao');
    const lista = document.getElementById('itemsLista');

    const API_URL = '/api/items';
    let editarId = null;

    async function renderizarDados() {
        try {
            const resposta = await fetch(API_URL);
            if(!resposta.ok){
                throw new Error(`Erro: ${resposta.status}`);
            }
            const items = await resposta.json();

            renderizar(items);

        } catch (error) {
            console.error('falha ao carregar os dados', error);
        }
    }

    function renderizar(items) {
        lista.innerHTML = '';

        if (!items || items.length === 0) {
            alert('Nenhum dado cadastrado.');
        } else {
            items.forEach(item => {
                const li = document.createElement('li');
                li.dataset.id = item.id;
                const content = document.createElement('div');
                content.classList.add('items');
                content.innerHTML = `<strong>${item.nome}</strong>${item.descricao} ? '<p>${item.descricao}</p>' :'' `;
                const acaoDiv = document.createElement('div');
                acaoDiv.classList.add('acao');
                const botaoEditar = document.createElement('button');
                botaoEditar.textContent = 'Editar';
                botaoEditar.classList.add('edit-btn');
                botaoEditar.addEventListener('click', () => editarItem(item._id));
                const botaoExcluir = document.createElement('button');
                botaoExcluir.textContent = 'Excluir';
                botaoExcluir.classList.add('excluir-btn');
                botaoExcluir.addEventListener('click', () => excluirItem(item._id));
                acaoDiv.appendChild(botaoEditar);
                acaoDiv.appendChild(botaoExcluir);
                li.appendChild(content);
                li.appendChild(acaoDiv);
                lista.appendChild(li);
            });
        }
    }

    function editarItem(item) {
        editarId = item._id;
        itemId.value = item._id;
        itemNome.value = item.nome;
        descricao.value = item.descricao;
        botao.textContent = 'Salvar alteração';
        window.scrollTo(0, 0);
    }

    formulario.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nome = itemNome.value.trim();
        const itemDescricao = descricao.value.trim();
        if (!nome) {
            alert('Nome obrigatorio');
            return;
        }
        const itemData = { nome, itemDescricao };

        let url = API_URL;
        let metodo = 'POST';

        if (editarId) {
            url = `${API_URL}/${editarId}`;
            metodo = 'PUT';
        }

        try {
            const resposta = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData),

            });

            if (!resposta.ok) {
                const erro = await resposta.json;
                throw new Error(erro.message || `Erro ao salvar: ${resposta.status}`);
            }

            await renderizarDados();

        } catch (error) {
            console.error('Erro ao salvar os dados', error);
        }
    });

    async function excluirDados(id) {
        if (!confirm('Tem certeza que você quer excluir os dodos do usuário?')) {
            return;
        }

        try {
            const reposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!reposta.ok) {
                const erro = await reposta.json();
                throw new Error(erro.message || `Erro ao deletar: ${reposta.status}`);
            }
             await renderizarDados();
        }catch(error){
            console.error('Erro ao excluir os dados', error);
        }

    }

renderizarDados() 
});