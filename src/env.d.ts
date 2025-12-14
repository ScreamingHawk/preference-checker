/// <reference types="vite/client" />

import type React from 'react';

declare module '*.vue' {
  const component: any;
  export default component;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'preference-glance': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        highlight?: string;
        count?: number;
      };
    }
  }
}

export {};
