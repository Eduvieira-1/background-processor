import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { LiveIndicators } from '../../components/live-indicators/live-indicators';
import { ResultCard } from '../../components/result-card/result-card';
import { ComparisonTable } from '../../components/comparison-table/comparison-table';

import { DataGeneratorService } from '../../services/data-generator.service';
import { ProcessingService } from '../../services/processing.service';
import { ProcessingOutcome, Registro } from '../../models/processing.model';

/**
 * Página orquestradora da demonstração.
 *
 * Responsabilidades:
 *  - manter o estado (registros gerados, resultados, flags de loading) em SIGNALS;
 *  - acionar os serviços de geração e processamento;
 *  - compor os componentes de UI.
 *
 * Toda a lógica pesada vive nos serviços; aqui ficamos só com estado e fluxo.
 */
@Component({
  selector: 'app-processor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, LiveIndicators, ResultCard, ComparisonTable],
  templateUrl: './processor.html',
  styleUrl: './processor.scss',
})
export class Processor {
  private readonly generator = inject(DataGeneratorService);
  private readonly processing = inject(ProcessingService);

  /** Quantidade alvo de registros da demo. */
  readonly QUANTIDADE = 100_000;

  // ---- Estado (Signals) -----------------------------------------------------
  readonly registros = signal<Registro[]>([]);

  readonly gerando = signal(false);
  readonly processandoMain = signal(false);
  readonly processandoWorker = signal(false);

  readonly resultadoMain = signal<ProcessingOutcome | null>(null);
  readonly resultadoWorker = signal<ProcessingOutcome | null>(null);

  // ---- Ações ----------------------------------------------------------------

  /** Gera os 100.000 registros em memória. */
  gerarDados(): void {
    this.gerando.set(true);
    // Resetamos resultados anteriores ao gerar uma nova massa de dados.
    this.resultadoMain.set(null);
    this.resultadoWorker.set(null);

    // setTimeout dá um "respiro" para a UI pintar o estado de loading antes
    // da geração (que também é síncrona). Mantemos simples e explícito.
    setTimeout(() => {
      this.registros.set(this.generator.gerar(this.QUANTIDADE));
      this.gerando.set(false);
    });
  }

  /**
   * Processa na MAIN THREAD (síncrono e bloqueante).
   *
   * IMPORTANTE: como o cálculo é síncrono, o `processandoMain.set(true)` acima
   * dele praticamente não chega a ser pintado — a thread já entra no cálculo e
   * congela. É por isso que o spinner/contador/relógio "travam": a prova visual.
   * Usamos setTimeout só para permitir um frame de loading antes do bloqueio.
   */
  processarMain(): void {
    if (!this.temDados()) return;
    this.processandoMain.set(true);

    setTimeout(() => {
      const outcome = this.processing.processarMainThread(this.registros());
      this.resultadoMain.set(outcome);
      this.processandoMain.set(false);
    });
  }

  /**
   * Processa no WEB WORKER (assíncrono, não bloqueante).
   * A UI continua fluida porque o cálculo roda em outra thread.
   */
  async processarWorker(): Promise<void> {
    if (!this.temDados()) return;
    this.processandoWorker.set(true);
    try {
      const outcome = await this.processing.processarComWorker(this.registros());
      this.resultadoWorker.set(outcome);
    } catch (erro) {
      console.error('Falha no Web Worker:', erro);
    } finally {
      this.processandoWorker.set(false);
    }
  }

  /** True quando já existem registros para processar. */
  temDados(): boolean {
    return this.registros().length > 0;
  }
}
