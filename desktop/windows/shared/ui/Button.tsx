import { twMerge } from 'tailwind-merge';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export function Button({
  children,
  onClick,
  className,
  disabled,
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'px-4 py-2 rounded-md bg-blue-500 text-white font-medium',
        'hover:bg-blue-600 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

