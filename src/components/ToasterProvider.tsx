'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px',
        },
        success: {
          style: {
            background: 'white',
            color: 'green',
            border: '1px solid #e5e7eb',
          },
          iconTheme: {
            primary: 'green',
            secondary: 'white',
          },
        },
        error: {
          style: {
            background: 'white',
            color: 'red',
            border: '1px solid #e5e7eb',
          },
        },
      }}
    />
  );
}