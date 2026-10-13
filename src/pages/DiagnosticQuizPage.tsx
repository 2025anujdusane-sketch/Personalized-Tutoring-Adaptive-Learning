import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Sparkles } from 'lucide-react';

export const DiagnosticQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startDiagnostic = async () => {
      try {
        const quiz = await api.generateDiagnosticQuiz();
        sessionStorage.setItem(`quiz_${quiz.id}`, JSON.stringify(quiz));
        navigate(`/app/quiz/${quiz.id}`);
      } catch (e) {
        navigate('/app/quiz');
      }
    };
    startDiagnostic();
  }, [navigate]);

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-xl bg-accent-subtle text-accent flex items-center justify-center animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-serif font-semibold text-main">
        Generating Diagnostic Assessment...
      </h2>
      <p className="text-xs text-muted max-w-sm">
        Selecting 5 foundational and prerequisite questions across Arrays, Recursion, Trees, and Dynamic Programming.
      </p>
    </div>
  );
};
