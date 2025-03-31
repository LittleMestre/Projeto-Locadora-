#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define JogosMax 50
#define CarrinhoMax 50

typedef struct {
    int codigo;
    char nome[30];
    char genero[20];
    int classificacao;
    char disponibilidade[20];
    float preco;
    int quantidade;
} Jogo;

typedef struct {
    Jogo produto; // Produto no carrinho
    int quantidade;
} Carrinho;

Carrinho carrinho[CarrinhoMax];
int numCarrinho = 0;  // Quantidade de itens no carrinho

void Menu();
void CadastrarProduto();
void ListarProdutos();
void ComprarProduto();
void VisualizarCarrinho();
void FecharPedido();
void Login();
int TemNoCarrinho(int codigo);
Jogo* PegarProdutoPorCodigo(int codigo);
void InfoJogos(Jogo jog);

int main() {
    Menu();
    return 0;
}

void Menu() {
    int opcao;
    do {
        printf("\n\nBem vindo a Locadora\n\n");
        printf("Menu:\n");
        printf("1. Cadastrar Jogos\n");
        printf("2. Vizualizar Catalogo\n");
        printf("3. Ver Carrinho\n");
        printf("4. Fechar Pedido\n");
        printf("5. Sair\n\n");
        printf("O que deseja fazer: ");
        scanf("%d", &opcao);

        switch(opcao) {
            case 1: CadastrarProduto(); break;
            case 2: ListarProdutos(); break;
            case 3: VisualizarCarrinho(); break;
            case 4: FecharPedido(); break;
            case 5: printf("\nObrigado por comprar conosco, volte sempre!\n\n"); break;
            default: printf("\nEssa opcao nao existe. Tente outra.\n");
        }
    } while (opcao != 5);
}

void CadastrarProduto() {
    if (numCarrinho >= CarrinhoMax) {
        printf("Carrinho cheio! Nao e possivel adicionar mais jogos.\n");
        return;
    }

    Jogo novoJogo;
    printf("\nDigite o codigo do jogo: ");
    scanf("%d", &novoJogo.codigo);
    getchar();  // Limpar o buffer
    printf("Digite o nome do jogo: ");
    fgets(novoJogo.nome, sizeof(novoJogo.nome), stdin);
    printf("Digite o preco do jogo: R$");
    scanf("%f", &novoJogo.preco);
    printf("Digite a quantidade em estoque: ");
    scanf("%d", &novoJogo.quantidade);

    carrinho[numCarrinho].produto = novoJogo;
    carrinho[numCarrinho].quantidade = 1; // Inicializa com 1 unidade
    numCarrinho++;
    printf("Produto cadastrado com sucesso!\n");
}

void ListarProdutos() {
    if (numCarrinho == 0) {
        printf("\nNenhum jogo no catalogo.\n");
        return;
    }

    printf("\nCatalogo de Produtos:\n");
    for (int i = 0; i < numCarrinho; i++) {
        printf("Codigo: %d | Jogo: %s | Preco: R$%.2f | Quantidade: %d\n",
               carrinho[i].produto.codigo, 
               carrinho[i].produto.nome, 
               carrinho[i].produto.preco, 
               carrinho[i].produto.quantidade);
    }
}

void ComprarProduto() {
    int codigo;
    printf("\nDigite o codigo do jogo que deseja comprar: ");
    scanf("%d", &codigo);

    // Verificar se o jogo ja esta no carrinho ou adicionar um novo
    for (int i = 0; i < numCarrinho; i++) {
        if (carrinho[i].produto.codigo == codigo) {
            carrinho[i].quantidade++;
            printf("Jogo %s adicionado ao carrinho. Quantidade agora: %d\n", 
                   carrinho[i].produto.nome, carrinho[i].quantidade);
            return;
        }
    }

    // Caso o jogo nao tenha sido encontrado, adiciona um novo
    Jogo* jogo = PegarProdutoPorCodigo(codigo);
    if (jogo != NULL) {
        carrinho[numCarrinho].produto = *jogo;
        carrinho[numCarrinho].quantidade = 1;
        numCarrinho++;
        printf("Jogo %s adicionado ao carrinho.\n", jogo->nome);
    } else {
        printf("Produto nao encontrado.\n");
    }
}

