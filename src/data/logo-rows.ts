/**
 * Hand-kept (not generated): partner logos a migrated body stacks one under
 * another, at whatever size each file happens to be, gathered into one row of
 * equal tiles (src/lib/logorow.ts). Each file is named by its company, which
 * becomes its alt text. `top` puts the page's own top image (also a partner
 * logo) first in the row, in place of the small inset it took beside the
 * opening text.
 *
 * The permanent fix belongs in the content pipeline; an entry here can go once
 * the generated body lays its logos out itself.
 */
export type LogoRow = { label: string; top?: string; logos: Record<string, string> };

export const logoRows: Record<string, LogoRow> = {
  '/specialty-labs/': {
    label: 'Our lab partners',
    top: 'IGeneX',
    logos: {
      '2024-12-Mosaic.jpg': 'Mosaic Diagnostics',
      '2024-12-RTL.jpg': 'RealTime Laboratories',
      '2024-12-th-1.jpg': 'US BioTek Laboratories',
      '2024-12-DD2.jpg': "Doctor's Data",
    },
  },
};
