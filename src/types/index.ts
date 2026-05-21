export interface Hotspot {
  id: string;
  url: string;
  left: number; // percentage
  top: number;  // percentage
  width: number; // percentage
  height: number; // percentage
  label: string;
}

export interface NavLink {
  text: string;
  url: string;
}

export interface SocialLink {
  platform: 'x' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
  url: string;
  active: boolean;
}

export interface BrandPreset {
  id: string;
  name: string;
  fallbackUrl: string;
  logoUrl?: string;
  primaryColor?: string;
  navLinks: NavLink[];
  footerText: string;
  socialLinks: SocialLink[];
}

export interface EmailConfig {
  companyName: string;
  fallbackUrl: string;
  preheader: string;
  
  // Header section
  headerActive: boolean;
  headerLogoUrl: string;
  headerBgColor: string;
  headerTextColor: string;
  navLinks: NavLink[];

  // Image section
  imageType: 'base64' | 'external';
  externalImageUrl: string;

  // Secondary CTA Block
  ctaActive: boolean;
  ctaTitle: string;
  ctaBody: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  ctaBgColor: string;
  ctaTextColor: string;

  // Footer Section
  footerActive: boolean;
  footerText: string;
  socialActive: boolean;
  socialLinks: SocialLink[];
}
