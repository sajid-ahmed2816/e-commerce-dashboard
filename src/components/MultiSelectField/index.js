import React, { Fragment } from "react";
import { Checkbox, Chip, FormControl, FormHelperText, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from "@mui/material";

function MultiSelectField({
  label,
  fullWidth = true,
  disabled = false,
  value = [],
  onChange,
  error,
  helperText,
  options = [],
}) {
  return (
    <FormControl fullWidth={true} error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={onChange} // onChange passed from Controller
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {selected.map((val) => {
              const option = options.find((o) => o.value === val);
              return <Chip size={"small"} key={val} label={option?.name} />;
            })}
          </div>
        )}
        SelectProps={{
        }}
        variant="outlined"
        label={label}
        fullWidth={fullWidth}
        disabled={disabled}
        InputLabelProps={{
          shrink: !!value?.length,
        }}
      >
        {options.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            <Checkbox checked={value.indexOf(item.value) > -1} />
            <ListItemText primary={item.name} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}

export default MultiSelectField;
