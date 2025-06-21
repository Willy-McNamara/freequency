import React, { useState, useEffect } from "react";
import { FeedPost } from "../components/feed-post";
import {
  FilterBar,
  FilterState,
  FilterType,
  FilterOption,
} from "../components/filter-bar";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [activeFilters, setActiveFilters] = useState<FilterState[]>([
    {
      type: "user",
      isSelected: false,
      options: [
        { id: "user1", label: "John Doe", checked: false },
        { id: "user2", label: "Jane Smith", checked: false },
      ],
    },
    {
      type: "instrument",
      isSelected: false,
      options: [
        { id: "rock", label: "Rock", checked: false },
        { id: "jazz", label: "Jazz", checked: false },
      ],
    },
    {
      type: "task",
      isSelected: false,
      options: [
        { id: "favorites", label: "Favorites", checked: false },
        { id: "recent", label: "Recent", checked: false },
      ],
    },
    {
      type: "tag",
      isSelected: false,
      options: [
        { id: "beginner", label: "Beginner", checked: false },
        { id: "advanced", label: "Advanced", checked: false },
      ],
    },
    { type: "saved", isSelected: false },
  ]);

  const handleFilterChange = (
    filterType: FilterType,
    isSelected: boolean,
    options?: FilterOption[]
  ) => {
    setActiveFilters((prev) =>
      prev.map((filter) =>
        filter.type === filterType
          ? { ...filter, isSelected, options: options || filter.options }
          : filter
      )
    );

    // Here you would typically filter your posts based on the new filter state
    console.log(`Filter ${filterType} changed:`, { isSelected, options });
  };

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
    <div className="flex flex-col w-full justify-start">
      {/* Search Bar, removing until I have more of a plan for implementing sticky search */}
      {/* <div className="flex w-full min-w-[236px] max-w-md items-center gap-2 px-2 py-1.5 bg-gray-200 rounded-md mb-4 mx-auto">
        <SearchIcon className="w-4 h-4 text-slate-900" />
        <Input
          className="border-0 bg-transparent p-0 h-auto shadow-none font-subtle text-slate-900 text-[length:var(--subtle-font-size)] tracking-[var(--subtle-letter-spacing)] leading-[var(--subtle-line-height)] placeholder:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="search sessions..."
        />
      </div> */}
      {/* Filter Bar */}
      <FilterBar filters={activeFilters} onFilterChange={handleFilterChange} />
      {/* Here we'll need a flex container for the feed posts */}
      <div className="flex flex-col items-start gap-12 mb-2">
        {/* At some point this will need to be scrollable, may make a separate Feed container to house logic, replacing that div */}
        {posts.map((post) => (
          <FeedPost postData={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
