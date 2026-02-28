
import React from 'react';

interface FormStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const FormStep: React.FC<FormStepProps> = ({ title, description, children }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
};

export default FormStep;
