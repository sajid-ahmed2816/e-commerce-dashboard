import { Pagination, Select, MenuItem, Box, Typography, FormControl } from "@mui/material";

function TablePagination({
  totalPages,
  page,
  onChange,
  rowsPerPage,
  onRowsPerPageChange,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >
        <Typography sx={{ fontSize: "13px" }}>Rows per page</Typography>
        <FormControl>
          <Select
            labelId="rowsPerPage"
            size="small"
            value={rowsPerPage}
            onChange={onRowsPerPageChange}
            sx={{ minWidth: 70 }}
            slotProps={{
              root: {
                sx: {
                  fontSize: "13px"
                }
              },
              input: {
                sx: {
                  py: "3.4px"
                }
              }
            }}
          >
            {[10, 25, 50, 100].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Pagination
        color={"primary"}
        size={"small"}
        shape={"rounded"}
        variant={"outlined"}
        siblingCount={2}
        boundaryCount={2}
        count={totalPages}
        page={page}
        onChange={onChange}
        sx={{
          "& .MuiPagination-ul": {
            justifyContent: "flex-end"
          }
        }}
      />
    </Box>
  );
}

export default TablePagination;