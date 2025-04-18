
import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Menu } from "lucide-react";
import clsx from "clsx";

const COLORS = {
  bg: "#f7f7fb",
  sidebar: "#f3f4f6",
  accent: "#7c3aed",
  accentLight: "#ede9fe",
  text: "#22223b",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  white: "#fff",
};

const FONT = {
  family: "'Inter', 'Nunito', sans-serif",
};

type BlockType = "text" | "heading" | "bulleted-list";

interface Block {
  id: string;
  type: BlockType;
  content: string;
}

interface Note {
  id: string;
  title: string;
  blocks: Block[];
  created: number;
  updated: number;
}

const LS_KEY = "notion-inspired-notes-v1";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

function newNote(): Note {
  return {
    id: Math.random().toString(36).slice(2),
    title: "Untitled",
    blocks: [
      {
        id: Math.random().toString(36).slice(2),
        type: "heading",
        content: "New Note",
      },
      {
        id: Math.random().toString(36).slice(2),
        type: "text",
        content: "",
      },
    ],
    created: Date.now(),
    updated: Date.now(),
  };
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SIDEBAR_WIDTH = 260;

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load notes from localStorage
  useEffect(() => {
    const n = loadNotes();
    setNotes(n);
    if (n.length > 0) setSelectedId(n[0].id);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  function handleAddNote() {
    const n = newNote();
    setNotes([n, ...notes]);
    setSelectedId(n.id);
  }

  function handleDeleteNote(id: string) {
    if (!window.confirm("Delete this note?")) return;
    const idx = notes.findIndex((n) => n.id === id);
    let nextId: string | null = null;
    if (notes.length > 1) {
      if (idx === 0) nextId = notes[1].id;
      else nextId = notes[idx - 1].id;
    }
    setNotes(notes.filter((n) => n.id !== id));
    setSelectedId(nextId);
  }

  function handleUpdateNote(updated: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...updated, updated: Date.now() } : n))
    );
  }

  // Sidebar animation
  const sidebarStyle: React.CSSProperties = {
    width: sidebarOpen ? SIDEBAR_WIDTH : 0,
    minWidth: sidebarOpen ? SIDEBAR_WIDTH : 0,
    transition: "width 0.25s cubic-bezier(.4,2,.6,1), min-width 0.25s cubic-bezier(.4,2,.6,1)",
    overflow: "hidden",
    background: COLORS.sidebar,
    borderRight: `1px solid ${COLORS.border}`,
    boxShadow: sidebarOpen ? "2px 0 8px 0 rgba(60,60,100,0.04)" : "none",
    zIndex: 10,
    position: "relative",
  };

  return (
    <div
      style={{
        fontFamily: FONT.family,
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        display: "flex",
        transition: "background 0.2s",
      }}
    >
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px 16px 12px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.white,
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: -1,
              color: COLORS.accent,
              flex: 1,
              userSelect: "none",
            }}
          >
            Creative Notes
          </span>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              marginLeft: 8,
              cursor: "pointer",
              color: COLORS.textSecondary,
              padding: 4,
              borderRadius: 6,
              transition: "background 0.15s",
            }}
            tabIndex={0}
          >
            <Menu size={22} />
          </button>
        </div>
        <div style={{ padding: "16px 0 0 0", height: "calc(100vh - 60px)", overflowY: "auto" }}>
          <button
            onClick={handleAddNote}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: COLORS.accent,
              color: COLORS.white,
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: 15,
              margin: "0 16px 18px 20px",
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(124,58,237,0.08)",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
          >
            <Plus size={18} />
            New Note
          </button>
          <nav>
            {notes.length === 0 && (
              <div
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 15,
                  padding: "32px 20px 0 20px",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                No notes yet.
                <br />
                Click <b>New Note</b> to get started!
              </div>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className={clsx(
                  "note-list-item",
                  selectedId === note.id && "selected"
                )}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px 10px 20px",
                  margin: "0 8px 4px 8px",
                  borderRadius: 8,
                  background:
                    selectedId === note.id ? COLORS.accentLight : "none",
                  cursor: "pointer",
                  fontWeight: selectedId === note.id ? 700 : 500,
                  color: selectedId === note.id ? COLORS.accent : COLORS.text,
                  transition: "background 0.15s, color 0.15s",
                  position: "relative",
                  minHeight: 44,
                  userSelect: "none",
                }}
                onClick={() => setSelectedId(note.id)}
                tabIndex={0}
              >
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={note.title}
                >
                  {note.title || "Untitled"}
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {formatDate(note.updated)}
                  </div>
                </div>
                <button
                  aria-label="Delete note"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.textSecondary,
                    padding: 4,
                    borderRadius: 6,
                    cursor: "pointer",
                    opacity: 0.7,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  tabIndex={0}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: COLORS.bg,
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            margin: "0 auto",
            padding: "40px 24px 32px 24px",
            minHeight: "100vh",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {!selectedNote ? (
            <div
              style={{
                marginTop: 120,
                textAlign: "center",
                color: COLORS.textSecondary,
                fontSize: 22,
                fontWeight: 600,
                opacity: 0.7,
                letterSpacing: -0.5,
                lineHeight: 1.3,
              }}
            >
              <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>
                ✨
              </span>
              Welcome to <span style={{ color: COLORS.accent }}>Creative Notes</span>!
              <div style={{ fontSize: 16, marginTop: 16, fontWeight: 400 }}>
                Start by creating a new note from the sidebar.
              </div>
            </div>
          ) : (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onChange={handleUpdateNote}
            />
          )}
        </div>
      </main>
      {/* Responsive sidebar toggle (mobile) */}
      {!sidebarOpen && (
        <button
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: 18,
            left: 12,
            zIndex: 100,
            background: COLORS.accent,
            color: COLORS.white,
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            boxShadow: "0 2px 8px 0 rgba(124,58,237,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          <Menu size={26} />
        </button>
      )}
    </div>
  );
}

