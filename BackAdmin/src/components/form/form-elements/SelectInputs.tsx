import React from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import MultiSelect from "../../../components/form/MultiSelect";

type AreaSelectProps = {
  selectedValues: string[];
  onChange: (selected: string[]) => void;
};

const areaOptions = [
  { value: "computacion", text: "Computación" },
  { value: "mecanica", text: "Mecánica" },
  { value: "automotores", text: "Automotores" },
  { value: "exactas", text: "Exactas" },
];

export default function AreaSelect({ selectedValues, onChange }: AreaSelectProps) {
  return (
    
      <MultiSelect
        label="Seleccioná una o más áreas"
        options={areaOptions}
        defaultSelected={selectedValues}
        onChange={onChange}
        
      />
    
  );
}
