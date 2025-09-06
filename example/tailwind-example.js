import React, { useState } from 'react';
import { LjTextArea } from 'lj-text-area';
import 'lj-text-area/dist/index.css';

function TailwindExample() {
  const [content, setContent] = useState('<p>Hello <strong>world</strong>! This is a <span style="color: #ef4444">rich text editor</span> with Tailwind CSS support.</p>');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">LJ Text Area with Tailwind CSS</h1>
      <p className="text-gray-600 mb-6">This example demonstrates how to use LJ Text Area with Tailwind CSS classes.</p>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Default Editor</h2>
        <LjTextArea 
          value={content}
          onChange={setContent}
          placeholder="Start typing here..."
          className="border rounded-lg shadow-sm"
          style={{ minHeight: '300px' }}
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Compact Editor with Tailwind</h2>
        <LjTextArea 
          value={content}
          onChange={setContent}
          placeholder="Compact editor with Tailwind..."
          className="border rounded-lg shadow-sm"
          toolbarMode="compact"
          useTailwind={true}
          style={{ minHeight: '200px' }}
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Minimal Editor with Tailwind</h2>
        <LjTextArea 
          value={content}
          onChange={setContent}
          placeholder="Minimal editor with Tailwind..."
          className="border rounded-lg shadow-sm"
          toolbarMode="minimal"
          useTailwind={true}
          style={{ minHeight: '200px' }}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Output:</h3>
        <div 
          className="p-4 bg-white border rounded min-h-[100px]" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Tailwind CSS Integration</h3>
        <p className="text-blue-700">
          By setting the <code className="bg-blue-100 px-1 rounded">useTailwind</code> prop to <code className="bg-blue-100 px-1 rounded">true</code>, 
          the component will use Tailwind CSS utility classes for styling instead of the built-in styles. 
          This allows for better customization and consistency with your Tailwind-based design system.
        </p>
      </div>
    </div>
  );
}

export default TailwindExample;