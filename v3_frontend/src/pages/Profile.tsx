import { useState, useEffect } from "react";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Card, CardContent } from "../components/card";
import { apiConfig } from "../config/api";
interface Instrument {
  id: number;
  name: string;
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
  totalPracticeMinutes: number;
  totalSessions: number;
}

const initialProfileData: UserProfile = {
  bio: "Passionate musician exploring jazz and classical.",
  createdAt: "2025-05-07T18:08:24.248Z",
  displayName: "John Doe",
  id: 1,
  instruments: [
    { id: 1, name: "Piano" },
    { id: 2, name: "Guitar" },
  ],
  profilePictureUrl: "https://via.placeholder.com/150",
  totalGasUpsGiven: 6,
  totalGasUpsReceived: 7,
  totalPracticeMinutes: 450,
  totalSessions: 8,
};

export default function Profile() {
  const [data, setData] = useState<UserProfile>(initialProfileData);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(apiConfig.endpoints.musicians.profile(3));
        const profileData = await response.json();
        console.log(profileData);
        // setData(profileData);

        // For now, using initialProfileData
        setData(initialProfileData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div>
      <div className="flex justify-center mb-4">
        <Avatar>
          <AvatarImage src={data.profilePictureUrl} alt={data.displayName} />
          <AvatarFallback>{data.displayName[0]}</AvatarFallback>
        </Avatar>
      </div>
      <h2 className="relative self-stretch font-h-2 font-[number:var(--h-2-font-weight)] text-black text-[length:var(--h-2-font-size)] text-center tracking-[var(--h-2-letter-spacing)] leading-[var(--h-2-line-height)] [font-style:var(--h-2-font-style)]">
        {data.displayName}
      </h2>
      <p className="text-center text-muted-foreground mb-4">
        {"Member since " +
          new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(new Date(data.createdAt))}
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {data.instruments.map((skill, index) => (
          <Badge
            key={index}
            className="bg-slate-700 text-slate-50 rounded-md px-2 py-[0.125rem]"
          >
            <span className="text-xs">{skill.name}</span>
          </Badge>
        ))}
      </div>
      <p className="text-center text-muted-foreground mb-6">{data.bio}</p>
      <Button className="mb-4">Follow</Button>
      <div className="flex justify-center flex-row gap-2 mb-6">
        <Button>See Sessions</Button>
        <Button>See Tasks</Button>
      </div>
      <div className="flex flex-col w-[340px] justify-items gap-2.5 px-3 py-[19px] left-[26px] bg-slate-100">
        <Card className="w-[315px] bg-white">
          <CardContent className="flex items-start gap-2.5 px-4 py-2">
            //ICON
            <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
              {data.totalSessions} Total Sessions
            </span>
          </CardContent>
        </Card>
        <Card className="w-[315px] bg-white">
          <CardContent className="flex items-start gap-2.5 px-4 py-2">
            //ICON
            <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
              {data.totalPracticeMinutes} Practice Minutes
            </span>
          </CardContent>
        </Card>
        <Card className="w-[315px] bg-white">
          <CardContent className="flex items-start gap-2.5 px-4 py-2">
            //ICON
            <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
              {data.totalGasUpsGiven} Gas Ups Given
            </span>
          </CardContent>
        </Card>
        <Card className="w-[315px] bg-white">
          <CardContent className="flex items-start gap-2.5 px-4 py-2">
            //ICON
            <span className="relative w-fit mt-[-0.50px] font-table-item font-[number:var(--table-item-font-weight)] text-slate-900 text-[length:var(--table-item-font-size)] tracking-[var(--table-item-letter-spacing)] leading-[var(--table-item-line-height)] whitespace-nowrap [font-style:var(--table-item-font-style)]">
              {data.totalGasUpsReceived} Gas Ups Recieved
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
