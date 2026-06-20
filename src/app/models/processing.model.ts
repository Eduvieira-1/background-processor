/**
 * Modelos de domínio da demonstração.
 *
 * Mantemos todas as interfaces em um único arquivo porque o domínio é pequeno
 * e coeso. Tipagem forte aqui é o que permite que a MESMA lógica de cálculo
 * (ver `shared/processing-logic.ts`) rode com segurança tanto na Main Thread
 * quanto dentro do Web Worker.
 */

/** Registro individual gerado em memória. */
export interface Registro {
  id: number;
  nome: string;
  valor: number;
  categoria: string;
}

/**
 * Resultado bruto do processamento estatístico.
 * Não inclui tempo — é puramente o "o quê" foi calculado, não o "quão rápido".
 */
export interface ProcessingResult {
  totalRegistros: number;
  somaValores: number;
  media: number;
  maiorValor: number;
  menorValor: number;
  /** Mapa categoria -> quantidade de registros naquela categoria. */
  categorias: Record<string, number>;
}

/**
 * Resultado + medição de tempo de execução.
 * É o que a UI realmente consome para preencher os cards e a tabela de comparação.
 */
export interface ProcessingOutcome extends ProcessingResult {
  /** Tempo de execução do cálculo, em milissegundos. */
  tempoExecucao: number;
}

/**
 * Contrato de mensagem enviada DA Main Thread PARA o Worker.
 * Tudo que cruza a fronteira de threads precisa ser serializável (algoritmo
 * de clonagem estruturada do navegador). Um array de objetos simples atende.
 */
export interface WorkerRequest {
  registros: Registro[];
}

/**
 * Contrato de mensagem enviada DO Worker DE VOLTA para a Main Thread.
 * É exatamente o `ProcessingOutcome`, mas tipamos como interface própria para
 * deixar explícito que este é o "shape" que viaja no `postMessage`.
 */
export type WorkerResponse = ProcessingOutcome;

/** Identifica em qual contexto o processamento ocorreu. */
export type ProcessingMode = 'main' | 'worker';
