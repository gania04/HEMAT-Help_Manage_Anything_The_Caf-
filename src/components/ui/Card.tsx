import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'audit';
};

export function Card({ children, className = '', variant = 'default' }: Readonly<CardProps>) { // NOSONAR
  const baseStyles = "bg-neutral-white rounded-xl shadow-sm p-6";
  const variants = {
    default: "border border-gray-100",
    audit: "border-2 border-dashed border-primary-green bg-secondary-green/20",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
