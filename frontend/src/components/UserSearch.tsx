import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, X } from "lucide-react";
import { apiConfig } from "../config/api";
import { SecureInput } from "./ui/secure-form";

interface User {
  id: number;
  displayName: string;
  avatarUrl: string | null;
}

interface UserSearchProps {
  className?: string;
}

export function UserSearch({ className = "" }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiConfig.endpoints.musicians.allIdNames, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      setShowDropdown(false);
      return;
    }

    const filtered = users.filter((user) =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchTerm, users]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserSelect = (user: User) => {
    setSearchTerm("");
    setShowDropdown(false);
    setIsFocused(false);
    navigate(`/profile/${user.id}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowDropdown(false);
    setIsFocused(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <SecureInput
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={`pl-10 pr-10 focus:ring-0 focus:border-gray-200 ${
            showDropdown && isFocused ? "rounded-b-none border-b-0" : ""
          }`}
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 bg-white rounded"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && isFocused && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 bg-white">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-white">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left bg-white text-gray-900"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={user.avatarUrl || undefined}
                    alt={user.displayName}
                  />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900">
                  {user.displayName}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
