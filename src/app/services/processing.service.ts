import { Injectable } from '@angular/core';
import { calcularEstatisticas } from '../shared/processing-logic';
import {
  ProcessingOutcome,
  Registro,
  WorkerRequest,
  WorkerResponse,
} from '../models/processing.model';

/**
 * Serviço que centraliza as DUAS estratégias de processamento.
 *
 * O componente de página não precisa saber detalhes de threads — ele apenas
 * pede "processe na Main Thread" ou "processe no Worker" e recebe um
 * `ProcessingOutcome`. Isso mantém a página focada em estado/UI.
 */
@Injectable({ providedIn: 'root' })
export class ProcessingService {
  /**
   * Processa SÍNCRONAMENTE na Main Thread.
   *
   * Tudo aqui — inclusive a medição — acontece na mesma thread que renderiza a
   * UI. Por ser síncrono e pesado, ele BLOQUEIA o event loop: animações, o
   * relógio, o contador e qualquer interação do usuário ficam congelados até
   * a função retornar. Esse congelamento é exatamente o que queremos evidenciar.
   */
  processarMainThread(registros: Registro[]): ProcessingOutcome {
    const inicio = performance.now();
    const resultado = calcularEstatisticas(registros);
    const tempoExecucao = performance.now() - inicio;
    return { ...resultado, tempoExecucao };
  }

  /**
   * Processa em um WEB WORKER (thread separada) e resolve via Promise.
   *
   * A Main Thread só faz três coisas baratas: criar o Worker, enviar os dados
   * (`postMessage`) e aguardar a resposta (`onmessage`). O cálculo pesado roda
   * na thread do Worker, então a UI permanece fluida o tempo todo.
   */
  processarComWorker(registros: Registro[]): Promise<ProcessingOutcome> {
    return new Promise<ProcessingOutcome>((resolve, reject) => {
      // Fallback documentado: ambientes muito antigos podem não ter Worker.
      if (typeof Worker === 'undefined') {
        reject(new Error('Web Workers não são suportados neste navegador.'));
        return;
      }

      // A sintaxe `new URL('./arquivo', import.meta.url)` é a forma oficial
      // suportada pelo builder do Angular para empacotar o Worker corretamente.
      const worker = new Worker(new URL('../workers/data.worker', import.meta.url));

      // Recebe o resultado vindo da thread do Worker.
      worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
        resolve(data);
        // Encerramos o Worker após o uso para liberar a thread/memória.
        worker.terminate();
      };

      // Trata erros ocorridos dentro do Worker.
      worker.onerror = (erro) => {
        reject(erro);
        worker.terminate();
      };

      // Dispara o processamento enviando os dados para o Worker.
      const request: WorkerRequest = { registros };
      worker.postMessage(request);
    });
  }
}
