import React from 'react';
import { QuestPoint } from '@/types';
import { MultipleChoiceTask } from './tasks/MultipleChoiceTask';
import { TextInputTask } from './tasks/TextInputTask';
import { PhotoTask } from './tasks/PhotoTask';
import { SelfieTask } from './tasks/SelfieTask';

interface TaskComponentProps {
  point: QuestPoint;
  onComplete: (isCorrect: boolean, answer: any, photoUrl?: string) => void;
}

export const TaskComponent: React.FC<TaskComponentProps> = ({ point, onComplete }) => {
  const renderTask = () => {
    switch (point.task_type) {
      case 'multiple_choice':
        return <MultipleChoiceTask point={point} onComplete={onComplete} />;
      case 'text_input':
        return <TextInputTask point={point} onComplete={onComplete} />;
      case 'photo':
        return <PhotoTask point={point} onComplete={onComplete} />;
      case 'selfie':
        return <SelfieTask point={point} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return <div>{renderTask()}</div>;
};