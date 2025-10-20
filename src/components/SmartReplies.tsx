'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, ThumbsUp, ThumbsDown, Copy, Clock } from 'lucide-react';

interface SmartSuggestion {
  id: number;
  content: string;
  confidence: number;
  category: string;
  responseTime: string;
}

export function SmartReplies() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{[key: number]: 'positive' | 'negative'}>({});

  const generateSuggestions = async (userQuery: string) => {
    setIsLoading(true);
    
    // Simulate AI API call
    setTimeout(() => {
      setSuggestions([
        {
          id: 1,
          content: "I understand you're experiencing issues with your account access. Let me help you resolve this quickly. Please try clearing your browser cache and cookies, then attempt to log in again. If the issue persists, we can reset your password.",
          confidence: 0.95,
          category: 'account_access',
          responseTime: '2s'
        },
        {
          id: 2, 
          content: "Thank you for reaching out about this issue. I can see this is affecting your ability to use our service. Let me investigate this further for you. In the meantime, you might want to try using our mobile app as an alternative.",
          confidence: 0.87,
          category: 'general_support',
          responseTime: '3s'
        },
        {
          id: 3,
          content: "I apologize for the inconvenience you're experiencing. This appears to be a known issue that our technical team is currently addressing. We expect to have a resolution within the next few hours. I'll keep you updated on our progress.",
          confidence: 0.78,
          category: 'technical_issue',
          responseTime: '1s'
        }
      ]);
      setIsLoading(false);
    }, 2000);
  };

  const handleUseSuggestion = (suggestion: SmartSuggestion) => {
    navigator.clipboard.writeText(suggestion.content);
    // Could also insert directly into an active text editor
  };

  const handleFeedback = (suggestionId: number, isPositive: boolean) => {
    setFeedback(prev => ({
      ...prev,
      [suggestionId]: isPositive ? 'positive' : 'negative'
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'account_access': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'general_support': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'technical_issue': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <span>AI-Powered Reply Suggestions</span>
        </CardTitle>
        <CardDescription>
          Get intelligent response suggestions based on customer context and conversation history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Describe the customer issue or context..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => generateSuggestions(query)}
            disabled={!query.trim() || isLoading}
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Analyzing context and generating smart suggestions...</p>
          </div>
        )}

        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={getCategoryColor(suggestion.category)}>
                      {suggestion.category.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <span>{Math.round(suggestion.confidence * 100)}% match</span>
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{suggestion.responseTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(suggestion.id, true)}
                      className={feedback[suggestion.id] === 'positive' ? 'text-green-600' : ''}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(suggestion.id, false)}
                      className={feedback[suggestion.id] === 'negative' ? 'text-red-600' : ''}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm mb-4 whitespace-pre-wrap">{suggestion.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>AI-generated suggestion</span>
                    {feedback[suggestion.id] && (
                      <Badge variant="outline" className={
                        feedback[suggestion.id] === 'positive' ? 'text-green-600' : 'text-red-600'
                      }>
                        {feedback[suggestion.id] === 'positive' ? 'Helpful' : 'Not helpful'}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUseSuggestion(suggestion)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Use This
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {suggestions.length > 0 && !isLoading && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Not finding what you need? Try being more specific in your description.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}