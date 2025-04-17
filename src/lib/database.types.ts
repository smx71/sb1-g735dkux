export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          role: 'member' | 'section_admin' | 'global_admin'
          phone: string | null
          country: string | null
          language: string[] | null
          notifications_enabled: boolean
          address: Json | null
          expertise_areas: string[] | null
          administrative_status: Json | null
          consent_data: Json | null
          member_type: string | null
          key_work_areas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: 'member' | 'section_admin' | 'global_admin'
          phone?: string | null
          country?: string | null
          language?: string[] | null
          notifications_enabled?: boolean
          address?: Json | null
          expertise_areas?: string[] | null
          administrative_status?: Json | null
          consent_data?: Json | null
          member_type?: string | null
          key_work_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          role?: 'member' | 'section_admin' | 'global_admin'
          phone?: string | null
          country?: string | null
          language?: string[] | null
          notifications_enabled?: boolean
          address?: Json | null
          expertise_areas?: string[] | null
          administrative_status?: Json | null
          consent_data?: Json | null
          member_type?: string | null
          key_work_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          organization: string | null
          email: string | null
          phone: string | null
          address: Json | null
          contact_type: string
          status: string
          tags: string[] | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          organization?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
          contact_type: string
          status?: string
          tags?: string[] | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          organization?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
          contact_type?: string
          status?: string
          tags?: string[] | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_relationships: {
        Row: {
          id: string
          contact_id: string
          related_contact_id: string
          relationship_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          related_contact_id: string
          relationship_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          related_contact_id?: string
          relationship_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_interactions: {
        Row: {
          id: string
          contact_id: string
          interaction_type: string
          description: string
          date: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          interaction_type: string
          description: string
          date: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          interaction_type?: string
          description?: string
          date?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'member' | 'section_admin' | 'global_admin'
      membership_status: 'pending' | 'active' | 'expired'
      post_status: 'draft' | 'published' | 'archived'
      event_type: 'meeting' | 'workshop' | 'conference' | 'protest' | 'other'
    }
  }
}