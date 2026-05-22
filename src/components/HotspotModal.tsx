import React, { useState, useEffect } from 'react';
import { Link, X, AlertTriangle, Settings } from 'lucide-react';

interface HotspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, label: string, coords?: { left: number; top: number; width: number; height: number }) => void;
  initialUrl?: string;
  initialLabel?: string;
  isEditing?: boolean;
  initialCoords?: { left: number; top: number; width: number; height: number };
}

export const HotspotModal: React.FC<HotspotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUrl = 'https://',
  initialLabel = '',
  isEditing = false,
  initialCoords
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [label, setLabel] = useState(initialLabel);
  
  // Coordinates State in Percentages
  const [left, setLeft] = useState(initialCoords?.left ?? 0);
  const [top, setTop] = useState(initialCoords?.top ?? 0);
  const [width, setWidth] = useState(initialCoords?.width ?? 0);
  const [height, setHeight] = useState(initialCoords?.height ?? 0);

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setLabel(initialLabel);
      setLeft(initialCoords?.left ?? 30);
      setTop(initialCoords?.top ?? 35);
      setWidth(initialCoords?.width ?? 40);
      setHeight(initialCoords?.height ?? 30);
      setError('');
    }
  }, [isOpen, initialUrl, initialLabel, initialCoords]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl || trimmedUrl === 'https://' || trimmedUrl === 'http://') {
      setError('Please enter a valid target URL.');
      return;
    }

    try {
      // Basic URL format validation (must support mailto, tel, relative, or absolute HTTP/S protocols)
      if (!trimmedUrl.startsWith('mailto:') && !trimmedUrl.startsWith('tel:') && !trimmedUrl.startsWith('#')) {
        new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
      }
      setError('');
      
      onSave(
        trimmedUrl, 
        label.trim() || 'Interactive Link', 
        {
          left: Math.max(0, Math.min(100, left)),
          top: Math.max(0, Math.min(100, top)),
          width: Math.max(1, Math.min(100 - left, width)),
          height: Math.max(1, Math.min(100 - top, height))
        }
      );
    } catch {
      setError('Invalid URL format. Example: https://google.com');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism animate-fade-in">
        <div className="modal-header">
          <div className="modal-title">
            <Link size={18} className="icon-neon-cyan" />
            <span>{isEditing ? 'Configure Hotspot Link' : 'Map Clickable Region'}</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="hotspot-url">Destination URL</label>
            <input
              id="hotspot-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/promo-landing"
              autoFocus
            />
            <span className="field-hint">Supports links (https://), emails (mailto:), phone numbers (tel:) or anchors (#)</span>
          </div>

          <div className="form-group">
            <label htmlFor="hotspot-label">Description / Accessibility Label</label>
            <input
              id="hotspot-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Shop Now Button, 20% Off Banner"
            />
            <span className="field-hint">Used for alt/title tags and screen readers</span>
          </div>

          <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-dim)', paddingTop: '15px' }}>
            <div className="flex-row align-center gap-5 mb-10" style={{ color: 'var(--neon-cyan)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <Settings size={12} />
              <span>Geometry Controls (Percentage of banner size)</span>
            </div>
            
            <div className="modal-grid-2">
              <div className="form-group">
                <label>Left Position (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={left}
                  onChange={(e) => setLeft(parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Top Position (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={top}
                  onChange={(e) => setTop(parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                />
              </div>
            </div>

            <div className="modal-grid-2" style={{ marginTop: '8px' }}>
              <div className="form-group">
                <label>Width (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="any"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Height (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="any"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error" style={{ marginTop: '12px' }}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Apply Changes' : 'Create Hotspot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotspotModal;

