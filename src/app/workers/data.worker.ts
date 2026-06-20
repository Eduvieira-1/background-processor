/// <reference lib="webworker" />

/**
 * ============================================================================
 *  WEB WORKER REAL
 * ============================================================================
 *
 * Este arquivo é compilado e executado em uma THREAD SEPARADA do navegador.
 * Ele NÃO tem acesso ao DOM, ao `window`, nem aos componentes Angular.
 * Seu único canal de comunicação com a Main Thread é por troca de mensagens.
 *
 * Ciclo de vida da troca de mensagens:
 *
 *   Main Thread                         Worker Thread (este arquivo)
 *   -----------                         ----------------------------
 *   worker.postMessage(req)   ───────►  addEventListener('message', ...)
 *                                       (processa SEM travar a Main Thread)
 *   worker.onmessage  ◄───────────────  postMessage(resposta)
 *
 * Repare que importamos a MESMA função `calcularEstatisticas` usada na Main
 * Thread. A lógica é idêntica; só muda a thread em que ela roda.
 */

import { calcularEstatisticas } from '../shared/processing-logic';
import { WorkerRequest, WorkerResponse } from '../models/processing.model';

/**
 * `addEventListener('message')` é o ponto de entrada do Worker.
 * Toda vez que a Main Thread chama `worker.postMessage(...)`, este callback
 * dispara — já dentro da thread do Worker.
 */
addEventListener('message', ({ data }: MessageEvent<WorkerRequest>) => {
  // Medimos o tempo DENTRO do Worker para reportar o custo real do cálculo.
  const inicio = performance.now();

  // Processamento pesado: roda aqui, na thread do Worker.
  // Enquanto isso acontece, a Main Thread continua livre para animar a UI.
  const resultado = calcularEstatisticas(data.registros);

  const tempoExecucao = performance.now() - inicio;

  const resposta: WorkerResponse = { ...resultado, tempoExecucao };

  // Devolve o resultado para a Main Thread. Aqui também ocorre serialização
  // (structured clone) do objeto que cruza a fronteira de threads.
  postMessage(resposta);
});
