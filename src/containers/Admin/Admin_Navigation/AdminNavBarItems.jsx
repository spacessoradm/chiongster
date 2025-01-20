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
        title: "Manage Bookings",
        link: "/admin/bookings",
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
        title: "Settings",
        icon: <FaCog />,
        dropdown: true, // Indicates dropdown
        items: [
            {
                title: "Manage Venue",
                link: "/admin/venuecategory",
                icon: <FaListAlt />,
            },
        ]
    },
];

export default adminNavBarItems;
