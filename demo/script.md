# Testcoveragent


## Criando uma aplicação e melhorando a cobertura de testes com um Agente usando o GitHub Copilot CLI e o GitHub Copilot Coding Agent.

1. Clone esse repositorio localmente no seu computador e abra o Visual Studio Code a partir do repositorio clonado. Garanta que voce tenha o Python 3.13 + PIP instalado no seu computador.

2. Inicie a aplicação com o 
```
npm install
npm start
```

3. Crie a pasta chamada .github e outra chamada .vscode, ambas na raiz do repositório, crie também a pasta chamada workflows, outra chamada prompts e crie também o arquivo chamado copilot-instructions.md.

4. Crie um novo arquivo de prompt chamado `testcoveragent.prompt.md` com o seguinte conteúdo:

    ```
        ---
        agent: 'agent'
        description: 'Analisa a cobertura de código e sugere testes unitários para melhorar a cobertura geral.'
        tools: ['search', 'runCommands']
        ---

        # Análise de melhoria de cobertura de código por testcoveragent 

        Você é um engenheiro especialista em garantia de qualidade e testador de software. Sua tarefa é analisar o code coverage do código fornecido APENAS nos diretórios src/ e propor testes unitários que melhorem a cobertura geral dos testes.

        RESTRIÇÕES IMPORTANTES:
        - Acesse APENAS arquivos dentro do diretório src/
        - Use APENAS os relatórios de coverage existentes (coverage-reports/)
        - NÃO tente criar ou acessar arquivos fora do workspace do projeto
        - NÃO acesse arquivos de sistema ou paths absolutos

        ## Context do Projeto
        Este é um aplicativo React de gerenciamento de tarefas (Task Dashboard) construído com:
        - React 19
        - Vite como build tool
        - Vitest para testes
        - Tailwind CSS para estilização
        - Framer Motion para animações

        ## Estrutura do projeto:
        - `/src/features/` - Componentes organizados por funcionalidade (tasks, lists, tags)
        - `/src/context/` - Context providers para gerenciamento de estado
        - `/src/common/` - Utilitários e componentes compartilhados

        ## Sua análise deve:

        1. **Verificar os relatórios de coverage existentes**
        - Analisar coverage/lcov.info
        - Revisar coverage/coverage-final.json
        - Examinar coverage-reports/coverage-summary.md

        2. **Identificar componentes e funções não testadas**
        - Focar em arquivos com baixa cobertura no diretório src/
        - Priorizar componentes críticos (Context providers, componentes principais)
        - Identificar funções/métodos específicos sem cobertura

        3. **Sugerir casos de teste específicos**
        - Testes de renderização de componentes
        - Testes de interação do usuário (cliques, formulários)
        - Testes de gerenciamento de estado (Context)
        - Testes de edge cases e validação

        4. **Criar um relatório estruturado**
        - Lista de arquivos com baixa cobertura
        - Casos de teste específicos sugeridos para cada arquivo
        - Exemplos de código de teste quando apropriado
        - Priorização baseada na criticidade dos componentes

        ## Formato do Relatório:

        ```markdown
        # Relatório de Análise de Cobertura de Testes - Task Dashboard

        ## Resumo Executivo
        - Cobertura atual: X%
        - Arquivos analisados: X
        - Recomendações principais: X

        ## Arquivos com Baixa Cobertura

        ### [Nome do Arquivo] - X% cobertura
        **Linhas não cobertas:** [números das linhas]
        **Funções não testadas:** [lista de funções]

        **Testes sugeridos:**
        1. [Descrição do teste 1]
        2. [Descrição do teste 2]

        **Exemplo de implementação:**
        ```javascript
        // Código de exemplo do teste
        ```

        ## Prioridades de Implementação
        1. Alta - [Arquivos críticos]
        2. Média - [Arquivos importantes]  
        3. Baixa - [Arquivos opcionais]
        ```

        Crie uma nova Issue no repositório caiocqueiroz/task_dashboard_agent com o título "Análise de melhoria de cobertura de código por testcoveragent - [Data Atual]" e inclua o relatório compilado no corpo da issue. Certifique-se de que o relatório esteja bem formatado e fácil de ler.

    ```

5. Crie um novo workflow dentro da pasta .github/workflows chamado build.yml com o seguinte conteúdo:

    ```yaml

    name: Build and Test with Copilot CLI

    on:
    workflow_dispatch:

    jobs:
    copilot-cli-build-and-test:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout repository
            uses: actions/checkout@v3

        - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
            node-version: '20'

        - name: Install GitHub Copilot CLI 
            run: |
            npm install -g @github/copilot

        - name: Run Copilot CLI 
            env:
            GITHUB_TOKEN: ${{ secrets.COPILOT_TOKEN }}
            GH_TOKEN: ${{ secrets.COPILOT_TOKEN }}
            run: |
            echo "Testing Copilot CLI..."

            # User Copilot CLI
            copilot -p "Porque o ceu é azul?" --allow-all-tools
    ```

    Este workflow vai instalar e executar o GitHub Copilot CLI e executar um prompt simples para validar se está funcionando corretamente.

6. Agora execute os comandos abaixo para adicionar, commitar e dar push nas mudanças para o repositório remoto.

    ```bash
    git add .
    git commit -m "Commit inicial com o app Django e a configuração do Copilot CLI"
    git push origin demo-<seu-nome-de-usuario>
    ```
