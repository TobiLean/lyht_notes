import ConfirmWrapper from "./ConfirmWrapper";
import {Trash2} from 'lucide-react'
import {useNotification} from "./NotificationProvider.jsx";
import supabaseClient from "../../utils/supabaseClient.js";

// Function to handle deleting a tag
const DeleteTag = async (tagId, notify) => {
  try {
    // Check if tagId is not 0 (0 is the id for all General tags)
    if(tagId !== 0){
      const {error} = await supabaseClient
        .from("tags")
        .delete()
        .eq("tag_id", tagId);

      if (error) {
        notify.error({
          message: "Failed to delete tag",
          description: "An error occurred while deleting the tag.",
          placement: "bottomRight",
        });
        return;
      }

      notify.success({
        message: "Tag Deleted",
        description: "The tag was successfully removed.",
        placement: "bottomRight",
      });
    } else {
      notify.error({
        message: "Cannot delete General tag",
        description: "An error occurred while deleting the tag.",
        placement: "bottomRight",
      })
    }

  } catch (err) {
    console.log("Unexpected Error", err)
    notify.error({
      message: "Unexpected Error",
      description: "Something went wrong. Please try again.",
      placement: "bottomRight",
    });
  }
};

// Component to render delete tag button with confirmation wrapper
const DeleteTagButton = ({tagId}) => {
  const notify = useNotification();

  return (
    <ConfirmWrapper
      title="Delete Tag"
      description="Are you sure you want to delete this tag?"
      onConfirm={() => DeleteTag(tagId, notify)}
    >
      <button className="delete-tag-button">
        <Trash2/>
      </button>
    </ConfirmWrapper>
  )
};

export default DeleteTagButton;