import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { useAuth } from "../components/auth/AuthProvider";
import { apiConfig } from "../config/api";
import { Music, Clock, Fuel, Pencil, ChevronDown } from "lucide-react";
import { ALL_INSTRUMENTS } from "../types/instruments.types";

interface Instrument {
  id: number;
  label: string;
  color?: string | null;
  createdAt: string;
}

interface UserProfile {
  bio: string;
  createdAt: string;
  displayName: string;
  id: number;
  instruments: Instrument[];
  profilePictureUrl: string;
  totalGasUpsGiven: number;
  totalGasUpsReceived: number;
  totalPracticeSeconds: number;
  totalSessions: number;
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
}

// Helper function to convert seconds to hours and minutes if over 60
const formatPracticeMinutes = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function Profile() {
  const { user } = useAuth();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const userParam = searchParams.get("user");

  // Get user ID from either URL params or query params
  const userId = params.id
    ? Number(params.id)
    : userParam
    ? Number(userParam)
    : user?.id;
  const viewingOwnProfile = !userId || userId === user?.id;

  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Remove allInstruments state and fetch logic
  // const [allInstruments, setAllInstruments] = useState<{ id: number; label: string }[]>([]);
  const [instrumentDropdownOpen, setInstrumentDropdownOpen] = useState(false);
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const id = userId;
        if (!id) throw new Error("No user ID");
        const response = await fetch(apiConfig.endpoints.musicians.profile(id));
        if (!response.ok) throw new Error("Failed to fetch profile");
        const profileData = await response.json();
        setData(profileData);

        // Set initial follow status if not viewing own profile
        if (!viewingOwnProfile && user?.id) {
          setIsFollowing(profileData.isFollowing || false);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId, user, viewingOwnProfile]);

  // Remove allInstruments state and fetch logic
  // useEffect(() => {
  //   // Fetch all instruments for the dropdown
  //   const fetchInstruments = async () => {
  //     try {
  //       const res = await fetch(apiConfig.endpoints.instruments.all);
  //       if (!res.ok) throw new Error("Failed to fetch instruments");
  //       const instruments = await res.json();
  //       setAllInstruments(instruments);
  //     } catch {
  //       setAllInstruments([]);
  //     }
  //   };
  //   fetchInstruments();
  // }, []);

  // Edit modal handlers
  const openEdit = () => {
    setEditData(data);
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);
  const handleEditChange = (field: keyof UserProfile, value: unknown) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };
  const handleSaveEdit = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      const id = userId;
      if (!id) throw new Error("No user ID");
      const response = await fetch(apiConfig.endpoints.musicians.profile(id), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      if (!response.ok) throw new Error("Failed to save profile changes");
      const updatedProfile = await response.json();
      setData(updatedProfile);
      setEditOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user?.id || !data?.id || viewingOwnProfile) return;

    setIsFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(
        apiConfig.endpoints.musicians.follow(data.id),
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? "unfollow" : "follow"}`);
      }

      setIsFollowing(!isFollowing);

      // Update the data with new follow counts
      if (data) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                followerCount: isFollowing
                  ? (prev.followerCount || 1) - 1
                  : (prev.followerCount || 0) + 1,
              }
            : null
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading profile: {error}
      </div>
    );
  }
  if (!data) {
    return <div className="text-center py-10">No profile data found.</div>;
  }

  return (
    <>
      {/* Edit Profile button - fixed in the top right of the viewport */}
      {viewingOwnProfile && (
        <Button
          variant="outline"
          className="fixed top-4 right-4 z-50 flex items-center gap-2"
          onClick={openEdit}
        >
          <Pencil className="w-4 h-4 mr-1" /> Edit Profile
        </Button>
      )}
      <Container size="lg">
        {/* Header Section */}
        <Section spacing="lg">
          <div className="flex justify-center relative">
            <Avatar>
              <AvatarImage
                src={data.profilePictureUrl}
                alt={data.displayName}
              />
              <AvatarFallback>{data.displayName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="relative self-stretch font-h-2 font-[number:var(--h-2-font-weight)] text-black text-[length:var(--h-2-font-size)] text-center tracking-[var(--h-2-letter-spacing)] leading-[var(--h-2-line-height)] [font-style:var(--h-2-font-style)]">
            {data.displayName}
          </h2>
          <p className="text-center text-muted-foreground">
            {"Member since " +
              new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date(data.createdAt))}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {data.instruments.map((skill, index) => (
              <Badge
                key={index}
                className="rounded-md px-2 py-[0.125rem]"
                style={{
                  backgroundColor: skill.color || "#475569",
                  color: "white",
                }}
              >
                <span className="text-xs">{skill.label}</span>
              </Badge>
            ))}
          </div>
        </Section>

        {/* Description Section */}
        <Section spacing="md">
          <p className="text-center text-muted-foreground">{data.bio}</p>
        </Section>

        {/* Actions Section */}
        <Section spacing="lg">
          {/* Follow button always visible, disabled if own profile */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              disabled={viewingOwnProfile || isFollowLoading}
              title={
                viewingOwnProfile
                  ? "You can't follow yourself"
                  : "Follow this user"
              }
              onClick={handleFollowToggle}
            >
              {isFollowLoading
                ? "Loading..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </Button>
          </div>
          <div className="flex justify-center flex-row gap-2">
            <Button
              onClick={() =>
                navigate(`/feed?user=${encodeURIComponent(data.displayName)}`)
              }
            >
              See Sessions
            </Button>
            <Button
              onClick={() =>
                navigate(
                  `/task-library?user=${encodeURIComponent(data.displayName)}`
                )
              }
            >
              See Tasks
            </Button>
          </div>
        </Section>

        {/* Stats Section */}
        <Section spacing="lg">
          <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-slate-100 rounded-lg p-4">
            <Card className="w-full bg-white mb-2">
              <CardContent className="flex items-start gap-2.5 px-4 py-2">
                <Music className="w-5 h-5 text-slate-500 mt-1" />
                <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
                  {data.totalSessions} Total Sessions
                </span>
              </CardContent>
            </Card>
            <Card className="w-full bg-white mb-2">
              <CardContent className="flex items-start gap-2.5 px-4 py-2">
                <Clock className="w-5 h-5 text-slate-500 mt-1" />
                <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
                  {formatPracticeMinutes(data.totalPracticeSeconds)} Practice
                  Time
                </span>
              </CardContent>
            </Card>
            <Card className="w-full bg-white">
              <CardContent className="flex items-start gap-2.5 px-4 py-2">
                <Fuel className="w-5 h-5 text-slate-500 mt-1" />
                <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
                  {data.totalGasUpsGiven} Gas Ups Given
                </span>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Edit Profile Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            {editData ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    value={editData.displayName}
                    onChange={(e) =>
                      handleEditChange("displayName", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Avatar URL</label>
                  <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                    Coming soon...
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Input
                    value={editData.bio}
                    onChange={(e) => handleEditChange("bio", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Instruments</label>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 min-w-[180px] justify-between"
                    onClick={() => setInstrumentDropdownOpen(true)}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      {editData.instruments.length > 0
                        ? editData.instruments
                            .map((inst) => inst.label)
                            .join(", ")
                        : "Select instruments"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {/* Dropdown dialog for instruments */}
                  {instrumentDropdownOpen && (
                    <div className="absolute z-50 bg-white border rounded-md shadow-lg mt-2 w-[300px] p-4">
                      <Input
                        placeholder="Search instruments..."
                        value={instrumentSearch}
                        onChange={(e) => setInstrumentSearch(e.target.value)}
                        className="mb-2"
                      />
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {ALL_INSTRUMENTS.filter((inst) =>
                          inst.label
                            .toLowerCase()
                            .includes(instrumentSearch.toLowerCase())
                        ).map((inst) => {
                          const selected = editData.instruments.some(
                            (i) => i.label === inst.label
                          );
                          return (
                            <button
                              key={inst.id}
                              className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2 ${
                                selected ? "bg-primary/10 font-semibold" : ""
                              }`}
                              onClick={() => {
                                setEditData((prev) => {
                                  if (!prev) return prev;
                                  const alreadySelected = prev.instruments.some(
                                    (i) => i.label === inst.label
                                  );
                                  let newInstruments;
                                  if (alreadySelected) {
                                    newInstruments = prev.instruments.filter(
                                      (i) => i.label !== inst.label
                                    );
                                  } else {
                                    newInstruments = [
                                      ...prev.instruments,
                                      {
                                        id: inst.id,
                                        label: inst.label,
                                        color: null,
                                        createdAt: new Date().toISOString(),
                                      },
                                    ];
                                  }
                                  return {
                                    ...prev,
                                    instruments: newInstruments,
                                  };
                                });
                              }}
                            >
                              <span>{inst.label}</span>
                              {selected && <span>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={closeEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}
