# obsd.daily.repass

[English 🇬🇧](README.md)

Um companheiro de revisão diária para o [Obsidian](https://obsidian.md) que leva suas tarefas não concluídas para a nota de hoje automaticamente — sem você precisar copiar e colar nada.

> Repasse o seu dia, uma nota de cada vez.

### O que esse plugin faz, na prática?

Imagine que você tem a função de **Notas diárias** configurada no Obsidian, e a nota de ontem ficou com um ou dois itens que você não terminou. Normalmente, você teria que abrir a nota de ontem, procurar o que ficou pendente e copiar tudo manualmente para a nota de hoje.

Este plugin faz isso por você:

- Ele olha para a sua nota diária mais recente.
- Ele pega as tarefas não concluídas (ou, se você preferir, uma seção inteira da nota) que ainda estão em aberto.
- Ele adiciona tudo isso na nota de hoje, automaticamente.
- Se você quiser, ele também pode remover esses itens da nota de ontem depois de movidos, para você não acabar com duplicatas.

Você aciona o plugin quando quiser, com um único comando — ele não faz nada sozinho, escondido, sem você saber.

### Preciso de mais alguma coisa instalada?

Sim — este plugin depende da função **Notas diárias** (que já vem no Obsidian) ou do plugin da comunidade **Periodic Notes**. Um dos dois precisa estar ativado e configurado (com pasta e formato de data definidos) para que este plugin tenha o que processar.

## Instalando o plugin

Este plugin ainda não está disponível na loja oficial de **plugins da comunidade** do Obsidian. Por isso, a forma mais simples de instalá-lo é usando um pequeno plugin auxiliar chamado **BRAT**. Não se preocupe — o BRAT é, ele mesmo, um plugin normal e bem conhecido do Obsidian, e instalá-lo leva menos de um minuto.

**Passo 1 — Instale o BRAT**
1. No Obsidian, abra **Configurações**.
2. Vá em **Plugins da comunidade** e clique em **Navegar**.
3. Procure por `BRAT` (nome completo: *Obsidian42 - BRAT*).
4. Clique em **Instalar** e, em seguida, em **Ativar**.

**Passo 2 — Use o BRAT para instalar este plugin**
1. Abra a **paleta de comandos** (`Ctrl/Cmd + P`).
2. Procure e execute o comando `BRAT: Add a beta plugin for testing`.
3. Cole o link deste repositório: `https://github.com/kuuh4/obsd.daily.repass`
4. Clique em **Add Plugin** e aguarde a confirmação do BRAT.
5. Volte em **Configurações → Plugins da comunidade**, encontre "obsd.daily.repass" na sua lista e ative o botão.

Pronto — sem precisar baixar ou mover arquivo nenhum manualmente. Quando sair uma nova versão, você consegue atualizar direto pela tela de configurações do BRAT, com poucos cliques.

## Como usar

1. Abra a **paleta de comandos** (`Ctrl/Cmd + P`, ou `/` dentro de uma nota).
2. Procure por **"obsd.repass"**.
3. Escolha **"bring tasks to today's note"** para trazer os itens não concluídos de ontem para a nota de hoje.
4. Se algo deu errado, escolha **"Undo last import/rollover"** para desfazer — isso só funciona por cerca de 2 minutos depois de rodar o comando.

## Configurações, em termos simples

Você encontra essas opções em **Configurações → obsd.daily.repass**:

- **Template heading** (cabeçalho do modelo) — Escolha um cabeçalho (como `## A fazer`) se quiser trazer só aquela seção da nota de ontem. Deixe em "None" e o plugin vai simplesmente pegar todo item não concluído do arquivo.
- **Skip already-completed tasks** (pular tarefas já concluídas) — Quando ativado, tarefas finalizadas (`- [x]`) ficam para trás, em vez de serem copiadas junto com o resto.
- **Delete rolled-over content from previous day** (apagar da nota anterior o que foi movido) — Quando ativado, assim que algo é copiado com sucesso para hoje, ele também é removido da nota de ontem. Deixe desativado se preferir manter um histórico completo e não se importar com uma certa duplicação.
- **Remove empty todos in rollover** (remover itens vazios) — Ignora tarefas sem nenhum texto (apenas uma caixinha de marcação vazia).

## O que o plugin não faz

- Ele não roda sozinho em segundo plano — você decide quando acioná-lo.
- Ele olha só um dia para trás por vez, não todo o seu histórico de uma vez.
- Ele não consegue desfazer alterações feitas há mais de alguns minutos, ou depois que o Obsidian foi fechado e reaberto.

---

### Sobre este fork — obsd.daily.repass

Este repositório é um fork de `obsidian-daily-todo-pro` / `obsidian-rollover-daily-todos`, mantido por Deki @ kuuh.art.

Este fork inclui código licenciado sob MIT proveniente das fontes originais. As partes originais do projeto permanecem sob a licença MIT, enquanto as novas contribuições deste fork são licenciadas sob a Duck License, para uso não comercial. O uso comercial das novas contribuições requer permissão prévia; entre em contato com o detentor dos direitos autorais para obter uma licença. Veja `LICENSE` para mais detalhes.

#### Fonte original

- Projeto original (upstream): https://github.com/shichongrui/obsidian-rollover-daily-todos
- Fork original: https://github.com/die4passion/obsidian-daily-todo-pro
- Autor(es) original(is): `shichongrui`, `Die4passion`

#### Licença

- Código original (upstream): MIT
- Novas contribuições deste fork: Duck License, para uso não comercial
- O uso comercial das novas contribuições deste fork requer permissão prévia
- Veja `LICENSE` para o texto completo da Duck License e os requisitos de atribuição.
