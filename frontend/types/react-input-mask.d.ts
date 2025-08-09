// types/react-input-mask.d.ts

declare module 'react-input-mask' {
    import * as React from 'react';
  
    interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
      mask: string;
      alwaysShowMask?: boolean;
      maskChar?: string | null;
      beforeMaskedStateChange?: (states: {
        currentState: any;
        nextState: any;
        previousState: any;
      }) => any;
    }
  
    const ReactInputMask: React.ForwardRefExoticComponent<
      Props & React.RefAttributes<HTMLInputElement>
    >;
  
    export default ReactInputMask;
  }
  