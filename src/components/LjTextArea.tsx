import React, { useState, useEffect, useRef } from 'react';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { exportToDocx, importFromDocx, exportToPdf } from '../utils/documentUtils';
import { isValidLinkUrl, isValidImageUrl } from '../utils/securityUtils';
import './LjTextArea.css';

// Define the props for our component
export interface LjTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  
  // Feature toggles
  features?: {
    basicFormatting?: boolean;
    advancedFormatting?: boolean;
    lists?: boolean;
    alignment?: boolean;
    colors?: boolean;
    images?: boolean;
    tables?: boolean;
    documentHandling?: boolean;
  };
  
  // Display modes
  toolbarMode?: 'full' | 'minimal' | 'compact';
}

// Toolbar component for formatting options
const Toolbar = ({ features, toolbarMode }: { features: LjTextAreaProps['features'], toolbarMode: LjTextAreaProps['toolbarMode'] }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  // Collapsible section component
  const CollapsibleSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    
    if (toolbarMode === 'minimal') return null;
    
    return (
      <div className="toolbar-section">
        <button 
          className="section-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title} {isOpen ? '▲' : '▼'}
        </button>
        {isOpen && <div className="section-content">{children}</div>}
      </div>
    );
  };

  // Dropdown component for font selection
  const Dropdown = ({ 
    label, 
    options, 
    value, 
    onChange 
  }: { 
    label: string; 
    options: { value: string; label: string }[]; 
    value: string; 
    onChange: (value: string) => void; 
  }) => {
    return (
      <div className="dropdown">
        <label>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className={`lj-text-area-toolbar toolbar-mode-${toolbarMode}`}>
      {features?.basicFormatting !== false && (
        <>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url && isValidLinkUrl(url)) {
                editor.chain().focus().setLink({ href: url }).run();
              } else if (url) {
                alert('Invalid URL');
              }
            }}
            className={editor.isActive('link') ? 'is-active' : ''}
            title="Add Link"
          >
            🔗
          </button>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="Remove Link"
          >
            🔗×
          </button>
          {features?.advancedFormatting !== false && (
            <>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'is-active' : ''}
                title="Strikethrough"
              >
                S
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'is-active' : ''}
                title="Highlight"
              >
                H
              </button>
            </>
          )}
        </>
      )}
      
      {features?.advancedFormatting !== false && (
        <CollapsibleSection title="Headings">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          >
            H3
          </button>
        </CollapsibleSection>
      )}
      
      {features?.lists !== false && (
        <CollapsibleSection title="Lists">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            1. List
          </button>
        </CollapsibleSection>
      )}
      
      {features?.alignment !== false && (
        <CollapsibleSection title="Alignment">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          >
            →
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          >
            ≡
          </button>
        </CollapsibleSection>
      )}
      
      {features?.colors !== false && (
        <CollapsibleSection title="Colors">
          <div className="color-controls">
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
            />
            <button
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="unset-color"
            >
              Clear
            </button>
          </div>
        </CollapsibleSection>
      )}
      
      {features?.images !== false && (
        <>
          <button
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url && isValidImageUrl(url)) {
                editor.chain().focus().setImage({ src: url }).run();
              } else if (url) {
                alert('Invalid image URL');
              }
            }}
            title="Insert Image from URL"
          >
            🌐
          </button>
          <button
            onClick={() => {
              // Create a file input element
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  // In a real implementation, you would upload the file to a server
                  // and get a URL back. For now, we'll create a local object URL.
                  const url = URL.createObjectURL(file);
                  editor.chain().focus().setImage({ src: url }).run();
                }
              };
              input.click();
            }}
            title="Upload Image"
          >
            📁
          </button>
        </>
      )}
      
      {features?.tables !== false && (
        <CollapsibleSection title="Tables">
          <div className="table-controls">
            <button
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              Insert Table
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
            >
              Add Col Before
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
            >
              Add Col After
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
            >
              Delete Column
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
            >
              Add Row Before
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
            >
              Add Row After
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
            >
              Delete Row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
            >
              Delete Table
            </button>
          </div>
        </CollapsibleSection>
      )}
      
      {features?.documentHandling !== false && (
        <CollapsibleSection title="Documents">
          <div className="document-controls">
            <button
              onClick={() => {
                const content = editor.getHTML();
                exportToDocx(content);
              }}
            >
              Export DOCX
            </button>
            <button
              onClick={() => {
                const content = editor.getHTML();
                exportToPdf(content);
              }}
            >
              Export PDF
            </button>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const content = await importFromDocx(file);
                  editor.commands.setContent(content);
                }
              }}
              style={{ display: 'none' }}
              id="import-docx"
            />
            <label htmlFor="import-docx" className="button">
              Import DOCX
            </label>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

// Main component
const LjTextArea: React.FC<LjTextAreaProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  style = {},
  features = {
    basicFormatting: true,
    advancedFormatting: true,
    lists: true,
    alignment: true,
    colors: true,
    images: true,
    tables: true,
    documentHandling: true
  },
  toolbarMode = 'full'
}) => {
  const [content, setContent] = useState(value);

  // Update content when value prop changes
  useEffect(() => {
    setContent(value);
  }, [value]);

  // Define extensions for the editor
  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight,
    Color,
    TextStyle,
    Underline,
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
      },
    }),
    FontFamily.configure({
      types: ['textStyle'],
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ];

  // Handle editor updates
  const handleUpdate = ({ editor }: any) => {
    const html = editor.getHTML();
    setContent(html);
    if (onChange) {
      onChange(html);
    }
  };

  // Font options
  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
  ];

  // Font size options
  const fontSizeOptions = [
    { value: '1', label: '8pt' },
    { value: '2', label: '10pt' },
    { value: '3', label: '12pt' },
    { value: '4', label: '14pt' },
    { value: '5', label: '18pt' },
    { value: '6', label: '24pt' },
    { value: '7', label: '36pt' },
  ];

  return (
    <div className={`lj-text-area ${className}`} style={style}>
      <EditorProvider
        slotBefore={<Toolbar features={features} toolbarMode={toolbarMode} />}
        extensions={extensions}
        content={content}
        onUpdate={handleUpdate}
      >
      </EditorProvider>
    </div>
  );
};

export default LjTextArea;