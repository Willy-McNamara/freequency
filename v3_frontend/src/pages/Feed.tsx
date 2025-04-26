import React, { useState, useEffect } from "react";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/sessions");
        const result = await response.json();
        setPosts(result);
        console.log(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Feed</h1>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <p>Session ID: {post.id}</p>
            <p>Title: {post.title}</p>
            <p>Notes: {post.notes}</p>
            <p>
              Instruments:{" "}
              {post.instruments
                .map((instrument) => instrument.label)
                .join(", ")}
            </p>
            <p>Duration: {post.duration} minutes</p>
            <p>Is Public: {post.isPublic ? "Yes" : "No"}</p>
            <p>Created At: {new Date(post.createdAt).toLocaleString()}</p>
            <p>Musician: {post.musicianDisplayname}</p>
            <p>
              Profile Picture:{" "}
              <img
                src={post.musicianProfilePictureUrl}
                alt="Profile"
                width="50"
              />
            </p>

            {/* GasUps */}
            <p>
              Gas Ups Given:{" "}
              {post.gasUps.filter((gasUp) => gasUp.type === "give").length}
            </p>
            <p>
              Gas Ups Received:{" "}
              {post.gasUps.filter((gasUp) => gasUp.type === "receive").length}
            </p>

            {/* Comments */}
            <p>Comments:</p>
            <ul>
              {post.comments.map((comment, commentIndex) => (
                <li key={commentIndex}>{comment.text}</li>
              ))}
            </ul>

            {/* Tags */}
            <p>Tags: {post.tags.map((tag) => tag.label).join(", ")}</p>

            {/* Media */}
            <p>Media:</p>
            <ul>
              {post.media.map((mediaItem, mediaIndex) => (
                <li key={mediaIndex}>
                  <p>Type: {mediaItem.type}</p>
                  <p>
                    URL:{" "}
                    <a
                      href={mediaItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Media
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feed;
