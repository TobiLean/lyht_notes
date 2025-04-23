function GroupHeader(groupTitle, groupMembersCount) {
  return (
    <div className="group-header">
      <div className="group-header-meta">
        <div className="group-header-title">
          {groupTitle}
        </div>
        <div className="group-members">
          {groupMembersCount}
        </div>
      </div>
      <div className="group-details-button">
        Group Details
      </div>
    </div>
  )
}