import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  color?: string;
}

export function Avatar({ className, initials, color = '#059669', ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white text-xs font-bold shrink-0',
        className
      )}
      style={{ backgroundColor: color }}
      {...props}
    >
      {initials}
    </div>
  );
}
