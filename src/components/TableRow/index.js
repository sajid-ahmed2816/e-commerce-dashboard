import { styled } from "@mui/material";
import MuiTableRow from "@mui/material/TableRow";

const StyledTableRow = styled(MuiTableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function TableRow({ children, ...props }) {
  return (
    <StyledTableRow {...props}>
      {children}
    </StyledTableRow>
  );
};

export default TableRow;