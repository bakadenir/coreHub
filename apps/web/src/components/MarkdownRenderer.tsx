import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDefList from 'remark-definition-list';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
});

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    node?: any;
}

// Mermaid diagram component
function MermaidDiagram({ code }: { code: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const renderDiagram = async () => {
            if (!code) return;
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, code);
                setSvg(svg);
                setError('');
            } catch (err) {
                setError('Failed to render diagram');
                console.error('Mermaid error:', err);
            }
        };
        renderDiagram();
    }, [code]);

    if (error) {
        return (
            <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {error}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="my-3 flex justify-center overflow-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

function CodeBlock({ inline, className, children, node }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const language = match ? match[1] : '';

    // Check if it's a code block
    const isCodeBlock = !inline && (node?.position?.start?.line !== node?.position?.end?.line || match);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Mermaid diagram
    if (language === 'mermaid') {
        return <MermaidDiagram code={codeString} />;
    }

    // Code block (with or without language)
    if (isCodeBlock) {
        return (
            <div className="relative group my-3">
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1 rounded bg-[#fdfdfd]/80 hover:bg-[#fdfdfd] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Copy code"
                >
                    <span className="material-icons-outlined text-xs text-gray-500">
                        {copied ? 'check' : 'content_copy'}
                    </span>
                </button>
                <SyntaxHighlighter
                    style={oneLight}
                    language={language || 'text'}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        fontSize: '0.8125rem',
                        background: '#f7f7f7',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        boxShadow: 'none',
                        overflow: 'auto',
                        lineHeight: '1.5',
                    }}
                    codeTagProps={{
                        style: {
                            background: 'transparent',
                            border: 'none',
                        }
                    }}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        );
    }

    // Inline code - gray background, red text, thin font
    return (
        <code className="bg-gray-100 text-rose-600 px-1 py-0.5 rounded-sm text-[13px] font-normal">
            {children}
        </code>
    );
}

// Custom image component
function ImageComponent({ src, alt }: { src?: string; alt?: string }) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className="my-2 p-3 bg-gray-100 rounded text-gray-500 text-sm text-center">
                📷 {alt || 'Image failed to load'}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt || ''}
            onError={() => setError(true)}
            className="my-2 max-w-full h-auto rounded"
        />
    );
}

// Custom list item for task lists
function ListItemComponent({ children, node, ...props }: any) {
    const isTaskItem = node?.children?.[0]?.tagName === 'input';
    const isChecked = node?.children?.[0]?.properties?.checked;

    return (
        <li className={`${isTaskItem && isChecked ? 'line-through text-gray-400' : ''}`} {...props}>
            {children}
        </li>
    );
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`markdown-body ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDefList]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code: CodeBlock as any,
                    pre: ({ children }) => <>{children}</>,
                    img: ImageComponent as any,
                    li: ListItemComponent as any,
                }}
            >
                {content}
            </ReactMarkdown>
            <style>{`
                .markdown-body {
                    font-size: 15px;
                    line-height: 1.6;
                    color: #37352f;
                }
                .markdown-body > *:first-child { margin-top: 0; }
                .markdown-body > *:last-child { margin-bottom: 0; }
                
                /* Headings - compact spacing */
                .markdown-body h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin: 1.25rem 0 0.5rem;
                    line-height: 1.3;
                }
                .markdown-body h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1rem 0 0.4rem;
                    line-height: 1.3;
                }
                .markdown-body h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0.875rem 0 0.35rem;
                    line-height: 1.4;
                }
                .markdown-body h4,
                .markdown-body h5,
                .markdown-body h6 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.25rem;
                    line-height: 1.4;
                }
                
                /* Paragraphs - tight spacing */
                .markdown-body p {
                    margin: 0.25rem 0;
                }
                
                /* Lists - compact with proper markers */
                .markdown-body ul {
                    margin: 0.25rem 0;
                    padding-left: 1.5rem;
                    list-style-type: disc;
                }
                .markdown-body ol {
                    margin: 0.25rem 0;
                    padding-left: 1.5rem;
                    list-style-type: decimal;
                }
                .markdown-body ul ul {
                    list-style-type: circle;
                }
                .markdown-body ul ul ul {
                    list-style-type: square;
                }
                .markdown-body li {
                    margin: 0.125rem 0;
                    display: list-item;
                }
                .markdown-body li > ul,
                .markdown-body li > ol {
                    margin: 0.125rem 0;
                }
                
                /* Blockquote */
                .markdown-body blockquote {
                    margin: 0.5rem 0;
                    padding: 0.25rem 0 0.25rem 1rem;
                    border-left: 3px solid #e5e5e5;
                    color: #6b7280;
                }
                .markdown-body blockquote p { margin: 0.125rem 0; }
                
                /* Horizontal rule */
                .markdown-body hr {
                    margin: 1rem 0;
                    border: none;
                    border-top: 1px solid #e5e5e5;
                }
                
                /* Tables - compact */
                .markdown-body table {
                    margin: 0.5rem 0;
                    border-collapse: collapse;
                    font-size: 14px;
                    width: 100%;
                }
                .markdown-body th,
                .markdown-body td {
                    padding: 0.4rem 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: left;
                }
                .markdown-body th {
                    background: #f9fafb;
                    font-weight: 500;
                }
                
                /* Links */
                .markdown-body a {
                    color: #18181b;
                    text-decoration: underline;
                }
                .markdown-body a:hover {
                    color: #000;
                }
                
                /* Strong/Bold */
                .markdown-body strong { font-weight: 600; }
                
                /* Strikethrough */
                .markdown-body del { color: #9ca3af; }
                
                /* Task list */
                .markdown-body input[type="checkbox"] {
                    margin-right: 0.4rem;
                    width: 14px;
                    height: 14px;
                    accent-color: #2563eb;
                }
                .markdown-body li:has(input[type="checkbox"]) {
                    list-style: none;
                    margin-left: -1.5rem;
                }
                
                /* Definition list */
                .markdown-body dl {
                    margin: 0.5rem 0;
                }
                .markdown-body dt {
                    font-weight: 600;
                    margin-top: 0.5rem;
                }
                .markdown-body dd {
                    margin-left: 0;
                    padding-left: 1rem;
                    color: #6b7280;
                    border-left: 2px solid #e5e5e5;
                }
            `}</style>
        </div>
    );
}
