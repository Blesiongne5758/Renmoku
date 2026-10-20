import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper functions
export const supabaseHelpers = {
  // Auth helpers
  auth: {
    signUp: async (email: string, password: string, metadata?: any) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      return { data, error };
    },

    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },

    getCurrentUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    },

    getSession: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    },
  },

  // Database helpers
  db: {
    // Generic query builder
    from: (table: string) => supabase.from(table),

    // Insert data
    insert: async (table: string, data: any) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      return { data: result, error };
    },

    // Update data
    update: async (table: string, data: any, id: string) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      return { data: result, error };
    },

    // Delete data
    delete: async (table: string, id: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      return { error };
    },

    // Get single record
    getById: async (table: string, id: string) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    // Get all records
    getAll: async (table: string, filters?: any) => {
      let query = supabase.from(table).select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      return { data, error };
    },
  },

  // Storage helpers
  storage: {
    // Upload file to Supabase Storage
    upload: async (bucket: string, path: string, file: File) => {
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(path, file);
      return { data, error };
    },

    // Get public URL
    getPublicUrl: (bucket: string, path: string) => {
      const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path);
      return data.publicUrl;
    },

    // Delete file
    delete: async (bucket: string, paths: string[]) => {
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .remove(paths);
      return { data, error };
    },

    // List files
    list: async (bucket: string, path: string) => {
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .list(path);
      return { data, error };
    },
  },
};

export default supabase;
