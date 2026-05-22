import React, { useState, useEffect } from 'react';
import { Mail, Send, X, Paperclip, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { EmailConfig, Hotspot, CampaignHistoryEntry } from '../types';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  companyName: string;
  config: EmailConfig;
  hotspots: Hotspot[];
  base64Image: string;
}

type SendingStatus = 'idle' | 'sending' | 'success' | 'error';

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  htmlCode,
  companyName,
  config,
  hotspots,
  base64Image
}) => {
  const [sender, setSender] = useState('marketing@novelleyx.com');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [status, setStatus] = useState<SendingStatus>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSubject(`Exclusive Campaign from ${companyName || 'Novelleyx'}`);
      setRecipient('');
      setSender('marketing@novelleyx.com');
      
      setAttachments([]);
      setStatus('idle');
      setActiveStep(0);
      setErrorMessage('');
      setIsDragging(false);
      setTerminalLogs([]);
    }
  }, [isOpen, companyName]);

  if (!isOpen) return null;

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 3 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 3MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64String
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const runSimulatedSend = async () => {
    setStatus('sending');
    setTerminalLogs([]);
    setActiveStep(1);

    const logs = [
      `[info] Resolving optimal delivery route...`,
      `[info] Establishing connection to dispatch server...`,
      `[success] Connection established successfully.`,
      `[info] Compiling email template payload (${(htmlCode.length / 1024).toFixed(1)} KB)...`,
      ...attachments.map(att => `[info] Bound Attachment: ${att.name} (${formatSize(att.size)}, mime: ${att.type})`),
      `[info] Transmitting payload headers & mime boundary...`,
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
      setTerminalLogs(prev => [...prev, logs[i]]);
      
      if (i === 1) setActiveStep(1);
      if (i === 3) setActiveStep(2);
      if (i === logs.length - 1) setActiveStep(3);
    }

    setTerminalLogs(prev => [...prev, `[info] Dispatching secure payload to downstream MX...`]);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Save to history
    const historyEntry: CampaignHistoryEntry = {
      id: 'history_' + Date.now(),
      date: new Date().toISOString(),
      sender,
      recipient,
      subject,
      config,
      hotspots,
      base64Image
    };

    try {
      const savedHistory = localStorage.getItem('novelleyx_campaign_history');
      const historyArr: CampaignHistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : [];
      historyArr.unshift(historyEntry);
      localStorage.setItem('novelleyx_campaign_history', JSON.stringify(historyArr));
    } catch (e) {
      console.warn("Failed to save history", e);
    }

    const finalLogs = [
      `[success] Delivery confirmed. Campaign successfully routed to ${recipient}!`,
    ];

    for (let i = 0; i < finalLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTerminalLogs(prev => [...prev, finalLogs[i]]);
    }

    setActiveStep(4);
    await new Promise(resolve => setTimeout(resolve, 600));
    setStatus('success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !sender.trim()) return;
    runSimulatedSend();
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glassmorphism animate-scale-up" style={{ maxWidth: '550px' }}>
        
        <div className="modal-header">
          <div className="modal-title">
            <Mail className="icon-neon-cyan" size={16} />
            <span>Send Email Campaign</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} disabled={status === 'sending'}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {status === 'idle' && (
            <form onSubmit={handleSubmit} className="flex-col gap-10">
              <div className="modal-grid-2">
                <div className="form-group">
                  <label htmlFor="send-sender">Sender Email (From)</label>
                  <input
                    id="send-sender"
                    type="email"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="marketing@company.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="send-recipient">Recipient Email (To)</label>
                  <input
                    id="send-recipient"
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="recipient@company.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="send-subject">Subject Line</label>
                <input
                  id="send-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email Subject Line"
                  required
                />
              </div>

              <div className="form-group">
                <label>Add File Attachments (Optional)</label>
                <div 
                  className={`attachment-dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => document.getElementById('email-attachment-file')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Paperclip size={18} className="icon-neon-cyan" />
                  <span>{isDragging ? 'Drop Files Here' : 'Choose Files or Drag & Drop'}</span>
                  <span>Max 3MB per file</span>
                  <input
                    id="email-attachment-file"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="attachments-list scrollbar-neon">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="attachment-file-item animate-fade-in">
                        <div className="flex-row align-center min-width-0">
                          <span className="attachment-file-name">{file.name}</span>
                          <span className="attachment-file-size">({formatSize(file.size)})</span>
                        </div>
                        <button 
                          type="button" 
                          className="btn-remove-attachment"
                          onClick={() => removeAttachment(idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit flex-row align-center gap-5">
                  <Send size={13} />
                  <span>Send Campaign</span>
                </button>
              </div>
            </form>
          )}

          {status === 'sending' && (
            <div className="flex-col align-center py-10 text-center animate-fade-in">
              <RefreshCw className="icon-neon-cyan animate-spin mb-10" size={28} />
              <h4>Transmitting Campaign...</h4>
              <p className="text-muted mt-5" style={{ fontSize: '11px' }}>Please hold on while the campaign is prepared and routed.</p>

              <div 
                className="terminal-console-wrapper w-100 my-15"
                style={{
                  border: '1px solid var(--border-dim)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  width: '100%'
                }}
              >
                <div 
                  className="terminal-header flex-row justify-between align-center px-10 py-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid var(--border-dim)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px'
                  }}
                >
                  <span>TRANSACTION CONSOLE</span>
                  <div className="terminal-buttons flex-row gap-5" style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}></span>
                  </div>
                </div>
                <div 
                  className="terminal-body p-10 scrollbar-neon" 
                  style={{ 
                    maxHeight: '160px', 
                    overflowY: 'auto', 
                    textAlign: 'left', 
                    fontFamily: '"JetBrains Mono", monospace', 
                    fontSize: '10px', 
                    lineHeight: '15px', 
                    background: '#07070a', 
                    color: '#e0e0e6',
                    height: '160px'
                  }}
                >
                  {terminalLogs.map((log, idx) => {
                    let color = '#a0a0b0';
                    if (log.startsWith('[info]')) color = '#00bcff';
                    else if (log.startsWith('[success]')) color = '#39ff14';
                    else if (log.startsWith('[error]')) color = '#ff0055';
                    
                    return (
                      <div key={idx} style={{ color, wordBreak: 'break-all' }}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="stepper-container w-100" style={{ padding: '10px', marginTop: '0' }}>
                <div className={`step-item ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>{activeStep > 1 ? '✓' : '1'}</div>
                  <div className="step-text">Connecting to Server</div>
                </div>

                <div className={`step-item ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>{activeStep > 2 ? '✓' : '2'}</div>
                  <div className="step-text">Compiling Payload</div>
                </div>

                <div className={`step-item ${activeStep >= 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>{activeStep > 3 ? '✓' : '3'}</div>
                  <div className="step-text">Transmitting Data</div>
                </div>

                <div className={`step-item ${activeStep >= 4 ? 'active' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>4</div>
                  <div className="step-text">Delivery Receipt</div>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex-col align-center py-20 text-center animate-fade-in">
              <CheckCircle className="text-neon-cyan mb-15" size={48} />
              <h3>Campaign Dispatched!</h3>
              <p className="text-muted mt-10" style={{ fontSize: '13px', lineHeight: '20px' }}>
                The responsive campaign was routed successfully:
                <br />
                <span style={{ color: 'var(--text-muted)' }}>From:</span> <strong className="text-neon-cyan">{sender}</strong>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>To:</span> <strong className="text-neon-cyan">{recipient}</strong>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>Subject:</span> <em>"{subject}"</em>
              </p>

              {attachments.length > 0 && (
                <div className="mt-10 text-muted" style={{ fontSize: '11px' }}>
                  Successfully attached {attachments.length} files.
                </div>
              )}

              <div className="modal-footer w-100" style={{ justifyContent: 'center', marginTop: '30px' }}>
                <button type="button" className="btn-submit" style={{ padding: '10px 30px' }} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex-col align-center py-20 text-center animate-fade-in">
              <AlertCircle className="text-neon-pink mb-15" size={48} />
              <h3>Transmission Failed</h3>
              <div className="form-error w-100 mt-10">
                <span>{errorMessage}</span>
              </div>
              <div className="modal-footer w-100" style={{ justifyContent: 'center', marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={() => setStatus('idle')}>
                  Back to Form
                </button>
                <button type="button" className="btn-submit" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SendEmailModal;
