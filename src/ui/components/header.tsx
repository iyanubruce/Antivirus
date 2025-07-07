import { HeaderProps } from "./interfaces";
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header
      className={`h-16 ${
        theme === "light"
          ? "bg-white border-b border-gray-200"
          : "bg-gray-800 border-b border-gray-700"
      } flex items-center justify-between px-6 shadow-sm`}
    >
      <div className="flex items-center">
        <i className="fas fa-shield-alt text-2xl text-blue-600 mr-3"></i>
        <h1 className="text-xl font-semibold">Electron Antivirus</h1>
      </div>
      <button
        onClick={toggleTheme}
        className={`w-[50px] h-[50px] grid place-content-center rounded-full ${
          theme === "light"
            ? "bg-gray-100 hover:bg-gray-200"
            : "bg-gray-700 hover:bg-gray-600"
        } cursor-pointer !rounded-full whitespace-nowrap`}
      >
        <i
          className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"} text-lg`}
        ></i>
      </button>
    </header>
  );
};

export default Header;
