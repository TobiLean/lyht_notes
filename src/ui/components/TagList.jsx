import Tag from './Tag.jsx';

function TagList({tags, notes, setCurrentNoteData}) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <Tag key={tag.name} tag={tag} notes={(notes || []).filter((note) => note.tag_id === tag.tag_id)}
             setCurrentNoteData={setCurrentNoteData}/>
      ))}
    </div>
  );
}

export default TagList;