import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export default forwardRef<HTMLInputElement, InputProps>(function Input({ error, className, ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={[
        "w-full px-3 py-2 rounded-lg border",
        "bg-white text-slate-900",
        "text-sm outline-none transition",
        "border-slate-300",
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error ? "border-red-500 focus:ring-red-500" : "",
        className || ""
      ].join(" ")}
    />
  );
});
