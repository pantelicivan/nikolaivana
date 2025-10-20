import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown = () => {
  const weddingDate = new Date("2026-05-30T00:00:00");
  
  const calculateTimeLeft = (): TimeLeft => {
    const difference = weddingDate.getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 my-12">
      <div className="countdown-card min-w-[100px] text-center animate-fade-in">
        <div className="text-4xl md:text-5xl font-bold" style={{ color: 'hsl(var(--wedding-rose))' }}>
          {timeLeft.days}
        </div>
        <div className="text-sm md:text-base uppercase tracking-wide mt-2" style={{ color: 'hsl(var(--wedding-text-muted))' }}>
          Dana
        </div>
      </div>
      
      <div className="countdown-card min-w-[100px] text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="text-4xl md:text-5xl font-bold" style={{ color: 'hsl(var(--wedding-rose))' }}>
          {timeLeft.hours}
        </div>
        <div className="text-sm md:text-base uppercase tracking-wide mt-2" style={{ color: 'hsl(var(--wedding-text-muted))' }}>
          Sati
        </div>
      </div>
      
      <div className="countdown-card min-w-[100px] text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="text-4xl md:text-5xl font-bold" style={{ color: 'hsl(var(--wedding-rose))' }}>
          {timeLeft.minutes}
        </div>
        <div className="text-sm md:text-base uppercase tracking-wide mt-2" style={{ color: 'hsl(var(--wedding-text-muted))' }}>
          Minuta
        </div>
      </div>
      
      <div className="countdown-card min-w-[100px] text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="text-4xl md:text-5xl font-bold" style={{ color: 'hsl(var(--wedding-rose))' }}>
          {timeLeft.seconds}
        </div>
        <div className="text-sm md:text-base uppercase tracking-wide mt-2" style={{ color: 'hsl(var(--wedding-text-muted))' }}>
          Sekundi
        </div>
      </div>
    </div>
  );
};

export default Countdown;
