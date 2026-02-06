import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST') {
            const { dataVenda, produtos } = req.body;
            // Insere cada produto da venda no banco
            for (const p of produtos) {
                await sql`INSERT INTO vendas (produto_id, quantidade, data, valor_total) 
                          VALUES (${p.produtoId}, ${p.quantidade}, ${dataVenda}, ${p.valorTotal})`;
            }
            return res.status(201).json({ success: true });
        }
        if (req.method === 'GET') {
            const result = await sql`
                SELECT v.*, p.nome 
                FROM vendas v 
                JOIN produtos p ON v.produto_id = p.id 
                ORDER BY v.data DESC`;
            return res.status(200).json(result);
        }
    } catch (e) { return res.status(500).json({ error: e.message }); }
}