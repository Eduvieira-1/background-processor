import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideKeycloak } from 'keycloak-angular';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Inicializa o Keycloak no bootstrap. Como `initOptions` é informado,
    // o keycloak-angular registra automaticamente um provideAppInitializer:
    // o app só termina de carregar após a checagem de sessão. Com
    // `login-required`, isso significa redirect imediato à tela de login.
    // A config (url/realm/clientId) vem dos environment files; o redirect de
    // retorno é resolvido em runtime via window.location.origin.
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
    }),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
  ]
};
