'use client';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  direction?: 'horizontal' | 'vertical';
}

export default function ResizeHandle({ onMouseDown, direction = 'horizontal' }: ResizeHandleProps) {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div
      className={`${
        isHorizontal 
          ? 'resize-handle' 
          : 'h-1 bg-border hover:bg-primary cursor-row-resize transition-colors'
      }`}
      onMouseDown={onMouseDown}
    />
  );
}
