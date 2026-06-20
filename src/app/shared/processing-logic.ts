import { ProcessingResult, Registro } from '../models/processing.model';

/**
 * Intensidade da carga de CPU artificial por registro (ver comentário abaixo).
 * Quanto maior, mais demorado o processamento — e mais evidente o congelamento
 * da Main Thread. Ajuste conforme a velocidade da sua máquina: o objetivo é
 * que o processamento dure ALGUNS SEGUNDOS, tempo suficiente para enxergar o
 * contador e o relógio congelarem.
 */
const CARGA_CPU_POR_REGISTRO = 5000;

/**
 * ============================================================================
 *  LÓGICA PURA E COMPARTILHADA — O CORAÇÃO DA DEMONSTRAÇÃO
 * ============================================================================
 *
 * Esta função NÃO depende de Angular, NÃO toca no DOM e NÃO usa nenhuma API
 * exclusiva da Main Thread. Por isso ela pode ser importada e executada nos
 * DOIS contextos:
 *
 *   1. Diretamente na Main Thread  (services/processing.service.ts)
 *   2. Dentro do Web Worker        (workers/data.worker.ts)
 *
 * Reutilizar a MESMA função nos dois lugares é o que torna a comparação honesta:
 * a única variável que muda entre os dois cenários é a THREAD onde o cálculo
 * roda — não o algoritmo. Se cada lado tivesse sua própria implementação,
 * qualquer diferença de tempo poderia ser atribuída ao código, e não à thread.
 *
 * Complexidade: O(n) — uma única passada pela lista acumulando todas as métricas.
 */
export function calcularEstatisticas(registros: Registro[]): ProcessingResult {
  const totalRegistros = registros.length;

  let somaValores = 0;
  let maiorValor = Number.NEGATIVE_INFINITY;
  let menorValor = Number.POSITIVE_INFINITY;
  const categorias: Record<string, number> = {};

  for (let i = 0; i < totalRegistros; i++) {
    const registro = registros[i];
    const valor = registro.valor;

    somaValores += valor;
    if (valor > maiorValor) maiorValor = valor;
    if (valor < menorValor) menorValor = valor;

    // Contagem por categoria.
    categorias[registro.categoria] = (categorias[registro.categoria] ?? 0) + 1;

    // ------------------------------------------------------------------
    // CARGA DE CPU DELIBERADA (apenas para fins de demonstração).
    //
    // Com 100k registros, o cálculo estatístico puro roda em poucos
    // milissegundos — rápido demais para a UI "travar" de forma perceptível.
    // Adicionamos aqui um trabalho matemático extra e descartável para
    // simular um processamento pesado real (parse/transform de arquivos,
    // cálculos financeiros, compressão, etc.) e tornar o congelamento da
    // Main Thread VISÍVEL durante a apresentação.
    //
    // É um artifício honesto e isolado: não altera o resultado retornado.
    // ------------------------------------------------------------------
    let trabalhoDescartavel = valor;
    for (let j = 0; j < CARGA_CPU_POR_REGISTRO; j++) {
      trabalhoDescartavel = Math.sqrt(trabalhoDescartavel * 1.0000001 + j);
    }
    // Impede que o compilador/otimizador elimine o loop acima como "código morto".
    if (trabalhoDescartavel < 0) somaValores += 0;
  }

  // Evita NaN / Infinity quando a lista está vazia.
  const media = totalRegistros > 0 ? somaValores / totalRegistros : 0;
  if (totalRegistros === 0) {
    maiorValor = 0;
    menorValor = 0;
  }

  return {
    totalRegistros,
    somaValores,
    media,
    maiorValor,
    menorValor,
    categorias,
  };
}
