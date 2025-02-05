import { 
    FaTachometerAlt, 
    FaUser, 
    FaCog, 
    FaClipboardList, 
    FaUtensils, 
    FaTags, 
    FaListAlt, 
    FaPlusCircle, 
    FaTools,
    FaThList,
} from "react-icons/fa";

const adminNavBarItems = [
    {
        title: "Admin Dashboard",
        link: "/admin/dashboard",
        icon: <FaTachometerAlt />,
    },
    {
        title: "Manage App Users",
        link: "/admin/appusers",
        icon: <FaUser />,
    },

    {
        title: "Manage Managers",
        link: "/admin/managers",
        icon: <FaUser />,
    },

    {
        title: "Manage Bookings",
        link: "/admin/bookings",
        icon: <FaUser />,
    },
    {
        title: "Manage Alcohol Balance",
        link: "/admin/alcoholbalance",
        icon: <FaUser />,
    },
    {
        title: "Manage Drink Dollars",
        link: "/admin/drinkdollars",
        icon: <FaUser />,
    },
    {
        title: "Manage Venues",
        link: "/admin/venues",
        icon: <FaUser />,
    },
    {
        title: "Manage Blogs",
        link: "/admin/blogs",
        icon: <FaUser />,
    },
    {
        title: "Settings",
        icon: <FaCog />,
        dropdown: true, // Indicates dropdown
        items: [
            {
                title: "Manage Banner",
                link: "/admin/banners",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Blog Tags",
                link: "/admin/blogtags",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Notis",
                link: "/admin/notis",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Language",
                link: "/admin/languages",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Recommended Tags",
                link: "/admin/recommendedtags",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Redeem Items",
                link: "/admin/redeemitems",
                icon: <FaListAlt />,
            },
            {
                title: "Manage Venue",
                link: "/admin/venuecategory",
                icon: <FaListAlt />,
            },
        ]
    },
];

export default adminNavBarItems;
