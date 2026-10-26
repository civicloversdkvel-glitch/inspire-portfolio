import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  const formatInline = (text: string) => {
    // Bold with **
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Inline code with `
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200 text-blue-900 font-mono text-xs font-bold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base sm:text-lg font-black text-blue-950 mt-4 mb-2 pb-1 border-b border-slate-200">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-sm sm:text-base font-extrabold text-blue-900 mt-3 mb-1.5">
          {line.replace('#### ', '')}
        </h4>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      const cleanBullet = line.replace(/^[\*\-]\s+/, '');
      elements.push(
        <div key={i} className="flex items-start gap-2.5 my-1 ml-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
          <div>{formatInline(cleanBullet)}</div>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={i} className="flex items-start gap-2.5 my-1.5 ml-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="font-extrabold text-blue-900 text-xs shrink-0 w-4">{numMatch[1]}.</span>
            <div>{formatInline(numMatch[2])}</div>
          </div>
        );
      }
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-2 p-3 rounded-xl bg-blue-50 border-l-4 border-blue-600 text-xs sm:text-sm text-blue-950 italic">
          {formatInline(line.replace('> ', ''))}
        </blockquote>
      );
    } else {
      elements.push(
        <p key={i} className="my-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    }
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
