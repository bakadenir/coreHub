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
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useCallback, useState, useRef, memo, useLayoutEffect } from 'react';

const lowlight = createLowlight(common);

// Floating Toolbar Button - moved outside to prevent re-creation on each render
interface FloatingButtonProps {
    onClick: () => void;
    isActive?: boolean;
    icon: string;
    title: string;
}

const FloatingButton = memo(({ onClick, isActive, icon, title }: FloatingButtonProps) => (
    <button
        type="button"
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }}
        title={title}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-[#fdfdfd]/20 text-white' : 'text-white/80 hover:text-white hover:bg-[#fdfdfd]/10'}`}
    >
        <span className="material-icons-outlined text-base">{icon}</span>
    </button>
));
FloatingButton.displayName = 'FloatingButton';

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
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const [showListMenu, setShowListMenu] = useState(false);
    const [showInsertFloating, setShowInsertFloating] = useState(false);
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');

    // Floating toolbar state
    const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
    const [floatingToolbarPos, setFloatingToolbarPos] = useState({ top: 0, left: 0 });

    // Block handle state
    const [blockHandlePos, setBlockHandlePos] = useState({ top: 0, visible: false });
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    // Table button position state
    const [tableButtonPos, setTableButtonPos] = useState({ top: 0, left: 0, visible: false });

    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorWrapperRef = useRef<HTMLDivElement>(null);

    // Preset colors for the color picker
    const presetColors = [
        { name: 'Default', color: '' },
        { name: 'Red', color: '#ef4444' },
        { name: 'Orange', color: '#f97316' },
        { name: 'Yellow', color: '#eab308' },
        { name: 'Green', color: '#22c55e' },
        { name: 'Blue', color: '#3b82f6' },
        { name: 'Purple', color: '#a855f7' },
        { name: 'Pink', color: '#ec4899' },
        { name: 'Gray', color: '#6b7280' },
    ];

    // Preset colors for highlight (background)
    const highlightColors = [
        { name: 'None', color: '' },
        { name: 'Yellow', color: '#fef08a' },
        { name: 'Green', color: '#bbf7d0' },
        { name: 'Blue', color: '#bfdbfe' },
        { name: 'Purple', color: '#e9d5ff' },
        { name: 'Pink', color: '#fbcfe8' },
        { name: 'Orange', color: '#fed7aa' },
        { name: 'Red', color: '#fecaca' },
        { name: 'Gray', color: '#e5e7eb' },
    ];

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                link: false, // Disable default link to use custom Link extension
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
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
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

            // Reset all dropdown states when selection changes
            setShowColorPicker(false);
            setShowHighlightPicker(false);
            setShowLinkInput(false);
            setShowHeadingMenu(false);
            setShowInsertFloating(false);

            if (hasSelection) {
                // Hide toolbar during selection updates (dragging)
                // It will be shown on mouseup/keyup via the event listeners
                setShowFloatingToolbar(false);
            } else {
                setShowFloatingToolbar(false);
            }

            // Update table button position
            if (editor.isActive('table') && editorWrapperRef.current) {
                const tableNode = editorWrapperRef.current.querySelector('table');
                if (tableNode) {
                    const tableRect = tableNode.getBoundingClientRect();
                    const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
                    setTableButtonPos({
                        top: tableRect.top - wrapperRect.top,
                        left: tableRect.right - wrapperRect.left + 16,
                        visible: true
                    });
                }
            } else {
                setTableButtonPos(prev => ({ ...prev, visible: false }));
                setShowTableMenu(false);
            }

            updateBlockHandlePosition();
        },
        editorProps: {
            attributes: {
                class: 'prose prose-base max-w-none focus:outline-none min-h-[200px]',
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
            const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

            // Check if selection is inside a table
            let tableNode = null;
            let tablePos = -1;

            for (let d = $from.depth; d > 0; d--) {
                const node = $from.node(d);
                if (node.type.name === 'table') {
                    tableNode = node;
                    tablePos = $from.before(d);
                    break;
                }
            }

            if (tableNode && tablePos !== -1) {
                const nodeDOM = view.nodeDOM(tablePos) as HTMLElement;
                if (nodeDOM && nodeDOM.getBoundingClientRect) {
                    const rect = nodeDOM.getBoundingClientRect();
                    setBlockHandlePos({
                        top: rect.top - wrapperRect.top + 2,
                        visible: true,
                    });
                    return;
                }
            }

            // Use cursor position for accurate placement
            const coords = view.coordsAtPos($from.pos);
            setBlockHandlePos({
                top: coords.top - wrapperRect.top,
                visible: true,
            });
        } catch {
            setBlockHandlePos({ top: 0, visible: false });
        }
    }, [editor]);

    // NOTE: We removed the content sync effect that was causing bugs.
    // Instead, use `key` prop on RichTextEditor to force re-mount when switching notes.
    // This prevents race conditions where edited content gets overwritten.

    // Update editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    // Hide floating toolbar on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Check if the click is inside any of our custom popups/inputs
            // The refs might not be enough if we use portals or fixed positioning, but here we can try 
            // to relying on the selection check or timeouts.

            // Actually, we should just close everything if the click is outside the editor
            // and the selection is empty. But wait, if I click the Toolbar itself, I don't want to close it.
            // The e.target check is tricky with React portals or conditional rendering.

            // Simple approach: if selection is empty, close everything.
            // But waiting for 100ms allows selection to update on click.

            if (
                editorContainerRef.current &&
                !editorContainerRef.current.contains(e.target as Node)
            ) {
                // FORCE CLOSE everything if clicked outside the editor container
                // This handles the case where text is selected but user clicks away
                setShowFloatingToolbar(false);
                setShowLinkInput(false);
                setShowYoutubeInput(false);
                setShowHeadingMenu(false);
                setShowListMenu(false);
                setShowColorPicker(false);
                setShowHighlightPicker(false);
                setShowInsertFloating(false);
            }
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

        return () => {
            editor.off('transaction', handleTransaction);
        };
    }, [editor, updateBlockHandlePosition]);

    // Handle floating toolbar visibility on interaction end
    useEffect(() => {
        if (!editor) return;

        const updateToolbarState = () => {
            const { selection } = editor.state;
            const { from, to, empty } = selection;

            if (!empty && from !== to && editorContainerRef.current) {
                const { view } = editor;
                const start = view.coordsAtPos(from);
                const end = view.coordsAtPos(to);
                const containerRect = editorContainerRef.current.getBoundingClientRect();
                const left = ((start.left + end.left) / 2) - containerRect.left;

                // Calculate position - show above selection by default
                let top = start.top - containerRect.top - 60;

                // If not enough space above, show below the selection
                if (top < 10) {
                    top = end.bottom - containerRect.top + 10;
                }

                setFloatingToolbarPos({
                    top: top,
                    left: Math.max(10, Math.min(left, containerRect.width - 200))
                });
                setShowFloatingToolbar(true);
            } else {
                setShowFloatingToolbar(false);
            }
        };

        // We use mouseup and keyup to detect "finished" selection
        const dom = editor.view.dom;
        dom.addEventListener('mouseup', updateToolbarState);
        dom.addEventListener('keyup', updateToolbarState);

        return () => {
            dom.removeEventListener('mouseup', updateToolbarState);
            dom.removeEventListener('keyup', updateToolbarState);
        };
    }, [editor]);

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

            let blockStart = $from.start() - 1;
            let blockEnd = $from.end() + 1;

            // Check if inside table and adjust block boundaries to include entire table
            for (let d = $from.depth; d > 0; d--) {
                const node = $from.node(d);
                if (node.type.name === 'table') {
                    blockStart = $from.before(d);
                    blockEnd = $from.after(d);
                    break;
                }
            }

            // Check if we can move up
            if (blockStart <= 0) return;

            // Get the node to move
            const nodeToMove = state.doc.nodeAt(blockStart);
            if (!nodeToMove) return;

            // Use index-based logic to find previous sibling
            const $pos = state.doc.resolve(blockStart);
            const index = $pos.index();

            if (index === 0) return; // First child, cannot move up

            const prevSibling = $pos.parent.child(index - 1);
            if (!prevSibling) return;

            const targetPos = blockStart - prevSibling.nodeSize;

            // Copy node as JSON, delete, then insert at new position
            const nodeJSON = nodeToMove.toJSON();

            editor.chain()
                .focus()
                .deleteRange({ from: blockStart, to: blockEnd })
                .insertContentAt(targetPos, nodeJSON)
                .setTextSelection(targetPos + 1)
                .scrollIntoView()
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

            let blockStart = $from.start() - 1;
            let blockEnd = $from.end() + 1;

            // Check if inside table and adjust block boundaries to include entire table
            for (let d = $from.depth; d > 0; d--) {
                const node = $from.node(d);
                if (node.type.name === 'table') {
                    blockStart = $from.before(d);
                    blockEnd = $from.after(d);
                    break;
                }
            }

            const nodeToMove = state.doc.nodeAt(blockStart);
            if (!nodeToMove) return;

            // Use index-based logic to find next sibling
            const $pos = state.doc.resolve(blockStart);
            const index = $pos.index();

            if (index >= $pos.parent.childCount - 1) return; // Last child, cannot move down

            const nextSibling = $pos.parent.child(index + 1);
            if (!nextSibling) return;

            // We want to move AFTER the next sibling.
            // Target position calculation:
            // Current End + Next Sibling Size - Moved Node Size (because we delete it first)
            const targetPos = blockEnd + nextSibling.nodeSize - nodeToMove.nodeSize;

            // Copy node as JSON
            const nodeJSON = nodeToMove.toJSON();

            editor.chain()
                .focus()
                .deleteRange({ from: blockStart, to: blockEnd })
                .insertContentAt(targetPos, nodeJSON)
                .setTextSelection(targetPos + 1)
                .scrollIntoView()
                .run();
        } catch (e) {
            console.error('Move down failed:', e);
        }
    }, [editor]);

    // Duplicate current block
    const duplicateBlock = useCallback(() => {
        if (!editor) return;
        setShowBlockMenu(false);

        try {
            const { state } = editor;
            const { $from } = state.selection;

            let blockStart = $from.start() - 1;
            let blockEnd = $from.end() + 1;

            // Check if inside table
            for (let d = $from.depth; d > 0; d--) {
                const node = $from.node(d);
                if (node.type.name === 'table') {
                    blockStart = $from.before(d);
                    blockEnd = $from.after(d);
                    break;
                }
            }

            const nodeToDuplicate = state.doc.nodeAt(blockStart);
            if (!nodeToDuplicate) return;

            const nodeJSON = nodeToDuplicate.toJSON();

            editor.chain()
                .focus()
                .insertContentAt(blockEnd, nodeJSON)
                .run();
        } catch (e) {
            console.error('Duplicate failed:', e);
        }
    }, [editor]);

    // Delete current block
    const deleteBlock = useCallback(() => {
        if (!editor) return;

        const { state } = editor;
        const { $from } = state.selection;

        let blockStart = $from.start() - 1;
        let blockEnd = $from.end() + 1;

        // Check if inside table and detect table boundary
        for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'table') {
                blockStart = $from.before(d);
                blockEnd = $from.after(d);
                break;
            }
        }

        editor.chain()
            .focus()
            .deleteRange({ from: blockStart, to: blockEnd })
            .run();

        setShowBlockMenu(false);
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href || '';
        setLinkUrl(previousUrl);
        // Close other pickers
        setShowColorPicker(false);
        setShowHighlightPicker(false);
        setShowHeadingMenu(false);
        setShowListMenu(false);
        setShowInsertFloating(false);
        setShowYoutubeInput(false);
        setShowLinkInput(true);
    }, [editor]);

    useLayoutEffect(() => {
        if (showBlockMenu && editorWrapperRef.current) {
            const rect = editorWrapperRef.current.getBoundingClientRect();
            setMenuPosition({
                top: blockHandlePos.top + rect.top + 28,
                left: rect.left - 100
            });
        }
    }, [showBlockMenu, blockHandlePos.top]);

    const applyLink = useCallback(() => {
        if (!editor) return;
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            // Auto-add https:// if no protocol is specified
            let finalUrl = linkUrl.trim();
            if (finalUrl && !finalUrl.match(/^https?:\/\//i) && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
                finalUrl = 'https://' + finalUrl;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
        }
        setShowLinkInput(false);
        setLinkUrl('');
    }, [editor, linkUrl]);

    const cancelLink = useCallback(() => {
        setShowLinkInput(false);
        setLinkUrl('');
        editor?.chain().focus().run();
    }, [editor]);

    const addYoutubeVideo = useCallback(() => {
        if (!editor) return;
        setYoutubeUrl('');
        setShowYoutubeInput(true);
        setShowInsertFloating(false);
    }, [editor]);

    const insertYoutubeVideo = useCallback(() => {
        if (!editor) return;
        if (youtubeUrl) {
            editor.commands.setYoutubeVideo({ src: youtubeUrl });
            setYoutubeUrl('');
            setShowYoutubeInput(false);
        }
    }, [editor, youtubeUrl]);

    const insertTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) {
        return <div className="animate-pulse bg-gray-100 rounded h-48" />;
    }

    return (
        <div className="rich-text-editor" ref={editorContainerRef}>
            {/* Floating Toolbar - appears when text is selected */}
            {editable && showFloatingToolbar && (
                <div
                    className="absolute z-50 flex items-center gap-0.5 bg-zinc-900 rounded-xl shadow-2xl px-2 py-1.5 animate-fade-in border border-zinc-50/10"
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
                        isActive={editor.isActive('link') || showLinkInput}
                        icon="link"
                        title="Link"
                    />
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    {/* Heading Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowColorPicker(false);
                                setShowHighlightPicker(false);
                                setShowLinkInput(false);
                                setShowYoutubeInput(false);
                                setShowInsertFloating(false);
                                setShowListMenu(false);
                                setShowHeadingMenu(!showHeadingMenu);
                            }}
                            className={`h-7 px-2 flex items-center gap-1 rounded-lg transition-colors text-sm ${editor.isActive('heading') ? 'bg-[#fdfdfd]/20 text-white' : 'text-white/80 hover:text-white hover:bg-[#fdfdfd]/10'}`}
                            title="Text Style"
                        >
                            <span className="font-medium">
                                {editor.isActive('heading', { level: 1 }) ? 'H1' :
                                    editor.isActive('heading', { level: 2 }) ? 'H2' :
                                        editor.isActive('heading', { level: 3 }) ? 'H3' : 'T'}
                            </span>
                            <span className="material-icons-outlined text-xs">expand_more</span>
                        </button>
                        {showHeadingMenu && (
                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-zinc-900 rounded-xl shadow-2xl py-1 z-50 min-w-[140px] border border-zinc-50/10"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <button
                                    onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 transition-colors ${editor.isActive('paragraph') && !editor.isActive('heading') ? 'bg-[#fdfdfd]/10 text-white' : 'text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white'}`}
                                >
                                    <span className="font-medium w-6">T</span>
                                    Text
                                </button>
                                <button
                                    onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false); }}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-[#fdfdfd]/10 text-white' : 'text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white'}`}
                                >
                                    <span className="font-bold w-6">H1</span>
                                    Heading 1
                                </button>
                                <button
                                    onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[#fdfdfd]/10 text-white' : 'text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white'}`}
                                >
                                    <span className="font-bold w-6">H2</span>
                                    Heading 2
                                </button>
                                <button
                                    onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }}
                                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-[#fdfdfd]/10 text-white' : 'text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white'}`}
                                >
                                    <span className="font-bold w-6">H3</span>
                                    Heading 3
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    {/* List Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowHighlightPicker(false);
                                setShowColorPicker(false);
                                setShowLinkInput(false);
                                setShowYoutubeInput(false);
                                setShowHeadingMenu(false);
                                setShowInsertFloating(false);
                                setShowListMenu(!showListMenu);
                            }}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${editor.isActive('bulletList') || editor.isActive('orderedList') ? 'bg-[#fdfdfd]/20 text-white' : 'text-white/80 hover:text-white hover:bg-[#fdfdfd]/10'}`}
                            title="List Options"
                        >
                            <span className="material-icons-outlined text-base">
                                {editor.isActive('orderedList') ? 'format_list_numbered' : 'format_list_bulleted'}
                            </span>
                            <span className="material-icons-outlined text-[10px]">expand_more</span>
                        </button>
                        {showListMenu && (
                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-zinc-900 rounded-xl shadow-2xl p-1 z-50 min-w-[160px] border border-zinc-50/10 flex flex-col gap-1"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <button
                                    onClick={() => { editor.chain().focus().toggleBulletList().run(); setShowListMenu(false); }}
                                    className={`px-3 py-1.5 rounded-lg text-left text-sm flex items-center gap-2 ${editor.isActive('bulletList') ? 'bg-[#fdfdfd]/20 text-white' : 'text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white'}`}
                                >
                                    <span className="material-icons-outlined text-base">format_list_bulleted</span>
                                    Bullet List
                                </button>
                                <button
                                    onClick={() => { editor.chain().focus().toggleOrderedList().run(); setShowListMenu(false); }}
                                    className={`px-3 py-1.5 rounded-lg text-left text-sm flex items-center gap-2 ${editor.isActive('orderedList') ? 'bg-[#fdfdfd]/20 text-white' : 'text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white'}`}
                                >
                                    <span className="material-icons-outlined text-base">format_list_numbered</span>
                                    Numbered List
                                </button>
                            </div>
                        )}
                    </div>
                    <FloatingButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon="format_quote"
                        title="Quote"
                    />
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    {/* Color Picker */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowHighlightPicker(false);
                                setShowLinkInput(false);
                                setShowYoutubeInput(false);
                                setShowHeadingMenu(false);
                                setShowInsertFloating(false);
                                setShowListMenu(false);
                                setShowColorPicker(!showColorPicker);
                            }}
                            className="p-1.5 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-[#fdfdfd]/10 flex items-center gap-1"
                            title="Text Color"
                        >
                            <span className="material-icons-outlined text-base">format_color_text</span>
                            <span
                                className="w-3 h-1 rounded-sm"
                                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
                            />
                        </button>
                        {showColorPicker && (
                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-zinc-900 rounded-xl shadow-2xl p-2 z-50 min-w-[140px] border border-zinc-50/10"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <div className="grid grid-cols-3 gap-1">
                                    {presetColors.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (preset.color === '') {
                                                    editor.chain().focus().unsetColor().run();
                                                } else {
                                                    editor.chain().focus().setColor(preset.color).run();
                                                }
                                                setShowColorPicker(false);
                                            }}
                                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#fdfdfd]/10 transition-all duration-150"
                                            title={preset.name}
                                        >
                                            {preset.color === '' ? (
                                                <span className="material-icons-outlined text-base text-white/60">format_color_reset</span>
                                            ) : (
                                                <span
                                                    className="w-5 h-5 rounded-full border-2 border-zinc-50/20"
                                                    style={{ backgroundColor: preset.color }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Highlight/Background Color Picker */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowColorPicker(false);
                                setShowLinkInput(false);
                                setShowYoutubeInput(false);
                                setShowHeadingMenu(false);
                                setShowInsertFloating(false);
                                setShowListMenu(false);
                                setShowHighlightPicker(!showHighlightPicker);
                            }}
                            className="p-1.5 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-[#fdfdfd]/10 flex items-center gap-1"
                            title="Highlight Color"
                        >
                            <span className="material-icons-outlined text-base">format_color_fill</span>
                            <span
                                className="w-3 h-1 rounded-sm"
                                style={{ backgroundColor: editor.getAttributes('highlight').color || '#fef08a' }}
                            />
                        </button>
                        {showHighlightPicker && (
                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-zinc-900 rounded-xl shadow-2xl p-2 z-50 min-w-[140px] border border-zinc-50/10"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <div className="grid grid-cols-3 gap-1">
                                    {highlightColors.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (preset.color === '') {
                                                    editor.chain().focus().unsetHighlight().run();
                                                } else {
                                                    editor.chain().focus().setHighlight({ color: preset.color }).run();
                                                }
                                                setShowHighlightPicker(false);
                                            }}
                                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#fdfdfd]/10 transition-all duration-150"
                                            title={preset.name}
                                        >
                                            {preset.color === '' ? (
                                                <span className="material-icons-outlined text-base text-white/60">format_color_reset</span>
                                            ) : (
                                                <span
                                                    className="w-5 h-5 rounded-full border-2 border-zinc-50/20"
                                                    style={{ backgroundColor: preset.color }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                    {/* Insert Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowColorPicker(false);
                                setShowHighlightPicker(false);
                                setShowLinkInput(false);
                                setShowYoutubeInput(false);
                                setShowHeadingMenu(false);
                                setShowInsertFloating(!showInsertFloating);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-white/80 hover:text-white hover:bg-[#fdfdfd]/10"
                            title="Insert"
                        >
                            <span className="material-icons-outlined text-base">add</span>
                        </button>
                        {showInsertFloating && (
                            <div
                                className="absolute top-full right-0 mt-1 bg-zinc-900 rounded-xl shadow-2xl py-1 z-50 min-w-[150px] border border-zinc-50/10"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <button
                                    onClick={() => { editor.chain().focus().setHorizontalRule().run(); setShowInsertFloating(false); }}
                                    className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white transition-colors"
                                >
                                    <span className="material-icons-outlined text-base">horizontal_rule</span>
                                    Divider
                                </button>
                                <button
                                    onClick={() => { insertTable(); setShowInsertFloating(false); }}
                                    className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white transition-colors"
                                >
                                    <span className="material-icons-outlined text-base">table_chart</span>
                                    Table
                                </button>
                                <button
                                    onClick={() => { addYoutubeVideo(); setShowInsertFloating(false); }}
                                    className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white transition-colors"
                                >
                                    <span className="material-icons-outlined text-base">smart_display</span>
                                    YouTube
                                </button>
                                <button
                                    onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setShowInsertFloating(false); }}
                                    className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-white/80 hover:bg-[#fdfdfd]/10 hover:text-white transition-colors"
                                >
                                    <span className="material-icons-outlined text-base">code</span>
                                    Code Block
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Inline Link Input Form */}
            {editable && showLinkInput && (
                <div
                    className="absolute z-50 bg-zinc-900 rounded-xl shadow-2xl px-2 py-1 animate-fade-in border border-zinc-50/10"
                    style={{
                        top: floatingToolbarPos.top + 45,
                        left: floatingToolbarPos.left,
                        transform: 'translateX(-50%)'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <div className="flex items-center gap-1">
                        <span className="material-icons-outlined text-white/60 text-base">link</span>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    applyLink();
                                } else if (e.key === 'Escape') {
                                    cancelLink();
                                }
                            }}
                            placeholder="https://example.com"
                            className="bg-[#fdfdfd]/10 border border-zinc-50/20 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-zinc-50/40 w-[240px]"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={applyLink}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#fdfdfd]/10 hover:bg-[#fdfdfd]/20 text-white transition-colors"
                            title="Apply"
                        >
                            <span className="material-icons-outlined text-base">check</span>
                        </button>
                        <button
                            type="button"
                            onClick={cancelLink}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#fdfdfd]/10 text-white/60 hover:text-white transition-colors"
                            title="Cancel"
                        >
                            <span className="material-icons-outlined text-base">close</span>
                        </button>
                        {editor?.isActive('link') && (
                            <button
                                type="button"
                                onClick={() => {
                                    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                                    setShowLinkInput(false);
                                    setLinkUrl('');
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                title="Remove Link"
                            >
                                <span className="material-icons-outlined text-base">link_off</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* YouTube Link Input Form */}
            {editable && showYoutubeInput && (
                <div
                    className="absolute z-50 bg-zinc-900 rounded-xl shadow-2xl px-2 py-1 animate-fade-in border border-zinc-50/10"
                    style={{
                        top: floatingToolbarPos.top + 45,
                        left: floatingToolbarPos.left,
                        transform: 'translateX(-50%)'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <div className="flex items-center gap-1">
                        <span className="material-icons-outlined text-white/60 text-base">smart_display</span>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    insertYoutubeVideo();
                                } else if (e.key === 'Escape') {
                                    setShowYoutubeInput(false);
                                }
                            }}
                            placeholder="https://youtube.com/..."
                            className="bg-[#fdfdfd]/10 border border-zinc-50/20 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-zinc-50/40 w-[240px]"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={insertYoutubeVideo}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#fdfdfd]/10 hover:bg-[#fdfdfd]/20 text-white transition-colors"
                            title="Insert Video"
                        >
                            <span className="material-icons-outlined text-base">check</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowYoutubeInput(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#fdfdfd]/10 text-white/60 hover:text-white transition-colors"
                            title="Cancel"
                        >
                            <span className="material-icons-outlined text-base">close</span>
                        </button>
                    </div>
                </div>
            )}


            {/* Table Options Button - positioned at top right of table */}
            {editable && tableButtonPos.visible && (
                <div
                    className="absolute z-20"
                    style={{ top: tableButtonPos.top, left: tableButtonPos.left }}
                >
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowTableMenu(!showTableMenu)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#fdfdfd] border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
                            title="Table Options"
                        >
                            <span className="material-icons-outlined text-base">more_vert</span>
                        </button>
                        {showTableMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowTableMenu(false)} />
                                <div className="absolute right-0 top-full mt-1 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg py-1 z-20 w-[200px]">
                                    <button
                                        onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">view_column</span>
                                        Add Column
                                    </button>
                                    <button
                                        onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-base text-gray-400">table_rows</span>
                                        Add Row
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                        onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                    >
                                        <span className="material-icons-outlined text-base">remove</span>
                                        Delete Column
                                    </button>
                                    <button
                                        onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                    >
                                        <span className="material-icons-outlined text-base">remove</span>
                                        Delete Row
                                    </button>
                                    <button
                                        onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                    >
                                        <span className="material-icons-outlined text-base">delete</span>
                                        Delete Table
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Editor Content with Block Handles */}
            <div className="relative" ref={editorWrapperRef}>
                {/* Block Handles */}
                {editable && blockHandlePos.visible && (
                    <div
                        className="absolute z-10 h-6 flex items-center gap-0.5 block-handle"
                        style={{
                            top: blockHandlePos.top,
                            left: '0px',
                            transform: 'translateX(-100%) translateX(-8px)'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {/* Delete Block button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteBlock();
                            }}
                            className="flex items-center justify-center w-5 h-5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete block"
                        >
                            <span className="material-icons-outlined text-[16px]">delete</span>
                        </button>

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
                        </div>
                    </div>
                )}

                {/* Block menu dropdown - rendered outside of transform container */}
                {editable && showBlockMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowBlockMenu(false)} />
                        <div
                            className="fixed bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 min-w-[140px]"
                            style={{
                                top: menuPosition.top,
                                left: menuPosition.left
                            }}
                        >
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
                                onClick={duplicateBlock}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            >
                                <span className="material-icons-outlined text-base">content_copy</span>
                                Duplicate
                            </button>
                        </div>
                    </>
                )}

                <EditorContent
                    editor={editor}
                    className={`${editable ? 'bg-[#fdfdfd] rounded-xl editor-with-handles' : ''}`}
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
                    padding: 0;
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
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 1rem 0 0.5rem;
                }
                .rich-text-editor .ProseMirror h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.4rem;
                }
                .rich-text-editor .ProseMirror h3 {
                    font-size: 1.125rem;
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
