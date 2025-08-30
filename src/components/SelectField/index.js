import { MenuItem, TextField } from "@mui/material";

function SelectField({
  label,
  fullWidth,
  disabled,
  register,
  error,
  helperText,
  value,
  options
}) {
  return (
    <TextField
      select={true}
      value={value}
      variant={"outlined"}
      label={label}
      fullWidth={fullWidth}
      disabled={disabled}
      {...register}
      error={error}
      helperText={helperText}
      InputLabelProps={{
        shrink: !!value
      }}
    >
      {options && options.map((item) => (
        <MenuItem key={item.value} value={item.value}>{item.name}</MenuItem>
      ))}
    </TextField>
  )
}

export default SelectField;