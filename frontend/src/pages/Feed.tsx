import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FeedPost } from "../components/feed-post";
import {
  FilterBar,
  FilterState,
  FilterType,
  FilterOption,
} from "../components/filter-bar";
import { apiClient } from "../services/auth";
import { useAuth } from "../components/auth/AuthProvider";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { Separator } from "@/components/ui/separator";
import { Loading } from "../components/ui/loading";

interface SessionsResponse {
  sessions?: Post[];
  nextCursor?: string;
}

interface Post {
  id: number;
  title: string;
  notes: string;
  createdAt: string;
  duration: number;
  musician: {
    displayName: string;
    avatarUrl: string | null;
  };
  instruments: Array<{
    id: number;
    label: string;
    color: string | null;
  }>;
  tags: Array<{
    id: number;
    label: string;
    color: string | null;
  }>;
  gasUps: Array<{
    musician: {
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
  comments: Array<{
    musician: {
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
  tasks: Array<{
    id: number;
    title: string;
    notes: string;
    timeSpent: number;
    taskDefinition: {
      id: number;
      title: string;
      description: string;
      instrument: string;
      user: {
        displayName: string;
        avatarUrl: string | null;
      };
      tags: Array<{
        id: number;
        label: string;
        color: string | null;
      }>;
      checklist: string[];
      savedCount: number;
      usedCount: number;
    };
  }>;
}

const Feed = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const isFetching = useRef(false);
  const hasFetchedOnce = useRef(false);
  const filtersInitialized = useRef(false);
  const [allUsers, setAllUsers] = useState<
    { id: number; displayName: string }[]
  >([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const isSettingFromUrl = useRef(false);
  const previousFilterState = useRef<string>("");

  // Check for my-sessions filter in URL
  const isMySessionsFilter = searchParams.get("filter") === "my-sessions";

  const [activeFilters, setActiveFilters] = useState<FilterState[]>([
    {
      type: "user",
      isSelected: false,
      options: [],
    },
    {
      type: "instrument",
      isSelected: false,
      options: [],
    },
    {
      type: "tag",
      isSelected: false,
      options: [],
    },
    // { type: "saved", isSelected: false }, removing for now, don't know whether to filter liked posts, or add an option to save posts.
  ]);

  // Build query parameters from active filters
  const buildQueryParams = useCallback(
    (cursorOverride: string | null = null) => {
      const params = new URLSearchParams();

      const userFilter = activeFilters.find((f) => f.type === "user");

      if (userFilter?.isSelected && userFilter.options) {
        const selectedUserIds = userFilter.options
          .filter((option) => option.checked && option.id !== "following")
          .map((option) => option.id);
        const followingSelected = userFilter.options.some(
          (option) => option.id === "following" && option.checked
        );
        if (followingSelected) {
          params.append("following", "true");
        }
        if (selectedUserIds.length > 0) {
          params.append("users", selectedUserIds.join(","));
        }
      }

      const instrumentFilter = activeFilters.find(
        (f) => f.type === "instrument"
      );
      if (instrumentFilter?.isSelected && instrumentFilter.options) {
        const selectedInstruments = instrumentFilter.options
          .filter((option) => option.checked)
          .map((option) => option.label);
        if (selectedInstruments.length > 0) {
          params.append("instruments", selectedInstruments.join(","));
        }
      }

      const tagFilter = activeFilters.find((f) => f.type === "tag");
      if (tagFilter?.isSelected && tagFilter.options) {
        const selectedTags = tagFilter.options
          .filter((option) => option.checked)
          .map((option) => option.label);
        if (selectedTags.length > 0) {
          params.append("tags", selectedTags.join(","));
        }
      }

      const savedFilter = activeFilters.find((f) => f.type === "saved");
      if (savedFilter?.isSelected) {
        params.append("saved", "true");
      }

      if (cursorOverride) {
        params.append("cursor", cursorOverride);
      }

      return params;
    },
    [activeFilters]
  );

  const fetchSessions = useCallback(
    async (isInitial = false, cursorOverride: string | null = null) => {
      // Prevent multiple simultaneous requests
      if (isFetching.current) {
        return;
      }

      try {
        isFetching.current = true;

        if (isInitial) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        // For initial fetch (new filter), do not use any cursor
        const params = buildQueryParams(cursorOverride);
        const response = await apiClient.get<SessionsResponse | Post[]>(
          `/sessions?${params.toString()}`
        );

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error("No data received from server");
        }

        const result = response.data;

        // Handle both old format (array) and new format (object with sessions and nextCursor)
        let sessions, nextCursorValue;
        if (Array.isArray(result)) {
          // Old format - just an array of sessions
          sessions = result;
          nextCursorValue = undefined; // No pagination in old format
        } else {
          // New format - object with sessions and nextCursor
          sessions = result.sessions || [];
          nextCursorValue = result.nextCursor;
        }

        if (isInitial) {
          setPosts(sessions);
          setNextCursor(nextCursorValue);
          setHasMore(!!nextCursorValue);
        } else {
          setPosts((prev) => [...prev, ...sessions]);
          setNextCursor(nextCursorValue);
          setHasMore(!!nextCursorValue);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch posts"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetching.current = false;
      }
    },
    [buildQueryParams]
  );

  // Intersection Observer for infinite scroll
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore || isFetching.current) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchSessions(false, nextCursor);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchSessions, nextCursor]
  );

  const handleFilterChange = (
    filterType: FilterType,
    _isSelected: boolean,
    options?: FilterOption[]
  ) => {
    setActiveFilters((prev) =>
      prev.map((filter) => {
        if (filter.type === filterType) {
          const updatedOptions = options || filter.options;
          const hasSelectedOptions =
            updatedOptions?.some((option) => option.checked) || false;

          return {
            ...filter,
            isSelected: hasSelectedOptions,
            options: updatedOptions,
          };
        }
        return filter;
      })
    );
  };

  // New useEffect to trigger fetch when filters change
  useEffect(() => {
    // Create a string representation of the current filter state for comparison
    const currentFilterState = JSON.stringify(
      activeFilters.map((filter) => ({
        type: filter.type,
        isSelected: filter.isSelected,
        selectedOptions:
          filter.options
            ?.filter((opt) => opt.checked)
            .map((opt) => opt.label) || [],
      }))
    );

    // Fetch if filters have been initialized and either:
    // 1. At least one filter is selected, OR
    // 2. This is a filter change after initial load (to handle clearing filters)
    if (
      filtersInitialized.current &&
      hasFetchedOnce.current &&
      (activeFilters.some(
        (filter) =>
          filter.isSelected &&
          (filter.options ? filter.options.some((opt) => opt.checked) : true)
      ) ||
        // Also trigger fetch when filters are being cleared (previous state had filters, current doesn't)
        (previousFilterState.current &&
          previousFilterState.current !== currentFilterState &&
          activeFilters.every(
            (filter) =>
              !filter.isSelected ||
              (filter.options && !filter.options.some((opt) => opt.checked))
          )))
    ) {
      if (isSettingFromUrl.current) {
        isSettingFromUrl.current = false;
      }
      setPosts([]);
      setNextCursor(undefined);
      setHasMore(true);
      fetchSessions(true, null);
    }

    // Update the previous filter state
    previousFilterState.current = currentFilterState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  // Fetch all users, instruments, and tags on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, tagsResponse] = await Promise.all([
          apiClient.get<{ id: number; displayName: string }[]>(
            "/musicians/all-id-names"
          ),
          apiClient.get<string[]>("/tags/all-labels"),
        ]);

        if (usersResponse.data) {
          setAllUsers(usersResponse.data);
        }
        if (tagsResponse.data) {
          setAllTags(tagsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, []);

  // Update filter options based on available data
  useEffect(() => {
    // Use allUsers, ALL_INSTRUMENTS, allTags for filter options
    if (allUsers.length > 0 && allTags.length > 0) {
      const userOptions = allUsers.map((user) => ({
        id: String(user.id),
        label: user.displayName,
        checked:
          activeFilters
            .find((f) => f.type === "user")
            ?.options?.some(
              (opt) => opt.id === String(user.id) && opt.checked
            ) || false,
      }));

      // Add the "Following" option if user is authenticated
      const followingOption = {
        id: "following",
        label: "Following",
        checked:
          activeFilters
            .find((f) => f.type === "user")
            ?.options?.some((opt) => opt.id === "following" && opt.checked) ||
          false,
      };

      const allUserOptions = user
        ? [...userOptions, followingOption]
        : userOptions;

      const instrumentOptions = ALL_INSTRUMENTS.map((instrument) => ({
        id: instrument.label.toLowerCase(),
        label: instrument.label,
        checked:
          activeFilters
            .find((f) => f.type === "instrument")
            ?.options?.some(
              (opt) => opt.label === instrument.label && opt.checked
            ) || false,
      }));

      const instrumentLabels = ALL_INSTRUMENTS.map((instrument) =>
        instrument.label.toLowerCase()
      );

      const tagOptions = allTags
        .filter((tag) => !instrumentLabels.includes(tag.toLowerCase()))
        .map((tag) => ({
          id: tag.toLowerCase().replace(/\s+/g, ""),
          label: tag,
          checked:
            activeFilters
              .find((f) => f.type === "tag")
              ?.options?.some((opt) => opt.label === tag && opt.checked) ||
            false,
        }));

      // If my-sessions filter is active, automatically select the current user
      let updatedUserOptions = allUserOptions;
      if (isMySessionsFilter && user?.displayName) {
        updatedUserOptions = allUserOptions.map((option) => ({
          ...option,
          checked: option.label === user.displayName,
        }));
      }

      setActiveFilters((prev) =>
        prev.map((filter) => {
          if (filter.type === "user") {
            return {
              ...filter,
              options: updatedUserOptions,
              isSelected:
                isMySessionsFilter && user?.displayName
                  ? true
                  : filter.isSelected,
            };
          }
          if (filter.type === "instrument") {
            return { ...filter, options: instrumentOptions };
          }
          if (filter.type === "tag") {
            return { ...filter, options: tagOptions };
          }
          return filter;
        })
      );
    }
  }, [allUsers, allTags, isMySessionsFilter, user?.displayName]);

  // Initial data fetch: only after all filter options are loaded
  useEffect(() => {
    if (!hasFetchedOnce.current && allUsers.length > 0 && allTags.length > 0) {
      // Don't do initial fetch if there's a user parameter in URL
      const userParam = searchParams.get("user");
      if (!userParam) {
        fetchSessions(true);
        hasFetchedOnce.current = true;
        filtersInitialized.current = true;
      } else {
        hasFetchedOnce.current = true;
        filtersInitialized.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, allTags, searchParams]);

  // Handle user parameter from URL - set filter only
  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam && allUsers.length > 0 && filtersInitialized.current) {
      const userLabel = allUsers.find((u) => u.displayName === userParam);
      if (userLabel) {
        const userFilter = activeFilters.find((f) => f.type === "user");
        const isAlreadySet =
          userFilter?.isSelected &&
          userFilter.options?.some(
            (opt) => opt.label === userLabel.displayName && opt.checked
          );
        if (!isAlreadySet) {
          isSettingFromUrl.current = true;
          setActiveFilters((prev) =>
            prev.map((filter) => {
              if (filter.type === "user") {
                return {
                  ...filter,
                  isSelected: true,
                  options: filter.options
                    ? filter.options.map((opt) => ({
                        ...opt,
                        checked: opt.label === userLabel.displayName,
                      }))
                    : [],
                };
              }
              return filter;
            })
          );
        }
      }
    }
  }, [searchParams, allUsers, filtersInitialized, activeFilters]);

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-start">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" text="Loading posts..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full justify-start">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <button
              onClick={() => fetchSessions(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <Section>
        <FilterBar
          filters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </Section>

      {/* Feed Posts */}
      <div className="flex flex-col w-full min-w-[280px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[480px] xl:min-w-[560px] 2xl:min-w-[640px] max-w-full gap-8 sm:gap-10 md:gap-12 lg:gap-16 mt-2">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-12 w-full">
            <p className="text-muted-foreground">
              No posts found matching your filters.
            </p>
          </div>
        ) : (
          posts.map((post, index) => {
            if (posts.length === index + 1) {
              // Last element - attach ref for infinite scroll
              return (
                <div key={post.id || index} ref={lastPostElementRef}>
                  <FeedPost postData={{ ...post, duration: post.duration }} />
                </div>
              );
            } else {
              // All other posts - same wrapper structure but no ref
              return (
                <>
                  <div key={post.id || index}>
                    <FeedPost postData={{ ...post, duration: post.duration }} />
                  </div>
                  <Separator className="my-4" />
                </>
              );
            }
          })
        )}
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center w-full py-8">
            <Loading size="md" text="Loading more posts..." />
          </div>
        )}
      </div>
    </Container>
  );
};

export default Feed;
