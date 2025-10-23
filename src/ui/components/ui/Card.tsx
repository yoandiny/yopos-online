import React from 'react';
import { cn } from '../../lib/utils';

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)} {...props} />
);

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6 border-b border-gray-200', className)} {...props} />
);

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
);

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6 bg-gray-50 border-t border-gray-200', className)} {...props} />
);

export { Card, CardHeader, CardContent, CardFooter };
