import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-text',
  order: 50,
  name: 'Text',
  group: 'Utilities',
  summary: 'Font family, size, style and weight; line height and tracking; alignment; decoration and underline offset; link colors and underline opacity; transformation; wrapping and word breaking; vertical alignment.',
  examples: [
    {
      name: 'text-basic',
      title: 'Type utilities',
    },
    {
      name: 'text-links',
      title: 'Link utilities',
    },
  ],
  reference: [
    {
      title: 'Text classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-font-{sans,display,mono}', 'Font family tokens.'],
        ['.os-text-{xs,sm,base,lg,xl,2xl,3xl,4xl,5xl}', 'Fluid font sizes (responsive).'],
        ['.os-italic, .os-not-italic', 'Font style.'],
        ['.os-font-{light,normal,medium,semibold,bold,extrabold,black,bolder,lighter}', 'Font weight.'],
        ['.os-leading-{none,tight,snug,normal,relaxed,loose}', 'Line height.'],
        ['.os-tracking-{tight,normal,wide,wider}', 'Letter spacing.'],
        ['.os-text-{start,center,end,left,right,justify}', 'Alignment (responsive).'],
        ['.os-underline, .os-line-through, .os-no-underline', 'Decoration line.'],
        ['.os-underline-offset-{auto,1,2,3}', 'Underline offset.'],
        ['.os-link-{color,body,muted}', 'Link color (and underline color).'],
        [
          '.os-link-underline-{color}, .os-link-underline-opacity-{0,10,25,50,75,100}',
          'Underline color and opacity; combine freely.',
        ],
        ['.os-text-{upper,lower,capitalize,normal-case}', 'Transformation.'],
        [
          '.os-text-{wrap,nowrap,balance,pretty,break}, .os-break-{all,keep}, .os-truncate',
          'Wrapping and breaking.',
        ],
        [
          '.os-align-{baseline,top,middle,bottom,text-top,text-bottom,sub,super}',
          'Vertical alignment (inline and table cells).',
        ],
      ],
    },
  ],
  a11y: [
    'Links inside running text must stay underlined or otherwise distinguishable without color (1.4.1); only drop the underline on standalone links such as navigation.',
    'Avoid long runs of uppercase, italic or justified text: they are harder to read (1.4.8).',
    'Keep text resizable: sizes are rem-based, so do not fix heights on text containers.',
  ],
};

export default doc;
