import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-armario-gsap',
  standalone: true,
  templateUrl: './armario-gsap.component.html',
  styleUrl: './armario-gsap.component.scss'
})
export class ArmarioGsapComponent implements AfterViewInit, OnDestroy {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @ViewChild('video', { static: true })
  private readonly videoRef!: ElementRef<HTMLVideoElement>;

  private ctx?: gsap.Context;
  private tween: gsap.core.Tween | null = null;
  private cleanup: (() => void) | null = null;

  private readonly handleResize = () => {
    this.setupScrollScrub();
  };

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const video = this.videoRef.nativeElement;
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    const init = () => this.setupScrollScrub();

    if (video.readyState >= 1) {
      init();
    } else {
      const onLoadedMetadata = () => init();
      video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      this.cleanup = () => video.removeEventListener('loadedmetadata', onLoadedMetadata);
    }

    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.cleanup?.();
    this.ctx?.revert();
  }

  private setupScrollScrub(): void {
    const host = this.hostRef.nativeElement;
    const video = this.videoRef.nativeElement;
    const section = host.querySelector<HTMLElement>('.armario-section');

    if (!section) {
      return;
    }

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) {
      return;
    }

    this.ctx?.revert();
    this.tween = null;

    this.ctx = gsap.context(() => {
      video.pause();
      video.currentTime = 0;

      video.muted = true;
      video.play().then(() => video.pause()).catch(() => {});

      const pixelsPerSecond = 120;
      const scrollDistance = Math.max(800, Math.round(duration * pixelsPerSecond));

      this.tween = gsap.to(video, {
        currentTime: duration,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: section,
          anticipatePin: 1,
          scrub: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true
        }
      });

      ScrollTrigger.refresh();
      return () => {
        this.tween?.scrollTrigger?.kill();
        this.tween?.kill();
      };
    }, host);
  }
}
