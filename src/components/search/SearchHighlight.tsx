'use client';

interface SearchHighlightProps {
  text: string;
  searchTerm?: string;
  className?: string;
}

export function SearchHighlight({ text, searchTerm, className = '' }: SearchHighlightProps) {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const startIndex = lowerText.indexOf(lowerSearchTerm);

  if (startIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  const endIndex = startIndex + searchTerm.length;
  const before = text.substring(0, startIndex);
  const match = text.substring(startIndex, endIndex);
  const after = text.substring(endIndex);

  return (
    <span className={className}>
      {before}
      <mark className="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded">
        {match}
      </mark>
      {after}
    </span>
  );
}