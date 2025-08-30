import { Dashboard, Category, Workspaces, ViewCarousel, Groups, Article, Info, AccountCircle, Sell } from "@mui/icons-material";
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
    routes: ["/"],
  },
  {
    label: "Manage Banners",
    icon: <ViewCarousel sx={styles.iconSize} />,
    routes: ["/banners"]
  },
  {
    label: "Manage Categories",
    icon: <Category sx={styles.iconSize} />,
    routes: ["/categories"]
  },
  {
    label: "Manage Products",
    icon: <Workspaces sx={styles.iconSize} />,
    routes: ["/products", "/products/create-product", "/products/update-product/:id"],
    routesLabel: ["Manage Products", "Create Product", "Update Product"]
  },
  {
    label: "Orders",
    icon: <Sell sx={styles.iconSize} />,
    routes: ["/orders"],
  },
  {
    label: "Users",
    icon: <Groups sx={styles.iconSize} />,
    routes: ["/users"],
  },
  {
    label: "Manage About",
    icon: <Info sx={styles.iconSize} />,
    routes: ["/about"],
  },
  {
    label: "Manage Blogs",
    icon: <Article sx={styles.iconSize} />,
    routes: ["/blogs"],
  },
  {
    label: "Logout",
    icon: <AccountCircle sx={styles.iconSize} />,
    routes: ["/logout"],
  },
];

export default Navigation;
