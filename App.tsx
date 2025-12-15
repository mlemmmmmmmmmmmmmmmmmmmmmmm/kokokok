import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, BookOpen, Clock, Calendar, 
  Activity, Settings, Music, Volume2, VolumeX, 
  Plus, Trash2, Check, Moon, Sun, Bell, BellOff,
  Folder, FileText, Send, User as UserIcon, LogOut,
  BrainCircuit, Smile, Search, Phone, Mail, Users, X, MoreHorizontal, Video, Image as ImageIcon,
  Edit2, Camera, Trophy, MapPin, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Save, Palette, ChevronDown, FolderPlus, Minus, ArrowLeft,
  Link, Link2, Smartphone, Droplets, Footprints, Moon as MoonIcon, Smile as SmileIcon,
  Bold, Italic, Underline, List, Highlighter, AlignLeft, AlignCenter, AlignRight,
  ArrowUp, ArrowDown, ArrowUpDown, GripVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

// Import types and services
import { User, Subject, Goal, Note, Folder as NoteFolder, ScheduleEvent, ChatMessage, Contact, WellnessLog } from './types';
import { getStudyHelp, getWellnessInsights } from './services/geminiService';

// --- Custom Hook for Local Storage ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

// --- Components ---

// Helper: 12-Hour Time Format
const formatTo12Hour = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${suffix}`;
};

// Login Screen Component
const LoginScreen = ({ onLogin }: { onLogin: (identifier: string, type: 'email' | 'phone') => void }) => {
  const [step, setStep] = useState<'menu' | 'email' | 'phone'>('menu');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setError('Please enter a valid input');
      return;
    }
    
    if (step === 'email') {
      if (!inputValue.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      onLogin(inputValue, 'email');
    } else {
      if (!/^[\d\s\-+]+$/.test(inputValue)) {
        setError('Please enter a valid phone number');
        return;
      }
      onLogin(inputValue, 'phone');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[#111827] p-4 font-sans transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-md border-4 border-capy-200 dark:border-capy-700 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-capy-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 border-4 border-white dark:border-gray-700 shadow-md relative">
          🐹
          <div className="absolute -bottom-1 -right-1 bg-green-400 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        <h1 className="text-3xl font-bold text-capy-800 dark:text-white mb-2">CapyStudy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Your cozy study companion</p>
        
        {step === 'menu' && (
            <div className="space-y-4">
                <button 
                    onClick={() => setStep('email')}
                    className="w-full py-4 bg-white border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-3 shadow-sm group"
                >
                    <Mail className="text-red-500 group-hover:scale-110 transition-transform" /> Continue with Google
                </button>
                <button 
                    onClick={() => setStep('phone')}
                    className="w-full py-4 bg-capy-500 text-white rounded-xl font-bold text-lg hover:bg-capy-600 transition-all flex items-center justify-center gap-3 shadow-md group"
                >
                    <Smartphone className="group-hover:scale-110 transition-transform" /> Continue with Phone
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
                     <div className="w-4 h-4 rounded border border-gray-300 bg-capy-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                     </div>
                     <span>Keep me logged in</span>
                </div>
            </div>
        )}

        {step !== 'menu' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 <div className="text-left">
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 ml-1">
                        {step === 'email' ? 'Google Account Email' : 'Phone Number'}
                    </label>
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => {setInputValue(e.target.value); setError('');}}
                      placeholder={step === 'email' ? "name@gmail.com" : "123-456-7890"}
                      className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-capy-400 transition-all placeholder-gray-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>{error}</p>}
                 </div>
                 
                 <button 
                    onClick={handleSubmit}
                    className="w-full py-4 bg-capy-500 text-white rounded-xl font-bold text-lg hover:bg-capy-600 transition-all shadow-md active:scale-95"
                 >
                    {step === 'email' ? 'Sign In' : 'Send Code'}
                 </button>
                 
                 <button onClick={() => {setStep('menu'); setError(''); setInputValue('')}} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold pt-2">
                     Back to options
                 </button>
            </div>
        )}
      </div>
    </div>
  )
}

// 1. Navigation Sidebar
const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'focus', icon: Clock, label: 'Focus Zone' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'notebook', icon: BookOpen, label: 'Notebook' },
    { id: 'ai-chat', icon: BrainCircuit, label: 'AI Helper' }, 
    { id: 'wellness', icon: Activity, label: 'Wellness' }, 
    { id: 'settings', icon: Settings, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-capy-500 text-white z-50 flex items-center justify-center shadow-md">
         <span className="text-2xl mr-2">🐹</span>
         <h1 className="text-xl font-bold">CapyStudy</h1>
      </div>

      {/* Navigation Bar */}
      <div className="
        fixed bottom-0 left-0 w-full h-16 bg-capy-500 dark:bg-capy-900 text-white z-50 flex flex-row justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
        md:relative md:w-64 md:h-screen md:flex-col md:justify-start md:shadow-xl md:items-stretch md:bg-capy-500
      ">
        <div className="hidden md:flex p-6 items-center justify-center md:justify-start gap-3">
          <div className="bg-white p-2 rounded-full text-black">
              <span className="text-2xl">🐹</span> 
          </div>
          <h1 className="text-2xl font-bold">CapyStudy</h1>
        </div>

        <nav className="flex-1 flex flex-row justify-around w-full md:flex-col md:mt-6 md:px-3 md:space-y-2 md:justify-start">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                p-2 rounded-xl transition-all flex items-center justify-center gap-4
                md:w-full md:px-4 md:py-3 md:justify-start
                ${activeTab === item.id 
                  ? 'text-white bg-white/20 md:bg-white md:text-capy-600 md:shadow-md md:font-bold' 
                  : 'text-capy-100 hover:bg-capy-400 md:hover:bg-capy-400 dark:md:hover:bg-capy-700'}
              `}
              title={item.label}
            >
              <item.icon size={24} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden md:block p-4 text-capy-200 text-xs text-center">
          v1.1.0 • Stay Chill
        </div>
      </div>
    </>
  );
};

