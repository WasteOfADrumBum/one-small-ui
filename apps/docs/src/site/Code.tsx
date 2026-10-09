import { Highlight } from 'prism-react-renderer';
import { CodeBlock, type CodeBlockProps } from 'onesmallui';

/** Prism highlighting rendered with classes; colors come from AAA-checked theme tokens in site.scss. */
export function highlight(code: string, language = 'tsx') {
  return (
    <Highlight code={code} language={language === 'ts' ? 'typescript' : language}>
      {({ tokens, getTokenProps }) =>
        tokens.map((line, i) => (
          <span key={i} className="line" style={{ display: 'block' }}>
            {line.map((token, j) => {
              const { className, children } = getTokenProps({ token });
              return (
                <span key={j} className={className}>
                  {children}
                </span>
              );
            })}
          </span>
        ))
      }
    </Highlight>
  );
}

export function Code({ language = 'tsx', ...rest }: CodeBlockProps) {
  return <CodeBlock language={language} renderCode={(c, l) => highlight(c, l)} {...rest} />;
}
