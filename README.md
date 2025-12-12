# Reset User Script Batch

Script batch para gerenciamento de usuários em ambientes Salesforce Commerce Cloud (SFCC), permitindo criar usuários de teste e resetar senhas em massa.

## Funcionalidades

- **Criar Usuários**: Gera usuários de teste com dados aleatórios
- **Resetar Senhas**: Reseta senhas de múltiplos usuários em lote
- Suporte a múltiplos ambientes (development, staging, production)
- Suporte a múltiplos sites (AvonBrazil, NatBrazil)
- Importação de e-mails via CSV ou entrada manual

## Pré-requisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Credenciais de acesso à API do Salesforce Commerce Cloud

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd reset-user-script-batch
```

2. Instale as dependências:
```bash
pnpm install
# npm install / yarn install
```


3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production
```

## Configuração

### Variáveis de Ambiente

Edite os arquivos `.env.development`, `.env.staging` e `.env.production` com suas credenciais:

```env
AUTH_ENDPOINT=https://account.demandware.com/dwsso/oauth2
OCAPI_ENDPOINT=https://development.na01.natura.com/s/-/dw/batch
CLIENT_SECRET=seu_client_secret_aqui
CLIENT_ID=seu_client_id_aqui
```

**Importante**: Cada arquivo deve conter as credenciais específicas do ambiente correspondente.

## Uso

### 1. Criar Usuários de Teste

Cria usuários de teste com dados aleatórios (nome, CPF, telefone, etc).

```bash
pnpm create
# npm install / yarn install
```

**Processo interativo:**
1. Selecione o ambiente (development, staging, production)
2. Selecione o site (AvonBrazil, NatBrazil)
3. Aguarde a criação dos usuários

### 2. Resetar Senhas

Reseta as senhas de múltiplos usuários em lote.

```bash
pnpm reset
```

**Processo interativo:**
1. Selecione o ambiente (development, staging, production)
2. Selecione o site (AvonBrazil, NatBrazil)
3. Escolha o método de entrada dos e-mails:
   - **Arquivo CSV**: Forneça o caminho do arquivo
   - **Digitar manualmente**: Digite os e-mails separados por vírgula

**Exemplo de entrada manual:**
```
Digite os e-mails separados por vírgula:
user1@email.com, user2@email.com, user3@email.com
```

**Formato do CSV de entrada:**

Crie um arquivo CSV na pasta `input/` com o seguinte formato:

```csv
email
user1@example.com
user2@example.com
user3@example.com
```

**Importante**: O CSV deve ter uma coluna chamada `email` (sem acentos).

**Exemplo de uso com CSV:**
```bash
pnpm reset
# npm install / yarn install
# Selecione: Arquivo CSV
# Digite o caminho: input/users.csv
```