import { useEffect, useRef } from 'react';

const NAVY_COLOR = '#1a2744';
const BACKGROUND_COLOR = '#f5f7fa';

/**
 * Dynamically updates the theme-color meta tag based on scroll position.
 * When at top (within hero area), status bar matches heroColor.
 * When scrolled past, switches to scrolledColor (page background).
 */
export function useThemeColor(
  heroRef?: React.RefObject<HTMLElement | null>,
  heroColor: string = NAVY_COLOR,
  scrolledColor: string = BACKGROUND_COLOR
) {
  const currentColor = useRef(heroColor);

  useEffect(() => {
    const meta = document.getElementById('theme-color-meta') as HTMLMetaElement | null;
    if (!meta) return;

    // If no ref provided, just set a static color
    if (!heroRef) {
      meta.setAttribute('content', heroColor);
      return () => { meta.setAttribute('content', NAVY_COLOR); };
    }

    const updateColor = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      const newColor = heroBottom > 0 ? heroColor : scrolledColor;
      if (newColor !== currentColor.current) {
        currentColor.current = newColor;
        meta.setAttribute('content', newColor);
      }
    };

    meta.setAttribute('content', heroColor);
    updateColor();

    window.addEventListener('scroll', updateColor, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateColor);
      meta.setAttribute('content', NAVY_COLOR);
    };
  }, [heroRef, heroColor, scrolledColor]);
}
