// Styled in NotesPage.css
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import LinearProgress from '@mui/material/LinearProgress';
import { createTheme } from '@mui/material/styles';
import NoteMenuBar from './NoteMenuBar';

import {Collaboration} from "@tiptap/extension-collaboration";
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
// import {Awareness} from "y-protocols/awareness.js";
import * as awarenessProtocol from 'y-protocols/awareness.js'
import {IndexeddbPersistence} from 'y-indexeddb';

import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {v4 as uuidv4} from 'uuid';

import supabaseClient from '../../utils/supabaseClient.js'
import SupabaseProvider from "../../services/supabaseProvider.js";
import {useEditor, EditorContent} from "@tiptap/react";

const theme = createTheme({
  palette: {
    ochre: {
      primary: '#616161',
      secondary: '#474554',
      tertiary: '#aca7cb',
    }
  }
})

function NoteEditor({saveStatus, setSaveStatus}) {

  const {id: noteId} = useParams();
  const [title, setTitle] = useState('Untitled Note');
  const [loading, setLoading] = useState(true);
  // const [saveStatus, setSaveStatus] = useState('');
  const [collab, setCollab] = useState({ydoc: null, provider: null});
  const [editorReady, setEditorReady] = useState(false);

  const navigate = useNavigate();
  console.log("NoteEditor component is rendering, noteId:", noteId);

  useEffect(() => {
    console.log("useEffect triggered");
  }, [noteId, navigate]);

  useEffect(() => {
    let isMounted = true;
    console.log("Using effect")

    async function redirectOrProceed() {
      try {
        console.log("Entering redirectOrProceed")
        console.log("The note id: ", noteId)
        if (noteId === '00') {
          const {data: {user}} = await supabaseClient.auth.getUser();
          if (!user) {
            console.error('User not authenticated')
            return;
          }

          // Check for general tag
          const {data: tag, error: tagError} = await supabaseClient
            .from('tags')
            .select('tag_id, user_id')
            .eq('name', 'general')
            .eq('user_id', user.id)
            .limit(1)
            .single();

          if (tagError && tagError.code !== 'PGRST116') { // PGRST116 = "Row not found"
            console.error('Error fetching general tag:', tagError.message);
            return;
          }

          if (!tag) {
            console.log('General tag not found for this user. Inserting....');

            const {error: insertError} = await supabaseClient
              .from('tags')
              .insert({
                tag_id: 0,
                user_id: user.id,
                name: 'general',
                color: '#beff00'
              });

            if (insertError) {
              console.error('Error inserting general tag:', insertError.message);
            } else {
              console.log('General tag created successfully.');
            }
          } else {
            console.log('General tag already exits ', tag)
          }

          // Check for existing notes
          const {data, error} = await supabaseClient
            .from('notes')
            .select('id, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', {ascending: false})
            .limit(1);

          if (error) {
            console.error('Failed to fetch the most recent note for user:', user.id, 'Error:', error.message);
            return;
          }

          if (data && data.length > 0) {
            // Redirect to the most recent note
            navigate(`/notes/${data[0].id}`, {replace: true});
          } else {
            // Create a new note since none exists
            const {data: newData, error: createError} = await supabaseClient
              .from('notes')
              .insert([{
                title: 'Untitled Note',
                content: [],
                user_id: user.id,
              }])
              .select();
            if (createError) {
              console.error('Error creating note: ', createError);
            } else if (newData && newData.length > 0) {
              navigate(`/notes/${newData[0].id}`, {replace: true});
            }
          }
        } else {
          // Create a new Y.js document
          console.log("Before creating Y.Doc");
          // debugger;
          const doc = new Y.Doc();
          console.log('The doc is: ', doc);
          const xmlFragment = doc.getXmlFragment('document');

          const newProvider = new SupabaseProvider(noteId, doc);
          // setProvider(newProvider);
          console.log('The provider is: ', newProvider);
          setCollab({ydoc: doc, provider: newProvider})
          console.log('Local collab state:', {ydoc: doc, provider: newProvider});
          // console.log("Awareness object:", collab.provider.awareness);
          // console.log("Awareness states:", collab.provider.awareness?.states);
          // console.log("Awareness entries:", collab.provider.awareness?.states?.entries);

          // Load initial document state
          try {
            const {data, error} = await supabaseClient
              .from('notes')
              .select('title, content')
              .eq('id', noteId)
              .single();

            console.log("Supabase response:", {data, error});

            if (error) {
              console.error("Supabase query error:", error)
            }

            if (isMounted) {
              console.log("Component is still mounted, updating state");
              if (data) {
                setTitle(data.title || 'Untitled Note');
                // If there's stored content, apply it to Y.doc
                if (data.content) {
                  console.log("Applying content to ydoc")
                  const update = new Uint8Array(data.content);
                  Y.applyUpdate(doc, update);

                  const xmlFragment = doc.getXmlFragment('document');
                  console.log('XML Fragment content:', xmlFragment.toJSON());

                } else {
                  console.log("No content data found in note");
                }
              } else {
                console.log("No data found in Supabase");
              }
              console.log('About to set loading false with noteId:', noteId);
              setLoading(false);
              console.log('Loading state should now be false');
            } else {
              console.log("Component unmounted, not updating state");
            }
          } catch (error) {
            console.error('Error loading initial state:', error);
            if (isMounted) {
              console.log("Setting loading to false after error");
              setLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("Error with redirectOrProceed function:", error);
      }
    }

    redirectOrProceed();
    return () => {
      isMounted = false
    }
  }, [noteId, navigate]);

  // Dummy collaboration extensions so the array always contains 2 collaboration elements.
  const dummyCollaboration = useMemo(
    () =>
      Collaboration.configure({
        document: {getXmlFragment: () => new Y.XmlFragment()},
      }),
    []
  );
  const dummyCollaborationCursor = useMemo(
    () =>
      CollaborationCursor.configure({
        provider: {
          awareness: {
            setLocalStateField: () => {
            },
            getLocalState: () => ({}),
            on: () => ({
              unsubscribe: () => {
              }
            }),
          }
        },
        user: {name: 'User', color: '#000000'},
      }),
    []
  );

  // Create a collaborationExtension variable conditionally
  const getCollaborationExtensions = useMemo(() => {
    if (loading || !collab.ydoc || !collab.provider) {
      // Return dummy extensions so the array length remains constant.
      return [dummyCollaboration, dummyCollaborationCursor];
    }

    // Create a new awareness instance directly
    const awareness = new awarenessProtocol.Awareness(collab.ydoc);

    awareness.setLocalState({
      user: {
        name: 'User',
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      }
    })

    // Attach awareness to provider
    if (collab.provider && !collab.provider.awareness) {
      collab.provider.awareness = awareness;
    }

    return [
      Collaboration.configure({
        document: collab.ydoc,
        fragment: collab.ydoc.getXmlFragment('document'),
        field: 'document'
      }),
      CollaborationCursor.configure({
        provider: awareness,
        user: {
          name: 'User',
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        }
      })
    ];
  }, [collab.ydoc, collab.provider, loading]);

  // The base (non-collaborative) extensions.
  const baseExtensions = useMemo(() => [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    TextStyle,
    Image,
    Placeholder.configure({
      placeholder: ({node}) => {
        if (node.type.name === 'heading') {
          return 'What’s the title?'
        }

        return 'Can you add some further context?'
      },
    }),
  ], []);

  // Assemble the complete extensions list. This array will be stable.
  const allExtensions = useMemo(() => [...baseExtensions, ...getCollaborationExtensions],
    [baseExtensions, getCollaborationExtensions]);

  // Initialize editor only when collaboration setup is complete
  useEffect(() => {
    console.log("Checking if editor should be ready:", {
      hasYDoc: !!collab.ydoc,
      hasProvider: !!collab.provider,
      hasAwareness: !!collab.provider?.awareness,
      loading
    });

    if (collab.ydoc && collab.provider && collab.provider.awareness && !loading) {
      console.log("Checking Loading: ", loading)
      setEditorReady(true);
    } else {
      setEditorReady(false);
    }
  }, [collab.ydoc, collab.provider, loading]);

// Use editorReady state to conditionally initialize the editor
  const editor = useEditor(
    {
      extensions: editorReady ? allExtensions : baseExtensions,
      autofocus: editorReady,
      editable: editorReady,
      injectCSS: false,
    },
    [allExtensions]
  );

  // Effect to update editor properties
  useEffect(() => {
    if (!editor || !editorReady) return;

    editor.setEditable(editorReady);
    if (editorReady) {
      // Focus on editor
      editor.commands.focus();
    }
  }, [editor, editorReady]);

  const triggerManualUpdate = () => {
    if (collab.ydoc) {

      const frag = collab.ydoc.getXmlFragment('document');
      frag.insert(0, ['New test content']);
    }
  };

  useEffect(() => {
    if (collab.ydoc) {
      const onDocUpdate = (update, origin) => {
        console.log('Y.Doc update event fired globally:', update, origin);
        console.log('Y.Doc document: ', update.document)
      };
      collab.ydoc.on('update', onDocUpdate);
      return () => {
        collab.ydoc.off('update', onDocUpdate);
      };
    }
  }, [collab.ydoc]);

  useEffect(() => {
    if (collab.ydoc) {
      const onUpdate = (update, origin) => {
        // Log the binary update info or origin of the change
        console.log('Y.Doc update event fired:', update, origin);
      };

      collab.ydoc.on('update', onUpdate);

      // Cleanup on unmount
      return () => {
        collab.ydoc.off('update', onUpdate);
      };
    }
  }, [collab.ydoc]);

  useEffect(() => {
    if (collab.ydoc) {
      const xmlFragment = collab.ydoc.getXmlFragment('document');
      const onFragmentUpdate = (update, origin) => {
        console.log('XML Fragment updated:', update, origin);
      };
      xmlFragment.observeDeep(onFragmentUpdate);
      return () => {
        xmlFragment.unobserveDeep(onFragmentUpdate);
      };
    }
  }, [collab.ydoc]);

  useEffect(() => {
    if (editor) {
      const onEditorUpdate = ({ editor, transaction }) => {
        console.log('Editor update event:', editor.getJSON(), transaction);
      };

      editor.on('update', onEditorUpdate);

      return () => {
        editor.off('update', onEditorUpdate);
      };
    }
  }, [editor]);

  useEffect(() => {
    if (collab.ydoc) {
      // This will fire when any updates happen to the Y.doc
      const onDocUpdate = (update, origin) => {
        console.log('Y.Doc update event fired from:', origin);

        // Check if editor content matches Y.doc after update
        if (editor) {
          const editorContent = editor.getJSON();
          console.log('Editor content after Y.doc update:', editorContent);
        }
      };

      collab.ydoc.on('update', onDocUpdate);
      return () => {
        collab.ydoc.off('update', onDocUpdate);
      };
    }
  }, [collab.ydoc, editor]);

  useEffect(() => {
    if (collab.provider) {
      const onSaveStart = () => setSaveStatus('Saving note...');
      const onSaveComplete = () => {
        setSaveStatus('Note saved');
        setTimeout(() => setSaveStatus(''), 2000);
      };
      const onSaveError = (error) => setSaveStatus('Error saving note');

      if (collab.provider && collab.provider.on) {
        collab.provider.on('saveStart', onSaveStart);
        collab.provider.on('saveComplete', onSaveComplete);
        collab.provider.on('saveError', onSaveError);
      }

      return () => {
        if (collab.provider && collab.provider.off) {
          collab.provider.off('saveStart', onSaveStart);
          collab.provider.off('saveComplete', onSaveComplete);
          collab.provider.off('saveError', onSaveError);
        }
      };
    }
  }, [collab.provider, setSaveStatus]);

  // For safe handling in your component
  const isEditorReady = !!editor && !!collab.ydoc && !!collab.provider && !loading;

  // debugger;
  if (!isEditorReady) {
    console.log("Is edtior ready? no, why: ", "ydoc:", collab.ydoc, "provider:", collab.provider, "editor: ",
      editor, "loading:", loading);
    return <div className="loading">
      <LinearProgress  color='tertiary'/>
    </div>;
  }

  function setToggle(element) {
    if (element.classList.contains('toggled')) {
      element.classList.remove('toggled');
    } else {
      element.classList.add('toggled');
    }
  }

  // Handlers for the menu bar (formatting commands):
  const handleToggleBold = () => {
    if (editor) {
      editor.chain().focus().toggleBold().run();

      let button = document.querySelector('.note-menu-bar-button-bold')
      setToggle(button)
    }
  };

  const handleToggleItalic = () => {
    if (editor) {
      editor.chain().focus().toggleItalic().run();

      let button = document.querySelector('.note-menu-bar-button-italic')
      setToggle(button)
    }
  };

  const handleChangeFontFamily = (e) => {
    const fontFamily = e.target.value;
    if (editor) {
      editor.chain().focus().setMark('textStyle', {fontFamily}).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('URL')

    if (url && editor) {
      editor.chain().focus().setImage({src: url}).run()
    }
  }

  return (
    <div className="note-editor-container">
      <NoteMenuBar
        onToggleBold={handleToggleBold}
        onToggleItalic={handleToggleItalic}
        onChangeFontFamily={handleChangeFontFamily}
        onAddImage={addImage}
      />
      {/*<button onClick={triggerManualUpdate}>Trigger Update</button>*/}
      <EditorContent editor={editor} className="editor-content note-editor"/>
    </div>
  );
}

export default NoteEditor;
