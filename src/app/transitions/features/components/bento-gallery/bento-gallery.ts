import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-bento-gallery',
  standalone: true,
  templateUrl: './bento-gallery.component.html',
  styleUrl: './bento-gallery.component.scss'
})
export class BentoGalleryComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private flipCtx?: gsap.Context;

  private readonly handleResize = () => {
    this.createTween();
  };

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger, Flip);
    this.createTween();
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.flipCtx?.revert();
  }

  private createTween(): void {
    const galleryElement = this.elementRef.nativeElement.querySelector<HTMLElement>('#gallery-8');
    if (!galleryElement) {
      return;
    }

    const galleryItems = galleryElement.querySelectorAll('.gallery__item');
    const header = document.querySelector<HTMLElement>('.layout-header');
    const categoriesTitle = document.querySelector<HTMLElement>('.categories-title');

    this.flipCtx?.revert();
    galleryElement.classList.remove('gallery--final');
    categoriesTitle?.classList.remove('is-visible');

    this.flipCtx = gsap.context(() => {
      if (header) {
        gsap.set(header, { yPercent: -100, autoAlpha: 0, pointerEvents: 'none' });
      }

      const showCategoriesTitle = () => {
        categoriesTitle?.classList.add('is-visible');
      };

      const hideCategoriesTitle = () => {
        categoriesTitle?.classList.remove('is-visible');
      };

      galleryElement.classList.add('gallery--final');
      const flipState = Flip.getState(galleryItems);
      galleryElement.classList.remove('gallery--final');

      const flip = Flip.to(flipState, {
        simple: true,
        ease: 'expoScale(1, 5)'
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryElement,
          start: 'center center',
          end: '+=100%',
          scrub: true,
          pin: galleryElement.parentElement ?? undefined,
          onLeave: () => {
            if (header) {
              gsap.to(header, {
                yPercent: 0,
                autoAlpha: 1,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto',
                onStart: () => {
                  gsap.set(header, { pointerEvents: 'auto' });
                }
              });
            }

            showCategoriesTitle();
          },
          onEnterBack: () => {
            if (header) {
              gsap.to(header, {
                yPercent: -100,
                autoAlpha: 0,
                duration: 0.25,
                ease: 'power2.in',
                overwrite: 'auto',
                onComplete: () => {
                  gsap.set(header, { pointerEvents: 'none' });
                }
              });
            }

            hideCategoriesTitle();
          }
        }
      });

      const otherItems = Array.from(galleryItems).filter((_, index) => index !== 2);

      tl.add(flip)
        .to(otherItems, { opacity: 0, duration: 0.5 }, '<');

      ScrollTrigger.refresh();
      return () => gsap.set(galleryItems, { clearProps: 'all' });
    }, this.elementRef.nativeElement);
  }
}
