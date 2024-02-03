import React from "react";
import { feedPost } from "../../dummyData/dummyData";

type props = {
  post: feedPost
}

const Post = ({post}: props) => {

  return(
    <div>
        <h3>{post.username}</h3>
        <div>
          {post.sessionTitle}
          {post.sessionDuration}
          {post.sessionNotes}
          {post.sessionTake}
        </div>
    </div>
  )
}

export default Post;