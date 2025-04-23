import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import supabaseClient from '../utils/supabaseClient.js'
import * as awarenessProtocol from "y-protocols/awareness";

// Create a Y.js provider that works with Supabase Realtime
class SupabaseProvider {
  constructor(roomName, ydoc, options = {}) {

    const { awareness = new awarenessProtocol.Awareness(ydoc) } = options;
    this.roomName = roomName;
    this.ydoc = ydoc;
    // this.options = options;
    // Store awareness instance
    this.awareness = awareness || new awarenessProtocol.Awareness(doc);
    console.log("SupabaseProvider constructor – awareness:", this.awareness);
    console.log("SupabaseProvider constructor – awareness.states:", this.awareness?.states);
    this.localClientId = Math.floor(Math.random() * 100000);
    this.isOnline = false;

    // Set up local persistence for offline editing
    this.persistence = new IndexeddbPersistence(roomName, ydoc);

    // Create a Supabase channel
    this.channel = supabaseClient.channel(`room-${roomName}`, {
      config: {
        broadcast: { self: false }
      }
    });

    // Subscribe to document updates
    this.channel.on('broadcast', { event: 'document-update' }, this.receiveUpdate.bind(this));

    // Subscribe to awareness updates (cursor positions)
    if (this.awareness) {
      this.channel.on('broadcast', { event: 'awareness-update' }, this.receiveAwarenessUpdate.bind(this));
      this.awareness.on('update', this.broadcastAwarenessUpdate.bind(this));
    }

    // Subscribe to the channel
    this.channel.subscribe((status) => {
      console.log('Channel status:', status);
      this.isOnline = status === 'SUBSCRIBED';

      // When we come online, sync our state
      if (this.isOnline) {
        this.broadcastDocumentUpdate();
      }
    });

    // Listen for local document updates
    this.ydoc.on('update', this.broadcastDocumentUpdate.bind(this));

    this.callbacks = {
      saveStart: [],
      saveComplete: [],
      saveError: []
    }
  }

  // Add methods to register callbacks
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

// Trigger callbacks
  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Receive updates from other clients
  receiveUpdate(payload) {
    if (!payload || !payload.update) return;

    try {
      // Convert the update array back to Uint8Array
      const update = new Uint8Array(payload.update);

      // Apply the update to our local document
      Y.applyUpdate(this.ydoc, update);
    } catch (error) {
      console.error('Error applying update:', error);
    }
  }

  // Broadcast our document updates to other clients
  broadcastDocumentUpdate(update) {
    console.log("Change has been made ooooooooooooooo")
    if (!this.isOnline) return;

    try {
      // If no specific update was provided, send the entire document state
      if (!update) {
        update = Y.encodeStateAsUpdate(this.ydoc);
      }

      // Broadcast the update
      this.channel.send({
        type: 'broadcast',
        event: 'document-update',
        payload: {
          update: Array.from(update),
          clientId: this.localClientId
        }
      });

      console.log('Broadcasting document update...');
      // Periodically save to Supabase database
      this.debounceSave();
    } catch (error) {
      console.error('Error broadcasting document update:', error);
    }
  }

  // Use debounce to avoid too many database writes
  debounceSave = (() => {
    let timeout;
    return () => {
      console.log('Debounced save triggered');
      clearTimeout(timeout);
      timeout = setTimeout(() => this.saveToDatabase(), 3000);
    };
  })();

  // Save the document to the database
  async saveToDatabase() {
    try {
      this.trigger('saveStart')

      // Encode the current document state
      const update = Y.encodeStateAsUpdate(this.ydoc);

      // Save to Supabase
      const { error } = await supabaseClient
        .from('notes')
        .update({
          content: Array.from(update),
          updated_at: new Date().toISOString()
        })
        .eq('id', this.roomName);

      if (error) throw error;

      console.log('Document saved to database');
      this.trigger('saveComplete');
    } catch (error) {
      console.error('Error saving to database:', error);
      this.trigger('saveError')
    }
  }

  // Handle awareness updates (cursor positions)
  receiveAwarenessUpdate(payload) {
    if (!this.awareness || !payload || !payload.states) return;

    try {
      this.awareness.applyAwarenessUpdate(new Uint8Array(payload.states));
      console.log('Received awareness update payload:', payload);
    } catch (error) {
      console.error('Error applying awareness update:', error);
    }
  }

  // Broadcast awareness updates to other clients
  broadcastAwarenessUpdate() {
    if (!this.isOnline || !this.awareness) return;

    try {
      if (this.awareness && this.roomName) {
        const encodedUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.awareness.clientID]);
        // Then broadcast the encoded update to Supabase
        this.channel.send({
          type: 'awareness',
          update: Array.from(encodedUpdate)
        });
      }
    } catch (error) {
      console.error('Error broadcasting awareness update:', error);
    }
  }

  // Clean up resources
  destroy() {
    this.ydoc.off('update', this.broadcastDocumentUpdate);

    if (this.awareness) {
      this.awareness.off('update', this.broadcastAwarenessUpdate);
    }

    this.channel.unsubscribe();
    this.persistence.destroy();
  }
}


export default SupabaseProvider;
