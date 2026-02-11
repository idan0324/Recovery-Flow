import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, ArrowRight } from 'lucide-react';

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export function NameInput({ onSubmit }: NameInputProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-secondary">
      {/* Logo */}
      <div className="w-20 h-20 rounded-3xl gradient-hero flex items-center justify-center mb-8 shadow-glow animate-float text-primary-foreground">
        <Heart className="w-10 h-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-3 animate-fade-up text-foreground">
        Welcome to RecoverFlow
      </h1>
      
      <p className="text-lg mb-8 animate-fade-up text-muted-foreground" style={{ animationDelay: '0.1s' }}>
        What should we call you?
      </p>

      <div className="w-full max-w-xs space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-center text-lg h-12"
          autoFocus
        />
        
        <Button 
          onClick={handleSubmit} 
          variant="hero" 
          size="lg" 
          className="w-full"
          disabled={!name.trim()}
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <p className="text-sm mt-8 max-w-sm animate-fade-up text-muted-foreground" style={{ animationDelay: '0.3s' }}>
        Your name helps us personalize your recovery experience.
      </p>
    </div>
  );
}
