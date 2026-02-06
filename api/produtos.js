import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const result = await sql`SELECT * FROM produtos ORDER BY nome ASC`;
            return res.status(200).json(result);
        }
        if (req.method === 'POST') {
            const { nome, descricao, preco } = req.body;
            await sql`INSERT INTO produtos (nome, descricao, preco) VALUES (${nome}, ${descricao}, ${preco})`;
            return res.status(201).json({ message: 'Cadastrado' });
        }
    } catch (e) { return res.status(500).json({ error: e.message }); }
}