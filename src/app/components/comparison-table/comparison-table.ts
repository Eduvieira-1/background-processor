import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProcessingOutcome } from '../../models/processing.model';

/**
 * Tabela de comparação Main Thread × Web Worker.
 *
 * Apresenta lado a lado o tempo de execução e a métrica subjetiva mais
 * importante da demo: "a interface travou?". A coluna do vencedor de tempo
 * recebe destaque automático.
 */
@Component({
  selector: 'app-comparison-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './comparison-table.html',
  styleUrl: './comparison-table.scss',
})
export class ComparisonTable {
  readonly resultadoMain = input<ProcessingOutcome | null>(null);
  readonly resultadoWorker = input<ProcessingOutcome | null>(null);

  /** True quando ambos os lados já foram processados. */
  readonly completo = computed(
    () => this.resultadoMain() !== null && this.resultadoWorker() !== null,
  );

  /**
   * Diferença absoluta de tempo entre Worker e Main (em ms), quando ambos
   * existem. Valor POSITIVO = Worker levou mais tempo (overhead de
   * serialização); valor negativo = Worker levou menos.
   *
   * Atenção ao enquadramento: o Worker NÃO é uma técnica para "acelerar" o
   * cálculo — ele roda em um núcleo só, igual à Main Thread. Os tempos são
   * naturalmente parecidos. O ganho real é a UI não travar.
   */
  readonly diferencaMs = computed(() => {
    const main = this.resultadoMain();
    const worker = this.resultadoWorker();
    if (!main || !worker) return null;
    return worker.tempoExecucao - main.tempoExecucao;
  });
}
