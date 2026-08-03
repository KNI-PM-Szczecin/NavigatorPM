import type { HTMLAttributes } from "react";

type SafeAreaProps = HTMLAttributes<HTMLDivElement>;

const SafeArea = ({ className = "", children, ...rest }: SafeAreaProps) => {
  return (
    <div
      {...rest}
      className={`pr-[env(safe-area-inset-right) pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] ${className}`}
    >
      {children}
    </div>
  );
};

export default SafeArea;
