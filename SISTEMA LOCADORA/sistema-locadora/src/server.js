require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const DOMINIO_EMAIL = "@locadoradoze.com";

// Configurações do app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Yhr@121110',
  database: process.env.DB_NAME || 'loja_jogos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'segredo_secreto', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Rotas de páginas
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/catalogo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'catalogo.html'));
});

app.get('/funcionario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'funcionario.html'));
});

app.get('/menu-funcionario.html', autenticarToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu-funcionario.html'));
});

// API - Autenticação
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  
  if (!email.endsWith(DOMINIO_EMAIL)) {
    return res.status(400).json({ error: `Email deve terminar com ${DOMINIO_EMAIL}` });
  }

  try {
    const [funcionarios] = await pool.query('SELECT * FROM funcionarios WHERE email = ?', [email]);
    if (funcionarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const funcionario = funcionarios[0];
    const senhaValida = await bcrypt.compare(senha, funcionario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: funcionario.id, email: funcionario.email },
      process.env.JWT_SECRET || 'segredo_secreto',
      { expiresIn: '2h' }
    );

    res.json({ 
      token,
      nome: funcionario.nome,
      message: 'Login bem-sucedido!' 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// API - Funcionários
app.post('/api/funcionarios', async (req, res) => {
  const { nome, cpf, data_nascimento, email, senha } = req.body;

  try {
    const hashedSenha = await bcrypt.hash(senha, 10);
    await pool.query(
      'INSERT INTO funcionarios (nome, cpf, data_nascimento, email, senha) VALUES (?, ?, ?, ?, ?)',
      [nome, cpf, data_nascimento, email, hashedSenha]
    );
    res.status(201).json({ message: 'Funcionário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
  }
});

// API - Jogos
app.get('/api/jogos', async (req, res) => {
  try {
    const [jogos] = await pool.query('SELECT * FROM jogos');
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
});

app.get('/api/jogos', async (req, res) => {
  try {
    // Extrai os parâmetros de query (filtros e configurações)
    const { 
      genero, 
      preco_max, 
      classificacao, 
      disponivel,
      ordenar_por = 'nome', // Campo padrão para ordenação
      ordenar_direcao = 'ASC', // Direção padrão (ASC ou DESC)
      pagina = 1, // Página padrão
      itens_por_pagina = 10 // Quantidade padrão por página
    } = req.query;

    // Valida e sanitiza os parâmetros de paginação
    const paginaNum = Math.max(1, parseInt(pagina)) || 1;
    const itensPorPaginaNum = Math.min(50, Math.max(1, parseInt(itens_por_pagina))) || 10;
    const offset = (paginaNum - 1) * itensPorPaginaNum;

    // Lista de campos permitidos para seleção e ordenação
    const camposPermitidos = ['id', 'nome', 'genero', 'classificacao', 'disponibilidade', 'preco', 'quantidade'];
    const campoOrdenacao = camposPermitidos.includes(ordenar_por) ? ordenar_por : 'nome';
    const direcaoOrdenacao = ordenar_direcao.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Base da query SQL (selecionando apenas campos necessários)
    let query = `
      SELECT id, nome, genero, classificacao, disponibilidade, preco, quantidade
      FROM jogos 
      WHERE 1=1
    `;
    const params = [];

    // Filtro por gênero
    if (genero) {
      query += ' AND genero = ?';
      params.push(genero);
    }

    // Filtro por preço máximo
    if (preco_max && !isNaN(preco_max)) {
      query += ' AND preco <= ?';
      params.push(parseFloat(preco_max));
    }

    // Filtro por classificação etária
    if (classificacao) {
      query += ' AND classificacao = ?';
      params.push(classificacao);
    }

    // Filtro por disponibilidade
    if (disponivel !== undefined) {
      query += ' AND disponibilidade = ?';
      params.push(disponivel === 'true');
    }

    // Adiciona ordenação
    query += ` ORDER BY ${campoOrdenacao} ${direcaoOrdenacao}`;

    // Adiciona paginação
    query += ' LIMIT ? OFFSET ?';
    params.push(itensPorPaginaNum, offset);

    // Executa a query principal
    const [jogos] = await pool.query(query, params);

    // Query para contar o total de itens (para paginação)
    let countQuery = 'SELECT COUNT(*) as total FROM jogos WHERE 1=1';
    const countParams = [];

    // Aplica os mesmos filtros na query de contagem
    if (genero) {
      countQuery += ' AND genero = ?';
      countParams.push(genero);
    }
    if (preco_max && !isNaN(preco_max)) {
      countQuery += ' AND preco <= ?';
      countParams.push(parseFloat(preco_max));
    }
    if (classificacao) {
      countQuery += ' AND classificacao = ?';
      countParams.push(classificacao);
    }
    if (disponivel !== undefined) {
      countQuery += ' AND disponibilidade = ?';
      countParams.push(disponivel === 'true');
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    // Calcula o total de páginas
    const totalPaginas = Math.ceil(total / itensPorPaginaNum);

    // Retorna os resultados com metadados de paginação
    res.json({
      dados: jogos,
      paginacao: {
        pagina: paginaNum,
        itensPorPagina: itensPorPaginaNum,
        totalItens: total,
        totalPaginas,
        temProxima: paginaNum < totalPaginas,
        temAnterior: paginaNum > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar jogos',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/jogos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, genero, classificacao, disponibilidade, preco, quantidade } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE jogos SET nome = ?, genero = ?, classificacao = ?, disponibilidade = ?, preco = ?, quantidade = ? WHERE id = ?',
      [nome, genero, classificacao, disponibilidade, preco, quantidade, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    res.json({ message: 'Jogo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    res.status(500).json({ error: 'Erro ao atualizar jogo' });
  }
});

app.delete('/api/jogos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM jogos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    res.json({ message: 'Jogo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir jogo:', error);
    res.status(500).json({ error: 'Erro ao excluir jogo' });
  }
});

// API - Carrinho e Vendas
let carrinho = [];

app.post('/api/carrinho', async (req, res) => {
  const { jogoId, quantidade } = req.body;
  const token = req.headers.authorization?.split(' ')[1] || 'anonimo';

  try {
    const [jogos] = await pool.query('SELECT * FROM jogos WHERE id = ?', [jogoId]);
    
    if (jogos.length === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    const jogo = jogos[0];
    
    if (jogo.quantidade < quantidade) {
      return res.status(400).json({ error: 'Quantidade solicitada maior do que a disponível' });
    }

    carrinho.push({ produto: jogo, quantidade });
    res.json({ message: 'Item adicionado ao carrinho com sucesso!', carrinho });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
  }
});

app.get('/api/carrinho', async (req, res) => {
  res.json(carrinho);
});

app.post('/api/vendas', autenticarToken, async (req, res) => {
  if (carrinho.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Calcular total
    const total = carrinho.reduce((sum, item) => sum + (item.produto.preco * item.quantidade), 0);

    // Registrar venda
    const [vendaResult] = await connection.query(
      'INSERT INTO historico_vendas (valor_total) VALUES (?)',
      [total]
    );
    const vendaId = vendaResult.insertId;

    // Registrar itens e atualizar estoque
    for (const item of carrinho) {
      await connection.query(
        'UPDATE jogos SET quantidade = quantidade - ? WHERE id = ?',
        [item.quantidade, item.produto.id]
      );

      await connection.query(
        'UPDATE historico_vendas SET codigo_jogo = ?, nome_jogo = ?, quantidade_vendida = ? WHERE id = ?',
        [item.produto.id, item.produto.nome, item.quantidade, vendaId]
      );
    }

    await connection.commit();
    carrinho = []; // Limpa o carrinho após finalizar a compra
    res.status(201).json({ message: 'Venda realizada com sucesso!' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao processar venda:', error);
    res.status(500).json({ error: 'Erro ao processar venda' });
  } finally {
    connection.release();
  }
});


app.get('/api/historico', autenticarToken, async (req, res) => {
  try {
    const [vendas] = await pool.query('SELECT * FROM historico_vendas ORDER BY data_venda DESC');
    res.json(vendas);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// Adicione ANTES da rota 404
app.get('/logout', (req, res) => {
  res.redirect('/index.html');
});

// Rota 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});