7. Agora vá até o repositorio remoto no GitHub e crie um Personal Access Token (Fine-grained - GitHub -> Settings -> Developer Settings -> Personal Access Tokens -> Fine-grained tokens) com as permissões necessárias para o GitHub Copilot CLI funcionar corretamente para analisar nosso código e criar issues. As permissões necessarias para que o Copilot possa operar da forma que o nosso agente precisa são:

    - **Actions**: Read
    - **Contents**: Read
    - **Issues**: Write
    - **Metadata**: Read
    - **Pull requests**: Write (se for criar PRs)

8. Adicione o token criado como um segredo do repositório (GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret) com o nome `COPILOT_TOKEN`.

9. Execute o workflow manualmente (GitHub -> Actions -> Build and Test with Copilot CLI -> Run workflow) para validar se o GitHub Copilot CLI está funcionando corretamente.

10. Você deve ver a saída do passo "Run Copilot CLI" com a resposta para o prompt "Porque o ceu é azul?".

11. Agora adicione ao workflow os passos de build e do test coverage que utilizaremos como artefato para o GitHub Copilot analisar, experiemente criar um prompt para alterar o workflow e iterar até conseguir o resultado esperado, caso prefira, utilize o workflow ja pronto em ./demo/ci.yaml

12. Agora temos um artefato com o coverage reports, vamos utilizar o Copilot CLI para analisar o coverage report e sugerir melhorias na cobertura de código. Para isso, vamos alterar o nosso workflow para enviar um novo prompt ao Copilot CLI.

    ```yaml
    - name: Generate Weekly Copilot Report and Create Issue
      env: 
        GITHUB_TOKEN: ${{ secrets.COPILOT_TOKEN }}
        GH_TOKEN: ${{ secrets.COPILOT_TOKEN }}
      run: |
        echo "Testing Copilot CLI..."
        
        # Make coverage data available in workspace
        echo "Coverage artifacts available for analysis:"
        ls -la coverage-reports/
        
        # Copy coverage data to current directory for agent access
        if [ -d "coverage-reports" ]; then
          cp -r coverage-reports/* . 2>/dev/null || true
        fi

        # Use Copilot CLI to execute the testcoveragent prompt
        copilot -p "Execute the .github/prompts/testcoveragent.prompt.md prompt file" --allow-all-tools --log-dir /tmp/logs --log-level debug

    ```
13. Execute o workflow manualmente novamente (GitHub -> Actions -> Build and Test with Copilot CLI -> Run workflow) para validar se o GitHub Copilot CLI está funcionando corretamente e criando a issue com o relatório de cobertura sugerido pelo agente.

14. Agora vá até a issue criada e atribua a issue ao Copilot, dessa modo vamos disparar uma execução do GitHub Copilot Coding Agent, que vai gerar uma pull requetest com os testes sugeridos para melhorar a cobertura de código do app Django..

## Utilizando um agent de Behavior Driven Development (BDD) e Playwright para descobrir e executar testes E2E automatizados.

1. Crie um novo arquivo de prompt chamado `bdd-agent.prompt.md` com o seguinte conteúdo:

    ```
    ---
    description: 'Help me create a BDD feature file based on user requirements.'
    tools: ['changes', 'codebase', 'editFiles', 'fetch', 'githubRepo', 'runCommands', 'search', 'usages', 'playwright', 'github', 'Azure MCP Server']
    ---
    # BDD Feature File Generator

    You are an expert in Behavior-Driven Development (BDD) and creating Gherkin feature files. Your task is to help create a well-structured feature file based on the user's requirements. 

    ## Clarification Phase

    If any of the following information is missing from the user's initial request, ask clarifying questions to gather:

    1. **Feature Name**: What is the name of the feature you want to describe?
    2. **Business Value**: What business value does this feature provide? (As a [role], I want [feature], so that [benefit])
    3. **User Roles**: Who are the main users/personas interacting with this feature?
    4. **Acceptance Criteria**: What are the main acceptance criteria for this feature?
    5. **Special Conditions**: Are there any edge cases or error conditions to consider?
    6. **Domain Terminology**: Are there specific domain terms I should use in the scenarios?

    ## Output Guidelines

    - Generate ONLY the feature file content in Gherkin syntax, no implementation code
    - Use the standard Gherkin keywords: Feature, Scenario, Given, When, Then, And, But
    - Include a clear feature description that explains the business value
    - Create concise, clear scenarios that cover the main acceptance criteria
    - Format the feature file properly with correct indentation

    ## Example Structure

        ```gherkin
        Feature: [Feature Name]
        As a [role]
        I want [feature]
        So that [benefit]

        Scenario: [Scenario Name]
            Given [precondition]
            When [action]
            Then [expected result]

        Scenario: [Another Scenario Name]
            Given [another precondition]
            When [another action]
            Then [another expected result]
        ```

    Remember to focus solely on the feature specification and not on implementation details or automation code.
    ```

2. Agora vá até .vscode/mcp.json e adicione o servidor MCP do PlayWright:
   
    ```json
    {

    "servers": {
        "playwright": {
        "command": "npx",
        "args": [
            "@playwright/mcp@latest"
         ]
        }
     }
    }
    ```
3. Inicie o servidor MCP usando a opção start que vai aparecer no arquivo mcp.json.

4. Agora arraste o arquivo bdd.prompt.md e execute o prompt abaixo: 

    ```
    Crie um feature file com alguns cenarios de testes em /apps/finance

    ```
5.Agora veja que o agente criou um arquivo .feature com os cenarios de testes usando Gherkin, agora peça para o agente executar alguns dos cenarios via Playwright:

    ```
    Execute os cenarios de testes do arquivo .feature criado anteriormente usando Playwright.

    ```
6. Acompanhe enquanto o Copilot da comandos para executar os testes E2E via Playwright em um browser!.


