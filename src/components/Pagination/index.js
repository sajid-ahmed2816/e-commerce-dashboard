import { Pagination } from "@mui/material";

function TablePagination({ totalPages, page, onChange }) {
  return (
    <Pagination
      color={"primary"}
      size={"medium"}
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
  );
};

export default TablePagination;