// 2. Focus Zone (Pomodoro)
const FocusZone = ({ 
  subjects, 
  updateStudyTime,
  onSessionComplete
}: { 
  subjects: Subject[], 
  updateStudyTime: (id: string, mins: number) => void,
  onSessionComplete: () => void
}) => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [focusDuration, setFocusDuration] = useLocalStorage('pomodoroFocus', 25);
  const [breakDuration, setBreakDuration] = useLocalStorage('pomodoroBreak', 5);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  // Audio Refs
  const lofiRef = useRef<HTMLAudioElement | null>(null);
  const whiteNoiseRef = useRef<HTMLAudioElement | null>(null);
  const [lofiVol, setLofiVol] = useState(0); 
  const [whiteVol, setWhiteVol] = useState(0); 

  useEffect(() => {
    if (subjects.length > 0) {
        const exists = subjects.find(s => s.id === selectedSubject);
        if (!exists || !selectedSubject) {
            setSelectedSubject(subjects[0].id);
        }
    }
  }, [subjects, selectedSubject]);

  useEffect(() => {
    if (!isActive) {
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    }
  }, [focusDuration, breakDuration, mode, isActive]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === 'focus' && selectedSubject) {
        updateStudyTime(selectedSubject, focusDuration);
        onSessionComplete();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, selectedSubject, focusDuration, updateStudyTime, onSessionComplete]);

  useEffect(() => {
    if (!lofiRef.current) {
        lofiRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3'); 
        lofiRef.current.loop = true;
    }
    if (!whiteNoiseRef.current) {
        whiteNoiseRef.current = new Audio('https://www.soundjay.com/nature/sounds/rain-01.mp3'); 
        whiteNoiseRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    const playAudio = async (ref: React.MutableRefObject<HTMLAudioElement | null>, vol: number) => {
        if(ref.current) {
            ref.current.volume = vol;
            if(vol > 0) {
                try {
                    if (ref.current.paused) await ref.current.play();
                } catch(e) { console.log("Audio play prevented", e)}
            } else {
                ref.current.pause();
            }
        }
    }
    playAudio(lofiRef, lofiVol);
    playAudio(whiteNoiseRef, whiteVol);
  }, [lofiVol, whiteVol]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-start md:justify-center min-h-full p-6 space-y-8 dark:text-white pb-24 md:pb-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg w-full max-w-2xl text-center border-4 border-capy-200 dark:border-capy-700">
        <div className="flex justify-center space-x-4 mb-8">
            <button 
                onClick={() => { setMode('focus'); setIsActive(false); }}
                className={`px-6 py-2 rounded-full font-bold transition-colors ${mode === 'focus' ? 'bg-capy-500 text-white' : 'bg-capy-100 text-capy-600 dark:bg-gray-700 dark:text-gray-300'}`}
            >
                Focus
            </button>
            <button 
                onClick={() => { setMode('shortBreak'); setIsActive(false); }}
                className={`px-6 py-2 rounded-full font-bold transition-colors ${mode !== 'focus' ? 'bg-nature-green text-white' : 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
                Rest
            </button>
        </div>

        <div className="text-6xl md:text-9xl font-bold text-capy-800 dark:text-capy-200 font-mono tracking-tighter mb-8">
            {formatTime(timeLeft)}
        </div>

        <div className="mb-6">
            <label className="block text-capy-600 dark:text-capy-300 mb-2 font-bold">I am studying:</label>
            <div className="relative inline-block w-full md:w-64">
                <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="p-3 w-full rounded-xl border-2 border-capy-200 dark:border-capy-600 text-center focus:outline-none focus:border-capy-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none font-bold"
                >
                    {subjects.length === 0 && <option value="">No subjects added</option>}
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-capy-500 pointer-events-none" size={18}/>
            </div>
        </div>

        <div className="flex justify-center gap-4">
            <button 
                onClick={toggleTimer} 
                className={`px-8 md:px-12 py-4 rounded-2xl text-xl md:text-2xl font-bold text-white transition-transform transform active:scale-95 ${isActive ? 'bg-red-400' : 'bg-capy-500 hover:bg-capy-600'}`}
            >
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer} className="p-4 rounded-2xl bg-capy-100 text-capy-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-capy-200 dark:hover:bg-gray-600">
                Reset
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-capy-700 dark:text-capy-300 mb-4 flex items-center gap-2"><Settings size={18}/> Timer Settings</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm md:text-base">Focus Time (min)</span>
                    <input type="number" value={focusDuration} onChange={e => setFocusDuration(Number(e.target.value))} className="w-16 md:w-20 p-2 border border-gray-300 rounded-lg text-center bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-capy-300"/>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm md:text-base">Rest Time (min)</span>
                    <input type="number" value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} className="w-16 md:w-20 p-2 border border-gray-300 rounded-lg text-center bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-capy-300"/>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
             <h3 className="font-bold text-capy-700 dark:text-capy-300 mb-4 flex items-center gap-2"><Music size={18}/> Soundscapes</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-20 md:w-24 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Lo-Fi Beats</span>
                    <VolumeX size={16} className="text-gray-400"/>
                    <input type="range" min="0" max="1" step="0.1" value={lofiVol} onChange={e => setLofiVol(parseFloat(e.target.value))} className="flex-1 accent-capy-500" />
                    <Volume2 size={16} className="text-capy-600 dark:text-capy-300"/>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-20 md:w-24 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Rain Sounds</span>
                    <VolumeX size={16} className="text-gray-400"/>
                    <input type="range" min="0" max="1" step="0.1" value={whiteVol} onChange={e => setWhiteVol(parseFloat(e.target.value))} className="flex-1 accent-capy-500" />
                    <Volume2 size={16} className="text-capy-600 dark:text-capy-300"/>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

// 3. Planner (Schedule + Goals)
const Planner = ({ 
  schedule, setSchedule, goals, setGoals, subjects, setSubjects 
}: { 
  schedule: ScheduleEvent[], 
  setSchedule: any, 
  goals: Goal[], 
  setGoals: any, 
  subjects: Subject[],
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
}) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [plannerMode, setPlannerMode] = useState<'view' | 'addEvent' | 'addGoal'>('view');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Goal State
  const [goalForm, setGoalForm] = useState<Partial<Goal>>({ title: '', targetMinutes: 60, subjectId: '' });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Add Subject State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#fbbf24');

  const [eventForm, setEventForm] = useState<Partial<ScheduleEvent>>({ 
      day: 'Monday', 
      type: 'study', 
      recurrence: 'none',
      title: '',
      startTime: '',
      endTime: '',
      date: '',
      subjectId: '',
      reminder: false,
      isAllDay: false
  });
  
  const [useDate, setUseDate] = useState(false);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper to get date for current week
  const getWeekDate = (dayName: string) => {
    const today = new Date();
    const dayIndex = days.indexOf(dayName);
    const currentDayIndex = (today.getDay() + 6) % 7; 
    const diff = dayIndex - currentDayIndex;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
      // Sync day if date is selected
      if (useDate && eventForm.date) {
          const d = new Date(eventForm.date);
          const d2 = new Date(eventForm.date + 'T12:00:00'); 
          const dayName = d2.toLocaleDateString('en-US', { weekday: 'long' });
          if (days.includes(dayName)) {
              setEventForm(prev => ({ ...prev, day: dayName }));
          }
      }
  }, [eventForm.date, useDate]);

  const addSubject = () => {
      if (!newSubjectName.trim()) return;
      const newSub: Subject = {
          id: Date.now().toString(),
          name: newSubjectName,
          color: newSubjectColor,
          totalTimeStudied: 0
      };
      setSubjects([...subjects, newSub]);
      setNewSubjectName('');
      setNewSubjectColor('#fbbf24'); // reset to default
  };

  const deleteSubject = (id: string) => {
      if(subjects.length <= 1) return; 
      setSubjects(subjects.filter(s => s.id !== id));
  };

  const saveEvent = () => {
    if(!eventForm.title) return;
    // Allow empty time if it is All Day
    if(!eventForm.isAllDay && (!eventForm.startTime || !eventForm.endTime)) return;

    const finalEventForm = { ...eventForm };
    if (!useDate) delete finalEventForm.date;
    if (finalEventForm.isAllDay) {
        // Just placeholders if all day
        finalEventForm.startTime = '00:00';
        finalEventForm.endTime = '23:59';
    }

    if (editingId) {
        setSchedule(schedule.map(s => s.id === editingId ? { ...s, ...finalEventForm } : s));
        setEditingId(null);
    } else {
        const event: ScheduleEvent = {
            id: Date.now().toString(),
            title: finalEventForm.title!,
            day: finalEventForm.day || 'Monday',
            date: finalEventForm.date,
            startTime: finalEventForm.startTime!,
            endTime: finalEventForm.endTime!,
            type: finalEventForm.type as any || 'study',
            recurrence: finalEventForm.recurrence as any || 'none',
            subjectId: finalEventForm.subjectId,
            reminder: finalEventForm.reminder,
            isAllDay: finalEventForm.isAllDay
        };
        setSchedule([...schedule, event]);
    }
    
    setEventForm({ day: 'Monday', type: 'study', recurrence: 'none', title: '', startTime: '', endTime: '', date: '', subjectId: '', reminder: false, isAllDay: false });
    setUseDate(false);
    setPlannerMode('view');
  };

  const editEvent = (evt: ScheduleEvent) => {
      setEditingId(evt.id);
      setEventForm(evt);
      if (evt.date) setUseDate(true);
      else setUseDate(false);
      setPlannerMode('addEvent');
  };

  const deleteEvent = () => {
      if (editingId) {
          setSchedule(schedule.filter(s => s.id !== editingId));
          setEditingId(null);
          setEventForm({ day: 'Monday', type: 'study', recurrence: 'none', title: '', startTime: '', endTime: '', date: '', subjectId: '', reminder: false, isAllDay: false });
          setPlannerMode('view');
      }
  };

  const saveGoal = () => {
    if(!goalForm.title) return;
    
    if (editingGoalId) {
        setGoals(goals.map(g => g.id === editingGoalId ? { ...g, ...goalForm } : g));
        setEditingGoalId(null);
    } else {
        const goal: Goal = {
            id: Date.now().toString(),
            subjectId: goalForm.subjectId || '',
            title: goalForm.title!,
            targetMinutes: goalForm.targetMinutes || 60,
            completed: false,
            createdAt: new Date().toISOString()
        };
        setGoals([...goals, goal]);
    }
    setGoalForm({ title: '', targetMinutes: 60, subjectId: '' });
    setPlannerMode('view');
  };

  const editGoal = (goal: Goal) => {
      setEditingGoalId(goal.id);
      setGoalForm(goal);
      setPlannerMode('addGoal');
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };
  
  const deleteGoal = (id: string) => {
      setGoals(goals.filter(g => g.id !== id));
      if (editingGoalId === id) {
          setEditingGoalId(null);
          setPlannerMode('view');
      }
  };

  const renderTimetable = () => {
      if (view === 'week') {
          return (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-10">
                {days.map(day => (
                    <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden min-h-[150px] md:min-h-[200px]">
                        <div className="bg-capy-200 dark:bg-capy-800 p-2 text-center text-capy-800 dark:text-capy-100">
                            <div className="font-bold">{day}</div>
                            <div className="text-xs opacity-70">{getWeekDate(day)}</div>
                        </div>
                        <div className="p-2 space-y-2">
                            {schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(evt => {
                                const subject = subjects.find(s => s.id === evt.subjectId);
                                return (
                                    <div 
                                        onClick={() => editEvent(evt)} 
                                        key={evt.id} 
                                        className="cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg border-l-4 text-xs shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
                                        style={{ borderLeftColor: subject ? subject.color : '#fbbf24' }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-gray-800 dark:text-white">{evt.title}</div>
                                            {evt.reminder && <Bell size={10} className="text-capy-500" />}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-300">
                                            {evt.isAllDay ? 'All Day' : `${formatTo12Hour(evt.startTime)} - ${formatTo12Hour(evt.endTime)}`}
                                        </div>
                                        {evt.date && <div className="text-[9px] text-blue-500 font-bold">{evt.date}</div>}
                                        {evt.recurrence !== 'none' && <div className="text-[10px] text-capy-500 dark:text-capy-300 capitalize mt-1 font-semibold">{evt.recurrence}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
          );
      } else if (view === 'month') {
          return (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-10 overflow-hidden">
                  <h3 className="text-xl font-bold mb-4 dark:text-white">May {currentYear}</h3>
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="grid grid-cols-7 gap-2">
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 py-2">{d}</div>)}
                          {Array.from({length: 31}, (_, i) => (
                              <div key={i} className="h-24 border dark:border-gray-600 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 relative">
                                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>
                              </div>
                          ))}
                      </div>
                    </div>
                  </div>
              </div>
          )
      } else {
          const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; 
          return (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-10 max-w-lg mx-auto">
                  <h3 className="text-center font-bold text-xl mb-4 text-capy-700 dark:text-capy-200">{today}, {new Date().toLocaleDateString()}</h3>
                  <div className="space-y-4">
                        {schedule.filter(s => s.day === today).map(evt => {
                             const subject = subjects.find(s => s.id === evt.subjectId);
                             return (
                                <div onClick={() => editEvent(evt)} key={evt.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl" style={{ borderLeft: `4px solid ${subject ? subject.color : 'transparent'}`}}>
                                    <span className="font-bold text-gray-500 dark:text-gray-300">
                                        {evt.isAllDay ? 'All Day' : formatTo12Hour(evt.startTime)}
                                    </span>
                                    <span className="font-bold text-gray-800 dark:text-white">{evt.title}</span>
                                    {evt.reminder && <Bell size={16} className="text-capy-500 ml-auto" />}
                                </div>
                             )
                        })}
                  </div>
              </div>
          )
      }
  }

  if (plannerMode === 'addGoal') {
      return (
        <div className="p-6 h-full overflow-y-auto dark:text-white">
            <button onClick={() => {setPlannerMode('view'); setEditingGoalId(null);}} className="flex items-center gap-2 text-capy-500 mb-6 hover:underline">
                <ArrowLeft size={20}/> Back to Planner
            </button>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border transition-colors border-capy-100 dark:border-gray-700 max-w-2xl mx-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl text-capy-700 dark:text-capy-200">{editingGoalId ? 'Edit Study Goal' : 'New Study Goal'}</h3>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Goal Title</label>
                        <input type="text" placeholder="e.g., Read 3 chapters" value={goalForm.title || ''} onChange={e => setGoalForm({...goalForm, title: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-capy-400"/>
                    </div>

                    <div>
                        <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Select Subject (Optional)</label>
                        <div className="relative">
                            <select 
                                value={goalForm.subjectId || ''} 
                                onChange={e => setGoalForm({...goalForm, subjectId: e.target.value})} 
                                className="w-full p-4 pr-10 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none appearance-none"
                            >
                                <option value="">None / General</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-4 text-gray-500 pointer-events-none"/>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Target Time (minutes)</label>
                        <input type="number" value={goalForm.targetMinutes || ''} onChange={e => setGoalForm({...goalForm, targetMinutes: Number(e.target.value)})} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-capy-400"/>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                        <button onClick={saveGoal} className="flex-1 bg-nature-green text-white p-4 rounded-xl font-bold hover:bg-green-600 flex justify-center items-center gap-2 text-lg">
                            <Save size={20}/> {editingGoalId ? 'Update Goal' : 'Create Goal'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (plannerMode === 'addEvent') {
      return (
        <div className="p-6 h-full overflow-y-auto dark:text-white">
            <button onClick={() => {setPlannerMode('view'); setEditingId(null);}} className="flex items-center gap-2 text-capy-500 mb-6 hover:underline">
                <ArrowLeft size={20}/> Back to Planner
            </button>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border transition-colors border-capy-100 dark:border-gray-700 max-w-2xl mx-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl text-capy-700 dark:text-capy-200">{editingId ? 'Edit Event' : 'New Timetable Event'}</h3>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Class/Task Name</label>
                        <input type="text" placeholder="e.g., Math Class" value={eventForm.title || ''} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-capy-400"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => setEventForm({...eventForm, type: 'class'})} className={`p-4 rounded-xl border-2 text-center cursor-pointer font-bold ${eventForm.type === 'class' ? 'border-capy-500 bg-capy-50 text-capy-700 dark:bg-gray-700 dark:text-white' : 'border-gray-200 text-gray-400 dark:border-gray-600'}`}>Class</div>
                        <div onClick={() => setEventForm({...eventForm, type: 'study'})} className={`p-4 rounded-xl border-2 text-center cursor-pointer font-bold ${eventForm.type === 'study' ? 'border-capy-500 bg-capy-50 text-capy-700 dark:bg-gray-700 dark:text-white' : 'border-gray-200 text-gray-400 dark:border-gray-600'}`}>Study</div>
                    </div>

                    <div>
                        <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Subject (Optional)</label>
                        <select value={eventForm.subjectId || ''} onChange={e => setEventForm({...eventForm, subjectId: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none appearance-none">
                            <option value="">None</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <div onClick={() => setEventForm({...eventForm, isAllDay: !eventForm.isAllDay})} className={`w-6 h-6 rounded border cursor-pointer flex items-center justify-center ${eventForm.isAllDay ? 'bg-capy-500 border-capy-500 text-white' : 'border-gray-400 bg-white dark:bg-gray-700'}`}>
                            {eventForm.isAllDay && <Check size={16}/>}
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-300" onClick={() => setEventForm({...eventForm, isAllDay: !eventForm.isAllDay})}>Whole Day Event</span>
                    </div>

                    {!eventForm.isAllDay && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Start Time</label>
                                <input type="time" value={eventForm.startTime || ''} onChange={e => setEventForm({...eventForm, startTime: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none"/>
                            </div>
                            <div>
                                <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">End Time</label>
                                <input type="time" value={eventForm.endTime || ''} onChange={e => setEventForm({...eventForm, endTime: e.target.value})} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none"/>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 font-bold text-capy-600 dark:text-gray-300">Day / Date</label>
                         <div className="flex gap-4">
                             {!useDate && (
                                <select value={eventForm.day || 'Monday'} onChange={e => setEventForm({...eventForm, day: e.target.value})} className="flex-1 p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none">
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                             )}
                             {useDate && (
                                 <input type="date" value={eventForm.date || ''} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="flex-1 p-4 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white outline-none"/>
                             )}
                             <button onClick={() => setUseDate(!useDate)} className="p-4 bg-gray-200 dark:bg-gray-600 rounded-xl font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                 {useDate ? 'Use Day' : 'Use Date'}
                             </button>
                         </div>
                    </div>

                     <div className="flex gap-4 pt-4">
                        <button onClick={saveEvent} className="flex-1 bg-capy-500 text-white p-4 rounded-xl font-bold hover:bg-capy-600 flex justify-center items-center gap-2 text-lg">
                            <Save size={20}/> {editingId ? 'Update Event' : 'Add to Schedule'}
                        </button>
                        {editingId && (
                            <button onClick={deleteEvent} className="bg-red-100 text-red-600 p-4 rounded-xl font-bold hover:bg-red-200 flex justify-center items-center">
                                <Trash2 size={24}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="p-6 h-full overflow-y-auto pb-20 dark:text-white">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-capy-800 dark:text-capy-100">Planner <span className="text-lg opacity-50 ml-2">{currentYear}</span></h2>
          <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
              {['day','week','month'].map((v) => (
                  <button key={v} onClick={() => setView(v as any)} className={`px-4 py-1 rounded-lg text-sm capitalize font-bold ${view === v ? 'bg-capy-100 text-capy-700 dark:bg-capy-700 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>{v}</button>
              ))}
          </div>
      </div>
      
      {/* Subject Management Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-8 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-capy-700 dark:text-capy-200 mb-4">My Subjects</h3>
          <div className="flex flex-wrap gap-3 mb-4">
              {subjects.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 group">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{s.name}</span>
                      <button 
                        onClick={() => deleteSubject(s.id)}
                        className="ml-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Subject"
                      >
                          <X size={12} />
                      </button>
                  </div>
              ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
              <input 
                  type="text" 
                  value={newSubjectName} 
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="New Subject Name..." 
                  className="flex-1 min-w-[150px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-capy-500 focus:border-transparent"
              />
              <input 
                  type="color" 
                  value={newSubjectColor} 
                  onChange={(e) => setNewSubjectColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"
                  title="Choose Color"
              />
              <button 
                  onClick={addSubject}
                  className="bg-capy-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-capy-600 flex items-center gap-2"
              >
                  <Plus size={16}/> Add Subject
              </button>
          </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-gray-700 dark:text-gray-200">Timetable</h3>
        <button 
            onClick={() => setPlannerMode('addEvent')} 
            className="p-2 rounded-full bg-capy-500 text-white hover:bg-capy-600 shadow-md transition-transform active:scale-95"
            title="Add to Timetable"
        >
            <Plus size={24} />
        </button>
      </div>

      {renderTimetable()}

      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-3xl font-bold text-capy-800 dark:text-capy-100">Study Goals</h2>
        <button 
            onClick={() => { setGoalForm({ title: '', targetMinutes: 60, subjectId: '' }); setEditingGoalId(null); setPlannerMode('addGoal'); }} 
            className="p-2 rounded-full bg-nature-green text-white hover:bg-green-600 shadow-md transition-transform active:scale-95"
            title="Add Study Goal"
        >
             <Plus size={24} />
        </button>
      </div>

       <div className="space-y-3">
            {goals.map(goal => {
                const subject = subjects.find(s => s.id === goal.subjectId);
                const progress = Math.min(100, (subject ? (subject.totalTimeStudied / goal.targetMinutes) * 100 : 0));
                
                return (
                    <div key={goal.id} className={`bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm transition-all ${goal.completed ? 'opacity-60 bg-gray-50 dark:bg-gray-900' : ''}`}>
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => toggleGoal(goal.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${goal.completed ? 'bg-green-400 border-green-400 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                {goal.completed && <Check size={14} />}
                            </button>
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${goal.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>{goal.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="bg-capy-100 dark:bg-capy-900 px-2 py-0.5 rounded text-capy-700 dark:text-capy-300 font-semibold">{subject?.name}</span>
                                    <span>Target: {goal.targetMinutes}m</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-32 mr-4 hidden md:block">
                             <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-capy-500" style={{ width: `${progress}%` }}></div>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => editGoal(goal)} className="text-gray-400 hover:text-capy-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => deleteGoal(goal.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                );
            })}
       </div>
    </div>
  );
};

// 4. Notebook (Rich Text)
interface RichTextEditorProps {
    initialContent: string;
    onChange: (html: string) => void;
    placeholder: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEmpty, setIsEmpty] = useState(!initialContent || initialContent === '<br>');
    const [showHighlightPalette, setShowHighlightPalette] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = initialContent;
            setIsEmpty(!initialContent || initialContent === '<br>');
            document.execCommand('styleWithCSS', false, 'true');
            document.execCommand('defaultParagraphSeparator', false, 'div');
        }
    }, []); 

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setIsEmpty(html === '' || html === '<br>');
            onChange(html);
        }
    };

    const execCmd = (cmd: string, arg?: string) => {
        document.execCommand(cmd, false, arg);
        if(cmd === 'hiliteColor') setShowHighlightPalette(false);
        handleInput(); 
    };

    const highlightColors = [
        { color: '#fde047', label: 'Yellow' },
        { color: '#86efac', label: 'Green' },
        { color: '#67e8f9', label: 'Blue' },
        { color: '#f9a8d4', label: 'Pink' },
        { color: '#c4b5fd', label: 'Purple' },
        { color: 'transparent', label: 'None' }
    ];

    return (
        <div className="flex flex-col flex-1 h-full relative overflow-hidden">
             {/* Editor Container */}
             <div className="flex-1 relative overflow-hidden flex flex-col">
                <div 
                    ref={editorRef}
                    className="flex-1 p-8 outline-none overflow-y-auto notebook-scroll text-gray-900 dark:text-gray-100 leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-5"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                />
                {isEmpty && (
                    <div className="absolute top-8 left-8 text-gray-500 pointer-events-none select-none italic">
                        {placeholder}
                    </div>
                )}
             </div>

             {/* Toolbar */}
             <div className="p-2 m-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 flex items-center justify-center gap-1 shrink-0 z-10 animate-in slide-in-from-bottom-2 overflow-visible">
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('bold')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Bold"><Bold size={16}/></button>
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('italic')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Italic"><Italic size={16}/></button>
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('underline')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Underline"><Underline size={16}/></button>
                  <div className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('justifyLeft')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Align Left"><AlignLeft size={16}/></button>
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('justifyCenter')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Align Center"><AlignCenter size={16}/></button>
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('justifyRight')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Align Right"><AlignRight size={16}/></button>
                  <div className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                  <button onMouseDown={(e) => {e.preventDefault(); execCmd('insertUnorderedList')}} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white" title="Bullet List"><List size={16}/></button>
                  
                  {/* Highlight Color Picker */}
                  <div className="relative">
                      <button 
                        onMouseDown={(e) => {e.preventDefault(); setShowHighlightPalette(!showHighlightPalette)}} 
                        className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white ${showHighlightPalette ? 'bg-gray-200 dark:bg-gray-500' : ''}`} 
                        title="Highlight"
                      >
                          <Highlighter size={16}/>
                      </button>
                      
                      {showHighlightPalette && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 z-50 animate-in zoom-in-95 duration-100">
                             {highlightColors.map((c) => (
                                 <button 
                                    key={c.color}
                                    onMouseDown={(e) => {e.preventDefault(); execCmd('hiliteColor', c.color)}} 
                                    className={`w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm transition-transform hover:scale-110 flex items-center justify-center`}
                                    style={{backgroundColor: c.color === 'transparent' ? 'white' : c.color}}
                                    title={c.label}
                                 >
                                    {c.color === 'transparent' && <div className="w-full h-px bg-red-400 rotate-45 transform"></div>}
                                 </button>
                             ))}
                          </div>
                      )}
                  </div>
             </div>
        </div>
    )
}

const Notebook = () => {
    const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
    const [folders, setFolders] = useLocalStorage<NoteFolder[]>('noteFolders', [{id: '1', name: 'General'}, {id: '2', name: 'Math'}]);
    const [activeFolderId, setActiveFolderId] = useState('1');
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | ''>('');

    const createNote = (color: string) => {
        const newNote: Note = {
            id: Date.now().toString(),
            folderId: activeFolderId,
            title: '', 
            content: '',
            updatedAt: new Date().toISOString(),
            color: color
        };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
    };

    const saveNewFolder = () => {
        if (newFolderName.trim()) {
            setFolders([...folders, { id: Date.now().toString(), name: newFolderName }]);
            setNewFolderName('');
            setIsCreatingFolder(false);
        } else {
            setIsCreatingFolder(false);
        }
    }

    const activeNote = notes.find(n => n.id === activeNoteId);

    const updateNote = (field: 'title' | 'content', value: string) => {
        if (!activeNoteId) return;
        setSaveStatus('saving');
        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n));
        setTimeout(() => setSaveStatus('saved'), 800);
    };

    const displayFolders = folders;
    const displayNotes = search 
        ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
        : notes.filter(n => n.folderId === activeFolderId);
    
    const colors = ['#ffffff', '#fce7f3', '#e0f2fe', '#dcfce7', '#fee2e2', '#fef9c3']; 

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] m-0 md:m-4 bg-white dark:bg-gray-800 md:rounded-3xl shadow-xl overflow-hidden md:border border-capy-200 dark:border-gray-700 dark:text-white">
            <div className={`w-full md:w-64 bg-capy-50 dark:bg-gray-900 border-b md:border-b-0 md:border-r border-capy-100 dark:border-gray-700 flex-col ${activeNoteId ? 'hidden md:flex' : 'flex h-full'}`}>
                <div className="p-4 border-b border-capy-100 dark:border-gray-700 shrink-0 space-y-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-2 top-2.5 text-gray-500 dark:text-gray-400"/>
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none text-gray-900 dark:text-white font-medium"/>
                    </div>
                </div>
                
                <div className="p-4 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-capy-800 dark:text-capy-200 flex items-center gap-2"><Folder size={20}/> Folders</h3>
                        <button onClick={() => setIsCreatingFolder(!isCreatingFolder)} className="text-gray-500 hover:text-capy-500" title="New Folder"><FolderPlus size={16}/></button>
                    </div>
                    {isCreatingFolder && (
                        <div className="mb-2 flex gap-2 animate-in slide-in-from-left-2 duration-200">
                            <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveNewFolder()} className="w-full text-sm p-2 border border-capy-300 rounded-lg outline-none bg-white dark:bg-gray-700" placeholder="Name..."/>
                            <button onClick={saveNewFolder} className="bg-capy-500 text-white p-2 rounded-lg hover:bg-capy-600"><Check size={14}/></button>
                        </div>
                    )}
                    <div className="space-y-1">
                        {displayFolders.map((f, index) => (
                            <button key={f.id} onClick={() => { setActiveFolderId(f.id); setSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeFolderId === f.id && !search ? 'bg-capy-200 dark:bg-capy-800 font-bold text-capy-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-capy-100 dark:hover:bg-gray-800'}`}>{f.name}</button>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 border-t border-capy-100 dark:border-gray-700 flex-1 overflow-y-auto notebook-scroll">
                    <h3 className="font-bold text-capy-800 dark:text-capy-200 mb-2">{search ? 'Results' : 'Notes'}</h3>
                    <div className="space-y-2">
                        {displayNotes.map((n) => (
                            <button key={n.id} onClick={() => setActiveNoteId(n.id)} className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden ${activeNoteId === n.id ? 'border-capy-400 shadow-sm' : 'border-transparent hover:opacity-90'}`} style={{ backgroundColor: n.color }}>
                                <div className="font-bold text-gray-900 text-sm truncate">{n.title || 'Untitled'}</div>
                                <div className="text-[10px] text-gray-700 mt-1 font-medium">{new Date(n.updatedAt).toLocaleDateString()}</div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 border-t border-capy-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 mt-auto">
                    <div className="text-xs font-bold text-gray-700 mb-2">Create new page:</div>
                    <div className="flex justify-between gap-1">
                        {colors.map(c => <button key={c} onClick={() => createNote(c)} className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform shadow-sm" style={{backgroundColor: c}}></button>)}
                    </div>
                </div>
            </div>

            <div className={`flex-1 flex-col bg-amber-50/30 dark:bg-gray-800 ${activeNoteId ? 'flex h-full' : 'hidden md:flex'}`}>
                {activeNote ? (
                    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: activeNote.color }}>
                        <div className="p-6 border-b border-black/5 flex justify-between items-center shrink-0">
                            <button onClick={() => setActiveNoteId(null)} className="md:hidden mr-4 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button>
                            <input type="text" placeholder="New Note" value={activeNote.title} onChange={e => updateNote('title', e.target.value)} className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none w-full placeholder-gray-500/50"/>
                            <div className="text-xs text-gray-500 shrink-0">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}</div>
                        </div>
                        <RichTextEditor key={activeNote.id} initialContent={activeNote.content} placeholder="Start typing..." onChange={(html) => updateNote('content', html)}/>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-capy-300 flex-col gap-4">
                        <BookOpen size={64}/>
                        <p>Select a page or create a new one to start writing!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 6. Wellness Center
const WellnessCenter = ({ logs, setLogs }: { logs: WellnessLog[], setLogs: (logs: WellnessLog[]) => void }) => {
    const getTodayLog = () => {
        const today = new Date().toISOString().split('T')[0];
        const existing = logs.find(l => l.date === today);
        return existing || { date: today, mood: 'neutral' as any, waterIntake: 0, sleepHours: 0, steps: 0 };
    };

    const [todayLog, setTodayLog] = useState<WellnessLog>(getTodayLog());
    const [insights, setInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            const today = new Date().toISOString().split('T')[0];
            const newLog = { 
                ...todayLog, 
                date: today,
                waterIntake: Number(todayLog.waterIntake) || 0,
                sleepHours: Number(todayLog.sleepHours) || 0,
                steps: Number(todayLog.steps) || 0
            };
            
            // Check if log actually changed to prevent loops
            const existingLog = logs.find(l => l.date === today);
            const hasChanged = !existingLog || 
                existingLog.mood !== newLog.mood || 
                existingLog.waterIntake !== newLog.waterIntake || 
                existingLog.sleepHours !== newLog.sleepHours ||
                existingLog.steps !== newLog.steps;

            if (hasChanged) {
                const newLogs = logs.filter(l => l.date !== today);
                setLogs([...newLogs, newLog]);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [todayLog, logs, setLogs]);

    const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
            const result = await getWellnessInsights(logs);
            setInsights(result);
        } catch (e) {
            setInsights("Could not fetch insights at this time.");
        }
        setLoadingInsights(false);
    };

    // Updated mood options: Ascending order (Sad to Happy)
    const moodOptions = [
        { value: 'stressed', emoji: '😭', score: 1, label: 'Miserable' },
        { value: 'tired', emoji: '😢', score: 2, label: 'Sad' },
        { value: 'neutral', emoji: '😐', score: 3, label: 'Neutral' },
        { value: 'happy', emoji: '😊', score: 4, label: 'Happy' },
        { value: 'energetic', emoji: '🤩', score: 5, label: 'Super Happy' },
    ];

    const moodMap: Record<string, number> = {
        stressed: 1,
        tired: 2,
        neutral: 3,
        happy: 4,
        energetic: 5
    };

    const chartData = useMemo(() => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
        // Calculate days to subtract to get to the most recent Monday
        // If today is Sunday (0), we subtract 6 days.
        // If today is Monday (1), we subtract 0 days.
        const daysToSubtract = (currentDay + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - daysToSubtract);

        const weekDates = Array.from({length: 7}, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d.toISOString().split('T')[0];
        });

        const todayStr = today.toISOString().split('T')[0];
        
        // Construct map of existing data
        const logMap = new Map();
        logs.forEach(l => logMap.set(l.date, l));
        
        // Override today's data in map with current input state
        logMap.set(todayStr, {
            ...todayLog,
            date: todayStr,
            waterIntake: Number(todayLog.waterIntake) || 0,
            sleepHours: Number(todayLog.sleepHours) || 0,
            steps: Number(todayLog.steps) || 0
        });

        return weekDates.map(date => {
            const log = logMap.get(date) || { date, waterIntake: 0, sleepHours: 0, mood: 'neutral' };
            return {
                ...log,
                moodScore: moodMap[log.mood] || 3
            };
        });
    }, [logs, todayLog]);

    return (
        <div className="p-6 h-full overflow-y-auto pb-20 dark:text-white">
            <h2 className="text-3xl font-bold text-capy-800 dark:text-capy-100 mb-6">Wellness Center</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Daily Log Form */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-capy-700 dark:text-capy-200">Track Today</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Mood (Sad to Happy)</label>
                            <div className="flex justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-xl">
                                {moodOptions.map((m) => (
                                    <button 
                                        key={m.value}
                                        onClick={() => setTodayLog({...todayLog, mood: m.value as any})}
                                        className={`text-2xl p-2 rounded-lg transition-transform hover:scale-125 ${todayLog.mood === m.value ? 'bg-white dark:bg-gray-600 shadow-sm scale-110' : 'opacity-50'}`}
                                        title={m.label}
                                    >
                                        {m.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Water (ml)</label>
                                <input 
                                    type="number" 
                                    value={todayLog.waterIntake || ''} 
                                    onChange={e => setTodayLog({...todayLog, waterIntake: Number(e.target.value)})} 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-capy-400" 
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Sleep (hrs)</label>
                                <input 
                                    type="number" 
                                    value={todayLog.sleepHours || ''} 
                                    onChange={e => setTodayLog({...todayLog, sleepHours: Number(e.target.value)})} 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-capy-400"
                                    placeholder="0" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 relative overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-4 text-green-800 dark:text-green-300 flex items-center gap-2">
                             <BrainCircuit size={20}/> Capy Wellness Coach
                        </h3>
                        {insights ? (
                            <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200 backdrop-blur-sm">
                                {insights}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-green-700 dark:text-green-400 opacity-70">
                                <p>Get personalized tips based on your logs!</p>
                            </div>
                        )}
                        <button 
                            onClick={fetchInsights} 
                            disabled={loadingInsights}
                            className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loadingInsights ? <span className="animate-spin">⏳</span> : <Smile size={20}/>}
                            {loadingInsights ? 'Analyzing...' : 'Get Wellness Tips'}
                        </button>
                     </div>
                     <Footprints className="absolute -bottom-10 -right-10 text-green-200 dark:text-gray-700 opacity-50" size={150} />
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
                <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">Weekly Trends</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#9ca3af" 
                            tick={{fontSize: 12}} 
                            tickFormatter={(value) => {
                                // Add time to ensure date parsing is in local time, not UTC which might shift the day back
                                return new Date(value + 'T12:00:00').toLocaleDateString(undefined, {weekday: 'short'});
                            }} 
                        />
                        
                        <YAxis 
                            yAxisId="left" 
                            stroke="#8b5cf6" 
                            tick={{fontSize: 12}} 
                            domain={[0, 6]} 
                            width={45}
                            label={{ value: 'Mood / Sleep', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: '#8b5cf6', textAnchor: 'middle'} }} 
                        />
                        <YAxis yAxisId="right" orientation="right" stroke="#1e3a8a" tick={{fontSize: 12}} label={{ value: 'Water (ml)', angle: 90, position: 'insideRight', style: {fontSize: 10, fill: '#1e3a8a'} }} />
                        
                        <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                            itemSorter={(item) => (typeof item.value === 'number' ? -item.value : 0)}
                        />
                        <Legend />
                        
                        <Line yAxisId="right" type="monotone" dataKey="waterIntake" stroke="#1e3a8a" strokeWidth={3} name="Water (ml)" dot={{r: 4}} activeDot={{r: 6}} connectNulls />
                        <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke="#8b5cf6" strokeWidth={3} name="Sleep (h)" dot={{r: 4}} activeDot={{r: 6}} connectNulls />
                        <Line yAxisId="left" type="monotone" dataKey="moodScore" stroke="#f97316" strokeWidth={3} name="Mood (1-5)" dot={{r: 4}} activeDot={{r: 6}} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// 8. AI Chat
const AIChat = () => {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'model', text: string}>>([
      {role: 'model', text: "Hi! I'm Capy. How can I help you study today?"}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
      if(!input.trim()) return;
      const userMsg = input;
      setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
      setInput('');
      setLoading(true);
      
      try {
        const response = await getStudyHelp(userMsg);
        setMessages(prev => [...prev, {role: 'model', text: response || 'Squeak?'}]);
      } catch (e) {
        setMessages(prev => [...prev, {role: 'model', text: "Sorry, I'm having trouble connecting."}]);
      }
      setLoading(false);
  };
 
  return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 md:bg-transparent">
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 md:rounded-3xl shadow-lg border border-capy-100 dark:border-gray-700 md:m-4 overflow-hidden">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-capy-100 rounded-full flex items-center justify-center text-xl border-2 border-white dark:border-gray-700 shadow-sm">
                            🐹
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white leading-tight">Capy Helper</h3>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online & Ready</p>
                    </div>
                </div>
                <button onClick={() => setMessages([{role: 'model', text: "Hi! I'm Capy. How can I help you study today?"}])} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Chat"><Trash2 size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                         {m.role === 'model' && (<div className="w-8 h-8 rounded-full bg-capy-100 flex items-center justify-center shrink-0 self-end mb-1 border border-capy-200">🐹</div>)}
                        <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-capy-500 text-white rounded-2xl rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700'}`}>{m.text}</div>
                    </div>
                ))}
                {loading && (<div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-capy-100 flex items-center justify-center shrink-0 self-end mb-1 border border-capy-200">🐹</div><div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 w-fit"><span className="w-2 h-2 bg-capy-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-capy-400 rounded-full animate-bounce delay-75"></span><span className="w-2 h-2 bg-capy-400 rounded-full animate-bounce delay-150"></span></div></div>)}
                <div ref={scrollRef}/>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
                <div className="flex gap-2 items-end bg-gray-100 dark:bg-gray-700/50 p-2 rounded-2xl border border-transparent focus-within:border-capy-300 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all shadow-inner focus-within:shadow-lg">
                    <button className="p-2 text-gray-400 hover:text-capy-500 transition-colors rounded-xl"><Plus size={20} /></button>
                    <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); sendMessage();}}} placeholder="Ask Capy about math, history, science..." className="flex-1 bg-transparent text-gray-800 dark:text-white outline-none placeholder-gray-400 text-sm py-2 resize-none max-h-32 notebook-scroll" rows={1}/>
                    <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-2 bg-capy-500 text-white rounded-xl hover:bg-capy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"><Send size={18}/></button>
                </div>
            </div>
        </div>
      </div>
  )
}

