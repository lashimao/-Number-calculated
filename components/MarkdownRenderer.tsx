import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-academic prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-indigo-900 prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
           // Customizing blockquotes to look like notes/tips
           blockquote: ({node, ...props}) => (
               <blockquote className="border-l-4 border-primary bg-blue-50 p-4 my-4 italic rounded-r text-slate-700" {...props} />
           )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;