import { Dashboard, Category, ListAlt, Workspaces, ViewCarousel, Groups, Language, Article, Info, AccountCircle, Sell } from "@mui/icons-material";
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
    label: "Manage Banners",
    icon: <ViewCarousel sx={styles.iconSize} />,
    path: "/banners"
  },
  {
    label: "Manage Categories",
    icon: <Category sx={styles.iconSize} />,
    path: "/categories"
  },
  {
    label: "Manage Products",
    icon: <Workspaces sx={styles.iconSize} />,
    path: "/products",
  },
  {
    label: "Orders",
    icon: <Sell sx={styles.iconSize} />,
    path: "/orders",
  },
  {
    label: "Users",
    icon: <Groups sx={styles.iconSize} />,
    path: "/users",
  },
  {
    label: "Manage About",
    icon: <Info sx={styles.iconSize} />,
    path: "/about",
  },
  {
    label: "Manage Blogs",
    icon: <Article sx={styles.iconSize} />,
    path: "/blogs",
  },
  {
    label: "Logout",
    icon: <AccountCircle sx={styles.iconSize} />,
    path: "/logout",
  },
];

export default Navigation;
