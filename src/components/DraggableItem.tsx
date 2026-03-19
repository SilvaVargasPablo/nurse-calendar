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
        className="absolute top-0 right-0 w-6 h-6 bg-white/20 dark:bg-black/30 backdrop-blur-md text-slate-800 dark:text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg border border-white/30 dark:border-white/10 hidden group-hover:flex hover:bg-red-500 hover:text-white dark:hover:bg-red-600 hover:border-transparent scale-90 group-hover:scale-100"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
      <div className="relative pointer-events-none select-none">
        {children}
      </div>
    </motion.div>
  );
};
