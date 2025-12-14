import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

type Variant = 'solid' | 'ghost' | 'subtle';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const base = 'cursor-pointer inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300';

const variants: Record<Variant, string> = {
  solid: 'bg-pink-400 text-slate-900 shadow-lg shadow-pink-300/40 hover:brightness-105 px-4 py-2',
  ghost: 'bg-slate-900/60 text-slate-100 hover:bg-slate-800/80 px-3 py-2',
  subtle: 'bg-slate-800/70 text-slate-100 hover:bg-slate-800 px-3 py-2',
};

const Button: FC<Props> = ({ variant = 'solid', className = '', children, ...rest }) => {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
