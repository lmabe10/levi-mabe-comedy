import { Fragment, type ReactNode } from 'react';

/** Render headlines with newlines and *italic* segments. */
export function renderHeadline(text: string): ReactNode {
  return text.split('\n').map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 ? <br /> : null}
      {line.split(/(\*[^*]+\*)/g).map((part, partIndex) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return <em key={partIndex}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={partIndex}>{part}</Fragment>;
      })}
    </Fragment>
  ));
}
