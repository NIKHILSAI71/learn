import { useCallback, useEffect, useRef } from 'react';

interface UseResizeReturn {
  startResizing: (e: React.MouseEvent) => void;
  startResizingOutput: (e: React.MouseEvent) => void;
  isResizing: boolean;
  isResizingOutput: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  rightPanelRef: React.RefObject<HTMLDivElement | null>;
}

interface UseResizeProps {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  outputHeight: number;
  setOutputHeight: (height: number) => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  isResizingOutput: boolean;
  setIsResizingOutput: (resizing: boolean) => void;
}

export function useResize({
  sidebarWidth,
  setSidebarWidth,
  outputHeight,
  setOutputHeight,
  isResizing,
  setIsResizing,
  isResizingOutput,
  setIsResizingOutput
}: UseResizeProps): UseResizeReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, [setIsResizing]);

  const startResizingOutput = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingOutput(true);
  }, [setIsResizingOutput]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setIsResizingOutput(false);
  }, [setIsResizing, setIsResizingOutput]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        const minWidth = 300;
        const maxWidth = containerRect.width * 0.6;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth);
        }
      }
      
      if (isResizingOutput && rightPanelRef.current) {
        const rightPanelRect = rightPanelRef.current.getBoundingClientRect();
        const newHeight = rightPanelRect.bottom - e.clientY;
        const minHeight = 150;
        const maxHeight = rightPanelRect.height - 200;
        
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setOutputHeight(newHeight);
        }
      }
    },
    [isResizing, isResizingOutput, setSidebarWidth, setOutputHeight]
  );

  useEffect(() => {
    if (isResizing || isResizingOutput) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      
      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing, isResizingOutput, resize, stopResizing]);

  return {
    startResizing,
    startResizingOutput,
    isResizing,
    isResizingOutput,
    containerRef,
    rightPanelRef
  };
}
