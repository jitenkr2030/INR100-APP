"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image, 
  Video, 
  Code, 
  Calculator,
  ExternalLink,
  Download,
  BookOpen,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface ContentRendererProps {
  content: {
    type: 'text' | 'markdown' | 'interactive' | 'quiz' | 'video';
    html?: string;
    text?: string;
    interactiveElements?: any[];
    quizQuestions?: any[];
  };
  className?: string;
}

export default function ContentRenderer({ content, className = "" }: ContentRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showQuiz, setShowQuiz] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderContent = () => {
    switch (content.type) {
      case 'markdown':
      case 'text':
        return (
          <div className="prose max-w-none">
            <div 
              className="lesson-content"
              dangerouslySetInnerHTML={{ 
                __html: content.html || content.text || '' 
              }} 
            />
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-6">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: content.html || '' 
              }} 
            />
            {content.interactiveElements && (
              <div className="mt-6 space-y-4">
                {content.interactiveElements.map((element, index) => (
                  <InteractiveElement key={index} element={element} />
                ))}
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: content.html || '' 
              }} 
            />
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 mb-4">
                <strong>Interactive Quiz Available:</strong> Test your understanding with {content.quizQuestions?.length || 0} questions
              </p>
              <Button 
                onClick={() => setShowQuiz(!showQuiz)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showQuiz ? 'Hide Quiz' : 'Start Quiz'}
                <Calculator className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {showQuiz && content.quizQuestions && (
              <QuizComponent questions={content.quizQuestions} />
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Video Content</p>
                <p className="text-sm text-gray-500">Video player would be embedded here</p>
              </div>
            </div>
            {content.html && (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: content.html 
                }} 
              />
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Content type: {content.type}</p>
            <div dangerouslySetInnerHTML={{ __html: content.html || content.text }} />
          </div>
        );
    }
  };

  const getContentIcon = () => {
    switch (content.type) {
      case 'video': return Video;
      case 'interactive': return Code;
      case 'quiz': return Calculator;
      case 'text':
      case 'markdown': return FileText;
      default: return FileText;
    }
  };

  const ContentIcon = getContentIcon();

  return (
    <Card className={`border border-gray-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ContentIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">
            {content.type === 'markdown' ? 'Lesson Content' : 
             content.type === 'interactive' ? 'Interactive Content' :
             content.type === 'quiz' ? 'Quiz Content' :
             content.type === 'video' ? 'Video Lesson' : 'Lesson Content'}
          </h3>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
            {content.type}
          </span>
        </div>
        
        {renderContent()}
      </CardContent>
    </Card>
  );
}

// Interactive Element Component
function InteractiveElement({ element }: { element: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderElement = () => {
    switch (element.type) {
      case 'calculator':
        return <CalculatorComponent {...element} />;
      case 'chart':
        return <ChartComponent {...element} />;
      case 'simulation':
        return <SimulationComponent {...element} />;
      case 'exercise':
        return <ExerciseComponent {...element} />;
      default:
        return (
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="font-medium">{element.title}</p>
            <p className="text-gray-600 text-sm">{element.description}</p>
          </div>
        );
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <p className="font-medium">{element.title}</p>
            <p className="text-gray-600 text-sm">{element.description}</p>
          </div>
          {isExpanded ? 
            <ChevronDown className="h-4 w-4" /> : 
            <ChevronRight className="h-4 w-4" />
          }
        </button>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {renderElement()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Calculator Component (placeholder)
function CalculatorComponent(props: any) {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">{props.title}</h4>
      <p className="text-blue-700 text-sm mb-3">{props.description}</p>
      <div className="space-y-2">
        <p className="text-sm text-blue-600">
          Interactive calculator would be implemented here based on the lesson content.
        </p>
      </div>
    </div>
  );
}

// Chart Component (placeholder)
function ChartComponent(props: any) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-2">{props.title}</h4>
      <p className="text-green-700 text-sm mb-3">{props.description}</p>
      <div className="h-32 bg-white rounded border flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chart would be displayed here</p>
      </div>
    </div>
  );
}

// Simulation Component (placeholder)
function SimulationComponent(props: any) {
  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-medium text-purple-900 mb-2">{props.title}</h4>
      <p className="text-purple-700 text-sm mb-3">{props.description}</p>
      <div className="space-y-2">
        <p className="text-sm text-purple-600">
          Interactive simulation would be implemented here.
        </p>
      </div>
    </div>
  );
}

// Exercise Component (placeholder)
function ExerciseComponent(props: any) {
  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <h4 className="font-medium text-orange-900 mb-2">{props.title}</h4>
      <p className="text-orange-700 text-sm mb-3">{props.description}</p>
      <div className="space-y-2">
        <p className="text-sm text-orange-600">
          Practice exercise would be implemented here.
        </p>
      </div>
    </div>
  );
}

// Quiz Component
function QuizComponent({ questions }: { questions: any[] }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  if (showResults) {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Quiz Results</h3>
          <div className="space-y-2">
            <p className="text-green-800">
              You answered {Object.keys(answers).length} out of {questions.length} questions.
            </p>
            <p className="text-green-700 text-sm">
              Results and scoring would be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-blue-200">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Quiz</h3>
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {questions[currentQuestion] && (
          <div className="space-y-4">
            <h4 className="font-medium">{questions[currentQuestion].question}</h4>
            
            <div className="space-y-2">
              {questions[currentQuestion].options?.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion, option)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    answers[currentQuestion] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}