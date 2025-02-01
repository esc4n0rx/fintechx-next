import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
      {...props}
    >
      {children}
    </button>
  );
};
