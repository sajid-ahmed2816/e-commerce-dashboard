import { Dashboard, Category, Workspaces, ViewCarousel, Groups, Article, Info, AccountCircle, Sell, LocalActivity, CandlestickChart, Tune, SwitchAccessShortcut } from "@mui/icons-material";
import colors from "./assets/styles/colors";

const styles = {
  iconSize: {
    p: 0.2,
    fontSize: "20px",
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
    label: "Manage Offers",
    icon: <LocalActivity sx={styles.iconSize} />,
    routes: ["/offers"]
  },
  {
    label: "Manage Attributes",
    icon: <Tune sx={styles.iconSize} />,
    routes: ["/attributes"]
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
    label: "Manage Variants",
    icon: <SwitchAccessShortcut sx={styles.iconSize} />,
    routes: ["/variants", "/variants/create-variant", "/variants/update-variant/:id"],
    routesLabel: ["Manage Variants", "Create Variant", "Update Variant"]
  },
  {
    label: "Manage Orders",
    icon: <Sell sx={styles.iconSize} />,
    routes: ["/orders", "/orders/order-detail/:id"],
    routesLabel: ["Manage Orders", "Order Details"]
  },
  {
    label: "Manage Users",
    icon: <Groups sx={styles.iconSize} />,
    routes: ["/users"],
  },
  {
    label: "Manage Blogs",
    icon: <Article sx={styles.iconSize} />,
    routes: ["/blogs", "/blogs/create-blog", "/blogs/update-blog/:id"],
    routesLabel: ["Manage Blogs", "Create Blog", "Update Blog"]
  },
];

export default Navigation;
