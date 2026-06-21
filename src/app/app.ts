import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, ReadyArgs, typeEventArgs } from 'keycloak-angular';
import { Processor } from './pages/processor/processor';

/**
 * Casca raiz da aplicação. Como é uma demo de página única, apenas renderiza
 * a página `Processor`. Sem roteamento por opção de simplicidade.
 *
 * A autenticação é tratada pelo Keycloak (configurado em app.config.ts com
 * `login-required`): quando este componente renderiza, o usuário já está
 * autenticado. Aqui apenas exibimos seus dados e oferecemos o logout.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Processor],
  template: `
    @if (autenticado()) {
      <div class="user-bar">
        <span>Olá, <strong>{{ username() }}</strong></span>
        @if (roles().length) {
          <span class="roles">[{{ roles().join(', ') }}]</span>
        }
        <button type="button" (click)="logout()">Sair</button>
      </div>
    }
    <app-processor />
  `,
  styles: [`
    .user-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: #1f2937;
      color: #f9fafb;
      font-size: 0.9rem;
    }
    .user-bar .roles { opacity: 0.7; font-size: 0.8rem; }
    .user-bar button {
      margin-left: auto;
      padding: 0.3rem 0.9rem;
      border: 1px solid #4b5563;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .user-bar button:hover { background: #374151; }
  `],
})
export class App {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakEvents = inject(KEYCLOAK_EVENT_SIGNAL);

  readonly autenticado = signal(this.keycloak.authenticated ?? false);

  /** Claims do token: preferred_username, name, realm_access.roles, etc. */
  readonly username = computed(() =>
    (this.keycloak.tokenParsed?.['preferred_username'] as string | undefined) ?? '');
  readonly roles = computed(() => this.keycloak.realmAccess?.roles ?? []);

  constructor() {
    // Mantém o signal `autenticado` em dia com os eventos do Keycloak
    // (Ready ao iniciar, AuthLogout ao deslogar).
    effect(() => {
      const ev = this.keycloakEvents();
      if (ev.type === KeycloakEventType.Ready) {
        this.autenticado.set(typeEventArgs<ReadyArgs>(ev.args));
      }
      if (ev.type === KeycloakEventType.AuthLogout) {
        this.autenticado.set(false);
      }
    });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
