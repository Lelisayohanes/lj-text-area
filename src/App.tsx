import { useState } from 'react';
import { LjTextArea } from './index';

function App() {
  const [content, setContent] = useState('<p>This is a <strong>simple example</strong> of our rich text editor.</p>');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>LJ Text Area Demo</h1>
      <p>A next-generation rich text editor that combines the simplicity of a textarea with the power of advanced document editing tools.</p>
      
      <LjTextArea 
        value={content}
        onChange={setContent}
        placeholder="Start typing here..."
        style={{ minHeight: '300px' }}
      />
      
      <div style={{ marginTop: '20px' }}>
        <h3>Output:</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}

export default App;