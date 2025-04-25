import {NavLink} from "react-router-dom";
import {useEffect, useState} from "react";
import supabaseClient from "../../utils/supabaseClient.js";

// Component to render group list
function GroupList({userId}) {
  const [groups, setGroups] = useState([]);

  // Effect to get groups when userId is ready
  useEffect(() => {
    const getGroupList = async () => {
      try {
        const {data: groupRelations, groupRelationsError} = await supabaseClient
          .from('group_members')
          .select('group_id')
          .eq('user_id', userId);

        if (groupRelationsError) {
          console.error('Error getting membership data', groupRelationsError);
        }

        if (!groupRelations.length) {
          console.log('User is not a member of any groups');
          return [];
        }

        const groupIds = groupRelations.map((relation) => relation.group_id);

        const {data: groupsData, error: groupsDataError} = await supabaseClient
          .from('groups')
          .select('id, name')
          .in('id', groupIds);

        if (groupsDataError) {
          console.error('Error getting groups data', groupsDataError.message);
          return [];
        }

        setGroups(groupsData || []);
      } catch (err) {
        console.error('Unexpected error getting group list', err);
        setGroups([]);
      }
    }

    if (userId) {
      getGroupList();
    }
  }, [userId]);

  return (
    <div className="group-list">
      {groups.map((group) => (
        <div key={group.id} className='dynamic-sidebar-button group-list-name'>
          <NavLink
            to={'/groups/' + group.name}
          >
            {group.name}
          </NavLink>
        </div>
      ))}
    </div>
  );
}

export default GroupList;