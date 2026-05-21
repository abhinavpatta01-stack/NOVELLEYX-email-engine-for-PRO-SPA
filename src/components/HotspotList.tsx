import React from 'react';
import { Hotspot } from '../types';
import { Trash2, Edit2, Link, MapPin } from 'lucide-react';

interface HotspotListProps {
  hotspots: Hotspot[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const HotspotList: React.FC<HotspotListProps> = ({
  hotspots,
  selectedId,
  onSelect,
  onDelete,
  onEdit
}) => {
  return (
    <div className="hotspot-list-wrapper">
      <div className="section-title-bar">
        <h4>Interactive Links ({hotspots.length})</h4>
      </div>

      {hotspots.length === 0 ? (
        <div className="hotspot-list-empty">
          <p>No active hotspots mapped yet.</p>
          <span className="hint">Draw directly on the image banner to insert a new link region.</span>
        </div>
      ) : (
        <div className="hotspot-list-scroll scrollbar-neon">
          {hotspots.map((h, index) => {
            const isSelected = selectedId === h.id;
            return (
              <div
                key={h.id}
                className={`hotspot-list-item glassmorphism ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(h.id)}
              >
                <div className="item-main">
                  <div className="item-row-header">
                    <span className="item-badge">Zone {index + 1}</span>
                    <span className="item-label-text">{h.label || 'Unnamed Link'}</span>
                  </div>
                  
                  <div className="item-url-row">
                    <Link size={12} className="url-icon text-muted" />
                    <a 
                      href={h.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="item-url-link"
                      onClick={(e) => e.stopPropagation()} // don't trigger selection toggle
                    >
                      {h.url}
                    </a>
                  </div>

                  <div className="item-coords-grid">
                    <span className="coord-chip">
                      <MapPin size={9} /> L: {h.left}%
                    </span>
                    <span className="coord-chip">T: {h.top}%</span>
                    <span className="coord-chip">W: {h.width}%</span>
                    <span className="coord-chip">H: {h.height}%</span>
                  </div>
                </div>

                <div className="item-actions">
                  <button
                    type="button"
                    className="icon-btn-rounded hover-cyan"
                    title="Edit Settings"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(h.id);
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn-rounded hover-pink"
                    title="Remove Area"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(h.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default HotspotList;
