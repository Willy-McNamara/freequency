import React, { useEffect } from "react";

const Profile: React.FC = () => {
  const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  // call api to get musician by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/musicians/1");
        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
