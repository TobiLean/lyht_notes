import Tag from './Tag.jsx';

function TagList({tags, notes}) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <Tag key={tag.name} tag={tag} notes={(notes || []).filter((note) => note.tag_id === tag.tag_id)}/>
      ))}
    </div>
  );
}

export default TagList;