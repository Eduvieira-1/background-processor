import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';


@Component({
  selector: 'app-live-indicators',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-indicators.html',
  styleUrl: './live-indicators.scss',
})
export class LiveIndicators implements OnInit, OnDestroy {
  /** Contador que sobe a cada frame de animação. */
  readonly contador = signal(0);

  /** Horário atual formatado (HH:MM:SS). */
  readonly relogio = signal(this.formatarHora());

  /** NgZone: usamos runOutsideAngular para o RAF não disparar CD a cada frame. */
  private readonly zone = inject(NgZone);

  private rafId = 0;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    // O loop de animação roda fora da zona do Angular por performance; só
    // atualizamos o signal (que agenda CD pontual via OnPush) a cada frame.
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        this.contador.update((n) => n + 1);
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });

    // Relógio: atualiza a cada segundo.
    this.intervalId = setInterval(() => {
      this.relogio.set(this.formatarHora());
    }, 1000);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private formatarHora(): string {
    const agora = new Date();
    const p = (n: number) => n.toString().padStart(2, '0');
    return `${p(agora.getHours())}:${p(agora.getMinutes())}:${p(agora.getSeconds())}`;
  }
}
