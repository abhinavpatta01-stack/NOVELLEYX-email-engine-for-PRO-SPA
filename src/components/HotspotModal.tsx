import React, { useState, useEffect } from 'react';
import { Link, X, AlertTriangle } from 'lucide-react';

interface HotspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, label: string) => void;
  initialUrl?: string;
  initialLabel?: string;
  isEditing?: boolean;
}

export const HotspotModal: React.FC<HotspotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUrl = 'https://',
  initialLabel = '',
  isEditing = false
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [label, setLabel] = useState(initialLabel);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setLabel(initialLabel);
      setError('');
    }
  }, [isOpen, initialUrl, initialLabel]);

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
      onSave(trimmedUrl, label.trim() || 'Interactive Link');
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
            <label htmlFor="hotspot-label">Description / ACCESSIBILITY Label</label>
            <input
              id="hotspot-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Shop Now Button, 20% Off Banner"
            />
            <span className="field-hint">Used for alt/title tags and screens readers</span>
          </div>

          {error && (
            <div className="form-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-footer">
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
