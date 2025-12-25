'use client';

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-accent border-accent text-canvas'
                      : isCurrent
                      ? 'bg-timber-dark border-timber-dark text-canvas'
                      : 'bg-canvas border-timber-dark/30 text-timber-beam'
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : stepNumber}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-timber-dark' : 'text-timber-beam'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-timber-beam hidden lg:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              {stepNumber < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-accent' : 'bg-timber-dark/20'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
