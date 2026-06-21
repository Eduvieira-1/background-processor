import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideKeycloak } from 'keycloak-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    // Inicializa o Keycloak no bootstrap. Como `initOptions` é informado,
    // o keycloak-angular registra automaticamente um provideAppInitializer:
    // o app só termina de carregar após a checagem de sessão. Com
    // `login-required`, isso significa redirect imediato à tela de login.
    // Valores de ambiente LOCAL de estudo — para ambiente real, extrair
    // para src/environments/ em vez de hardcode.
    provideKeycloak({
      config: {
        url: 'http://localhost:8080',
        realm: 'estudo',
        clientId: 'angular-app',
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
