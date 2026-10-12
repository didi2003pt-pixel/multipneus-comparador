# Multipneus Comparador

Comparador interno de preços e stock de pneus entre fornecedores B2B.

## Objetivo do MVP

Introduzir uma medida (por exemplo, `205/55 R16`) e consultar os fornecedores configurados, normalizando os resultados para mostrar o mesmo pneu lado a lado.

Fornecedores mapeados nesta fase:

- AB Tyres
- S. José Pneus
- RS Contreras

## Estado atual

A estrutura base do projeto está criada. Os três portais já foram analisados. Os parsers de **RS Contreras, AB Tyres e S. José Pneus** já estão implementados com testes sanitizados. O núcleo já consegue consultar vários conectores em paralelo, com timeout e isolamento de falhas. Existe também uma **interface web em modo demo** para validar o fluxo ao balcão. **A autenticação automática ainda não está implementada**.

O projeto não deve guardar passwords, cookies, tokens de sessão ou respostas B2B brutas no Git.

## Executar a demonstração local

Requer Node.js 20+.

```bash
npm install
npm run typecheck
npm test
npm run demo
npm run web
```

A demonstração usa apenas ofertas já validadas e dados sanitizados para testar a normalização e ordenação. `npm run web` abre a interface em `http://localhost:3000`. A página mostra claramente **MODO DEMO** e ainda não faz login nem pedidos autenticados aos fornecedores.

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


## Interface web

A primeira interface é deliberadamente simples: medida, marca e quantidade, estado dos três fornecedores e tabela ordenada pelo custo conhecido.

Para executar:

```bash
npm install
npm run web
```

Depois abrir `http://localhost:3000`.

O endpoint `/health` pode ser usado por uma plataforma de alojamento para verificar se o serviço está online.


## GitHub Pages (demo estática)

A pasta `docs/` contém uma demonstração estática preparada para GitHub Pages.

No GitHub Free, Pages só está disponível para repositórios públicos. Para publicar:
1. tornar o repositório público, ou mover apenas a demo para um repositório público separado;
2. em **Settings → Pages**, escolher **Deploy from a branch**;
3. selecionar `main` e a pasta `/docs`.

A demo do Pages não contém credenciais e não consulta os fornecedores em tempo real.
