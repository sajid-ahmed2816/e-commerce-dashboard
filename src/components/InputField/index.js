import { TextField } from "@mui/material";

function InputField({
  variant,
  label,
  type,
  fullWidth,
  disabled,
  register,
  error,
  helperText
}) {
  return (
    <TextField
      variant={variant}
      label={label}
      type={type}
      fullWidth={fullWidth}
      disabled={disabled}
      {...register}
      error={error && true}
      helperText={helperText}
    />
  )
}

export default InputField;