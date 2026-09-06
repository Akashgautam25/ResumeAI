import React from 'react';
import { StructuredResume } from '../../types/index.js';
import { ATSClassicTemplate } from './templates/ATSClassicTemplate.js';
import { ModernTemplate } from './templates/ModernTemplate.js';
import { DeveloperTemplate } from './templates/DeveloperTemplate.js';
import { MinimalTemplate } from './templates/MinimalTemplate.js';

export interface ResumePreviewProps {
  resume: StructuredResume;
  templateId?: string;
  id?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  templateId = 'ats-classic',
  id = 'resume-preview-document',
}) => {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern':
        return <ModernTemplate resume={resume} />;
      case 'developer':
        return <DeveloperTemplate resume={resume} />;
      case 'minimal':
        return <MinimalTemplate resume={resume} />;
      case 'ats-classic':
      default:
        return <ATSClassicTemplate resume={resume} />;
    }
  };

  return (
    <div className="w-full flex justify-center bg-zinc-200/50 p-4 sm:p-8 rounded-2xl overflow-x-auto min-h-[850px] shadow-inner">
      <div
        id={id}
        className="w-full max-w-[800px] bg-white rounded-xl shadow-premium border border-zinc-200/60 overflow-hidden"
      >
        {renderTemplate()}
      </div>
    </div>
  );
};
