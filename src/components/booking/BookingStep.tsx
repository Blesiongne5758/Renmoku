import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

interface BookingStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  icon?: ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  children?: ReactNode;
}

export default function BookingStep({
  stepNumber,
  title,
  description,
  icon,
  isActive,
  isCompleted,
  children,
}: BookingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="card-luxury p-6"
    >
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            isCompleted
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : isActive
              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-luxury-900'
              : 'neu-soft text-gray-500'
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : icon ? (
            <span className="text-lg">{icon}</span>
          ) : (
            <span className="font-bold">{stepNumber}</span>
          )}
        </div>
        <div>
          <h2 className="font-[Playfair_Display] text-xl font-bold text-white">
            {title}
          </h2>
          {description && (
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Step Content */}
      {children && <div className="space-y-6">{children}</div>}
    </motion.div>
  );
}
