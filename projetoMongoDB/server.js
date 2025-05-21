const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://usuarioTeste:Teste123@cluster0.wl8ayaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const nomeBanco = 'dados';
const nomeColecao = 'App';
let db;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        db = client.db(nomeBanco);
        console.log('Conectado com sucesso!');

    } catch (error) {
    }
}
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const verificarConexao = (req, res, prox) =>{
    if(!db){
        return res.status(503).json({message:'Serviço indisponivel'});
    }
    prox();
}

//API ADICIONAR
app.post('/api/items', verificarConexao, async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({ message: 'O campo nome não foi preenchido' });
        }
        const novoItem = { nome, descricao: descricao || '', createdAt: new Date() };
        const resultado = await db.collection(nomeColecao).insertOne(novoItem);
        const inserirItem = await db.collection(nomeColecao).findOne({ _id: resultado.insertedId });
        res.status(201).json(inserirItem);
    } catch (error) {
        console.error("Erro ao adicionar items:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao inserir dados' });
    }
});

//API LEITURA
app.get('/api/items', async (req, res) => {
    if (!db) {
        return res.status(503).json({ message: 'Serviço indisponivel (Banco de Dados)' });
    }
    try {
        const items = await db.collection(nomeColecao).find({}).sort({ createdAt: -1 }).toArray();
        res.status(200).json(items);
    } catch (error) {
        console.error("Erro ao buscar os dados", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar dados" });
    }
});

//API ATUALIZAR 
app.put('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const { nome, descricao } = req.body;
        if (!nome) {
            return res.status(400).json({ message: 'O campo nome não foi preenchido' });
        }
        const atualizarDados = {
            $set: {
                nome, descricao: descricao || '', updatedAt: new Date()
            }
        };
        const result = await db.collection(nomeColecao).findOneAndUpdate(
            { _id: new ObjectId(id) },
            atualizarDados,
            { returnDocument: 'after' }
        );

        if (!result || !result.value) {
            return res.status(404).json({ message: 'Dado não encontrado para atualização' });
        }
        res.status(200).json(result.value);
    } catch (error) {
        console.error("Erro ao atualizar os dados", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar os dados" });
    }
});

//API DELETAR
app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const result = await db.collection(nomeColecao).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Dado não encotrado para ser deletado' });
        }
        res.status(200).json({ message: "Item excluido com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar os dados", error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar os dados" });
    }
});

async function iniciarServidor() {
    await run();

    app.listen(port, () => {
        console.log(`Servidor rodando em http:\\localhost:${port}`);
    });
}
iniciarServidor();