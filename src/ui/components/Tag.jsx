import {NavLink} from 'react-router-dom'
import { useRef } from "react";
import { ChevronDown } from 'lucide-react';
import { ChevronRight } from 'lucide-react'
import {useNotification} from "./NotificationProvider.jsx";
import DeleteTagButton from "./DeleteTagButton.jsx";

function Tag({tag, notes}) {
  const notify = useNotification();
  const statusRef = useRef(null);

  function handleToggle(e) {
    if (statusRef.current) {
      statusRef.current.textContent = e.currentTarget.open ? 'open' : 'closed';
    }
  }

  return (
    <details className="tag">
      <summary className="tag-title">
        <span className='tag-chevron tag-chevron-right'> <ChevronRight /> </span>
        <span className='tag-chevron tag-chevron-down'> <ChevronDown /> </span>
        <div className="tag-color"
             style={{
               backgroundColor: tag.color,
               width: '8px',
               height: '8px',
               border: '1px solid var(--secondary-color)',
             }}
        >
        </div>
        <p className="tag-name">
          {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
        </p>
        <DeleteTagButton tagId={tag.tag_id} />
      </summary>
      {notes.map((note) => (
        <div key={note.id} className="tag-list-note">
          <NavLink
            to={'/notes/' + note.id}
            aria-label={note.id}
          >
            {note.title}
          </NavLink>
        </div>
      ))}
    </details>
  );
}

export default Tag;