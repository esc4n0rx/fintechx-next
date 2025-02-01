import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          ref={ref}
          className={`w-full p-3 pl-10 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder={label}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
