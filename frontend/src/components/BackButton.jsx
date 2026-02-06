import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export default function BackButton({ to = null, onClick = null }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button variant="ghost" onClick={handleClick} className="mb-4">
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
}



