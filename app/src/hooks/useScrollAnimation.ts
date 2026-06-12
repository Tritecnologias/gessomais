import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useFadeUpAnimation<T extends HTMLElement>(
  options: {
    delay?: number;
    duration?: number;
    y?: number;
    threshold?: number;
  } = {}
) {
  const ref = useRef<T>(null);
  const { delay = 0, duration = 0.8, y = 30, threshold = 0.15 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease: 'power3.out',
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [delay, duration, y, threshold]);

  return ref;
}

export function useStaggerFadeUp<T extends HTMLElement>(
  options: {
    childSelector: string;
    stagger?: number;
    duration?: number;
    y?: number;
    threshold?: number;
  }
) {
  const ref = useRef<T>(null);
  const { childSelector, stagger = 0.1, duration = 0.8, y = 30, threshold = 0.15 } = options;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(children, {
              opacity: 1,
              y: 0,
              duration,
              stagger,
              ease: 'power3.out',
            });
            observer.unobserve(container);
          }
        });
      },
      { threshold }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [childSelector, stagger, duration, y, threshold]);

  return ref;
}

export function useParallax<T extends HTMLElement>(
  options: {
    yPercent?: number;
  } = {}
) {
  const ref = useRef<T>(null);
  const { yPercent = 15 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.to(el, {
      yPercent: -yPercent,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [yPercent]);

  return ref;
}

export function useCountUpAnimation<T extends HTMLElement>(
  targetValue: number,
  options: {
    duration?: number;
    suffix?: string;
    threshold?: number;
  } = {}
) {
  const ref = useRef<T>(null);
  const { duration = 2.5, suffix = '', threshold = 0.3 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(obj, {
              value: targetValue,
              duration,
              ease: 'power2.out',
              onUpdate: () => {
                if (el) {
                  const formatted = Math.floor(obj.value).toLocaleString('pt-BR');
                  el.textContent = formatted + suffix;
                }
              },
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [targetValue, duration, suffix, threshold]);

  return ref;
}
