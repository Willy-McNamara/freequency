import React from "react";
import { feedPost, dummyFeed } from "../dummyData/dummyData";
import Post from "./components/Post";

const Feed = () => {

  /*
  grab array of feedPosts from api
  either useEffect or loader, prob loader at the Root level
  */

  return(
    <div>
        <h1>Feed</h1>
        <div>
          flexBox to contain feed
          {dummyFeed.map((post: feedPost) => {
          return (
            <Post post={post}/>
          )
        })}
        </div>
    </div>
  )
}

export default Feed;
