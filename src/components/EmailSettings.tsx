import React, { useState } from 'react';
import { EmailConfig, NavLink, SocialLink, BrandPreset } from '../types';
import { 
  Building, Image, Type, Compass, 
  Share2, ChevronDown, ChevronUp, Upload, Trash, Plus, X 
} from 'lucide-react';

interface EmailSettingsProps {
  config: EmailConfig;
  onChange: (updates: Partial<EmailConfig>) => void;
  presets: BrandPreset[];
  onPresetSelect: (presetId: string) => void;
  onSavePreset: (preset: Omit<BrandPreset, 'id'>) => void;
  onDeletePreset: (presetId: string) => void;
  onImageUpload: (file: File) => void;
  base64Image: string;
}

type AccordionKey = 'brand' | 'image' | 'header' | 'cta' | 'footer';

export const EmailSettings: React.FC<EmailSettingsProps> = ({
  config,
  onChange,
  presets,
  onPresetSelect,
  onSavePreset,
  onDeletePreset,
  onImageUpload,
  base64Image
}) => {
  const [activeAccordion, setActiveAccordion] = useState<AccordionKey>('brand');
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom Preset Modal State
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [addCompanyName, setAddCompanyName] = useState('');
  const [addFallbackUrl, setAddFallbackUrl] = useState('https://');
  const [addPrimaryColor, setAddPrimaryColor] = useState('#00f0ff');
  const [addLogoUrl, setAddLogoUrl] = useState('');

  const toggleAccordion = (key: AccordionKey) => {
    setActiveAccordion(activeAccordion === key ? 'brand' : key);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  // Nav Links helper functions
  const handleNavLinkChange = (index: number, field: keyof NavLink, value: string) => {
    const newLinks = [...config.navLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({ navLinks: newLinks });
  };

  const addNavLink = () => {
    if (config.navLinks.length >= 4) return;
    onChange({
      navLinks: [...config.navLinks, { text: 'New Page', url: 'https://' }]
    });
  };

  const removeNavLink = (index: number) => {
    const newLinks = config.navLinks.filter((_, idx) => idx !== index);
    onChange({ navLinks: newLinks });
  };

  // Social Links helper functions
  const handleSocialLinkChange = (index: number, updates: Partial<SocialLink>) => {
    const newSocials = [...config.socialLinks];
    newSocials[index] = { ...newSocials[index], ...updates };
    onChange({ socialLinks: newSocials });
  };

  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCompanyName.trim()) return;

    onSavePreset({
      name: addCompanyName.trim(),
      fallbackUrl: addFallbackUrl.trim(),
      logoUrl: addLogoUrl.trim(),
      primaryColor: addPrimaryColor,
      navLinks: [
        { text: 'Home', url: addFallbackUrl.trim() },
        { text: 'Products', url: addFallbackUrl.trim() + '/products' },
        { text: 'Contact Us', url: addFallbackUrl.trim() + '/contact' }
      ],
      footerText: `© ${new Date().getFullYear()} ${addCompanyName.trim()} Technology Inc. All Rights Reserved.`,
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com', active: false },
        { platform: 'x', url: 'https://x.com', active: true },
        { platform: 'instagram', url: 'https://instagram.com', active: true },
        { platform: 'linkedin', url: 'https://linkedin.com', active: false },
        { platform: 'youtube', url: 'https://youtube.com', active: false }
      ]
    });

    // Reset and Close
    setAddCompanyName('');
    setAddFallbackUrl('https://');
    setAddPrimaryColor('#00f0ff');
    setAddLogoUrl('');
    setShowAddCompanyModal(false);
  };

  return (
    <div className="settings-panel scrollbar-neon">
      
      {/* 1. BRAND & PRESETS ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'brand' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('brand')}
        >
          <div className="accordion-title">
            <Building size={16} className="icon-neon-cyan" />
            <span>1. Brand Settings & Presets</span>
          </div>
          {activeAccordion === 'brand' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="form-group">
            <div className="flex-row justify-between align-center mb-5">
              <label>Select active company profile</label>
              <button 
                type="button" 
                className="btn-tiny flex-row align-center gap-5"
                onClick={() => setShowAddCompanyModal(true)}
              >
                <Plus size={10} />
                <span>Add Company</span>
              </button>
            </div>
            
            <div className="presets-list-container scrollbar-neon">
              {presets.map(p => {
                const isActive = config.companyName.toLowerCase() === p.name.toLowerCase();
                return (
                  <div 
                    key={p.id} 
                    className={`preset-list-row ${isActive ? 'active' : ''}`}
                  >
                    <span 
                      className="preset-row-name flex-1"
                      onClick={() => onPresetSelect(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.name}
                    </span>
                    {p.id !== 'novelleyx' && (
                      <button 
                        type="button" 
                        className="btn-delete-preset" 
                        onClick={() => onDeletePreset(p.id)}
                        title="Delete Company Profile"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company-name">Brand Name</label>
            <input
              id="company-name"
              type="text"
              value={config.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="e.g. Novelleyx"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fallback-url">Main Fallback Link URL</label>
            <input
              id="fallback-url"
              type="text"
              value={config.fallbackUrl}
              onChange={(e) => onChange({ fallbackUrl: e.target.value })}
              placeholder="https://novelleyx.com"
            />
            <span className="field-hint">Primary fallback link if user clicks outside mapped hotspots.</span>
          </div>

          <div className="form-group">
            <label htmlFor="email-preheader">Inboxes Preview Preheader Text</label>
            <input
              id="email-preheader"
              type="text"
              value={config.preheader}
              onChange={(e) => onChange({ preheader: e.target.value })}
              placeholder="e.g. Don't miss our summer flash sale! ⚡"
            />
            <span className="field-hint">Hidden intro text visible inside email client previews.</span>
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL IMAGE ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'image' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('image')}
        >
          <div className="accordion-title">
            <Image size={16} className="icon-neon-cyan" />
            <span>2. Promotional Banner Graphic</span>
          </div>
          {activeAccordion === 'image' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="form-group">
            <label>Image Source Type</label>
            <div className="segmented-control">
              <button
                type="button"
                className={config.imageType === 'base64' ? 'active' : ''}
                onClick={() => onChange({ imageType: 'base64' })}
              >
                Local Upload (Base64)
              </button>
              <button
                type="button"
                className={config.imageType === 'external' ? 'active' : ''}
                onClick={() => onChange({ imageType: 'external' })}
              >
                External CDN URL
              </button>
            </div>
          </div>

          {config.imageType === 'base64' ? (
            <div className="form-group">
              <label>Select & Load Promotional Image</label>
              <div 
                className={`upload-dropzone ${base64Image ? 'has-file' : ''} ${isDragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('sidebar-image-file')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={24} className="icon-neon-cyan" />
                <span>{isDragging ? 'Drop Image Here' : base64Image ? 'Replace Banner Image' : 'Click to Upload Image'}</span>
                <span className="field-hint">Supports PNG, JPG, WEBP (Max 3MB)</span>
                <input
                  id="sidebar-image-file"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="external-image-url">CDN Hosted Image URL</label>
              <input
                id="external-image-url"
                type="text"
                value={config.externalImageUrl}
                onChange={(e) => onChange({ externalImageUrl: e.target.value })}
                placeholder="https://mycdn.com/assets/email-banner.png"
              />
              <span className="field-hint">Enter the absolute web URL of your image asset. Highly recommended for actual campaign deployments.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. OPTIONAL HEADER ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'header' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('header')}
        >
          <div className="accordion-title">
            <Compass size={16} className="icon-neon-cyan" />
            <span>3. Brand Header Block (Optional)</span>
          </div>
          {activeAccordion === 'header' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="toggle-group mb-15">
            <span className="toggle-label">Include Brand Header Section</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.headerActive}
                onChange={(e) => onChange({ headerActive: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {config.headerActive && (
            <div className="accordion-sub-fields animate-fade-in">
              <div className="form-group">
                <label htmlFor="header-logo-url">Logo Image URL (Leave blank to use Brand Name Text)</label>
                <input
                  id="header-logo-url"
                  type="text"
                  value={config.headerLogoUrl}
                  onChange={(e) => onChange({ headerLogoUrl: e.target.value })}
                  placeholder="https://yourcompany.com/logo.png"
                />
              </div>

              <div className="flex-row gap-15 mb-15">
                <div className="form-group flex-1">
                  <label htmlFor="header-bg-color">Background Color</label>
                  <div className="color-picker-input">
                    <input
                      id="header-bg-color"
                      type="color"
                      value={config.headerBgColor}
                      onChange={(e) => onChange({ headerBgColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.headerBgColor}
                      onChange={(e) => onChange({ headerBgColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="header-text-color">Links / Text Color</label>
                  <div className="color-picker-input">
                    <input
                      id="header-text-color"
                      type="color"
                      value={config.headerTextColor}
                      onChange={(e) => onChange({ headerTextColor: e.target.checked ? '#00f0ff' : config.headerTextColor })} // Safely bound
                      className="hidden-color-input"
                      style={{ display: 'none' }}
                    />
                    <input
                      type="color"
                      value={config.headerTextColor}
                      onChange={(e) => onChange({ headerTextColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.headerTextColor}
                      onChange={(e) => onChange({ headerTextColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="flex-row justify-between align-center mb-5">
                  <label>Header Navigation Links (Max 4)</label>
                  {config.navLinks.length < 4 && (
                    <button 
                      type="button" 
                      className="btn-tiny"
                      onClick={addNavLink}
                    >
                      + Add Link
                    </button>
                  )}
                </div>

                {config.navLinks.map((link, idx) => (
                  <div key={idx} className="flex-row gap-5 mb-5 align-center animate-fade-in">
                    <input
                      type="text"
                      value={link.text}
                      onChange={(e) => handleNavLinkChange(idx, 'text', e.target.value)}
                      placeholder="Title"
                      className="input-tiny flex-1"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleNavLinkChange(idx, 'url', e.target.value)}
                      placeholder="https://"
                      className="input-tiny flex-2"
                    />
                    <button
                      type="button"
                      className="btn-delete-tiny"
                      onClick={() => removeNavLink(idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. OPTIONAL SECONDARY CTA ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'cta' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('cta')}
        >
          <div className="accordion-title">
            <Type size={16} className="icon-neon-cyan" />
            <span>4. Secondary CTA Segment (Optional)</span>
          </div>
          {activeAccordion === 'cta' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="toggle-group mb-15">
            <span className="toggle-label">Include Body Text & Button</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.ctaActive}
                onChange={(e) => onChange({ ctaActive: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {config.ctaActive && (
            <div className="accordion-sub-fields animate-fade-in">
              <div className="form-group">
                <label htmlFor="cta-title">Headline</label>
                <input
                  id="cta-title"
                  type="text"
                  value={config.ctaTitle}
                  onChange={(e) => onChange({ ctaTitle: e.target.value })}
                  placeholder="Take action before it's gone!"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cta-body">Body Description Text</label>
                <textarea
                  id="cta-body"
                  value={config.ctaBody}
                  onChange={(e) => onChange({ ctaBody: e.target.value })}
                  placeholder="Enter details about your promotion here."
                  rows={3}
                />
              </div>

              <div className="flex-row gap-10 mb-15">
                <div className="form-group flex-1">
                  <label htmlFor="cta-btn-text">Button Text</label>
                  <input
                    id="cta-btn-text"
                    type="text"
                    value={config.ctaButtonText}
                    onChange={(e) => onChange({ ctaButtonText: e.target.value })}
                    placeholder="Claim Discount"
                  />
                </div>
                <div className="form-group flex-2">
                  <label htmlFor="cta-btn-url">Button Redirect URL</label>
                  <input
                    id="cta-btn-url"
                    type="text"
                    value={config.ctaButtonUrl}
                    onChange={(e) => onChange({ ctaButtonUrl: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="flex-row gap-15">
                <div className="form-group flex-1">
                  <label htmlFor="cta-btn-bg">Button Color</label>
                  <div className="color-picker-input">
                    <input
                      id="cta-btn-bg"
                      type="color"
                      value={config.ctaBgColor}
                      onChange={(e) => onChange({ ctaBgColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.ctaBgColor}
                      onChange={(e) => onChange({ ctaBgColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="cta-btn-text-color">Button Text Color</label>
                  <div className="color-picker-input">
                    <input
                      id="cta-btn-text-color"
                      type="color"
                      value={config.ctaTextColor}
                      onChange={(e) => onChange({ ctaTextColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.ctaTextColor}
                      onChange={(e) => onChange({ ctaTextColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. FOOTER & SOCIAL ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'footer' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('footer')}
        >
          <div className="accordion-title">
            <Share2 size={16} className="icon-neon-cyan" />
            <span>5. Footer & Social Accounts</span>
          </div>
          {activeAccordion === 'footer' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="toggle-group mb-15">
            <span className="toggle-label">Include Brand Footer Block</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.footerActive}
                onChange={(e) => onChange({ footerActive: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {config.footerActive && (
            <div className="accordion-sub-fields animate-fade-in">
              <div className="form-group">
                <label htmlFor="footer-text-copyright">Footer Details / Copyright Notice</label>
                <textarea
                  id="footer-text-copyright"
                  value={config.footerText}
                  onChange={(e) => onChange({ footerText: e.target.value })}
                  placeholder="© 2026 Novelleyx."
                  rows={2}
                />
              </div>

              <div className="toggle-group mb-10 mt-15">
                <span className="toggle-label-sub">Display Social Profile Links</span>
                <label className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={config.socialActive}
                    onChange={(e) => onChange({ socialActive: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              {config.socialActive && config.socialLinks.map((social, index) => (
                <div key={social.platform} className="flex-row gap-10 mb-8 align-center animate-fade-in">
                  <span className="social-platform-label capitalize">{social.platform}</span>
                  <input
                    type="checkbox"
                    checked={social.active}
                    onChange={(e) => handleSocialLinkChange(index, { active: e.target.checked })}
                    title="Activate Social Platform"
                  />
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => handleSocialLinkChange(index, { url: e.target.value })}
                    placeholder={`https://${social.platform}.com/brand`}
                    className="input-tiny flex-1"
                    disabled={!social.active}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sleek inline overlay Modal to create a new Company Preset */}
      {showAddCompanyModal && (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1000 }}>
          <div className="modal-content glassmorphism">
            <div className="modal-header">
              <div className="modal-title">
                <Building className="icon-neon-cyan" size={16} />
                <span>Create Company Profile</span>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowAddCompanyModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCompanySubmit} className="modal-body flex-col gap-10">
              <div className="form-group">
                <label>Company / Brand Name</label>
                <input
                  type="text"
                  value={addCompanyName}
                  onChange={(e) => setAddCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Redirect Link (Fallback URL)</label>
                <input
                  type="url"
                  value={addFallbackUrl}
                  onChange={(e) => setAddFallbackUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Theme Color (Hex)</label>
                <div className="color-picker-input">
                  <input
                    type="color"
                    value={addPrimaryColor}
                    onChange={(e) => setAddPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={addPrimaryColor}
                    onChange={(e) => setAddPrimaryColor(e.target.value)}
                    className="color-hex"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Logo Image URL (Optional)</label>
                <input
                  type="url"
                  value={addLogoUrl}
                  onChange={(e) => setAddLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddCompanyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default EmailSettings;
