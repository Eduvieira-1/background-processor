/**
 * Configuração de PRODUÇÃO (usada pelo `ng build` / deploy na Vercel).
 *
 * Os valores de Keycloak abaixo (url/realm/clientId) referem-se a um client
 * PÚBLICO (SPA) — não são segredos: o navegador os recebe de qualquer forma.
 * Client público não possui secret, então nada sensível é versionado aqui.
 */
export const environment = {
  production: true,
  keycloak: {
    url: 'https://keycloak.esdrassystems.com.br',
    realm: 'background-processor',
    clientId: 'background-processor',
  },
};
