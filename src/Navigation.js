import { Dashboard, Group, ListAlt, LocalOffer } from "@mui/icons-material";
import colors from "./styles/colors";

const styles = {
  iconSize: {
    p: 0.2,
    fontSize: "22px",
    color: colors.secondary,
  },
};

const Navigation = [
  {
    label: "Dashboard",
    icon: <Dashboard sx={styles.iconSize} />,
    path: "/",
  },
  {
    label: "Customers",
    icon: <Group sx={styles.iconSize} />,
    path: "/customers",
  },
  {
    label: "Products",
    icon: <LocalOffer sx={styles.iconSize} />,
    path: "/products",
  },
  {
    label: "Orders",
    icon: <ListAlt sx={styles.iconSize} />,
    path: "/orders",
  },
];

export default Navigation;
