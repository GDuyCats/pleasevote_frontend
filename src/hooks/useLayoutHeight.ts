'use client';

import { useEffect, useRef } from 'react';

export default function useLayoutHeight(property: '--app-header-height' | '--mobile-nav-height') {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const style = document.documentElement.style;
    const previous = style.getPropertyValue(property);
    const measure = () => {
      const height = element.getBoundingClientRect().height;
      if (height > 0) style.setProperty(property, height + 'px');
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      if (previous) style.setProperty(property, previous);
      else style.removeProperty(property);
    };
  }, [property]);

  return ref;
}
