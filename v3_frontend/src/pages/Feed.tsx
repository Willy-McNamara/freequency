import React, { useState, useEffect } from "react";
import { Input } from "../components/input";
import {
  BookmarkIcon,
  ChevronDownIcon,
  ListMusicIcon,
  MusicIcon,
  SearchIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "../components/button";
import { FeedPost } from "../components/feed-post";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  // Filter buttons data for mapping
  const filterButtons = [
    { icon: <SearchIcon className="w-6 h-6" />, hasDropdown: false },
    { icon: <UserIcon className="w-6 h-6" />, hasDropdown: true },
    { icon: <MusicIcon className="w-6 h-6" />, hasDropdown: true },
    { icon: <ListMusicIcon className="w-6 h-6" />, hasDropdown: true },
    { icon: <TagIcon className="w-6 h-6" />, hasDropdown: true },
    { icon: <BookmarkIcon className="w-6 h-6" />, hasDropdown: false },
  ];

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
      {/* Search Bar */}
      <div className="flex w-full min-w-[236px] max-w-md items-center gap-2 px-2 py-1.5 bg-gray-200 rounded-md mb-4 mx-auto">
        <SearchIcon className="w-4 h-4 text-slate-900" />
        <Input
          className="border-0 bg-transparent p-0 h-auto shadow-none font-subtle text-slate-900 text-[length:var(--subtle-font-size)] tracking-[var(--subtle-letter-spacing)] leading-[var(--subtle-line-height)] placeholder:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="search sessions..."
        />
      </div>
      {/* Filter Buttons */}
      <div className="flex items-center gap-[11px] pb-2">
        {filterButtons.map((button, index) => (
          <Button
            key={index}
            variant="secondary"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 rounded-md h-auto"
          >
            {button.icon}
            {button.hasDropdown && <ChevronDownIcon className="w-6 h-6" />}
          </Button>
        ))}
      </div>
      {/* Here we'll need a flex container foer the feed posts */}
      <FeedPost />
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
