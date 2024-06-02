import { Dashboard, Category, ListAlt, Workspaces } from "@mui/icons-material";
import colors from "./assets/styles/colors";

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
    label: "Manage Categories",
    icon: <Category sx={styles.iconSize} />,
    subMenu: [
      {
        label: "Create Category",
        path: "/create-category"
      },
      {
        label: "All Categories",
        path: "/categories"
      },
    ]
  },
  {
    label: "Manage Products",
    icon: <Workspaces sx={styles.iconSize} />,
    subMenu: [
      {
        label: "Create Product",
        path: "/create-product",
      },
      {
        label: "All Products",
        path: "/products",
      },
    ]
  },
  {
    label: "Orders",
    icon: <ListAlt sx={styles.iconSize} />,
    path: "/orders",
  },
];

export default Navigation;
