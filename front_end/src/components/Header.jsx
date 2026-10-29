import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../useAuth";

function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Vaccines", path: "/vaccines" },
    ...(user ? [{ name: "My reminders", path: "/reminders" }] : []),
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <NavLink className="navbar-brand fw-bold" to="/" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">+</span>
            E-Vaccine Reminder
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNavbar"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse${menuOpen ? " show" : ""}`} id="mainNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active fw-semibold" : ""}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              {user ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light ms-lg-3 mt-2 mt-lg-0"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Sign out
                </button>
              ) : (
                <NavLink
                  className="btn btn-sm btn-light text-primary fw-semibold ms-lg-3 mt-2 mt-lg-0"
                  to="/login"
                  onClick={closeMenu}
                >
                  Sign in
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
