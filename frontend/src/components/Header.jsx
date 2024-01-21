import logo from "../../public/logo.png";
// import logo from " ../assets/logo.png";

const Header = () => {
  return (
    <div className="absolute top-0 w-full  shadow-md ">
      <img className="w-[100px] h-[50px] mx-5 my-4 lg:mx-60" src={logo} alt="logo" />
    </div>
  );
};
export default Header;
