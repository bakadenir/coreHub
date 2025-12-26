import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import { common, createLowlight } from 'lowlight';
import { useEffect, useCallback, useState } from 'react';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
    autoFocus?: boolean;
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start writing...',
    editable = true,
    autoFocus = false,
}: RichTextEditorProps) {
    const [showTableMenu, setShowTableMenu] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Use CodeBlockLowlight instead
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-black underline',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-gray-300',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Youtube.configure({
                controls: true,
                nocookie: true,
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-lg my-4',
                },
            }),
        ],
        content,
        editable,
        autofocus: autoFocus ? 'end' : false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
            },
        },
    });

    // Update content when prop changes (e.g., switching notes)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Update editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addYoutubeVideo = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('YouTube URL');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    const insertTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        setShowTableMenu(false);
    }, [editor]);

    if (!editor) {
        return <div className="animate-pulse bg-gray-100 rounded h-48" />;
    }

    const ToolbarButton = ({
        onClick,
        isActive,
        icon,
        title,
        disabled,
    }: {
        onClick: () => void;
        isActive?: boolean;
        icon: string;
        title: string;
        disabled?: boolean;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="material-icons-outlined text-lg">{icon}</span>
        </button>
    );

    return (
        <div className="rich-text-editor">
            {/* Toolbar */}
            {editable && (
                <div className="flex items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-wrap">
                    {/* Text Formatting */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon="format_bold"
                        title="Bold (Ctrl+B)"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon="format_italic"
                        title="Italic (Ctrl+I)"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon="strikethrough_s"
                        title="Strikethrough"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        icon="code"
                        title="Inline Code"
                    />

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    {/* Headings */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon="title"
                        title="Heading 1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon="format_size"
                        title="Heading 2"
                    />

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon="format_list_bulleted"
                        title="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon="format_list_numbered"
                        title="Numbered List"
                    />

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    {/* Block Elements */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon="format_quote"
                        title="Quote"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        icon="data_object"
                        title="Code Block"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        icon="horizontal_rule"
                        title="Horizontal Rule"
                    />

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    {/* Link */}
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        icon="link"
                        title="Add Link"
                    />

                    {/* Table */}
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => setShowTableMenu(!showTableMenu)}
                            isActive={editor.isActive('table')}
                            icon="table_chart"
                            title="Table"
                        />
                        {showTableMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowTableMenu(false)} />
                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]">
                                    <button
                                        onClick={insertTable}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">add</span>
                                        Insert Table
                                    </button>
                                    {editor.isActive('table') && (
                                        <>
                                            <button
                                                onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <span className="material-icons-outlined text-base text-gray-400">view_column</span>
                                                Add Column
                                            </button>
                                            <button
                                                onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <span className="material-icons-outlined text-base text-gray-400">table_rows</span>
                                                Add Row
                                            </button>
                                            <button
                                                onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                            >
                                                <span className="material-icons-outlined text-base">remove</span>
                                                Delete Column
                                            </button>
                                            <button
                                                onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                            >
                                                <span className="material-icons-outlined text-base">remove</span>
                                                Delete Row
                                            </button>
                                            <button
                                                onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                            >
                                                <span className="material-icons-outlined text-base">delete</span>
                                                Delete Table
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* YouTube */}
                    <ToolbarButton
                        onClick={addYoutubeVideo}
                        icon="smart_display"
                        title="Embed YouTube"
                    />

                    <div className="flex-1" />

                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        icon="undo"
                        title="Undo (Ctrl+Z)"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        icon="redo"
                        title="Redo (Ctrl+Y)"
                    />
                </div>
            )}

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className={`px-4 py-3 ${editable ? 'bg-white border border-gray-200 border-t-0 rounded-b-xl' : ''}`}
            />

            {/* Styles */}
            <style>{`
                .rich-text-editor .ProseMirror {
                    outline: none;
                    min-height: 200px;
                }
                .rich-text-editor .ProseMirror.is-editor-empty:first-child::before {
                    color: #9ca3af;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .rich-text-editor .ProseMirror p {
                    margin: 0.25rem 0;
                }
                .rich-text-editor .ProseMirror h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin: 1rem 0 0.5rem;
                }
                .rich-text-editor .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.4rem;
                }
                .rich-text-editor .ProseMirror h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0.3rem;
                }
                .rich-text-editor .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.25rem 0;
                }
                .rich-text-editor .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.25rem 0;
                }
                .rich-text-editor .ProseMirror li {
                    margin: 0.125rem 0;
                }
                .rich-text-editor .ProseMirror blockquote {
                    border-left: 3px solid #e5e7eb;
                    padding-left: 1rem;
                    margin: 0.5rem 0;
                    color: #6b7280;
                }
                .rich-text-editor .ProseMirror code {
                    background: #f3f4f6;
                    color: #e11d48;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }
                .rich-text-editor .ProseMirror pre {
                    background: #1f2937;
                    color: #e5e7eb;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                    overflow-x: auto;
                }
                .rich-text-editor .ProseMirror pre code {
                    background: transparent;
                    color: inherit;
                    padding: 0;
                }
                .rich-text-editor .ProseMirror hr {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 1rem 0;
                }
                .rich-text-editor .ProseMirror a {
                    color: #18181b;
                    text-decoration: underline;
                }
                /* Table styles */
                .rich-text-editor .ProseMirror table {
                    border-collapse: collapse;
                    margin: 0.5rem 0;
                    width: 100%;
                }
                .rich-text-editor .ProseMirror th,
                .rich-text-editor .ProseMirror td {
                    border: 1px solid #e5e7eb;
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                    min-width: 100px;
                }
                .rich-text-editor .ProseMirror th {
                    background: #f9fafb;
                    font-weight: 600;
                }
                .rich-text-editor .ProseMirror .selectedCell {
                    background: #dbeafe;
                }
                /* YouTube embed */
                .rich-text-editor .ProseMirror iframe {
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                }
                .rich-text-editor .ProseMirror div[data-youtube-video] {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
