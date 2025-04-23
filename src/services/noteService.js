// src/services/noteService.js
import supabase from './supabaseClient'; // Your Supabase configuration

export async function updateNoteInBackend({ id, content }) {
  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', id);
  if (error) throw error;
  return data;
}

export async function createNoteInBackend({ content }) {
  const { data, error } = await supabase
    .from('notes')
    .insert({ content })
    .single();
  if (error) throw error;
  return data;
}
