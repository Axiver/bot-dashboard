//Main Component
const Button = (props: any) => {
  return (
		<button type={props.type} className={["rounded-full py-3 px-6 border border-purple-500 text-purple-500 text-lg", props.className].join(" ")} onClick={props.onclick}>{props.children}</button>
	);
};

//Proptypes for the component
type Button = {
  /* Label for the button */
  value: string;
  /* Button type */
  type: string;
  /* Classes to be applied to the component */
  className: string;
  /* Children elements */
  children: React.ReactNode;
  /* Onclick event handler */
  onclick: Function;
}

//Export the component
export default Button;
