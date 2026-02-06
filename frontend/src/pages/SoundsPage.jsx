import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const natureSounds = [
  {
    id: "rain",
    name: "Rain",
    description: "Gentle rainfall on leaves",
    icon: "R",
    iconColor: "bg-blue-500",
    url: "https://audio-previews.elements.envatousercontent.com/files/281313173/preview.mp3?response-content-disposition=attachment%3B+filename%3D%22UPA6GE2-rain.mp3%22",
    attribution: "Pixabay — Rain Ambient",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Birds and rustling leaves",
    icon: "T",
    iconColor: "bg-green-600",
    url: "https://audio-previews.elements.envatousercontent.com/files/229940957/preview.mp3?response-content-disposition=attachment%3B+filename%3D%22CYZP5MS-in-the-forest.mp3%22",
    attribution: "Pixabay — Forest Ambience",
  },
  {
    id: "river",
    name: "River",
    description: "Babbling brook",
    icon: "D",
    iconColor: "bg-cyan-500",
    url: "https://audio-previews.elements.envatousercontent.com/files/597627854/preview.mp3?response-content-disposition=attachment%3B+filename%3D%22C9WQS3S-river.mp3%22",
    attribution: "Pixabay — River Ambient",
  },
  {
    id: "wind",
    name: "Wind",
    description: "Soft breeze through trees",
    icon: "W",
    iconColor: "bg-gray-400",
    url: "https://assets.mixkit.co/active_storage/sfx/894/894-preview.mp3",
    attribution: "Pixabay — Wind Blowing Ambient",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Waves gently rolling onto shore",
    icon: "O",
    iconColor: "bg-blue-700",
    url: "https://assets.mixkit.co/active_storage/sfx/1185/1185-preview.mp3",
    attribution: "Pixabay — Ocean Waves Ambient",
  },
];

// Sound presets
const soundPresets = [
  {
    name: "Rainy Day",
    sounds: ["rain", "wind"],
  },
  {
    name: "Beach Morning",
    sounds: ["ocean", "wind"],
  },
  {
    name: "Forest Walk",
    sounds: ["forest", "wind"],
  },
  {
    name: "Cozy Cabin",
    sounds: ["rain", "forest"],
  },
];

export default function SoundsPage() {
  const [sounds, setSounds] = useState(() => {
    const stored = localStorage.getItem("nature-sounds-state");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });
  const [masterVolume, setMasterVolume] = useState(() => {
    const stored = localStorage.getItem("nature-sound-master-volume");
    return stored ? parseFloat(stored) : 0.7;
  });
  const [isLoopEnabled, setIsLoopEnabled] = useState(true);
  const audioRefs = useRef({});

  // Initialize audio elements
  useEffect(() => {
    natureSounds.forEach((sound) => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.loop = isLoopEnabled;
        audio.volume = (sounds[sound.id]?.volume || 0.5) * masterVolume;
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      // Cleanup on unmount
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);

  // Update audio sources and states (avoid play/pause race)
  useEffect(() => {
    natureSounds.forEach((sound) => {
      const audio = audioRefs.current[sound.id];
      if (audio) {
        const soundState = sounds[sound.id];
        const targetVolume = (soundState?.volume || 0.5) * masterVolume;
        audio.volume = targetVolume;
        audio.loop = isLoopEnabled;

        // Only set src when changed
        if (audio.src !== sound.url) {
          audio.src = sound.url;
        }

        if (soundState?.isPlaying) {
          // If already playing, do nothing
          if (audio.paused) {
            const playSafe = () => {
              audio.play().catch((err) => {
                // AbortError occurs when play interrupted by pause; ignore silently
                if (err && String(err.name) === "AbortError") {
                  console.warn(`Play aborted for ${sound.name}`);
                  return;
                }
                console.error(`Error playing ${sound.name}:`, err);
                toast.error(`Failed to play ${sound.name}`, {
                  description: "Please check your internet connection.",
                });
                setSounds((prev) => ({
                  ...prev,
                  [sound.id]: { ...prev[sound.id], isPlaying: false },
                }));
              });
            };
            if (audio.readyState >= 2) {
              playSafe();
            } else {
              audio.addEventListener("canplay", playSafe, { once: true });
            }
          }
        } else {
          if (!audio.paused) {
            audio.pause();
          }
        }
      }
    });
  }, [sounds, masterVolume, isLoopEnabled]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("nature-sounds-state", JSON.stringify(sounds));
  }, [sounds]);

  useEffect(() => {
    localStorage.setItem("nature-sound-master-volume", masterVolume.toString());
  }, [masterVolume]);

  const toggleSound = (soundId) => {
    setSounds((prev) => {
      const currentState = prev[soundId] || { volume: 0.5, isPlaying: false };
      return {
        ...prev,
        [soundId]: {
          ...currentState,
          isPlaying: !currentState.isPlaying,
        },
      };
    });
  };

  const updateSoundVolume = (soundId, volume) => {
    setSounds((prev) => ({
      ...prev,
      [soundId]: {
        ...(prev[soundId] || { isPlaying: false }),
        volume,
      },
    }));
  };

  const handleMasterVolumeChange = (newVolume) => {
    setMasterVolume(newVolume[0]);
    // Update all audio volumes
    Object.keys(audioRefs.current).forEach((soundId) => {
      const audio = audioRefs.current[soundId];
      if (audio && sounds[soundId]) {
        audio.volume = (sounds[soundId].volume || 0.5) * newVolume[0];
      }
    });
  };

  const applyPreset = (preset) => {
    const newSounds = {};
    preset.sounds.forEach((soundId) => {
      newSounds[soundId] = {
        volume: 0.5,
        isPlaying: true,
      };
    });
    setSounds(newSounds);
    toast.success(`Applied preset: ${preset.name}`);
  };

  const clearAll = () => {
    setSounds({});
    toast.success("All sounds stopped");
  };

  const playingCount = Object.values(sounds).filter((s) => s.isPlaying).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Nature Sounds</h1>
        <p className="text-muted-foreground">
          Create your perfect ambient soundscape
        </p>
      </div>

      {/* Master Volume Control */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Master Volume</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isLoopEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLoopEnabled(!isLoopEnabled)}
              >
                Loop {isLoopEnabled ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
          {playingCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {playingCount} sound{playingCount !== 1 ? "s" : ""} playing
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sound Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {natureSounds.map((sound) => {
          const soundState = sounds[sound.id] || {
            volume: 0.5,
            isPlaying: false,
          };
          const isActive = soundState.isPlaying;

          return (
            <Card
              key={sound.id}
              className={cn(
                "transition-all duration-200",
                isActive && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg",
                      sound.iconColor
                    )}
                  >
                    {sound.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{sound.name}</CardTitle>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sound.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isActive && (
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSound(sound.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Slider
                        value={[soundState.volume]}
                        onValueChange={(val) =>
                          updateSoundVolume(sound.id, val[0])
                        }
                        min={0}
                        max={1}
                        step={0.01}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(soundState.volume * 100)}%
                      </span>
                    </div>
                  </>
                )}
                {!isActive && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleSound(sound.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sound Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sound Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {soundPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
