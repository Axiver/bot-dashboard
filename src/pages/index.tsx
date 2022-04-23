//Import required components
import LoginForm from "../components/LoginForm";

//Login Page
const LoginPage = () => {
  return (
    <div className="h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500 flex justify-center items-center">
      <div className="w-1/2 bg-white rounded-lg inline-grid grid-cols-2 drop-shadow-md">
        <LoginForm />
        <div className="border-l bg-teal-200 rounded-r-lg"></div>
      </div>
    </div>
  );
};

export default LoginPage;
