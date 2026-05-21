import React, { useState, useRef } from 'react';
import { Hotspot } from '../types';
import { Pencil, Trash2, Move, HelpCircle } from 'lucide-react';

interface HotspotCanvasProps {
  base64Image: string;
  hotspots: Hotspot[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddHotspot: (hotspot: Omit<Hotspot, 'id'>) => void;
  onUpdateHotspot: (id: string, updates: Partial<Hotspot>) => void;
  onDeleteHotspot: (id: string) => void;
  onOpenSettings: (id: string) => void;
}

type Mode = 'idle' | 'drawing' | 'moving' | 'resizing';

export const HotspotCanvas: React.FC<HotspotCanvasProps> = ({
  base64Image,
  hotspots,
  selectedId,
  onSelect,
  onAddHotspot,
  onUpdateHotspot,
  onDeleteHotspot,
  onOpenSettings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<Mode>('idle');
  
  // Interaction positions in percentages
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Temporary drawing box state (percentages)
  const [drawBox, setDrawBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  
  // Moving / Resizing reference state
  const [activeHotspotStart, setActiveHotspotStart] = useState<Hotspot | null>(null);

  // Read coordinates in percentage from browser client event
  const getPercentageCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Boundary check
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!base64Image) return;
    
    const target = e.target as HTMLElement;
    const isHandle = target.classList.contains('resize-handle');
    const isBox = target.classList.contains('hotspot-box') || target.classList.contains('hotspot-body');
    const boxId = target.getAttribute('data-id');

    // Prevent default context actions or scroll behavior
    if (e.pointerType === 'touch') {
      // For drawing, we only allow it on background or direct containers to avoid conflict with buttons
      const isButton = target.closest('.hotspot-actions') || target.closest('button');
      if (isButton) return;
    }

    const coords = getPercentageCoords(e.clientX, e.clientY);
    setStartPos(coords);

    if (isHandle && boxId) {
      // Resize mode
      e.stopPropagation();
      const hotspot = hotspots.find(h => h.id === boxId);
      if (hotspot) {
        onSelect(boxId);
        setMode('resizing');
        setActiveHotspotStart({ ...hotspot });
      }
    } else if (isBox && boxId) {
      // Move mode
      e.stopPropagation();
      const hotspot = hotspots.find(h => h.id === boxId);
      if (hotspot) {
        onSelect(boxId);
        setMode('moving');
        setActiveHotspotStart({ ...hotspot });
      }
    } else {
      // Drawing new box mode (on background image or container)
      const isActionElement = target.closest('.hotspot-actions') || target.closest('button');
      if (isActionElement) return;

      onSelect(null);
      setMode('drawing');
      setDrawBox({
        left: coords.x,
        top: coords.y,
        width: 0,
        height: 0
      });
    }

    // Set pointer capture to tracking mouse movements globally
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'idle') return;

    const coords = getPercentageCoords(e.clientX, e.clientY);

    if (mode === 'drawing' && drawBox) {
      const left = Math.min(startPos.x, coords.x);
      const top = Math.min(startPos.y, coords.y);
      const width = Math.abs(coords.x - startPos.x);
      const height = Math.abs(coords.y - startPos.y);
      
      setDrawBox({ left, top, width, height });
    } 
    else if (mode === 'moving' && activeHotspotStart && selectedId) {
      const dx = coords.x - startPos.x;
      const dy = coords.y - startPos.y;

      let newLeft = activeHotspotStart.left + dx;
      let newTop = activeHotspotStart.top + dy;

      // Keep inside container boundaries
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + activeHotspotStart.width > 100) newLeft = 100 - activeHotspotStart.width;
      if (newTop + activeHotspotStart.height > 100) newTop = 100 - activeHotspotStart.height;

      onUpdateHotspot(selectedId, {
        left: parseFloat(newLeft.toFixed(2)),
        top: parseFloat(newTop.toFixed(2))
      });
    } 
    else if (mode === 'resizing' && activeHotspotStart && selectedId) {
      const dx = coords.x - startPos.x;
      const dy = coords.y - startPos.y;

      let newWidth = activeHotspotStart.width + dx;
      let newHeight = activeHotspotStart.height + dy;

      // Min sizes
      newWidth = Math.max(3, Math.min(100 - activeHotspotStart.left, newWidth));
      newHeight = Math.max(3, Math.min(100 - activeHotspotStart.top, newHeight));

      onUpdateHotspot(selectedId, {
        width: parseFloat(newWidth.toFixed(2)),
        height: parseFloat(newHeight.toFixed(2))
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    containerRef.current?.releasePointerCapture(e.pointerId);

    if (mode === 'drawing' && drawBox) {
      // Filter out micro boxes
      if (drawBox.width > 2.5 && drawBox.height > 2.5) {
        // Open details modal by triggering custom form
        onAddHotspot({
          url: 'https://',
          label: `Zone ${hotspots.length + 1}`,
          left: parseFloat(drawBox.left.toFixed(2)),
          top: parseFloat(drawBox.top.toFixed(2)),
          width: parseFloat(drawBox.width.toFixed(2)),
          height: parseFloat(drawBox.height.toFixed(2))
        });
      }
      setDrawBox(null);
    }
    
    setMode('idle');
    setActiveHotspotStart(null);
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-header-bar">
        <h3>2. Draw & Configure Interactive Regions</h3>
        <div className="canvas-hint">
          <HelpCircle size={14} />
          <span>Click & drag on the image below to map a link, or drag nodes to adjust.</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`canvas-container ${!base64Image ? 'disabled' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {base64Image ? (
          <img 
            ref={imageRef}
            src={base64Image} 
            alt="Email Workspace Banner" 
            className="canvas-image"
            draggable="false"
          />
        ) : (
          <div className="canvas-placeholder flex-col animate-pulse">
            <Move size={48} className="icon-neon-cyan mb-10" />
            <p>Upload a promotional image on the left sidebar to start drawing clickable areas</p>
          </div>
        )}

        {/* Existing regions */}
        {base64Image && hotspots.map((h) => {
          const isSelected = selectedId === h.id;
          return (
            <div
              key={h.id}
              data-id={h.id}
              className={`hotspot-box ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${h.left}%`,
                top: `${h.top}%`,
                width: `${h.width}%`,
                height: `${h.height}%`
              }}
            >
              {/* Box core dragging area */}
              <div 
                data-id={h.id} 
                className="hotspot-body" 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(h.id);
                }}
              />

              {/* Box header label */}
              <div className="hotspot-header-tag">
                <span className="hotspot-tag-label">{h.label || 'Link'}</span>
                <span className="hotspot-tag-url">{h.url.substring(0, 16)}{h.url.length > 16 ? '...' : ''}</span>
              </div>

              {/* Bottom-right resizing node */}
              <div 
                data-id={h.id} 
                className="resize-handle"
                title="Drag to resize"
              />

              {/* Inline quick tools for selected hotspot */}
              {isSelected && (
                <div className="hotspot-actions animate-fade-in">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    title="Edit Link Settings"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSettings(h.id);
                    }}
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    title="Delete Region"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHotspot(h.id);
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Temporary box when drawing */}
        {mode === 'drawing' && drawBox && (
          <div
            className="hotspot-box temp-drawing"
            style={{
              left: `${drawBox.left}%`,
              top: `${drawBox.top}%`,
              width: `${drawBox.width}%`,
              height: `${drawBox.height}%`
            }}
          />
        )}
      </div>
    </div>
  );
};
export default HotspotCanvas;
