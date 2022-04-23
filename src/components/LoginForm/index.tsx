import { useState } from "react";
import Button from "../Button";
import TextInput from "../TextInput";

//Login Form
const LoginForm = () => {
  //-- Event hooks --//
  const [username, updateUsername] = useState("");
  const [password, updatePassword] = useState("");

  //-- Event handlers --//
  //Handles username input change
  const handleUsernameChange = (event: React.FormEvent<HTMLInputElement>) => {
    //Update the username value
    updateUsername(event.currentTarget.value);
  };

  //Handles password input change
  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    //Update the username value
    updatePassword(event.currentTarget.value);
  };

  //Handles form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //Prevents the page from reloading
    event.preventDefault();

    //Logs the input received
    console.log("username: ", username);
    console.log("password: ", password);
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-10">System Monitoring Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <h2 className="text-2xl font-semibold">Username</h2>
            <TextInput
              name="username"
              defaultValue={username}
              onChange={handleUsernameChange}
              className="mt-2 w-full"
            />
          </label>
        </div>
        <div className="my-6">
          <label>
            <h2 className="text-2xl font-semibold">Password</h2>
            <TextInput
              name="password"
              type="password"
              defaultValue={password}
              onChange={handlePasswordChange}
              className="mt-2 w-full"
            />
          </label>
        </div>
        <Button type="submit" className="w-full mt-8 hover:bg-purple-500 hover:text-white transition-all duration-200">Login</Button>
      </form>
    </div>
  );
};

//Export the component
export default LoginForm;
