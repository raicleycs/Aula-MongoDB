
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://{USUARIO}:{SENHA}@clusterappmongodb.bhzsmnb.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAppMongoDB";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const dbName = 'dado';

async function run() {
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('DadosUsuarios');
        console.log("Buscando Dados");

        const todosUsuarios = await collection.find({}).toArray();
        console.log("Usuarios encontrados:", JSON.stringify(todosUsuarios, null,2));
    }catch(erro){
        console.error('Erro encontrado', erro);
    }finally{
        await client.close();
    }
}
run().catch(console.dir);
