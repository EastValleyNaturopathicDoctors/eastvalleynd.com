/**
 * Cloudflare Turnstile in the browser, for the appointment and contact forms
 * (the e-book card in Resources.astro has its own copy of the same steps).
 * The script loads once, on demand; each form renders its own widget, gets a
 * single-use token per submission, and resets the widget after a try.
 * https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */
type Api = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  getResponse: (id: string) => string | undefined;
  reset: (id: string) => void;
};
const w = window as unknown as { turnstile?: Api };
let loading: Promise<void> | undefined;

const load = () =>
  (loading ??= new Promise<void>((done) => {
    if (w.turnstile) return done();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => done();
    s.onerror = () => done();
    document.head.append(s);
  }));

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Renders a widget in `slot`; returns a way to get a token and to reset. */
export async function widget(slot: HTMLElement, sitekey: string, action: string) {
  await load();
  const id = w.turnstile?.render(slot, { sitekey, action, appearance: 'interaction-only', size: 'flexible' });
  return {
    /** The token, waiting up to 8 s for one; '' if Turnstile didn't load. */
    async token() {
      if (!w.turnstile || id === undefined) return '';
      for (let i = 0; i < 40; i++) {
        const t = w.turnstile.getResponse(id);
        if (t) return t;
        await wait(200);
      }
      return '';
    },
    reset() {
      if (w.turnstile && id !== undefined) w.turnstile.reset(id);
    },
  };
}
