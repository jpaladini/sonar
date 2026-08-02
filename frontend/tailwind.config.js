/**
 * Design tokens from design/README.md, exposed as CSS variables in
 * src/index.css and consumed here. Only literal class strings appear in
 * components — the JIT sees every class (semantic color lookups go through
 * literal-string maps in src/ui.ts).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        panel2: 'var(--panel2)',
        raise: 'var(--raise)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        inv: 'var(--inv)',
        invtext: 'var(--invtext)',
        hover: 'var(--hover)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',
        track: 'var(--track)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        blinkdot: {
          '0%, 80%, 100%': { opacity: '.25' },
          '40%': { opacity: '1' },
        },
        fadeup: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        sping: {
          '0%': { transform: 'scale(.6)', opacity: '.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        wave: 'wave 1.2s ease-in-out infinite',
        'wave-fast': 'wave 1s ease-in-out infinite',
        blinkdot: 'blinkdot 1.2s infinite',
        'blinkdot-fast': 'blinkdot 1s infinite',
        fadeup: 'fadeup .3s ease',
        'fadeup-slow': 'fadeup .4s ease',
        'fadeup-fast': 'fadeup .2s ease',
        sping: 'sping 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
