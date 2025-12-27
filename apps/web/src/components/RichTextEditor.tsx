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
import { useEffect, useCallback, useState, useRef } from 'react';

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
    const [showInsertMenu, setShowInsertMenu] = useState(false);
    const [showBlockMenu, setShowBlockMenu] = useState(false);

    // Floating toolbar state
    const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
    const [floatingToolbarPos, setFloatingToolbarPos] = useState({ top: 0, left: 0 });

    // Block handle state
    const [blockHandlePos, setBlockHandlePos] = useState({ top: 0, visible: false });

    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorWrapperRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
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
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;
            const hasSelection = from !== to;

            if (hasSelection && editorContainerRef.current) {
                const { view } = editor;
                const start = view.coordsAtPos(from);
                const end = view.coordsAtPos(to);
                const containerRect = editorContainerRef.current.getBoundingClientRect();
                const left = ((start.left + end.left) / 2) - containerRect.left;
                const top = start.top - containerRect.top - 50;

                setFloatingToolbarPos({
                    top: Math.max(10, top),
                    left: Math.max(10, Math.min(left, containerRect.width - 200))
                });
                setShowFloatingToolbar(true);
            } else {
                setShowFloatingToolbar(false);
            }

            updateBlockHandlePosition();
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
                spellcheck: 'false',
            },
        },
    });

    // Update block handle position
    const updateBlockHandlePosition = useCallback(() => {
        if (!editorWrapperRef.current || !editor) return;

        try {
            const { view, state } = editor;
            const { $from } = state.selection;

            const depth = $from.depth > 0 ? $from.depth : 1;
            const blockStart = $from.start(depth);
            const coords = view.coordsAtPos(blockStart);
            const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

            setBlockHandlePos({
                top: coords.top - wrapperRect.top,
                visible: true,
            });
        } catch {
            setBlockHandlePos({ top: 0, visible: false });
        }
    }, [editor]);

    // Update content when prop changes
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

    // Hide floating toolbar on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setTimeout(() => {
                if (editor && !editor.state.selection.empty) return;
                setShowFloatingToolbar(false);
            }, 100);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editor]);

    // Update block handle on transactions
    useEffect(() => {
        if (!editor) return;

        const handleTransaction = () => {
            updateBlockHandlePosition();
        };

        editor.on('transaction', handleTransaction);
        return () => {
            editor.off('transaction', handleTransaction);
        };
    }, [editor, updateBlockHandlePosition]);

    // Add new block below
    const addBlockBelow = useCallback(() => {
        if (!editor) return;

        const { state } = editor;
        const { $from } = state.selection;
        const endPos = $from.end($from.depth);

        editor
            .chain()
            .focus()
            .setTextSelection(endPos)
            .splitBlock()
            .run();

        setShowBlockMenu(false);
    }, [editor]);

    // Move block up
    const moveBlockUp = useCallback(() => {
        if (!editor) return;
        setShowBlockMenu(false);

        try {
            const { state } = editor;
            const { $from } = state.selection;

            // Get block boundaries
            const blockStart = $from.start() - 1;
            const blockEnd = $from.end() + 1;

            // Check if we can move up
            if (blockStart <= 0) return;

            // Get the node to move
            const nodeToMove = state.doc.nodeAt(blockStart);
            if (!nodeToMove) return;

            // Find previous block start
            const $prev = state.doc.resolve(blockStart - 1);
            const prevBlockStart = $prev.start() - 1;

            // Copy node as JSON, delete, then insert at new position
            const nodeJSON = nodeToMove.toJSON();

            editor.chain()
                .focus()
                .deleteRange({ from: blockStart, to: blockEnd })
                .insertContentAt(prevBlockStart, nodeJSON)
                .setTextSelection(prevBlockStart + 1)
                .run();
        } catch (e) {
            console.error('Move up failed:', e);
        }
    }, [editor]);

    // Move block down
    const moveBlockDown = useCallback(() => {
        if (!editor) return;
        setShowBlockMenu(false);

        try {
            const { state } = editor;
            const { $from } = state.selection;

            // Get block boundaries  
            const blockStart = $from.start() - 1;
            const blockEnd = $from.end() + 1;

            // Check if we can move down
            if (blockEnd >= state.doc.content.size) return;

            // Get the node to move
            const nodeToMove = state.doc.nodeAt(blockStart);
            if (!nodeToMove) return;

            // Find next block end
            const $next = state.doc.resolve(blockEnd + 1);
            const nextBlockEnd = $next.end() + 1;

            // Copy node as JSON
            const nodeJSON = nodeToMove.toJSON();

            // Delete current block first, then insert after next block
            // After deleting, nextBlockEnd position shifts by the size of deleted content
            const adjustedInsertPos = nextBlockEnd - (blockEnd - blockStart);

            editor.chain()
                .focus()
                .deleteRange({ from: blockStart, to: blockEnd })
                .insertContentAt(adjustedInsertPos, nodeJSON)
                .setTextSelection(adjustedInsertPos + 1)
                .run();
        } catch (e) {
            console.error('Move down failed:', e);
        }
    }, [editor]);

    // Delete current block
    const deleteBlock = useCallback(() => {
        if (!editor) return;

        const { state } = editor;
        const { $from } = state.selection;

        const depth = $from.depth > 0 ? $from.depth : 1;
        const blockStart = $from.start(depth) - 1;
        const blockEnd = $from.end(depth) + 1;

        editor.chain()
            .focus()
            .deleteRange({ from: blockStart, to: blockEnd })
            .run();

        setShowBlockMenu(false);
    }, [editor]);

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
        setShowInsertMenu(false);
    }, [editor]);

    const insertTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        setShowInsertMenu(false);
    }, [editor]);

    if (!editor) {
        return <div className="animate-pulse bg-gray-100 rounded h-48" />;
    }

    // Floating Toolbar Button
    const FloatingButton = ({
        onClick,
        isActive,
        icon,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        icon: string;
        title: string;
    }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-200'}`}
        >
            <span className="material-icons-outlined text-base">{icon}</span>
        </button>
    );

    // Static toolbar button
    const ToolbarButton = ({
        onClick,
        icon,
        title,
        isActive,
    }: {
        onClick: () => void;
        icon: string;
        title: string;
        isActive?: boolean;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
        >
            <span className="material-icons-outlined text-lg">{icon}</span>
        </button>
    );

    return (
        <div className="rich-text-editor" ref={editorContainerRef}>
            {/* Floating Toolbar - appears when text is selected */}
            {editable && showFloatingToolbar && (
                <div
                    className="absolute z-50 flex items-center gap-0.5 bg-gray-900 rounded-xl shadow-2xl px-2 py-1.5 animate-fade-in"
                    style={{
                        top: floatingToolbarPos.top,
                        left: floatingToolbarPos.left,
                        transform: 'translateX(-50%)'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon="format_bold"
                        title="Bold"
                    />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon="format_italic"
                        title="Italic"
                    />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon="strikethrough_s"
                        title="Strikethrough"
                    />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        icon="code"
                        title="Code"
                    />
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    <FloatingButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        icon="link"
                        title="Link"
                    />
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon="title"
                        title="Heading 1"
                    />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon="format_size"
                        title="Heading 2"
                    />
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon="format_list_bulleted"
                        title="Bullet List"
                    />
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon="format_quote"
                        title="Quote"
                    />
                </div>
            )}

            {/* Mini Toolbar */}
            {editable && (
                <div className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-100">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowInsertMenu(!showInsertMenu)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm"
                        >
                            <span className="material-icons-outlined text-lg">add</span>
                            <span>Insert</span>
                        </button>
                        {showInsertMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowInsertMenu(false)} />
                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[180px]">
                                    <button
                                        onClick={() => { editor.chain().focus().setHorizontalRule().run(); setShowInsertMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">horizontal_rule</span>
                                        Horizontal Line
                                    </button>
                                    <button
                                        onClick={insertTable}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">table_chart</span>
                                        Table
                                    </button>
                                    <button
                                        onClick={addYoutubeVideo}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">smart_display</span>
                                        YouTube Video
                                    </button>
                                    <button
                                        onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setShowInsertMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">data_object</span>
                                        Code Block
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {editor.isActive('table') && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowTableMenu(!showTableMenu)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm"
                            >
                                <span className="material-icons-outlined text-lg">table_chart</span>
                                <span>Table</span>
                            </button>
                            {showTableMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowTableMenu(false)} />
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]">
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
                                        <div className="border-t border-gray-100 my-1" />
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
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex-1" />

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

            {/* Editor Content with Block Handles */}
            <div className="relative" ref={editorWrapperRef}>
                {/* Block Handles */}
                {editable && blockHandlePos.visible && (
                    <div
                        className="absolute left-1 z-10 flex items-center gap-0.5 block-handle"
                        style={{ top: blockHandlePos.top }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {/* Plus button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addBlockBelow();
                            }}
                            className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Add block below"
                        >
                            <span className="material-icons-outlined text-[16px]">add</span>
                        </button>

                        {/* Block menu button (drag indicator that opens menu) */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowBlockMenu(!showBlockMenu);
                                }}
                                className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Block options"
                            >
                                <span className="material-icons-outlined text-[16px]">drag_indicator</span>
                            </button>

                            {/* Block menu dropdown */}
                            {showBlockMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowBlockMenu(false)} />
                                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                                        <button
                                            onClick={moveBlockUp}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <span className="material-icons-outlined text-base text-gray-400">arrow_upward</span>
                                            Move Up
                                        </button>
                                        <button
                                            onClick={moveBlockDown}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <span className="material-icons-outlined text-base text-gray-400">arrow_downward</span>
                                            Move Down
                                        </button>
                                        <div className="border-t border-gray-100 my-1" />
                                        <button
                                            onClick={deleteBlock}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                        >
                                            <span className="material-icons-outlined text-base">delete</span>
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <EditorContent
                    editor={editor}
                    className={`${editable ? 'bg-white rounded-xl editor-with-handles' : ''}`}
                />
            </div>

            {/* Styles */}
            <style>{`
                .rich-text-editor {
                    position: relative;
                }
                .rich-text-editor .ProseMirror {
                    outline: none;
                    min-height: 200px;
                    padding: 1rem 1rem 1rem 3rem;
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
                .rich-text-editor .ProseMirror iframe {
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                }
                .rich-text-editor .ProseMirror div[data-youtube-video] {
                    cursor: pointer;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateX(-50%) translateY(5px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.15s ease-out;
                }
                .block-handle {
                    opacity: 0.4;
                    transition: opacity 0.15s ease;
                }
                .block-handle:hover,
                .editor-with-handles:hover .block-handle {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
