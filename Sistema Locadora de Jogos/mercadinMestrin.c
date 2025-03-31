#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_PRODUTOS 50  // Define o número máximo de produtos
#define MAX_CARRINHO 50  // Define o número máximo de itens no carrinho

// Estrutura para representar um produto
typedef struct {
    int codigo;           // Código do produto
    char nome[30];       // Nome do produto
    float preco;         // Preço do produto
} Produto;

// Estrutura para o carrinho de compras
typedef struct {
    Produto produto;     // Produto no carrinho
    int quantidade;      // Quantidade do produto
} Carrinho;

// Arrays para armazenar produtos e carrinho
Produto produtos[MAX_PRODUTOS];
Carrinho carrinho[MAX_CARRINHO];
int numProdutos = 0;    // Contador de produtos cadastrados
int numCarrinho = 0;    // Contador de itens no carrinho
int proximoCodigo = 1;  // Inicia o código automático a partir de 1

// Declaração de funções
void menu();
void cadastrarProduto();
void listarProdutos();
void comprarProduto();
void visualizarCarrinho();
void fecharPedido();
int temNoCarrinho(int codigo);
Produto* pegarProdutoPorCodigo(int codigo);
void infoProduto(Produto prod);

int main() {
    menu();  // Inicia o menu
    return 0;
}

// Função que exibe o menu e gerencia as opções
void menu() {
    int opcao;
    do {
        printf("\n==SEU SUPERMERCADO AO DIA A DIA==\n\n");
        printf("1. Cadastrar Produto\n");
        printf("2. Listar Produtos\n");
        printf("3. Comprar Produto\n");
        printf("4. Visualizar Carrinho\n");
        printf("5. Fechar Pedido\n");
        printf("6. Sair\n");
        printf("\nEscolha uma opcao: ");
        scanf("%d", &opcao);  // Lê a opção do usuário
        switch(opcao) {
            case 1: cadastrarProduto(); break;  // Cadastrar produto
            case 2: listarProdutos(); break;     // Listar produtos
            case 3: comprarProduto(); break;      // Comprar produto
            case 4: visualizarCarrinho(); break;  // Visualizar carrinho
            case 5: fecharPedido(); break;        // Fechar pedido
            case 6: printf("\nObrigado pela preferencia, volte sempre!\n"); break;  // Sair
            default: printf("\nOpção inválida! Tente novamente.\n");  // Opção inválida
        }
    } while (opcao != 6);  // Repete até o usuário escolher sair
}

// Função para cadastrar um novo produto
void cadastrarProduto() {
    if (numProdutos >= MAX_PRODUTOS) {
        printf("Limite de produtos atingido!\n");
        return;  // Verifica se o limite de produtos foi atingido
    }
    
    Produto novoProduto;
    novoProduto.codigo = proximoCodigo++;  // Gera código automaticamente
    printf("\nDigite o nome do produto: ");
    scanf(" %[^\n]", novoProduto.nome);  // Lê o nome do produto
    printf("\nDigite o preco do produto: R$");
    scanf("%f", &novoProduto.preco);      // Lê o preço do produto
    
    produtos[numProdutos++] = novoProduto;  // Armazena o novo produto
    printf("\nProduto cadastrado com sucesso! Codigo: %d\n", novoProduto.codigo);
}

// Função para listar todos os produtos cadastrados
void listarProdutos() {
    printf("\n=== Produtos Cadastrados ===\n\n");
    for (int i = 0; i < numProdutos; i++) {
        infoProduto(produtos[i]);  // Chama função para exibir informações do produto
    }
}

// Função para exibir as informações de um produto
void infoProduto(Produto prod) {
    printf("Codigo: %d | Nome: %s | Preco: R$%.2f\n", prod.codigo, prod.nome, prod.preco);
}

