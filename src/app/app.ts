import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Processor } from './pages/processor/processor';

/**
 * Casca raiz da aplicação. Como é uma demo de página única, apenas renderiza
 * a página `Processor`. Sem roteamento por opção de simplicidade.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Processor],
  template: '<app-processor />',
})
export class App {}
