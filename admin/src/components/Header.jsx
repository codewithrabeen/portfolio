import { Bell } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div>
        <span className="header-label">
          Portfolio Management
        </span>
      </div>

      <div className="header-right">
        <button className="icon-button">
          <Bell size={19} />
        </button>

        <div className="admin-user">
          <div className="avatar">R</div>

          <div>
            <strong>Rabeen</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;