import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        fullWidth = false,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-lg
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

        const variants = {
            primary: `
        bg-sand text-navy hover:bg-sand-light
        focus-visible:ring-sand
        active:scale-[0.98]
      `,
            secondary: `
        bg-indigo text-gray-100 hover:bg-indigo-light
        focus-visible:ring-indigo
        active:scale-[0.98]
      `,
            ghost: `
        bg-transparent text-gray-200 hover:bg-indigo/30
        focus-visible:ring-indigo
      `,
            danger: `
        bg-error/90 text-white hover:bg-error
        focus-visible:ring-error
        active:scale-[0.98]
      `,
        };

        const sizes = {
            sm: 'text-sm px-3 py-1.5 gap-1.5',
            md: 'text-base px-4 py-2 gap-2',
            lg: 'text-lg px-6 py-3 gap-2.5',
        };

        return (
            <button
                ref={ref}
                className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