Jogo* PegarProdutoPorCodigo(int codigo) {
    for (int i = 0; i < numCarrinho; i++) {
        if (carrinho[i].produto.codigo == codigo) {
            return &carrinho[i].produto;
        }
    }
    return NULL;
}

void VisualizarCarrinho() {
    if (numCarrinho == 0) {
        printf("\nCarrinho vazio.\n");
        return;
    }

    float total = 0;
    printf("\n=== Seu Carrinho ===\n\n");
    for (int i = 0; i < numCarrinho; i++) {
        float subtotal = carrinho[i].produto.preco * carrinho[i].quantidade;
        printf("Produto: %s | Quantidade: %d | Subtotal: R$%.2f\n", 
               carrinho[i].produto.nome, 
               carrinho[i].quantidade, 
               subtotal);
        total += subtotal;
    }
    printf("\nTotal do carrinho: R$%.2f\n", total);
}

void FecharPedido() {
    if (numCarrinho == 0) {
        printf("\nCarrinho vazio, impossivel fechar o pedido.\n");
        return;
    }

    float total = 0;
    int formaPagamento, resposta, parcelas;

    printf("\n=== Fatura ===\n\n");
    for (int i = 0; i < numCarrinho; i++) {
        float subtotal = carrinho[i].produto.preco * carrinho[i].quantidade;
        printf("Produto: %s | Quantidade: %d | Subtotal: R$%.2f\n", 
               carrinho[i].produto.nome, 
               carrinho[i].quantidade, 
               subtotal);
        total += subtotal;
    }

    printf("\nTotal da compra: R$%.2f\n", total);

    // Escolha de forma de pagamento
    printf("\nQual a forma de pagamento:\n\n 1-Credito\n 2-Debito\n 3-PIX\n\n");
    scanf("%d", &formaPagamento);

    if (formaPagamento == 1) {  // Pagamento com credito
        printf("\nGostaria de dividir esse valor? (1 - Sim / 2 - Nao)\n\n");
        scanf("%d", &resposta);
        if (resposta == 1) {
            printf("\nVoce pode dividir em ate 3 vezes. Em quantas vezes deseja dividir?\n\n");
            scanf("%d", &parcelas);
            switch (parcelas) {
                case 1: 
                    printf("\nDividindo o valor da compra em 1 vez, o valor da parcela fica R$%.2f\n", total / 1); 
                    printf("Processando pagamento...");
                    sleep(5);
                    break;
                case 2: 
                    printf("\nDividindo o valor da compra em 2 vezes, o valor de cada parcela fica R$%.2f\n", total / 2);
                    printf("Processando pagamento...");
                    sleep(5); 
                    break;
                case 3: 
                    printf("\nDividindo o valor da compra em 3 vezes, o valor de cada parcela fica R$%.2f\n", total / 3);
                    printf("Processando pagamento...");
                    sleep(5); 
                    break;
                default: 
                    printf("\nEscolha uma opcao de parcelamento correta.\n");
                    return;
            }
        }
    } else if (formaPagamento == 2) {  // Pagamento com debito
        printf("Processando pagamento...");
        sleep(5);
        printf("\nPagamento realizado via debito.\n");
    } else if (formaPagamento == 3) {  // Pagamento via PIX
        printf("Processando pagamento...");
        sleep(5);
        printf("\nO PIX para pagamento e o CPF 005.148.965.85.\n");
    } else {
        printf("\nOpcao de pagamento invalida.\n");
        return;
    }

    printf("\nPedido fechado com sucesso!\n");
    numCarrinho = 0;  // Limpa o carrinho após fechar o pedido
}