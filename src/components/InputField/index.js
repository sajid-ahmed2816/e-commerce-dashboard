import { TextField } from "@mui/material";

function InputField({
  variant,
  label,
  type,
  fullWidth,
  disabled,
  register,
  error,
  helperText,
  value,
  multiline,
  rows
}) {
  return (
    <TextField
      variant={variant}
      value={value}
      label={label}
      type={type}
      fullWidth={fullWidth}
      disabled={disabled}
      {...register}
      error={error}
      helperText={helperText}
      InputLabelProps={{
        shrink: !!value
      }}
      multiline={multiline}
      rows={rows}
    />
  )
}

export default InputField;