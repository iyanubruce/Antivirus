import { SidebarProps } from "./interfaces";

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  theme,
}) => {
  const navItems = [
    { id: "dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
    { id: "scan-results", icon: "fa-list-alt", label: "Scan Results" },
    { id: "vulnerability", icon: "fa-bug", label: "Vulnerability Reports" },
    { id: "settings", icon: "fa-cog", label: "Settings" },
  ];

  return (
    <aside
      className={`w-60 ${
        theme === "light"
          ? "bg-white border-r border-gray-200"
          : "bg-gray-800 border-r border-gray-700"
      } flex-shrink-0`}
    >
      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-6 py-3 cursor-pointer whitespace-nowrap ${
                  activeTab === item.id
                    ? `${
                        theme === "light"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-blue-900 bg-opacity-30 text-blue-400"
                      }`
                    : `${
                        theme === "light"
                          ? "hover:bg-gray-100"
                          : "hover:bg-gray-700"
                      }`
                }`}
              >
                <i
                  className={`fas ${item.icon} w-6 text-center ${
                    activeTab === item.id ? "text-blue-600" : ""
                  }`}
                ></i>
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
