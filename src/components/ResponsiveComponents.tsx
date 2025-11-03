import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer = ({ children, className }: ResponsiveContainerProps) => {
  return (
    <div className={cn('container mx-auto px-3 sm:px-4 md:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className 
}: ResponsiveGridProps) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  };

  const colsClass = `grid-cols-${cols.default || 1} ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''} ${cols.md ? `md:grid-cols-${cols.md}` : ''} ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''} ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}`;

  return (
    <div className={cn('grid', gapClasses[gap], colsClass, className)}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const ResponsiveCard = ({ children, className, hover = true }: ResponsiveCardProps) => {
  return (
    <div 
      className={cn(
        'rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6',
        'shadow-sm sm:shadow-md',
        'bg-card text-card-foreground',
        'border border-border',
        hover && 'hover:shadow-lg transition-shadow duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ResponsiveText = ({ 
  children, 
  size = 'base',
  weight = 'normal',
  className,
  as: Component = 'p'
}: ResponsiveTextProps) => {
  const sizeClasses = {
    xs: 'text-[10px] sm:text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl lg:text-4xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <Component className={cn(sizeClasses[size], weightClasses[weight], className)}>
      {children}
    </Component>
  );
};

interface ResponsiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
}

export const ResponsiveButton = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
  icon
}: ResponsiveButtonProps) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizeClasses = {
    sm: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
    md: 'px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base',
    lg: 'px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-md font-medium',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',
        'touch-action-manipulation',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

interface ResponsiveTableProps {
  headers: string[];
  data: Array<Record<string, any>>;
  renderRow: (item: any, index: number) => ReactNode;
  mobileCard?: (item: any, index: number) => ReactNode;
  className?: string;
}

export const ResponsiveTable = ({ 
  headers, 
  data, 
  renderRow,
  mobileCard,
  className 
}: ResponsiveTableProps) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn('w-full border-collapse', className)}>
          <thead>
            <tr className="border-b border-border">
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            {mobileCard ? mobileCard(item, index) : (
              <ResponsiveCard>
                <div className="space-y-2">
                  {Object.entries(item).map(([key, value], i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {headers[i] || key}:
                      </span>
                      <span className="text-sm font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </ResponsiveCard>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
