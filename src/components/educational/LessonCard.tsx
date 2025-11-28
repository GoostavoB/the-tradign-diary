import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    progress: number;
    completed: boolean;
    locked: boolean;
    category: string;
  };
}

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-500',
  intermediate: 'bg-yellow-500/20 text-yellow-500',
  advanced: 'bg-red-500/20 text-red-500',
};

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <PremiumCard className={`p-6 transition-all hover:shadow-lg ${lesson.locked ? 'opacity-60' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[lesson.difficulty]}`}>
                {lesson.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">{lesson.category}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          </div>
          {lesson.locked && <Lock className="h-5 w-5 text-muted-foreground" />}
          {lesson.completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{lesson.duration}</span>
        </div>

        {!lesson.locked && !lesson.completed && lesson.progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{lesson.progress}%</span>
            </div>
            <Progress value={lesson.progress} className="h-2" />
          </div>
        )}

        <Link to={`/learn/${lesson.id}`}>
          <Button
            className="w-full"
            disabled={lesson.locked}
            variant={lesson.completed ? 'outline' : 'default'}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {lesson.completed ? 'Review' : lesson.progress > 0 ? 'Continue' : 'Start Lesson'}
          </Button>
        </Link>
      </div>
    </PremiumCard>
  );
}
