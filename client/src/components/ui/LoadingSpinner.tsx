interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-12 w-12' };

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full border-2 border-brand-200 border-t-brand-600`} />
  );
}
