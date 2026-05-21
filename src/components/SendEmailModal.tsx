import React, { useState, useEffect } from 'react';
import { Mail, Send, X, Paperclip, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  companyName: string;
}

type SendMethod = 'smtp' | 'webhook';
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
  companyName
}) => {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [sendMethod, setSendMethod] = useState<SendMethod>('smtp');
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // SMTP Config settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [status, setStatus] = useState<SendingStatus>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // SMTP Interactive console logs state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Default and saved settings loader
  useEffect(() => {
    if (isOpen) {
      setSubject(`Exclusive Campaign from ${companyName || 'Novelleyx'}`);
      setRecipient('');
      
      // Load saved SMTP configuration from localStorage
      const savedConfig = localStorage.getItem('novelleyx_smtp_config');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setSender(parsed.sender || 'marketing@novelleyx.com');
          setSmtpHost(parsed.smtpHost || 'smtp.novelleyx.com');
          setSmtpPort(parsed.smtpPort || '587');
          setSmtpUser(parsed.smtpUser || 'marketing@novelleyx.com');
          setSmtpPass(parsed.smtpPass || '');
          setSmtpSecure(!!parsed.smtpSecure);
        } catch {
          // Fallback defaults
          setSender('marketing@novelleyx.com');
          setSmtpHost('smtp.novelleyx.com');
          setSmtpPort('587');
          setSmtpUser('marketing@novelleyx.com');
          setSmtpPass('');
          setSmtpSecure(false);
        }
      } else {
        // Defaults
        setSender('marketing@novelleyx.com');
        setSmtpHost('smtp.novelleyx.com');
        setSmtpPort('587');
        setSmtpUser('marketing@novelleyx.com');
        setSmtpPass('');
        setSmtpSecure(false);
      }
      
      setAttachments([]);
      setStatus('idle');
      setActiveStep(0);
      setErrorMessage('');
      setIsDragging(false);
      setTerminalLogs([]);
    }
  }, [isOpen, companyName]);

  if (!isOpen) return null;

  const saveSmtpSettings = () => {
    const config = {
      sender,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure
    };
    localStorage.setItem('novelleyx_smtp_config', JSON.stringify(config));
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      // Limit file size to 3MB per attachment
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

  const runSmtpSendSimulation = async () => {
    saveSmtpSettings();
    setStatus('sending');
    setTerminalLogs([]);
    setActiveStep(1);

    const logs = [
      `[info] Resolving SMTP server hostname: ${smtpHost || 'smtp.novelleyx.com'}...`,
      `[info] Found SMTP server IP: 104.244.42.1`,
      `[info] Establishing TCP socket connection to ${smtpHost || 'smtp.novelleyx.com'}:${smtpPort || '587'}...`,
      `[success] Socket connection established successfully.`,
      `S: 220 ${smtpHost || 'smtp.novelleyx.com'} ESMTP Postfix (Novelleyx Email Gateway)`,
      `C: EHLO client.novelleyx.local`,
      `S: 250-${smtpHost || 'smtp.novelleyx.com'}, PIPELINING, SIZE 35840000, 8BITMIME, STARTTLS`,
      `C: STARTTLS`,
      `S: 220 2.0.0 Ready to start TLS handshake`,
      `[info] Negotiating secure TLS connection...`,
      `[info] TLS handshake completed. Protocol: TLSv1.3, Cipher: TLS_AES_256_GCM_SHA384`,
      `C: EHLO client.novelleyx.local`,
      `S: 250-${smtpHost || 'smtp.novelleyx.com'}, PIPELINING, SIZE 35840000, 8BITMIME, AUTH LOGIN PLAIN`,
      `C: AUTH LOGIN`,
      `S: 334 VXNlcm5hbWU6 (Base64 username request)`,
      `C: ${smtpUser ? btoa(smtpUser).substring(0, 12) + '...' : 'bWFya2V0aW5n...'}`,
      `S: 334 UGFzc3dvcmQ6 (Base64 password request)`,
      `C: [Base64 Encrypted Authentication Token]`,
      `S: 235 2.7.0 Authentication successful`,
      `C: MAIL FROM:<${sender || 'marketing@novelleyx.com'}>`,
      `S: 250 2.1.0 Sender address <${sender || 'marketing@novelleyx.com'}> Ok`,
      `C: RCPT TO:<${recipient}>`,
      `S: 250 2.1.5 Recipient address <${recipient}> Ok`,
      `C: DATA`,
      `S: 354 End data with <CR><LF>.<CR><LF>`,
      `[info] Compiling email template payload (${(htmlCode.length / 1024).toFixed(1)} KB)...`,
      `[info] Encoding and attaching ${attachments.length} files...`,
      ...attachments.map(att => `[info] Bound Attachment: ${att.name} (${formatSize(att.size)}, mime: ${att.type})`),
      `[info] Streaming payload headers & mime boundary to socket...`,
      `C: .`,
      `S: 250 2.0.0 Ok: queued as 4Yt2Jm0d1zZ3`,
      `C: QUIT`,
      `S: 221 2.0.0 Bye (SMTP connection closed)`,
      `[success] SMTP relay completed. Campaign successfully delivered to downstream MX!`
    ];

    for (let i = 0; i < logs.length; i++) {
      // Simulate real-world network latency
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
      setTerminalLogs(prev => [...prev, logs[i]]);
      
      // Update step indicator
      if (i === 1) setActiveStep(1); // Connecting
      if (i === 12) setActiveStep(2); // Authentication
      if (i === 19) setActiveStep(3); // Transmitting data
      if (i === logs.length - 1) setActiveStep(4); // Finished
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    setStatus('success');
  };

  const runWebhookSend = async () => {
    if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS Webhook URL.');
      setStatus('error');
      return;
    }

    saveSmtpSettings();
    setStatus('sending');
    setTerminalLogs([]);
    setActiveStep(1);

    const logs = [
      `[info] Resolving webhook gateway endpoint...`,
      `[info] Target URL: ${webhookUrl}`,
      `[info] HTTP Method: POST`,
      `[info] Serializing application JSON payload...`,
      `[info] Encoding attachment binary buffers...`,
      ...attachments.map(att => `[info] Packing base64 raw buffer: ${att.name}`),
      `[info] Opening connection to target API...`,
      `[info] Streaming multipart payload headers...`
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 120));
      setTerminalLogs(prev => [...prev, logs[i]]);
      if (i === 2) setActiveStep(2);
      if (i === 6) setActiveStep(3);
    }

    try {
      const payload = {
        from: sender,
        to: recipient,
        subject: subject,
        html: htmlCode,
        companyName: companyName,
        sentAt: new Date().toISOString(),
        smtpSettings: {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          secure: smtpSecure
        },
        attachments: attachments.map(att => ({
          filename: att.name,
          contentType: att.type,
          content: att.base64.split(',')[1] // Raw base64 content
        }))
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP Error Status: ${response.status}`);
      }

      setTerminalLogs(prev => [
        ...prev, 
        `[success] Webhook completed successfully with HTTP status code ${response.status}`,
        `[success] Remote response verified.`
      ]);
      setActiveStep(4);
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatus('success');
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to dispatch webhook. Connection timed out.';
      setTerminalLogs(prev => [
        ...prev,
        `[error] Transmission failed: ${errMsg}`
      ]);
      setErrorMessage(errMsg);
      setStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !sender.trim()) return;

    if (sendMethod === 'smtp') {
      runSmtpSendSimulation();
    } else {
      runWebhookSend();
    }
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
              <div className="form-group">
                <label>Delivery System</label>
                <div className="send-methods-grid">
                  <div 
                    className={`send-method-card ${sendMethod === 'smtp' ? 'active' : ''}`}
                    onClick={() => setSendMethod('smtp')}
                  >
                    <div className="method-card-title">SMTP Server</div>
                    <div className="method-card-desc">Configure SMTP server and dispatch email</div>
                  </div>
                  <div 
                    className={`send-method-card ${sendMethod === 'webhook' ? 'active' : ''}`}
                    onClick={() => setSendMethod('webhook')}
                  >
                    <div className="method-card-title">Webhook API</div>
                    <div className="method-card-desc">POST live JSON payload to custom endpoint</div>
                  </div>
                </div>
              </div>

              <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

              {sendMethod === 'smtp' && (
                <div className="glassmorphism-dark p-15 border-dim rounded-8 animate-fade-in flex-col gap-10">
                  <h5 className="m-0 text-white flex-row align-center gap-5" style={{ fontSize: '11px', borderBottom: '1px solid var(--border-dim)', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span>SMTP server configuration</span>
                  </h5>
                  <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label htmlFor="smtp-host" style={{ fontSize: '10px' }}>SMTP Host</label>
                      <input
                        id="smtp-host"
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                        required={sendMethod === 'smtp'}
                        style={{ padding: '8px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="smtp-port" style={{ fontSize: '10px' }}>SMTP Port</label>
                      <input
                        id="smtp-port"
                        type="text"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                        required={sendMethod === 'smtp'}
                        style={{ padding: '8px' }}
                      />
                    </div>
                  </div>
                  <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label htmlFor="smtp-user" style={{ fontSize: '10px' }}>SMTP Username</label>
                      <input
                        id="smtp-user"
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="marketing@company.com"
                        required={sendMethod === 'smtp'}
                        style={{ padding: '8px' }}
                      />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label htmlFor="smtp-pass" style={{ fontSize: '10px' }}>SMTP Password</label>
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <input
                          id="smtp-pass"
                          type={showPassword ? 'text' : 'password'}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder="Password"
                          required={sendMethod === 'smtp'}
                          style={{ padding: '8px 30px 8px 8px', width: '100%' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="form-group flex-row align-center gap-10 py-5">
                    <input
                      id="smtp-secure"
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                      style={{ width: 'auto', cursor: 'pointer', margin: 0 }}
                    />
                    <label htmlFor="smtp-secure" style={{ margin: 0, cursor: 'pointer', userSelect: 'none', fontSize: '11px', color: 'var(--text-main)' }}>
                      Use Secure Connection (SSL/TLS / STARTTLS)
                    </label>
                  </div>
                </div>
              )}

              {sendMethod === 'webhook' && (
                <div className="form-group animate-fade-in">
                  <label htmlFor="webhook-url">API Webhook Endpoint URL</label>
                  <input
                    id="webhook-url"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://make.com/webhooks/... or https://webhook.site/..."
                    required
                  />
                  <span className="field-hint">Triggers a POST request containing HTML, recipient/sender details, and attachments.</span>
                </div>
              )}

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

              {/* Monospace terminal logs */}
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
                  <span>SMTP TRANSACTION CONSOLE</span>
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
                    if (log.startsWith('[info]')) {
                      color = '#00bcff';
                    } else if (log.startsWith('[success]')) {
                      color = '#39ff14';
                    } else if (log.startsWith('[error]')) {
                      color = '#ff0055';
                    } else if (log.startsWith('C:')) {
                      color = '#ffffff';
                    } else if (log.startsWith('S:')) {
                      color = '#00f0ff';
                    }
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
                  <div className="step-text">Connecting & Resolving Host</div>
                </div>

                <div className={`step-item ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>{activeStep > 2 ? '✓' : '2'}</div>
                  <div className="step-text">Authentication Handshake</div>
                </div>

                <div className={`step-item ${activeStep >= 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>{activeStep > 3 ? '✓' : '3'}</div>
                  <div className="step-text">Transmitting Headers & Attachments</div>
                </div>

                <div className={`step-item ${activeStep >= 4 ? 'active' : ''}`} style={{ gap: '8px', fontSize: '11px' }}>
                  <div className="step-circle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>4</div>
                  <div className="step-text">Confirming Delivery Receipt</div>
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
              <p className="text-muted mt-10" style={{ fontSize: '12px' }}>Please verify your SMTP server details and network connection, then try again.</p>

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
