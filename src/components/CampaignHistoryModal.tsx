import React, { useState, useEffect } from 'react';
import { History, X, Trash2, Edit, Calendar, Mail as MailIcon } from 'lucide-react';
import { CampaignHistoryEntry } from '../types';

interface CampaignHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: CampaignHistoryEntry) => void;
}

export const CampaignHistoryModal: React.FC<CampaignHistoryModalProps> = ({
  isOpen,
  onClose,
  onEdit
}) => {
  const [history, setHistory] = useState<CampaignHistoryEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('novelleyx_campaign_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.warn('Failed to load history', e);
      setHistory([]);
    }
  };

  const handleDelete = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('novelleyx_campaign_history', JSON.stringify(newHistory));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glassmorphism animate-scale-up" style={{ maxWidth: '700px', width: '90%' }}>
        
        <div className="modal-header">
          <div className="modal-title">
            <History className="icon-neon-cyan" size={18} />
            <span>Campaign History</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {history.length === 0 ? (
            <div className="flex-col align-center py-20 text-center">
              <History size={48} className="text-muted mb-15" style={{ opacity: 0.3 }} />
              <h4 style={{ color: 'var(--text-main)' }}>No History Found</h4>
              <p className="text-muted mt-5" style={{ fontSize: '13px' }}>Your sent campaigns will appear here.</p>
            </div>
          ) : (
            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {history.map((entry) => (
                <div 
                  key={entry.id} 
                  className="history-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="history-info" style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailIcon size={14} className="icon-neon-cyan" />
                      {entry.subject || '(No Subject)'}
                    </h4>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                      <span><strong>To:</strong> {entry.recipient}</span>
                      <span><strong>From:</strong> {entry.sender}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', opacity: 0.8 }}>
                      <Calendar size={11} />
                      {new Date(entry.date).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="history-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => onEdit(entry)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid var(--neon-cyan)',
                        color: 'var(--neon-cyan)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'}
                    >
                      <Edit size={12} />
                      Edit & Resend
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 0, 85, 0.1)',
                        border: '1px solid var(--neon-pink)',
                        color: 'var(--neon-pink)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)'}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
