interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-brand-100 text-brand-600',
  purple: 'bg-brand-100 text-brand-700',
};

export default function Badge({ children, variant = 'default' }: Props) {
  return (
    <span className={`badge ${variants[variant]}`}>{children}</span>
  );
}
