import React from "react";
import { setCategoryState } from "../../utils/storage";
import { CatProps } from "../../utils/types";

const Category: React.FC<CatProps> = ({ isOn, onChange, id }) => {
  const handleToggleChange = () => {
    onChange(!isOn);
    setCategoryState(id, !isOn);
  };

  return (
    <label className="switch">
      <input
        type="checkbox"
        id="toggle-switch"
        checked={isOn}
        onChange={handleToggleChange}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default Category;