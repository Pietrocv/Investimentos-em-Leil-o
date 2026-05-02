# Analise das planilhas atuais

Cada aba da planilha foi modelada como um registro da tabela `Property`, porque cada aba representa um imovel de leilao com seus dados de compra, datas, avaliacao, venda e observacoes.

Os custos que antes ficavam espalhados em linhas e formulas viraram registros da tabela `Expense`. Assim, um imovel pode ter qualquer quantidade de custos, com categoria, valor, data, forma de pagamento e observacoes.

Cartorio 1 e Cartorio 2 nao viraram tabelas separadas. Eles sao custos comuns do imovel usando `Expense.category` com os valores `CARTORIO_1` e `CARTORIO_2`. Isso simplifica a estrutura e ainda permite separar os totais na tela detalhada.

Os investidores viraram registros da tabela `Investor`. A ligacao entre imovel e investidores virou `PropertyInvestor`, permitindo 1, 2, 3 ou mais investidores no mesmo imovel sem alterar a estrutura do banco.

Pagamentos ao investidor viraram `InvestorPayment`, vinculados ao imovel e ao investidor. Esses pagamentos reduzem o saldo a pagar calculado para cada participante.

Os calculos de lucro, custo total, retorno previsto, retorno realizado, percentual de lucro e saldo nao ficam mais como formulas de celula. Eles ficam centralizados no backend em `backend/src/services/financial-calculations.ts`.

Com essa modelagem, o sistema permite multiplos investidores por imovel sem criar colunas fixas e sem precisar modificar o banco quando um novo investidor participa de uma operacao.
