export const API_BASE_URL = '/api'

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
}

export const HOSPITAL_ENDPOINTS = {
  hospitals: '/hospitals',
}

export const TICKET_ENDPOINTS = {
  tickets: '/tickets',
  adminTickets: '/tickets/admin',
  pendingTickets: '/tickets/pending',
  stats: '/tickets/stats',
}

export const DASHBOARD_ENDPOINTS = {
  stats: '/dashboard/stats',
}

export const USER_ENDPOINTS = {
  users: '/users',
  assignAdmin: '/users/assign-admin',
}

export const CHAT_ENDPOINTS = {
  messages: '/chat',
}

export const ROUTES = {
  splash: '/',
  login: '/login',
  register: '/register',
  patientDashboard: '/patient',
  adminDashboard: '/admin',
  superUserDashboard: '/super',
  settings: '/settings',
  ticketDetails: '/ticket-details',
  ticketReply: '/ticket-reply',
  ticketCreate: '/ticket-create',
}

export const ROLES = {
  patient: 'patient',
  admin: 'admin',
  super: 'super',
}

export const TICKET_STATUS = {
  pending: 'pending',
  assigned: 'assigned',
  inProgress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed',
}

export const TICKET_PRIORITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  emergency: 'emergency',
}

export const HOSPITAL_TYPE = {
  gov: 'gov',
  private: 'private',
  semi: 'semi',
}