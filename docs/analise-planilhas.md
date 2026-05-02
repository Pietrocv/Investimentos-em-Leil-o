# Analise das planilhas atuais

Cada aba da planilha foi modelada como um registro da tabela `Property`, porque cada aba representa um imovel de leilao com seus dados de compra, datas, avaliacao, venda e observacoes.

Os custos que antes ficavam espalhados em linhas e formulas viraram registros da tabela `Expense`. Assim, um imovel pode ter qualquer quantidade de custos, com categoria, valor, data, forma de pagamento e observacoes.

Documentacao Compra e Documentacao Venda nao viraram tabelas separadas. Elas sao custos comuns do imovel usando `Expense.category` com os valores `CARTORIO_1` e `CARTORIO_2`. Isso simplifica a estrutura e ainda permite separar os totais na tela detalhada.

Os investidores viraram registros da tabela `Investor`. A ligacao entre imovel e investidores virou `PropertyInvestor`, permitindo 1, 2, 3 ou mais investidores no mesmo imovel sem alterar a estrutura do banco.

Os calculos de lucro real, custo total, retorno realizado e percentual de lucro nao ficam mais como formulas de celula. Eles ficam centralizados no backend em `backend/src/services/financial-calculations.ts`.

Com essa modelagem, o sistema permite multiplos investidores por imovel sem criar colunas fixas e sem precisar modificar o banco quando um novo investidor participa de uma operacao.
