import { Injectable } from '@angular/core';
import { Registro } from '../models/processing.model';

/**
 * Serviço responsável por gerar a massa de dados em memória.
 *
 * Isolar a geração em um serviço deixa a página enxuta e permite reuso/teste.
 * A geração roda na Main Thread — é rápida o bastante para 100k itens e não é
 * o foco da demonstração (o foco é o PROCESSAMENTO).
 */
@Injectable({ providedIn: 'root' })
export class DataGeneratorService {
  /** Conjunto fixo de categorias usado para distribuir os registros. */
  private readonly categorias = ['Financeiro', 'Logística', 'Vendas', 'RH', 'TI'];

  /**
   * Gera uma lista de registros aleatórios.
   * @param quantidade total de registros (padrão: 100.000).
   */
  gerar(quantidade = 100_000): Registro[] {
    const registros: Registro[] = new Array<Registro>(quantidade);

    for (let i = 0; i < quantidade; i++) {
      const categoria = this.categorias[i % this.categorias.length];
      registros[i] = {
        id: i + 1,
        nome: `Registro #${i + 1}`,
        // valor entre 0 e 10.000 com duas casas decimais.
        valor: Math.round(Math.random() * 1_000_000) / 100,
        categoria,
      };
    }

    return registros;
  }
}
