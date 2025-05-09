// Função para lidar com erros de requisição
function handleError(message) {
  console.error(message);
  alert(message);
}

// main.js (login)
document.getElementById("loginForm")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;  // Alterado para 'username'
  const password = document.getElementById("password").value;  // Alterado para 'password'

  // Enviar a requisição para a API de login
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Login bem-sucedido, armazena o token e redireciona para o catálogo
      localStorage.setItem('token', data.token);  // Armazena o token
      window.location.href = "catalogo.html";  // Redireciona para a página de catálogo
    } else {
      document.getElementById("loginError").textContent = "Usuário ou senha incorretos!";
    }
  })
  .catch(error => handleError("Erro no login: " + error));
});

// main.js (catalogo)
function carregarCatalogo() {
  fetch('http://localhost:3000/jogos')  // Requisição para a API de jogos
    .then(response => response.json())
    .then(jogos => {
      const catalogo = document.getElementById("catalogo");
      catalogo.innerHTML = ''; // Limpa o catálogo antes de carregar os novos itens

      jogos.forEach((jogo) => {
        const item = document.createElement("div");
        item.className = "product-item";
        item.innerHTML = `
          <img src="${jogo.imagem}" alt="${jogo.nome}">
          <h3>${jogo.nome}</h3>
          <p>Gênero: ${jogo.genero}</p>
          <p>Preço: R$${jogo.preco.toFixed(2)}</p>
          <button onclick="adicionarAoCarrinho(${jogo.id})">Adicionar ao Carrinho</button>
        `;
        catalogo.appendChild(item);
      });
    })
    .catch(error => handleError("Erro ao carregar catálogo: " + error));
}

document.addEventListener("DOMContentLoaded", carregarCatalogo);

// main.js (histórico de vendas)
function carregarHistorico() {
  fetch('http://localhost:3000/vendas')  // Requisição para a API de histórico
    .then(response => response.json())
    .then(vendas => {
      const historicoDiv = document.getElementById("historico");
      historicoDiv.innerHTML = ''; // Limpa o histórico antes de carregar novos itens

      vendas.forEach((venda, index) => {
        const item = document.createElement("div");
        item.className = "product-item";
        item.innerHTML = `
          <h3>Venda #${index + 1}</h3>
          <p>Jogo: ${venda.nome}</p>
          <p>Preço: R$${venda.preco.toFixed(2)}</p>
        `;
        historicoDiv.appendChild(item);
      });
    })
    .catch(error => handleError("Erro ao carregar histórico: " + error));
}

document.addEventListener("DOMContentLoaded", carregarHistorico);

// main.js (Cadastrar Jogo)
document.getElementById("cadastroJogoForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const genero = document.getElementById("genero").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const imagem = document.getElementById("imagem").value;

  fetch('http://localhost:3000/cadastrar-jogo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome: nome,
      genero: genero,
      preco: preco,
      imagem: imagem
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Jogo cadastrado com sucesso!");
      document.getElementById("cadastroJogoForm").reset(); // Limpa o formulário
      window.location.href = "catalogo.html"; // Redireciona para o catálogo
    } else {
      alert("Erro ao cadastrar jogo.");
    }
  })
  .catch(error => handleError("Erro no cadastro do jogo: " + error));
});

// main.js (Cadastrar Funcionário)
document.getElementById("cadastroFuncionarioForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nomeFuncionario").value;
  const email = document.getElementById("emailFuncionario").value;
  const senha = document.getElementById("senhaFuncionario").value;

  fetch('http://localhost:3000/cadastrar-funcionario', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome: nome,
      email: email,
      senha: senha
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Funcionário cadastrado com sucesso!");
      window.location.href = "index.html"; // Redireciona para a página de login
    } else {
      alert("Erro ao cadastrar funcionário.");
    }
  })
  .catch(error => handleError("Erro no cadastro do funcionário: " + error));
});

// main.js (Atualizar Jogo)
document.getElementById("atualizarJogoForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("idJogo").value;
  const nome = document.getElementById("nomeJogo").value;
  const genero = document.getElementById("generoJogo").value;
  const preco = parseFloat(document.getElementById("precoJogo").value);
  const imagem = document.getElementById("imagemJogo").value;

  fetch(`http://localhost:3000/atualizar-jogo/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome: nome,
      genero: genero,
      preco: preco,
      imagem: imagem
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Jogo atualizado com sucesso!");
      window.location.href = "catalogo.html"; // Redireciona para o catálogo
    } else {
      alert("Erro ao atualizar jogo.");
    }
  })
  .catch(error => handleError("Erro na atualização do jogo: " + error));
});

// main.js (Excluir Jogo)
document.getElementById("excluirJogoForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("idExcluirJogo").value;

  fetch(`http://localhost:3000/excluir-jogo/${id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Jogo excluído com sucesso!");
      window.location.href = "catalogo.html"; // Redireciona para o catálogo
    } else {
      alert("Erro ao excluir jogo.");
    }
  })
  .catch(error => handleError("Erro na exclusão do jogo: " + error));
});

// main.js (Adicionar ao Carrinho)
function adicionarAoCarrinho(jogoId) {
  fetch(`http://localhost:3000/adicionar-carrinho/${jogoId}`, {
    method: 'POST',
    body: JSON.stringify({ jogoId }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Jogo adicionado ao carrinho!");
      // Atualize o carrinho na interface, se necessário
    }
  })
  .catch(error => handleError("Erro ao adicionar ao carrinho: " + error));
}