# Multipneus Comparador

Comparador interno de preços e stock de pneus entre fornecedores B2B.

## Objetivo do MVP

Introduzir uma medida (por exemplo, `205/55 R16`) e consultar os fornecedores configurados, normalizando os resultados para mostrar o mesmo pneu lado a lado.

Fornecedores mapeados nesta fase:

- AB Tyres
- S. José Pneus
- RS Contreras

## Estado atual

A estrutura base do projeto está criada. Os três portais já foram analisados. O parser e o construtor de pesquisa da **RS Contreras** já estão implementados e testáveis com dados sanitizados. **A autenticação automática ainda não está implementada**.

O projeto não deve guardar passwords, cookies, tokens de sessão ou respostas B2B brutas no Git.

## Executar a demonstração local

Requer Node.js 20+.

```bash
npm install
npm run typecheck
npm test
npm run demo
```

A demonstração usa ofertas de exemplo para validar a normalização e ordenação. Ainda não faz pedidos aos fornecedores.

## Regra de comparação

Nesta primeira versão, o núcleo calcula o **custo líquido conhecido por pneu**:

```
preço líquido + ecovalor + portes conhecidos
```

Se os portes ou outros encargos ainda não forem conhecidos, o resultado fica marcado como incompleto. Assim evitamos apresentar como "mais barato" um preço que não seja realmente comparável.

## Segurança

- Nunca fazer commit de `.env`.
- Nunca colocar credenciais, cookies, CSRF tokens ou sessões no repositório.
- Usar apenas integrações autorizadas pelas contas B2B da oficina.
- CAPTCHA, MFA/2FA ou outros controlos de acesso não devem ser contornados.

## Próximo passo

Implementar a autenticação/sessão da RS Contreras sem guardar segredos no Git e, depois, ligar os restantes fornecedores:

1. Sessão autenticada RS Contreras
2. AB Tyres
3. S. José Pneus

Cada conector deverá devolver o mesmo formato `TyreOffer`.
