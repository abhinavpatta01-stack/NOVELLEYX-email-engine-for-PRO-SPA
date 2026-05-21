import React, { useState, useEffect, useRef } from 'react';
import { X, Sliders, Grid, FileJson, AlertTriangle, Download, Upload, Copy, Check, RefreshCw } from 'lucide-react';
import { EmailConfig, Hotspot } from '../types';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasMaxWidth: number;
  setCanvasMaxWidth: (width: number) => void;
  snapGridSize: number;
  setSnapGridSize: (size: number) => void;
  targetBlank: boolean;
  setTargetBlank: (targetBlank: boolean) => void;
  config: EmailConfig;
  setConfig: React.Dispatch<React.SetStateAction<EmailConfig>>;
  hotspots: Hotspot[];
  setHotspots: React.Dispatch<React.SetStateAction<Hotspot[]>>;
  base64Image: string;
  setBase64Image: (img: string) => void;
  onHardReset: () => void;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  canvasMaxWidth,
  setCanvasMaxWidth,
  snapGridSize,
  setSnapGridSize,
  targetBlank,
  setTargetBlank,
  config,
  setConfig,
  hotspots,
  setHotspots,
  base64Image,
  setBase64Image,
  onHardReset
}) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'json' | 'danger'>('layout');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset transient confirmation states on open/close or tab change
  useEffect(() => {
    setConfirmReset(false);
    setImportError('');
    setImportSuccess('');
    setImportJsonText('');
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Prepare serialized campaign state JSON
  const sessionData = JSON.stringify({
    config,
    hotspots,
    base64Image,
    canvasMaxWidth,
    snapGridSize,
    targetBlank,
    version: '1.0.0',
    timestamp: Date.now()
  }, null, 2);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(sessionData)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        setImportError('Failed to copy to clipboard.');
      });
  };

  const handleDownloadJSON = () => {
    try {
      const blob = new Blob([sessionData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novelleyx-campaign-session-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportSuccess('Campaign exported and downloaded successfully.');
    } catch (err) {
      setImportError('Export failed.');
    }
  };

  const validateAndImport = (jsonString: string) => {
    setImportError('');
    setImportSuccess('');
    try {
      const parsed = JSON.parse(jsonString);
      
      // Basic schema validation
      if (!parsed.config || typeof parsed.config !== 'object') {
        throw new Error('Missing campaign configuration metadata ("config").');
      }
      if (!parsed.hotspots || !Array.isArray(parsed.hotspots)) {
        throw new Error('Missing active hotspot boundaries list ("hotspots").');
      }

      // Restore states
      setConfig(parsed.config);
      setHotspots(parsed.hotspots);
      
      if (parsed.base64Image !== undefined) {
        setBase64Image(parsed.base64Image);
      }
      if (parsed.canvasMaxWidth !== undefined) {
        setCanvasMaxWidth(Number(parsed.canvasMaxWidth));
      }
      if (parsed.snapGridSize !== undefined) {
        setSnapGridSize(Number(parsed.snapGridSize));
      }
      if (parsed.targetBlank !== undefined) {
        setTargetBlank(Boolean(parsed.targetBlank));
      }

      setImportSuccess('Campaign workspace imported successfully!');
      setImportJsonText('');
    } catch (err: any) {
      setImportError(err.message || 'Malformed JSON. Check the campaign syntax.');
    }
  };

  const handleImportTextSubmit = () => {
    if (!importJsonText.trim()) {
      setImportError('Paste a valid JSON session first.');
      return;
    }
    validateAndImport(importJsonText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      validateAndImport(text);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // clear input
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  const handleTriggerReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
    } else {
      onHardReset();
      setConfirmReset(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content glassmorphism" 
        style={{ 
          maxWidth: '650px', 
          width: '90%', 
          border: '1px solid var(--border-dim)',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders className="icon-neon-cyan" size={20} />
            <h2 style={{ fontSize: '18px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Advanced Engine Settings
            </h2>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            margin: '15px 0', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            paddingBottom: '10px'
          }}
        >
          <button
            type="button"
            className={`btn-submit ${activeTab === 'layout' ? 'active-neon' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: activeTab === 'layout' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              border: activeTab === 'layout' ? '1px solid var(--neon-cyan)' : '1px solid var(--border-dim)',
              color: activeTab === 'layout' ? 'var(--neon-cyan)' : '#888',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('layout')}
          >
            <Grid size={11} style={{ marginRight: '5px', display: 'inline' }} />
            Layout & Snapping
          </button>
          <button
            type="button"
            className={`btn-submit ${activeTab === 'json' ? 'active-neon' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: activeTab === 'json' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              border: activeTab === 'json' ? '1px solid #8b5cf6' : '1px solid var(--border-dim)',
              color: activeTab === 'json' ? '#a78bfa' : '#888',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('json')}
          >
            <FileJson size={11} style={{ marginRight: '5px', display: 'inline' }} />
            JSON Sessions
          </button>
          <button
            type="button"
            className={`btn-submit ${activeTab === 'danger' ? 'active-neon-red' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: activeTab === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              border: activeTab === 'danger' ? '1px solid #ef4444' : '1px solid var(--border-dim)',
              color: activeTab === 'danger' ? '#f87171' : '#888',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              marginLeft: 'auto'
            }}
            onClick={() => setActiveTab('danger')}
          >
            <AlertTriangle size={11} style={{ marginRight: '5px', display: 'inline' }} />
            Danger Zone
          </button>
        </div>

        {/* Modal Body Scroll Container */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
          
          {/* TAB 1: LAYOUT & SNAPPING */}
          {activeTab === 'layout' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '5px' }}>
              
              {/* Campaign Width */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 'bold' }}>
                    Email Campaign Container Width
                  </label>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '13px', background: 'rgba(0,240,255,0.08)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0,240,255,0.2)' }}>
                    {canvasMaxWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="800"
                  step="10"
                  value={canvasMaxWidth}
                  onChange={(e) => setCanvasMaxWidth(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--neon-cyan)',
                    background: 'rgba(255,255,255,0.05)',
                    height: '6px',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', fontSize: '11px' }}>
                  Specifies the maximum responsive layout width (max-width) of the output HTML email container. Recommended size is 600px.
                </small>
              </div>

              {/* Grid Snapping */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Canvas Grid Snapping
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {[0, 1, 2, 5, 10].map((size) => (
                    <button
                      key={size}
                      type="button"
                      style={{
                        padding: '8px 4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        background: snapGridSize === size ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)',
                        border: snapGridSize === size ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.05)',
                        color: snapGridSize === size ? 'var(--neon-cyan)' : '#999',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => setSnapGridSize(size)}
                    >
                      {size === 0 ? 'None' : `${size}%`}
                    </button>
                  ))}
                </div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', fontSize: '11px' }}>
                  Snaps interactive regions to percentage increments when drawing, moving, or resizing. Renders a coordinate helper mesh overlay.
                </small>
              </div>

              {/* Window Redirect Target */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Default Link Target Window
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: targetBlank ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: targetBlank ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.05)',
                      color: targetBlank ? 'var(--neon-cyan)' : '#999',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => setTargetBlank(true)}
                  >
                    _blank (New Tab)
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: !targetBlank ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: !targetBlank ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.05)',
                      color: !targetBlank ? 'var(--neon-cyan)' : '#999',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => setTargetBlank(false)}
                  >
                    _self (Same Tab)
                  </button>
                </div>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', fontSize: '11px' }}>
                  Configures the HTML anchor target attributes to control whether newsletter links load in new tabs or replace the current screen.
                </small>
              </div>

            </div>
          )}

          {/* TAB 2: JSON SESSIONS */}
          {activeTab === 'json' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '5px' }}>
              
              {/* File Importer and Exporter Action Bar */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-submit"
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    background: 'rgba(139, 92, 246, 0.12)',
                    border: '1px solid #8b5cf6',
                    color: '#c084fc',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={handleCopyJSON}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied Workspace!' : 'Copy Session JSON'}
                </button>

                <button
                  type="button"
                  className="btn-submit"
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    background: 'rgba(0, 240, 255, 0.12)',
                    border: '1px solid var(--neon-cyan)',
                    color: 'var(--neon-cyan)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={handleDownloadJSON}
                >
                  <Download size={12} />
                  Download Backup (.json)
                </button>

                <button
                  type="button"
                  className="btn-submit"
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-dim)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={12} />
                  Upload Session (.json)
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Status messages */}
              {importError && (
                <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
                  <strong>Error: </strong> {importError}
                </div>
              )}
              {importSuccess && (
                <div style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px' }}>
                  <strong>Success: </strong> {importSuccess}
                </div>
              )}

              {/* Paste Text Area */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
                  Paste Campaign Backup Data
                </label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder='{"config": {...}, "hotspots": [...]}'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'Consolas, Monaco, monospace',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  className="btn-submit"
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '8px',
                    background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer'
                  }}
                  onClick={handleImportTextSubmit}
                >
                  Verify & Import Pasted Workspace
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="animate-fade-in" style={{ padding: '5px' }}>
              <div 
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle className="icon-neon-red" size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ color: '#f87171', margin: '0 0 4px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Destructive Operation
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#fca5a5', lineHeight: '18px' }}>
                      Performing a hard reset will permanently erase all campaign presets, current logo configurations, and custom visual hotspots from both local storage memory and active application state.
                    </p>
                  </div>
                </div>

                <div 
                  style={{ 
                    borderTop: '1px solid rgba(239, 68, 68, 0.15)', 
                    paddingTop: '12px',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: confirmReset ? '#dc2626' : 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: confirmReset ? '0 0 15px rgba(220, 38, 38, 0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={handleTriggerReset}
                  >
                    <RefreshCw size={12} className={confirmReset ? 'animate-spin' : ''} />
                    {confirmReset ? 'CONFIRM SYSTEM WIPE' : 'Hard Reset Engine'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div 
          style={{ 
            borderTop: '1px solid var(--border-dim)', 
            paddingTop: '15px', 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            className="btn-submit"
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              background: 'linear-gradient(90deg, #00f0ff, #8b5cf6)',
              border: 'none',
              borderRadius: '4px',
              color: '#07070a',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)'
            }}
            onClick={onClose}
          >
            Save & Apply
          </button>
        </div>

      </div>
    </div>
  );
};
export default AdvancedSettingsModal;
