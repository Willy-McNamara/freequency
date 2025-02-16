import React from "react";

const TaskLibrary: React.FC = () => {
  const data = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];

  return (
    <div>
      <h1>TaskLibrary</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskLibrary;
