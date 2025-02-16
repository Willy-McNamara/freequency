import React from "react";

const Feed: React.FC = () => {
  const posts = [
    {
      username: "user1",
      profilePicture: "path/to/profile1.jpg",
      date: "2023-10-01",
      title: "Post 1",
      description: "Description 1",
      tasks: ["Task 1", "Task 2"],
      gasUps: 5,
      comments: ["Comment 1", "Comment 2"],
      tags: ["Tag1", "Tag2"],
      media: {
        audio: "path/to/audio1.mp3",
        video: "path/to/video1.mp4",
        image: "path/to/image1.jpg",
      },
    },
    {
      username: "user2",
      profilePicture: "path/to/profile2.jpg",
      date: "2023-10-02",
      title: "Post 2",
      description: "Description 2",
      tasks: ["Task 3", "Task 4"],
      gasUps: 3,
      comments: ["Comment 3", "Comment 4"],
      tags: ["Tag3", "Tag4"],
      media: {
        audio: "path/to/audio2.mp3",
        video: "path/to/video2.mp4",
        image: "path/to/image2.jpg",
      },
    },
  ];

  return (
    <div>
      <h1>Feed</h1>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <p>Username: {post.username}</p>
            <p>Profile Picture: {post.profilePicture}</p>
            <p>Date: {post.date}</p>
            <p>Title: {post.title}</p>
            <p>Description: {post.description}</p>
            <p>Tasks: {post.tasks.join(", ")}</p>
            <p>Gas Ups: {post.gasUps}</p>
            <p>Comments: {post.comments.join(", ")}</p>
            <p>Tags: {post.tags.join(", ")}</p>
            <p>Media:</p>
            <ul>
              <li>Audio: {post.media.audio}</li>
              <li>Video: {post.media.video}</li>
              <li>Image: {post.media.image}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feed;
