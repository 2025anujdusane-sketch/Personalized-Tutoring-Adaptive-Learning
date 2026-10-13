import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-main flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8 text-accent" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-main">404</h1>
      <h2 className="text-lg font-serif font-semibold text-main mt-1">Page Not Found</h2>
      <p className="text-xs text-muted max-w-sm mt-2 leading-relaxed">
        The requested syllabus route or learning resource does not exist in StudySphere AI.
      </p>
      <div className="pt-6">
        <Link to="/app">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
