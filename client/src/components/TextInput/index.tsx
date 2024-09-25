//Import required libraries
import React from "react";

//Text input component
const TextInput = (props: any) => {
  //CSS Styling for when the component is/is not in an errored state
  const regularCSS = "border-gray-300";
  const erroredCSS = "border-red-500";

  return (
    <input
      type={props.type ? props.type : "text"}
      name={props.name ? props.name : ""}
      className={[
        "text-lg p-2 px-4 border-2 rounded-full transition-all ease-out outline-none focus:border-purple-500", props.hasError ? erroredCSS : regularCSS, props.className].join(" ")}
      value={props.defaultValue}
      onChange={props.onChange}
    />
  );
};

//Proptypes for the component
type TextInput = {
  /* Input type */
  type: string;
  /* Input name */
  name: string;
  /* Default value for the text input */
  defaultValue: string;
  /* Classes to be applied to the component */
  className: string;
  /* Invoked when the value of the text input changes */
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
  /* Whether or not the text input is in an errored state */
  hasError: boolean;
};

//Export the component
export default TextInput;
