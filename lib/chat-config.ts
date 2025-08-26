/**
 * Configuración del chat para Tenerife Paradise Tour
 * Este archivo centraliza la configuración del admin y la empresa
 */

export interface ChatAdminConfig {
  name: string;
  displayName: string;
  avatar: string;
  companyName: string;
  companyLogo: string;
  role: string;
}

export interface ChatCompanyConfig {
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  supportPhone: string;
}

// Configuración del admin del chat
export const CHAT_ADMIN_CONFIG: ChatAdminConfig = {
  name: 'admin',
  displayName: 'Tenerife Paradise Tour',
  avatar: '/images/company-logo.png', // Logo de la empresa
  companyName: 'Tenerife Paradise Tour & Excursions',
  companyLogo: '/images/company-logo.png',
  role: 'admin'
};

// Configuración de la empresa
export const CHAT_COMPANY_CONFIG: ChatCompanyConfig = {
  name: 'Tenerife Paradise Tour & Excursions',
  logo: '/images/company-logo.png',
  primaryColor: '#2563eb', // Azul principal
  secondaryColor: '#1e40af', // Azul secundario
  supportEmail: 'info@tenerifeparadiseparadisetour.com',
  supportPhone: '+34 922 123 456'
};

// Función para obtener la configuración del admin
export function getChatAdminConfig(): ChatAdminConfig {
  return CHAT_ADMIN_CONFIG;
}

// Función para obtener la configuración de la empresa
export function getChatCompanyConfig(): ChatCompanyConfig {
  return CHAT_COMPANY_CONFIG;
}

// Función para verificar si un usuario es el admin del chat
export function isChatAdmin(userId: string, userRole: string): boolean {
  return userRole === 'admin';
}

// Función para obtener el nombre de visualización del admin
export function getAdminDisplayName(userId: string, userRole: string): string {
  if (isChatAdmin(userId, userRole)) {
    return CHAT_ADMIN_CONFIG.displayName;
  }
  return 'Usuario';
}

// Función para obtener el avatar del admin
export function getAdminAvatar(userId: string, userRole: string): string {
  if (isChatAdmin(userId, userRole)) {
    return CHAT_ADMIN_CONFIG.avatar;
  }
  return '/images/default-avatar.png';
}
