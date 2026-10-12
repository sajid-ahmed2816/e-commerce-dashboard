import { styled } from "@mui/material";
import colors from "../../assets/styles/colors";
import MuiTableCell, { tableCellClasses } from "@mui/material/TableCell";

const StyledTableCell = styled(MuiTableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: colors.primary,
    color: theme.palette.common.white,
    padding: 12,
    lineHeight: "2.25em"
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    padding: "8px 16px"
  },
}));

function TableCell({ children, ...props }) {
  return (
    <StyledTableCell {...props}>
      {children}
    </StyledTableCell>
  );
};

export default TableCell;