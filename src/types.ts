export interface Profile {
  id: string;
  company_name: string;
  full_name: string;
  avatar_url?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  moq: number;
  details: any;
  price: number;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  phone_number: string;
  name: string;
  status: 'new' | 'qualified' | 'converted' | 'lost';
  last_interaction: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  user_id: string;
  message: string;
  sender: 'ai' | 'customer' | 'agent';
  created_at: string;
}

export interface Settings {
  user_id: string;
  twilio_mode: 'platform' | 'custom';
  twilio_sid?: string;
  twilio_token?: string;
  twilio_number?: string;
  notifications_enabled: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
