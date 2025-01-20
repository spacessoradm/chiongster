import { Link, NavLink } from "react-router-dom"; // Use NavLink instead of Link
// import { FaBars } from "react-icons/fa";
// import logoNameImage from "../../../assets/images/logo-name.png";
import logoPNGImage from "../../../../assets/images/Chiongster-logo.jpg";
import navBarItems from "../navBarItems";
import "./index.css";

const HorizontalNavbar = () => {
  return (
    <nav>
      <Link to="/" className="link">
        <img src={logoPNGImage} alt="Chiongster Logo" className="logo-icon" />
      </Link>
      <div className="menu-items">
      </div>
      <div className="login-button-mobile-hidden">
      </div>
    </nav>
  );
};

export default HorizontalNavbar;
