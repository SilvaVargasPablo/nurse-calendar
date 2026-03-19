import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  List, 
  CheckSquare, 
  Palette, 
  Minus, 
  Type, 
  Plus, 
  Check,
  X
} from 'lucide-react';
import type { StickyNote, NoteBlock, BlockType, NoteItem } from '../types';

interface DraggableNoteProps {
  note: StickyNote;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onUpdate: (id: string, updates: Partial<StickyNote>) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDelete?: () => void;
  onDrag?: (x: number, y: number) => void;
  onDragStart?: () => void;
}

const COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'];

export const DraggableNote: React.FC<DraggableNoteProps> = ({
  note,
  containerRef,
  onUpdate,
  onDragEnd,
  onDelete,
  onDrag,
  onDragStart
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
        setShowColorMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addBlock = (type: BlockType, index?: number) => {
    const newBlock: NoteBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      isBold: false,
      items: type !== 'paragraph' ? [{ id: crypto.randomUUID(), text: '', completed: false }] : undefined
    };

    const newBlocks = [...note.blocks];
    if (index !== undefined) {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    onUpdate(note.id, { blocks: newBlocks });
  };

  const updateBlock = (blockId: string, updates: Partial<NoteBlock>) => {
    const newBlocks = note.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
    onUpdate(note.id, { blocks: newBlocks });
  };

  const removeBlock = (blockId: string) => {
    if (note.blocks.length === 1) return;
    const newBlocks = note.blocks.filter(b => b.id !== blockId);
    onUpdate(note.id, { blocks: newBlocks });
  };

  const addListItem = (blockId: string) => {
    const block = note.blocks.find(b => b.id === blockId);
    if (!block || !block.items) return;

    const newItem: NoteItem = { id: crypto.randomUUID(), text: '', completed: false };
    updateBlock(blockId, { items: [...block.items, newItem] });
  };

  const updateListItem = (blockId: string, itemId: string, text: string) => {
    const block = note.blocks.find(b => b.id === blockId);
    if (!block || !block.items) return;

    const newItems = block.items.map(i => i.id === itemId ? { ...i, text } : i);
    updateBlock(blockId, { items: newItems });
  };

  const toggleItemCompletion = (blockId: string, itemId: string) => {
    const block = note.blocks.find(b => b.id === blockId);
    if (!block || !block.items) return;

    const newItems = block.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
    updateBlock(blockId, { items: newItems });
  };

  const removeListItem = (blockId: string, itemId: string) => {
    const block = note.blocks.find(b => b.id === blockId);
    if (!block || !block.items) return;

    if (block.items.length === 1) {
      removeBlock(blockId);
      return;
    }

    const newItems = block.items.filter(i => i.id !== itemId);
    updateBlock(blockId, { items: newItems });
  };

  if (note.isMinimized) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={containerRef}
      onDragStart={onDragStart}
      onDrag={(_, info) => {
        onDrag?.(note.x + info.offset.x, note.y + info.offset.y);
      }}
      onDragEnd={(_, info) => {
        onDragEnd(note.id, note.x + info.offset.x, note.y + info.offset.y);
      }}
      initial={{ scale: 0, x: note.x, y: note.y }}
      animate={{ scale: 1, x: note.x, y: note.y }}
      exit={{ scale: 0, opacity: 0 }}
      style={{ position: 'absolute', zIndex: 30 }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 100 }}
    >
      <div 
        className="w-64 min-h-[140px] p-5 shadow-2xl rounded-sm rotate-1 flex flex-col relative group"
        style={{ backgroundColor: note.color }}
      >
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button 
              onClick={() => onUpdate(note.id, { isMinimized: true })}
              className="p-1 hover:bg-black/10 rounded-md transition-colors"
              title="Minimizar"
            >
              <Minus size={14} className="text-black/60" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-1 hover:bg-red-400 rounded-md transition-colors"
              title="Eliminar"
            >
              <X size={14} className="text-black/60" />
            </button>
          </div>
          
          <div className="flex gap-1 items-center">
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowColorMenu(!showColorMenu); }}
                className="p-1 hover:bg-black/10 rounded-md transition-colors"
                title="Color"
              >
                <Palette size={14} className="text-black/60" />
              </button>

              {showColorMenu && (
                <div 
                  ref={colorMenuRef}
                  className="absolute right-0 top-7 w-auto bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 p-2 z-20 flex gap-2 ring-1 ring-black/5"
                >
                  {COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => {
                        onUpdate(note.id, { color: c });
                        setShowColorMenu(false);
                      }}
                      className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note Body with Blocks */}
        <div className="flex-1 overflow-y-auto max-h-80 pr-1 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent hover:scrollbar-thumb-black/30 transition-colors">
          <style>{`
            .flex-1::-webkit-scrollbar {
              width: 5px;
            }
            .flex-1::-webkit-scrollbar-track {
              background: transparent;
            }
            .flex-1::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.15);
              border-radius: 99px;
            }
            .flex-1:hover::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.25);
            }
          `}</style>
          {note.blocks.map((block, bIndex) => (
            <div key={block.id} className="relative group/block px-1 mb-4 last:mb-0">
              {/* Block Menu (appears on hover) */}
              <div className="absolute -left-7 top-0 flex flex-col gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                <button 
                  onClick={() => removeBlock(block.id)}
                  className="p-0.5 text-black/20 hover:text-black/60 hover:bg-black/5 rounded"
                  title="Eliminar bloque"
                >
                  <X size={10} />
                </button>
                <div className="flex flex-col gap-0.5 mt-2">
                  <button onClick={() => addBlock('paragraph', bIndex)} className="p-0.5 text-black/20 hover:text-black/60 hover:bg-black/5 rounded"><Type size={10}/></button>
                  <button onClick={() => addBlock('list', bIndex)} className="p-0.5 text-black/20 hover:text-black/60 hover:bg-black/5 rounded"><List size={10}/></button>
                  <button onClick={() => addBlock('checklist', bIndex)} className="p-0.5 text-black/20 hover:text-black/60 hover:bg-black/5 rounded"><CheckSquare size={10}/></button>
                </div>
              </div>

              <div className="font-medium">
                {block.type === 'paragraph' ? (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-xs leading-tight placeholder:text-black/10 min-h-[1.5rem] text-black/80 font-medium"
                    placeholder="Escribe algo..."
                    spellCheck={false}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                ) : (
                  <div className="space-y-1.5">
                    {block.items?.map((item, iIndex) => (
                      <div key={item.id} className="flex items-start gap-2.5">
                        <div className="pt-[1px] flex-shrink-0 flex items-center justify-center w-4 h-4">
                          {block.type === 'checklist' ? (
                            <button 
                              onClick={() => toggleItemCompletion(block.id, item.id)}
                              className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-black/70 border-transparent text-white' : 'border-black/30 text-transparent hover:border-black/50'}`}
                            >
                              <Check size={8} strokeWidth={4} />
                            </button>
                          ) : (
                            <span className="text-[11px] text-black/50 font-bold lining-nums italic">{iIndex + 1}.</span>
                          )}
                        </div>
                        <input
                          value={item.text}
                          onChange={(e) => updateListItem(block.id, item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addListItem(block.id);
                            } else if (e.key === 'Backspace' && item.text === '') {
                              e.preventDefault();
                              removeListItem(block.id, item.id);
                            }
                          }}
                          autoFocus={item.text === '' && bIndex === note.blocks.length - 1}
                          className={`flex-1 bg-transparent border-none focus:ring-0 p-0 text-[11px] outline-none leading-4 ${item.completed ? 'line-through text-black/40' : 'text-black/80'} font-medium`}
                          placeholder={block.type === 'list' ? "Elemento..." : "Checklist..."}
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => addListItem(block.id)}
                      className="ml-6.5 text-[10px] text-black/30 hover:text-black/50 flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity"
                    >
                      <Plus size={10} /> Añadir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Quick Add */}
        <div className="mt-4 pt-3 border-t border-black/5 flex gap-2 opacity-0 group-hover:opacity-60 transition-opacity">
          <button onClick={() => addBlock('paragraph')} className="p-1 hover:bg-black/10 rounded group/btn" title="Agregar texto"><Type size={14} className="text-black/60 group-hover/btn:text-black/90"/></button>
          <button onClick={() => addBlock('list')} className="p-1 hover:bg-black/10 rounded group/btn" title="Agregar lista"><List size={14} className="text-black/60 group-hover/btn:text-black/90"/></button>
          <button onClick={() => addBlock('checklist')} className="p-1 hover:bg-black/10 rounded group/btn" title="Agregar checklist"><CheckSquare size={14} className="text-black/60 group-hover/btn:text-black/90"/></button>
        </div>
      </div>
    </motion.div>
  );
};