// Função para comprar um produto
void comprarProduto() {
    int codigo;
    printf("\nDigite o codigo do produto que deseja comprar: ");
    scanf("%d", &codigo);  // Lê o código do produto
    
    Produto* produto = pegarProdutoPorCodigo(codigo);  // Busca o produto pelo código
    if (produto == NULL) {
        printf("\nProduto nao encontrado!\n");
        return;  // Verifica se o produto existe
    }

    int index = temNoCarrinho(codigo);  // Verifica se o produto já está no carrinho
    if (index != -1) {
        carrinho[index].quantidade++;  // Incrementa quantidade se já está no carrinho
    } else {
        if (numCarrinho >= MAX_CARRINHO) {
            printf("\nLimite do carrinho atingido!\n");
            return;  // Verifica se o carrinho está cheio
        }
        carrinho[numCarrinho].produto = *produto;  // Adiciona o produto ao carrinho
        carrinho[numCarrinho].quantidade = 1;       // Define quantidade como 1
        numCarrinho++;
    }

    printf("\nO produto %s foi adicionado ao carrinho!\n", produto->nome);
}

// Função para visualizar os itens do carrinho
void visualizarCarrinho() {
    printf("\n=== Carrinho ===\n\n");
    for (int i = 0; i < numCarrinho; i++) {
        printf("Produto: %s | Quantidade: %d | Preco Total: R$%.2f\n", 
            carrinho[i].produto.nome, 
            carrinho[i].quantidade, 
            carrinho[i].produto.preco * carrinho[i].quantidade);
    }
}

// Função para fechar o pedido e calcular total
void fecharPedido() {
    int parcelas;
    int formaPagamento;
    int resposta;

    if (numCarrinho == 0) {
        printf("\nO carrinho esta vazio! Nao e possivel fechar o pedido, adicione um produto ao carrinho.\n");
        return;  // Verifica se o carrinho está vazio
    }

    float total = 0.0f;  // Inicializa total da compra

    printf("\n=== Fatura ===\n\n");
    for (int i = 0; i < numCarrinho; i++) {
        float subtotal = carrinho[i].produto.preco * carrinho[i].quantidade;  // Calcula subtotal
        printf("Produto: %s | Quantidade: %d | Subtotal: R$%.2f\n", 
            carrinho[i].produto.nome, 
            carrinho[i].quantidade, 
            subtotal);
        total += subtotal;  // Acumula total
    }
    
    printf("\nTotal da compra: R$%.2f\n", total);

    printf("\nQual a forma de pagamento:\n\n 1-Credito\n 2-Debito\n 3-PIX\n\n");
    scanf("%d", &formaPagamento);  // Lê a forma de pagamento

    if (formaPagamento == 1) {  // Pagamento com crédito
        printf("\nGostaria de dividir esse valor? (1 -Sim / 2 -Nao)\n\n");
        scanf("%d", &resposta);
        if (resposta == 1) {  // Se deseja parcelar
            printf("\nVoce pode dividir em ate 3 vezes, em quantas vezes deseja dividir?\n\n");
            scanf("%d", &parcelas);
            switch (parcelas) {
                case 1: 
                    printf("\nDividindo o valor da compra em 1 vez, o valor da parcela fica R$%.2f\n", total / 1); 
                    break;
                case 2: 
                    printf("\nDividindo o valor da compra em 2 vezes, o valor de cada parcela fica R$%.2f\n", total / 2); 
                    break;
                case 3: 
                    printf("\nDividindo o valor da compra em 3 vezes, o valor de cada parcela fica R$%.2f\n", total / 3); 
                    break;
                default: 
                    printf("\nEscolha uma opcao de parcelamento correta.\n");
                    return;  // Verifica se a opção de parcelamento é válida
            }
        }
    }

    if (formaPagamento == 2) {  // Pagamento com débito
        printf("\nOpcao escolhida foi o debito.\n");
    } else if (formaPagamento == 3) {  // Pagamento via PIX
        printf("\nO PIX para pagamento e o CPF 005.148.965.85.\n");
    }

    printf("\nPedido fechado com sucesso!\n");
    numCarrinho = 0; // Limpa o carrinho após fechar o pedido
}

// Função que verifica se um produto está no carrinho
int temNoCarrinho(int codigo) {
    for (int i = 0; i < numCarrinho; i++) {
        if (carrinho[i].produto.codigo == codigo) {
            return i;  // Retorna o índice se encontrado
        }
    }
    return -1;  // Retorna -1 se não encontrado
}

// Função que busca um produto pelo código
Produto* pegarProdutoPorCodigo(int codigo) {
    for (int i = 0; i < numProdutos; i++) {
        if (produtos[i].codigo == codigo) {
            return &produtos[i];  // Retorna o endereço do produto encontrado
        }
    }
    return NULL;  // Retorna NULL se o produto não for encontrado
}