import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProcessingMode, ProcessingOutcome } from '../../models/processing.model';

/**
 * Card que exibe um `ProcessingOutcome` formatado.
 *
 * Componente puramente apresentacional: recebe dados via `input()` (API de
 * inputs baseada em signals do Angular) e não tem lógica de negócio.
 */
@Component({
  selector: 'app-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './result-card.html',
  styleUrl: './result-card.scss',
})
export class ResultCard {
  /** Título do card (ex.: "Main Thread" ou "Web Worker"). */
  readonly titulo = input.required<string>();

  /** Modo de processamento — usado para estilizar e exibir o badge. */
  readonly modo = input.required<ProcessingMode>();

  /** Resultado a exibir; `null` enquanto ainda não houve processamento. */
  readonly resultado = input<ProcessingOutcome | null>(null);

  /** Lista de pares [categoria, quantidade] pronta para iterar no template. */
  readonly categorias = computed(() => {
    const r = this.resultado();
    return r ? Object.entries(r.categorias) : [];
  });
}
