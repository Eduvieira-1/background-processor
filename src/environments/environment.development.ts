/**
 * Configuração de DESENVOLVIMENTO (usada pelo `ng serve` em localhost:4200).
 *
 * Aponta para o MESMO Keycloak de produção — só muda quais origens estão
 * cadastradas no client (localhost vs domínio da Vercel). Se um dia quiser
 * um Keycloak local, basta trocar os valores abaixo aqui.
 */
export const environment = {
  production: false,
  keycloak: {
    url: 'https://keycloak.esdrassystems.com.br',
    realm: 'background-processor',
    clientId: 'background-processor',
  },
};