interface NoteEditorProps {
  note: Note;
  onChange: (note: Note) => void;
}

function NoteEditor({ note, onChange }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState<Block[]>(note.blocks);

  // Autosave on change
  useEffect(() => {
    if (
      title !== note.title ||
      JSON.stringify(blocks) !== JSON.stringify(note.blocks)
    ) {
      onChange({ ...note, title, blocks });
    }
    // eslint-disable-next-line
  }, [title, blocks]);

  // Only update contentEditable when block id changes, not on every keystroke
  useEffect(() => {
    setTitle(note.title);
    setBlocks(note.blocks);
  }, [note.id]);

  // Focus management for new blocks
  const blockRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  function handleBlockInput(
    id: string,
    content: string
  ) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
  }

  function handleBlockKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>,
    idx: number,
    block: Block
  ) {
    // Enter: add new block
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newBlock: Block = {
        id: Math.random().toString(36).slice(2),
        type: "text",
        content: "",
      };
      setBlocks((prev) => [
        ...prev.slice(0, idx + 1),
        newBlock,
        ...prev.slice(idx + 1),
      ]);
      setTimeout(() => {
        blockRefs.current[newBlock.id]?.focus();
      }, 10);
    }
    // Backspace on empty: remove block
    if (
      e.key === "Backspace" &&
      block.content === "" &&
      blocks.length > 1
    ) {
      e.preventDefault();
      setBlocks((prev) => prev.filter((b) => b.id !== block.id));
      setTimeout(() => {
        const prevBlock = blocks[idx - 1];
        if (prevBlock) blockRefs.current[prevBlock.id]?.focus();
      }, 10);
    }
    // Slash command: change block type
    if (e.key === "/" && block.type === "text") {
      // Show block type menu (simple inline)
      // For now, just cycle type
      e.preventDefault();
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id
            ? {
                ...b,
                type:
                  b.type === "text"
                    ? "heading"
                    : b.type === "heading"
                    ? "bulleted-list"
                    : "text",
              }
            : b
        )
      );
    }
  }

  function handleBlockPaste(
    e: React.ClipboardEvent<HTMLDivElement>,
    id: string
  ) {
    // Prevent pasting HTML, only allow plain text
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleBlockInput(id, text);
  }

  function renderBlock(block: Block, idx: number) {
    const commonProps = {
      key: block.id,
      ref: (el: HTMLDivElement | null) => (blockRefs.current[block.id] = el),
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: true,
      tabIndex: 0,
      className: "block-editor",
      style: {
        outline: "none",
        minHeight: block.type === "heading" ? 36 : 24,
        fontWeight: block.type === "heading" ? 700 : 400,
        fontSize: block.type === "heading" ? 26 : 17,
        margin: block.type === "heading" ? "0 0 10px 0" : "0 0 6px 0",
        padding: "2px 0",
        borderRadius: 4,
        background: "none",
        color: COLORS.text,
        transition: "background 0.15s",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        border: "none",
        width: "100%",
        outlineColor: COLORS.accent,
      } as React.CSSProperties,
      onInput: (e: React.FormEvent<HTMLDivElement>) =>
        handleBlockInput(block.id, (e.target as HTMLDivElement).innerText),
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
        handleBlockKeyDown(e, idx, block),
      onPaste: (e: React.ClipboardEvent<HTMLDivElement>) =>
        handleBlockPaste(e, block.id),
      "data-block-id": block.id,
      "aria-label":
        block.type === "heading"
          ? "Heading"
          : block.type === "bulleted-list"
          ? "Bullet"
          : "Text",
    };

    // Only set initial content via dangerouslySetInnerHTML to avoid caret jump
    if (block.type === "heading") {
      return (
        <div
          {...commonProps}
          dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, "<br/>") || "" }}
        />
      );
    }
    if (block.type === "bulleted-list") {
      return (
        <div
          style={{
            ...commonProps.style,
            fontSize: 17,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
          key={block.id}
        >
          <span
            style={{
              color: COLORS.accent,
              fontWeight: 700,
              fontSize: 18,
              marginTop: 2,
              userSelect: "none",
            }}
            aria-hidden
          >
            •
          </span>
          <div
            {...commonProps}
            style={{ ...commonProps.style, flex: 1, margin: 0, padding: 0 }}
            dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, "<br/>") || "" }}
          />
        </div>
      );
    }
    // text
    return (
      <div
        {...commonProps}
        dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, "<br/>") || "" }}
      />
    );
  }

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 18,
        boxShadow: "0 4px 32px 0 rgba(60,60,100,0.07)",
        padding: "36px 32px 32px 32px",
        minHeight: 320,
        marginTop: 12,
        transition: "box-shadow 0.2s",
        position: "relative",
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        style={{
          fontSize: 28,
          fontWeight: 800,
          border: "none",
          outline: "none",
          background: "none",
          color: COLORS.accent,
          marginBottom: 18,
          width: "100%",
          borderRadius: 6,
          padding: "2px 0",
          transition: "background 0.15s",
        }}
        maxLength={80}
        aria-label="Note title"
      />
      <div style={{ marginTop: 6 }}>
        {blocks.map((block, idx) => renderBlock(block, idx))}
      </div>
      <div
        style={{
          marginTop: 32,
          color: COLORS.textSecondary,
          fontSize: 13,
          textAlign: "right",
          opacity: 0.7,
        }}
      >
        Last edited: {formatDate(note.updated)}
      </div>
    </div>
  );
}