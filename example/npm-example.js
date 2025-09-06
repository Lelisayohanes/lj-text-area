// Example usage of lj-text-area in a React application

import React, { useState } from 'react';
import { LjTextArea } from 'lj-text-area';
import 'lj-text-area/dist/index.css';

function MyEditor() {
  const [content, setContent] = useState('');

  return (
    <div>
      <h1>My Document Editor</h1>
      <LjTextArea
        value={content}
        onChange={setContent}
        placeholder="Start typing your document here..."
        style={{ minHeight: '400px' }}
        features={{
          basicFormatting: true,
          advancedFormatting: true,
          lists: true,
          alignment: true,
          colors: true,
          images: true,
          tables: true,
          documentHandling: true
        }}
      />
      
      <div style={{ marginTop: '20px' }}>
        <h2>Document Preview</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}

export default MyEditor;