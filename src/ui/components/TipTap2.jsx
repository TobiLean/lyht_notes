import React, {useEffect, useState, useMemo} from "react";
import {Editor} from "@tiptap/core";
import {StarterKit} from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Image from '@tiptap/extension-image'
import * as Y from "yjs";
import {HocuspocusProvider} from "@hocuspocus/provider";
import NoteMenuBar from "./NoteMenuBar.jsx"
import { useNotification } from "./NotificationProvider.jsx";
import supabaseClient from "../../utils/supabaseClient.js";
import {useNavigate} from "react-router-dom";

// Helper function to convert Uint8Array to base64 string for storage
const uint8ArrayToBase64 = (uint8Array) => {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

// Helper function to convert base64 string back to Uint8Array
const base64ToUint8Array = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const EditorComponent = ({noteId, user}) => {
  const [collab, setCollab] = useState(null);
  const [editor, setEditor] = useState(null);

  const navigate = useNavigate();
  const notify = useNotification();

  // Initialize Y.Doc and provider
  useEffect(() => {
    // Create a new Y.Doc instance
    const ydoc = new Y.Doc();

    // Set up Hocuspocus provider
    const provider = new HocuspocusProvider({
      url: "ws://localhost:3123",
      name: noteId,
      document: ydoc,
    });

    setCollab({ydoc, provider});

    return () => {
      if (provider) {
        provider.disconnect();
      }
    };
  }, [noteId]);

  // Define editor extensions when collab is ready
  const extensions = useMemo(() => {
    if (!collab?.ydoc || !collab?.provider) return [];

    return [
      StarterKit.configure({history: false}),
      Image,
      Collaboration.configure({
        document: collab.ydoc,
      }),
      CollaborationCursor.configure({
        provider: collab.provider,
        user: {name: user.name, color: user.color},
      }),
    ];
  }, [collab, user]);

  // Initialize editor when extensions are ready
  useEffect(() => {
    if (!extensions.length) return;

    const editorElement = document.querySelector(".editor");
    if (!editorElement) return;

    const newEditor = new Editor({
      element: editorElement,
      extensions,
    });

    setEditor(newEditor);

    return () => {
      if (newEditor) {
        newEditor.destroy();
      }
    };
  }, [extensions]);

  // Fetch note from Supabase
  useEffect(() => {
    if (!noteId || !collab?.ydoc) return;

    const fetchNote = async () => {
      try {
        const {data, error} = await supabaseClient
          .from("notes")
          .select("ydoc, content")
          .eq("id", noteId)
          .single();

        if (error) {
          console.error("❌ Error fetching note:", error);
          return;
        }

        // Handle missing Y.Doc state
        if (!data?.ydoc) {
          console.warn("No stored Y.Doc found in Supabase. Creating a new document.");

          // Generate initial update from empty doc
          const initialUpdate = Y.encodeStateAsUpdate(collab.ydoc);
          const base64Update = uint8ArrayToBase64(initialUpdate);

          // const {error: insertError} = await supabaseClient.from("notes").insert({
          //   ydoc: base64Update,
          //   content: {type: "doc", content: []},
          // });
          const {error: updateError} = await supabaseClient
            .from("notes")
            .update({
              ydoc: base64Update,
              content: {type: "doc", content: []},
            })
            .eq("id", noteId);

          if (updateError) {
            console.error("❌ Error inserting new note:", updateError);
          }
        } else {
          try {
            // Decode the base64 stored update
            const updateBytes = base64ToUint8Array(data.ydoc);

            // Only apply update if we have actual data
            if (updateBytes.length > 0) {
              Y.applyUpdate(collab.ydoc, updateBytes);
              console.log("✅ Successfully applied Y.Doc update from Supabase");
            }

            // Apply content to the editor if available
            if (data?.content && editor) {
              editor.commands.setContent(data.content);
            }
          } catch (err) {
            console.error("❌ Decoding Error: Invalid Y.Doc structure", err);
          }
        }
      } catch (err) {
        console.error("❌ Error in fetchNote:", err);
      }
    };

    fetchNote();
  }, [noteId, collab?.ydoc, editor]);

  // Save note to Supabase
  const saveNote = async () => {
    if (!collab?.ydoc || !editor) {
      console.warn("Editor or Y.Doc not initialized yet");
      return;
    }

    try {
      // Encode the Y.Doc state
      const ydocUpdate = Y.encodeStateAsUpdate(collab.ydoc);
      const base64Update = uint8ArrayToBase64(ydocUpdate);

      // Get editor content as JSON
      const jsonContent = editor.getJSON();

      // Check if note exists
      const {data, error: checkError} = await supabaseClient
        .from("notes")
        .select("id")
        .eq("id", noteId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Error checking note existence:", checkError);
        return;
      }

      if (!data) {
        // Insert new note
        const {error: insertError} = await supabaseClient.from("notes").insert({
          id: noteId,
          ydoc: base64Update,
          content: jsonContent,
        });

        if (insertError) {
          console.error("❌ Error inserting note:", insertError);
          return;
        }
      } else {

        // Update existing note
        const {error: updateError} = await supabaseClient.from("notes").update({
          ydoc: base64Update,
          content: jsonContent,
        }).eq("id", noteId);

        if (updateError) {
          console.error("❌ Error updating note:", updateError);
          return;
        }
      }
      console.log("✅ Note saved successfully");
      notify.success({
        message: "Note saved successfully",
        description: "Successfully saved latest changes!",
        placement: "bottomRight",
      })
    } catch (err) {
      console.error("❌ Error saving note:", err);
    }
  };

  // Enable Supabase real-time updates
  useEffect(() => {
    if (!collab?.ydoc) return;

    const channel = supabaseClient
      .channel(`notes-${noteId}`)
      .on("postgres_changes",
        {event: "UPDATE", schema: "public", table: "notes", filter: `id=eq.${noteId}`},
        (payload) => {
          try {
            if (!payload.new.ydoc) {
              console.error("Skipping invalid update: No ydoc data");
              return;
            }

            // Convert from base64 to Uint8Array
            const updateBytes = base64ToUint8Array(payload.new.ydoc);

            if (updateBytes.length === 0) {
              console.warn("Empty update received");
              return;
            }

            // Apply the update to our Y.Doc
            Y.applyUpdate(collab.ydoc, updateBytes);
            console.log("Applied real-time update from Supabase");
          } catch (err) {
            console.error("Real-time update error:", err);
          }
        })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [collab?.ydoc, noteId]);

  return (
    <div className="editor-container">
      {editor && <NoteMenuBar editor={editor} saveNote={saveNote} />} {/* Pass editor instance */}

      <div
        className="editor"
      />
    </div>
  );
};

export default EditorComponent;