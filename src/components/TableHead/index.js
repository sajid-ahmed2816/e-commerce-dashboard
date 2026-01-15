import { styled } from "@mui/material";
import MuiTableHead, { tableHeadClasses } from "@mui/material/TableHead";

const StyledTableHead = styled(MuiTableHead)(({ theme }) => ({
  [`&.${tableHeadClasses.root}`]: {
    position: "sticky",
    top: 0,
    zIndex: 9
  },
}));

function TableHead({ children, ...props }) {
  return (
    <StyledTableHead {...props}>
      {children}
    </StyledTableHead>
  );
};

export default TableHead;