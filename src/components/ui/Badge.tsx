import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      dot = false,
      dotColor,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantClass = variant === 'warning' ? 'pill-accent' : 'pill';
    const sizeClass = size === 'sm' ? 'text-[0.6rem] px-2.5 py-1' : '';

    return (
      <span
        ref={ref}
        className={[variantClass, sizeClass, className].filter(Boolean).join(' ')}
        {...props}
      >
        {dot && (
          <span
            className="mr-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: dotColor || 'currentColor' }}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