// 9. Profile Settings
const ProfileSettings = ({ user, setUser, onLogout }: { user: User, setUser: React.Dispatch<React.SetStateAction<User>>, onLogout: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user.name);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [bindInput, setBindInput] = useState('');
    const [bindingType, setBindingType] = useState<'email' | 'phone' | null>(null);

    const handleSaveName = () => { setUser({ ...user, name: editName }); setIsEditing(false); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => { if(ev.target?.result) setUser({...user, avatar: ev.target.result as string}); }; reader.readAsDataURL(e.target.files[0]); } };
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => { if(ev.target?.result) setUser({...user, banner: ev.target.result as string}); }; reader.readAsDataURL(e.target.files[0]); } };
    const toggleSetting = (key: 'darkMode' | 'reminders') => { setUser({ ...user, settings: { ...user.settings, [key]: !user.settings[key] } }); };

    const handleBind = () => {
        if (!bindInput || !bindingType) return;
        setUser({...user, [bindingType]: bindInput});
        setBindingType(null);
        setBindInput('');
    };

    const handleUnbind = (type: 'email' | 'phone') => {
        // Removed validation to allow unbinding last method as requested
        setUser({...user, [type]: ''});
    };

    return (
        <div className="p-8 max-w-2xl mx-auto dark:text-white overflow-y-auto h-full pb-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-capy-100 dark:border-gray-700 mb-6">
                <div className="h-32 bg-capy-400 relative bg-cover bg-center" style={{ backgroundImage: user.banner ? `url(${user.banner})` : undefined }}>
                    <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors"><ImageIcon size={18}/></button>
                    <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerChange} />
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 absolute -top-12 left-8 shadow-md group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                         <img src={user.avatar || 'https://picsum.photos/200'} className="w-full h-full rounded-full object-cover" alt="Profile" />
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="mt-4 mb-8 flex flex-col items-end text-right min-h-[60px]">
                        <div className="flex items-center gap-3 mt-10 md:mt-0">
                             {isEditing ? ( <input value={editName} onChange={e => setEditName(e.target.value)} className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-capy-500 outline-none bg-transparent text-right w-48" autoFocus /> ) : ( <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h1> )}
                            <button onClick={() => isEditing ? handleSaveName() : setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">{isEditing ? <Check size={20} className="text-green-500"/> : <Edit2 size={20}/>}</button>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Student • Capy Lover</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <h3 className="font-bold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mb-4">Linked Accounts</h3>
                             
                             {/* Google / Email */}
                             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm text-red-500">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">Google Account</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'Not linked'}</div>
                                    </div>
                                </div>
                                {user.email ? (
                                    <button onClick={() => handleUnbind('email')} className="text-red-400 hover:text-red-500 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Unbind</button>
                                ) : (
                                    <button onClick={() => setBindingType('email')} className="text-capy-600 hover:text-capy-700 text-sm font-bold px-3 py-1 rounded-lg bg-capy-100 hover:bg-capy-200">Link</button>
                                )}
                             </div>

                             {/* Phone */}
                             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm text-blue-500">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">Phone Number</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.phone || 'Not linked'}</div>
                                    </div>
                                </div>
                                {user.phone ? (
                                    <button onClick={() => handleUnbind('phone')} className="text-red-400 hover:text-red-500 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Unbind</button>
                                ) : (
                                    <button onClick={() => setBindingType('phone')} className="text-capy-600 hover:text-capy-700 text-sm font-bold px-3 py-1 rounded-lg bg-capy-100 hover:bg-capy-200">Link</button>
                                )}
                             </div>
                        </div>

                        <div className="space-y-2">
                             <h3 className="font-bold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Preferences</h3>
                             <div className="flex justify-between items-center py-3"><span className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Moon size={20}/> Dark Mode</span><button onClick={() => toggleSetting('darkMode')} className={`w-12 h-6 rounded-full p-1 transition-colors ${user.settings.darkMode ? 'bg-capy-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${user.settings.darkMode ? 'translate-x-6' : ''}`}></div></button></div>
                             <div className="flex justify-between items-center py-3"><span className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Bell size={20}/> Study Reminders</span><button onClick={() => toggleSetting('reminders')} className={`w-12 h-6 rounded-full p-1 transition-colors ${user.settings.reminders ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${user.settings.reminders ? 'translate-x-6' : ''}`}></div></button></div>
                        </div>
                         <button onClick={onLogout} className="w-full py-3 text-red-500 font-bold bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center gap-2"><LogOut size={18} /> Log Out</button>
                    </div>
                </div>
            </div>

            {/* Binding Modal */}
             {bindingType && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-xl">
                         <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Link {bindingType === 'email' ? 'Google Account' : 'Phone'}</h3>
                         <input 
                            autoFocus
                            className="w-full p-3 border rounded-xl mb-4 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-capy-400"
                            placeholder={bindingType === 'email' ? 'name@gmail.com' : '123-456-7890'}
                            value={bindInput}
                            onChange={(e) => setBindInput(e.target.value)}
                         />
                         <div className="flex gap-3">
                             <button onClick={() => {setBindingType(null); setBindInput('')}} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
                             <button onClick={handleBind} className="flex-1 py-2 bg-capy-500 text-white font-bold rounded-xl hover:bg-capy-600">Link Account</button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

// 10. Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [user, setUser] = useLocalStorage<User & { streak: number, lastStudyDate: string }>('userProfile', {
      name: 'Student Capy',
      email: '',
      phone: '',
      avatar: 'https://picsum.photos/200',
      settings: { darkMode: false, reminders: false },
      streak: 5,
      lastStudyDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] 
  });

  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', [
    { id: '1', name: 'Mathematics', color: '#3b82f6', totalTimeStudied: 120 },
    { id: '2', name: 'History', color: '#10b981', totalTimeStudied: 45 },
    { id: '3', name: 'Science', color: '#8b5cf6', totalTimeStudied: 180 },
  ]);
  
  const [schedule, setSchedule] = useLocalStorage<ScheduleEvent[]>('schedule', [
     { id: '1', title: 'Math Class', day: 'Monday', startTime: '09:00', endTime: '10:30', type: 'class', recurrence: 'weekly', subjectId: '1' },
     { id: '2', title: 'History Study', day: 'Tuesday', startTime: '14:00', endTime: '15:30', type: 'study', recurrence: 'weekly', subjectId: '2' },
  ]);
  
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', [
      { id: '1', subjectId: '1', title: 'Finish Algebra Chapter', targetMinutes: 120, completed: false, createdAt: new Date().toISOString() },
      { id: '2', subjectId: '3', title: 'Write Lab Report', targetMinutes: 60, completed: true, createdAt: new Date().toISOString() }
  ]);

  const [wellnessLogs, setWellnessLogs] = useLocalStorage<WellnessLog[]>('wellnessLogs', [
        { date: '2023-05-20', mood: 'happy', waterIntake: 2000, sleepHours: 7, steps: 8000 },
        { date: '2023-05-21', mood: 'neutral', waterIntake: 1500, sleepHours: 6, steps: 5000 },
        { date: '2023-05-22', mood: 'stressed', waterIntake: 1000, sleepHours: 5, steps: 3000 },
        { date: '2023-05-23', mood: 'energetic', waterIntake: 2500, sleepHours: 8, steps: 10000 },
        { date: '2023-05-24', mood: 'happy', waterIntake: 2200, sleepHours: 7.5, steps: 9000 },
  ]);

  useEffect(() => {
    if (user.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.settings.darkMode]);

  const updateStudyTime = (subjectId: string, minutes: number) => {
      setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, totalTimeStudied: s.totalTimeStudied + minutes } : s));
  };

  const handleSessionComplete = () => {
      const today = new Date().toISOString().split('T')[0];
      const last = user.lastStudyDate;
      let newStreak = user.streak;
      const diffTime = Math.abs(new Date(today).getTime() - new Date(last).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
          newStreak += 1;
      } else if (diffDays > 1) {
          newStreak = 1;
      }
      setUser(prev => ({
          ...prev,
          streak: newStreak,
          lastStudyDate: today
      }));
  };

  const handleLogin = (identifier: string, type: 'email' | 'phone') => {
      setUser(prev => ({
          ...prev,
          [type]: identifier
      }));
      setIsLoggedIn(true);
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setActiveTab('dashboard');
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard':
              return (
                  <div className="p-6 h-full overflow-y-auto pb-20 dark:text-white">
                      <div className="flex justify-between items-center mb-8">
                          <div>
                              <h1 className="text-4xl font-bold text-capy-800 dark:text-capy-100">Welcome Back, {user.name.split(' ')[0]}!</h1>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">Ready to crush your goals today?</p>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                              <div className="relative z-10"><div className="text-blue-100 text-sm font-bold uppercase mb-1">Total Study Time</div><div className="text-4xl font-bold">{Math.round(subjects.reduce((acc, s) => acc + s.totalTimeStudied, 0) / 60)}h <span className="text-xl opacity-70">{subjects.reduce((acc, s) => acc + s.totalTimeStudied, 0) % 60}m</span></div></div>
                              <Clock size={100} className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform"/>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                               <div className="relative z-10"><div className="text-purple-100 text-sm font-bold uppercase mb-1">Goals Completed</div><div className="text-4xl font-bold">{goals.filter(g => g.completed).length} <span className="text-xl opacity-70">/ {goals.length}</span></div></div>
                              <Trophy size={100} className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform"/>
                          </div>
                          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                               <div className="relative z-10"><div className="text-pink-100 text-sm font-bold uppercase mb-1">Streak</div><div className="text-4xl font-bold">{user.streak} <span className="text-xl opacity-70">Days</span></div></div>
                              <Activity size={100} className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform"/>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                              <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">Subject Progress</h3>
                              <div className="space-y-4">
                                  {subjects.map(s => (
                                      <div key={s.id}>
                                          <div className="flex justify-between text-sm mb-1 font-semibold text-gray-600 dark:text-gray-300"><span>{s.name}</span><span>{Math.floor(s.totalTimeStudied / 60)}h {s.totalTimeStudied % 60}m</span></div>
                                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (s.totalTimeStudied / 300) * 100)}%`, backgroundColor: s.color }}></div></div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                               <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">Up Next</h3>
                               <div className="space-y-3">
                                   {schedule.sort((a,b) => a.startTime.localeCompare(b.startTime)).slice(0, 3).map(evt => (
                                       <div key={evt.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-capy-400">
                                           <div className="font-bold text-gray-400 dark:text-gray-300 text-xs flex flex-col justify-center items-center w-12"><span>{evt.startTime}</span></div>
                                           <div><div className="font-bold text-gray-800 dark:text-white">{evt.title}</div><div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{evt.day} • {evt.type}</div></div>
                                       </div>
                                   ))}
                                   {schedule.length === 0 && <div className="text-center text-gray-400 py-8">No upcoming events</div>}
                               </div>
                          </div>
                      </div>
                  </div>
              );
          case 'focus':
              return <FocusZone subjects={subjects} updateStudyTime={updateStudyTime} onSessionComplete={handleSessionComplete} />;
          case 'planner':
              return <Planner schedule={schedule} setSchedule={setSchedule} goals={goals} setGoals={setGoals} subjects={subjects} setSubjects={setSubjects} />;
          case 'notebook':
              return <Notebook />;
          case 'wellness':
              return <WellnessCenter logs={wellnessLogs} setLogs={setWellnessLogs} />;
          case 'ai-chat':
              return <AIChat />;
          case 'settings':
               return <ProfileSettings user={user} setUser={setUser} onLogout={handleLogout} />;
          default:
              return null;
      }
  };

  if (!isLoggedIn) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`flex flex-col md:flex-row h-screen bg-[#f3f4f6] dark:bg-[#111827] transition-colors duration-300 font-sans ${user.settings.darkMode ? 'dark' : ''}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden relative w-full">
         <div className="h-full overflow-y-auto pt-16 pb-20 md:pt-0 md:pb-0">
            {renderContent()}
         </div>
      </main>
    </div>
  );
};

export default App;