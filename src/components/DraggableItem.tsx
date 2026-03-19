import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DraggableItemProps {
  children: React.ReactNode;
  x: number;
  y: number;
  onDragStart?: () => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onDelete?: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ 
  children, 
  x, 
  y, 
  onDragStart,
  onDrag,
  onDragEnd,
  onDelete,
  containerRef
}) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0} // Prevents bouncing outside the border
      dragConstraints={containerRef}
      onDragStart={onDragStart}
      onDrag={(_, info) => {
        if (onDrag) {
          onDrag(x + info.offset.x, y + info.offset.y);
        }
      }}
      onDragEnd={(_, info) => {
        onDragEnd(x + info.offset.x, y + info.offset.y);
      }}
      initial={{ scale: 0, x, y }}
      animate={{ scale: 1, x, y }}
      exit={{ scale: 0, opacity: 0 }}
      style={{ 
        position: 'absolute', 
        cursor: 'grab', 
        zIndex: 30,
        padding: '8px' // Buffer to prevent emoji edge from touching the limit
      }}
      whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 100 }}
      className="group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="absolute top-0 right-0 w-5 h-5 bg-black/10 backdrop-blur-sm text-black/60 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hidden group-hover:flex hover:bg-red-500 hover:text-white"
      >
        <X size={12} />
      </button>
      <div className="relative pointer-events-none select-none">
        {children}
      </div>
    </motion.div>
  );
};
