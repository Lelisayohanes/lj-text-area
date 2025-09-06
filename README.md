# LJ Text Area

A next-generation rich text editor library that combines the simplicity of a textarea with the power of advanced document editing tools.

[![npm version](https://badge.fury.io/js/lj-text-area.svg)](https://badge.fury.io/js/lj-text-area)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Simple Integration**: Works like a normal textarea with `value` and `onChange` props
- **Rich Formatting**: Supports headings, lists, text alignment, highlighting, and more
- **Text Styling**: Text color selection and highlighting
- **Media Support**: Image insertion with URL
- **Link Embedding**: Add and remove hyperlinks
- **Tables**: Create and edit tables with resizable columns
- **Document Handling**: Import from DOCX and export to DOCX/PDF
- **Customizable**: Enable/disable features based on your needs
- **Multiple Modes**: Full, compact, and minimal toolbar modes
- **Collapsible Sections**: Organize toolbar into expandable/collapsible sections
- **Extensible**: Built on Tiptap, making it easy to add custom extensions
- **Lightweight**: Minimal core with optional extensions
- **Framework Agnostic**: Works with React, Next.js, and other frameworks
- **Tailwind CSS Support**: Works seamlessly with Tailwind CSS utility classes

## Installation

```bash
npm install lj-text-area
```

## Usage

```jsx
import React, { useState } from 'react';
import { LjTextArea } from 'lj-text-area';
import 'lj-text-area/dist/index.css';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <LjTextArea 
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

### Customizing Features

The editor can be customized to show only the features you need:

```jsx
<LjTextArea 
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
  features={{
    basicFormatting: true,
    advancedFormatting: false,
    lists: true,
    alignment: false,
    colors: true,
    images: false,
    tables: false,
    documentHandling: false
  }}
  toolbarMode="compact"
/>
```

### Using with Tailwind CSS

LJ Text Area has built-in support for Tailwind CSS. To use Tailwind classes for styling, set the `useTailwind` prop to `true`:

```jsx
<LjTextArea 
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
  useTailwind={true}
  className="border border-gray-300 rounded-lg shadow-sm"
/>
```

When `useTailwind` is enabled:
- The component uses Tailwind utility classes instead of built-in styles
- Buttons and UI elements are styled with Tailwind classes
- You can easily customize the appearance using Tailwind classes
- The component integrates seamlessly with your Tailwind-based design system

### Toolbar Modes

- `full` - Default mode with all features
- `compact` - Smaller toolbar buttons
- `minimal` - Only basic formatting visible, other features in collapsible sections

### Available Features

- Text formatting (bold, italic, underline, strikethrough)
- Text highlighting and color selection
- Headings (H1-H3)
- Lists (bullet and numbered)
- Text alignment (left, center, right, justify)
- Link embedding
- Image insertion
- Table creation and editing
- Document export (DOCX, PDF)
- Document import (DOCX, Excel, PDF)

## Props

| Prop | Type | Description |
|------|------|-------------|
| value | string | The HTML content of the editor |
| onChange | function | Callback when content changes |
| placeholder | string | Placeholder text when editor is empty |
| className | string | Additional CSS classes |
| style | object | Inline styles |
| useTailwind | boolean | Enable Tailwind CSS styling (default: false) |
| features | object | Feature toggles for the editor |
| toolbarMode | 'full' \| 'minimal' \| 'compact' | Toolbar display mode |

## Development

To run the development server:

```bash
npm run dev
```

To build the library:

```bash
npm run build
```

## Roadmap

- [x] Basic rich text editing
- [x] Core formatting tools (bold, italic, underline, etc.)
- [x] Image insertion
- [x] Link embedding
- [x] Table creation
- [x] Document import/export (DOCX, PDF, HTML)
- [x] Tailwind CSS support
- [ ] Collaboration features
- [ ] Plugin system for custom extensions

## License

MIT