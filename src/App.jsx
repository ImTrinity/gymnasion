import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Ruler, Calendar as CalendarIcon, Timer, 
  TrendingUp, Play, Pause, RotateCcw, Plus, Trash2, 
  CheckCircle2, Lock, Unlock, ArrowRight, Activity, Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function GymnasionApp() {
  const [activeTab, setActiveTab] = useState('workout');
  
  // Medidas iniciales
  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('gymnasion_measurements');
    return saved ? JSON.parse(saved) : [
      { date: '2026-11-01', weight: 57, hips: 95, waist: 75, neck: 31 }
    ];
  });

  // Estado del formulario de medidas
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '57',
    hips: '95',
    waist: '75',
    neck: '31'
  });

  // Rutinas semanales (Bloqueo de lunes)
  const [routineState, setRoutineState] = useState(() => {
    const saved = localStorage.getItem('gymnasion_routine_state');
    return saved ? JSON.parse(saved) : {
      completedDays: [],
      lastResetWeek: null,
      isLocked: false
    };
  });

  // Historial de entrenamientos por fecha (Calendario)
  const [workoutLogs, setWorkoutLogs] = useState(() => {
    const saved = localStorage.getItem('gymnasion_workout_logs');
    return saved ? JSON.parse(saved) : {};
  });

  // Activo el día seleccionado para entrenar
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [activeExercises, setActiveExercises] = useState({});
  const [unitMode, setUnitMode] = useState({}); // 'kg' o 'lbs'

  // Temporizador de descanso (120 segundos)
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  // Running
  const [runs, setRuns] = useState(() => {
    const saved = localStorage.getItem('gymnasion_runs');
    return saved ? JSON.parse(saved) : [];
  });
  const [newRun, setNewRun] = useState({ distance: '', time: '' });

  // Calendario modal detalle
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  useEffect(() => {
    localStorage.setItem('gymnasion_measurements', JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem('gymnasion_routine_state', JSON.stringify(routineState));
  }, [routineState]);

  useEffect(() => {
    localStorage.setItem('gymnasion_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('gymnasion_runs', JSON.stringify(runs));
  }, [runs]);

  // Temporizador hook
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startRestTimer = () => {
    setTimeLeft(120);
    setTimerActive(true);
    setIsTimerRunning(true);
  };

  // Rutinas predefinidas
  const routines = [
    {
      id: 1,
      name: "Día 1: Tirón & Espalda (1ª Dominada)",
      target: "Espalda, Bíceps, Core",
      exercises: [
        { id: 'e1', name: 'Jalón al Pecho (Lat Pulldown)', sets: 4, reps: '8-10' },
        { id: 'e2', name: 'Dominadas Asistidas (o Negativas)', sets: 4, reps: '5-6' },
        { id: 'e3', name: 'Remo en Máquina / Polea Baja', sets: 3, reps: '10-12' },
        { id: 'e4', name: 'Curl de Bíceps con Mancuernas', sets: 3, reps: '12' }
      ]
    },
    {
      id: 2,
      name: "Día 2: Glúteo Enfoque A (Carga Pesada)",
      target: "Glúteos y Femorales",
      exercises: [
        { id: 'g1', name: 'Hip Thrust en Barra / Máquina', sets: 4, reps: '8-10' },
        { id: 'g2', name: 'Sentadilla Búlgara con Mancuerna', sets: 3, reps: '10 por pierna' },
        { id: 'g3', name: 'Patada de Glúteo en Polea Baja', sets: 3, reps: '12-15' },
        { id: 'g4', name: 'Peso Muerto Rumano', sets: 3, reps: '10' }
      ]
    },
    {
      id: 3,
      name: "Día 3: Progresión Running (Cardio 10K)",
      target: "Resistencia Aeróbica Zona 2",
      exercises: [
        { id: 'r1', name: 'Trote Continuo / Intervalos', sets: 1, reps: 'Meta actual km' }
      ]
    },
    {
      id: 4,
      name: "Día 4: Torso & Estabilidad de Hombros",
      target: "Hombros, Pecho, Tríceps",
      exercises: [
        { id: 't1', name: 'Press Inclinado con Mancuernas', sets: 3, reps: '10' },
        { id: 't2', name: 'Press Militar de Hombros', sets: 3, reps: '10' },
        { id: 't3', name: 'Elevaciones Laterales', sets: 4, reps: '12-15' },
        { id: 't4', name: 'Dominada Asistida (Práctica extra)', sets: 3, reps: '4-5' }
      ]
    },
    {
      id: 5,
      name: "Día 5: Glúteo Enfoque B (Volumen & Cadena)",
      target: "Glúteos y Cuádriceps",
      exercises: [
        { id: 'gb1', name: 'Prensa 45° (Pies altos y separados)', sets: 4, reps: '10-12' },
        { id: 'gb2', name: 'Hip Thrust con Mancuerna / Máquina', sets: 3, reps: '12' },
        { id: 'gb3', name: 'Hiperextensiones enfocadas en Glúteo', sets: 3, reps: '12-15' },
        { id: 'gb4', name: 'Abductores en Máquina', sets: 3, reps: '15' }
      ]
    }
  ];

  // Manejo de sets en rutinas
  const handleSetChange = (exId, setIdx, field, val) => {
    setActiveExercises(prev => {
      const exData = prev[exId] || {};
      const setsData = exData.sets || {};
      return {
        ...prev,
        [exId]: {
          ...exData,
          sets: {
            ...setsData,
            [setIdx]: { ...(setsData[setIdx] || { weight: '', reps: '', completed: false }), [field]: val }
          }
        }
      };
    });
  };

  const toggleSetComplete = (exId, setIdx) => {
    setActiveExercises(prev => {
      const exData = prev[exId] || {};
      const setsData = exData.sets || {};
      const currentSet = setsData[setIdx] || { weight: '', reps: '', completed: false };
      const nextCompleted = !currentSet.completed;

      if (nextCompleted) {
        startRestTimer();
      }

      return {
        ...prev,
        [exId]: {
          ...exData,
          sets: {
            ...setsData,
            [setIdx]: { ...currentSet, completed: nextCompleted }
          }
        }
      };
    });
  };

  const finishRoutine = (routine) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLogs = {
      ...workoutLogs,
      [todayStr]: {
        routineName: routine.name,
        data: activeExercises
      }
    };
    setWorkoutLogs(newLogs);

    const updatedCompleted = [...routineState.completedDays, routine.id];
    const isAllDone = updatedCompleted.length >= routines.length;

    setRoutineState({
      completedDays: updatedCompleted,
      isLocked: isAllDone,
      lastResetWeek: new Date().toDateString()
    });

    setSelectedWorkoutId(null);
    setActiveExercises({});
    alert("¡Rutina guardada con éxito en tu calendario!");
  };

  // Cuenta regresiva al 10 de marzo de 2027
  const targetDate = new Date('2027-03-10T00:00:00');
  const today = new Date();
  const diffTime = targetDate - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex justify-center font-['Manrope',sans-serif] select-none">
      {/* Contenedor optimizado para Samsung Galaxy A55 / Móvil */}
      <div className="w-full max-w-md bg-[#09090b] min-h-screen flex flex-col relative shadow-2xl border-x border-[#1e1e2d]">
        
        {/* Header Superior */}
        <header className="px-5 py-4 bg-[#12121c] border-b border-[#27273a] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#a855f7] to-[#c084fc] flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-white">GYMNASION</h1>
              <p className="text-[10px] text-[#c084fc] font-medium uppercase tracking-widest">SmartFit & 10K Mode</p>
            </div>
          </div>
          <div className="bg-[#1e1e2d] px-3 py-1 rounded-full border border-[#3f3f5f] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#c084fc]" />
            <span className="text-xs font-bold text-white">{daysLeft > 0 ? `${daysLeft} días` : '¡Meta!'}</span>
          </div>
        </header>

        {/* Cuerpo Principal */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
          
          {/* PESTAÑA 1: ENTRENAMIENTO */}
          {activeTab === 'workout' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#161622] to-[#12121c] p-4 rounded-2xl border border-[#27273a]">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#c084fc]" /> Estado Semanal
                  </h2>
                  {routineState.isLocked && (
                    <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado hasta el lunes
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Completados: {routineState.completedDays.length} de {routines.length} rutinas de la semana.
                </p>
                {routineState.isLocked && (
                  <button 
                    onClick={() => setRoutineState({ completedDays: [], isLocked: false, lastResetWeek: null })}
                    className="mt-3 text-[11px] bg-[#27273a] hover:bg-[#3f3f5f] text-[#c084fc] px-3 py-1.5 rounded-xl font-semibold transition"
                  >
                    Reiniciar Progreso Semanal (Manual)
                  </button>
                )}
              </div>

              {!selectedWorkoutId ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Rutinas Optimizadas</h3>
                  {routines.map((routine) => {
                    const isDone = routineState.completedDays.includes(routine.id);
                    return (
                      <div 
                        key={routine.id}
                        onClick={() => !routineState.isLocked && !isDone && setSelectedWorkoutId(routine.id)}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                          isDone 
                            ? 'bg-[#12121c]/50 border-emerald-900/50 opacity-7opath' 
                            : routineState.isLocked 
                            ? 'bg-[#12121c]/40 border-zinc-800 opacity-50 cursor-not-allowed'
                            : 'bg-[#13131c] border-[#27273a] hover:border-[#c084fc] cursor-pointer shadow-md'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold text-[#c084fc] bg-[#27273a]/50 px-2 py-0.5 rounded-md">{routine.target}</span>
                          <h4 className="font-bold text-sm text-white mt-1">{routine.name}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5">{routine.exercises.length} ejercicios principales</p>
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Vista de Detalle de Rutina Activa
                (() => {
                  const routine = routines.find(r => r.id === selectedWorkoutId);
                  return (
                    <div className="space-y-4">
                      <button 
                        onClick={() => setSelectedWorkoutId(null)}
                        className="text-xs text-[#c084fc] font-semibold hover:underline flex items-center gap-1"
                      >
                        ← Volver a lista de rutinas
                      </button>

                      <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a]">
                        <h3 className="font-bold text-base text-white">{routine.name}</h3>
                        <p className="text-xs text-zinc-400">{routine.target}</p>

                        {/* Bloque Calentamiento 10 min */}
                        <div className="mt-3 p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-[#c084fc]" />
                            <span className="text-xs font-bold text-purple-200">Calentamiento previo</span>
                          </div>
                          <span className="text-xs font-extrabold text-[#c084fc]">10 min</span>
                        </div>
                      </div>

                      {routine.exercises.map((ex) => (
                        <div key={ex.id} className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                            <span className="text-[10px] bg-[#27273a] px-2 py-0.5 rounded text-zinc-300">Meta: {ex.reps} reps</span>
                          </div>

                          <div className="space-y-2">
                            {[...Array(ex.sets)].map((_, sIdx) => {
                              const setData = activeExercises[ex.id]?.sets?.[sIdx] || { weight: '', reps: '', completed: false };
                              const unit = unitMode[`${ex.id}-${sIdx}`] || 'kg';
                              return (
                                <div key={sIdx} className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${setData.completed ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-[#181824] border-[#27273a]'}`}>
                                  <span className="text-xs font-bold text-zinc-400 w-6">S{sIdx+1}</span>
                                  
                                  <div className="flex-1 flex items-center gap-1 bg-[#12121c] px-2 py-1 rounded-lg border border-[#3f3f5f]">
                                    <input 
                                      type="number" 
                                      placeholder="Peso"
                                      value={setData.weight}
                                      onChange={(e) => handleSetChange(ex.id, sIdx, 'weight', e.target.value)}
                                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                                    />
                                    <button 
                                      onClick={() => setUnitMode(prev => ({...prev, [`${ex.id}-${sIdx}`]: unit === 'kg' ? 'lbs' : 'kg'}))}
                                      className="text-[10px] font-bold text-[#c084fc] bg-[#27273a] px-1.5 py-0.5 rounded"
                                    >
                                      {unit}
                                    </button>
                                  </div>

                                  <div className="w-16 bg-[#12121c] px-2 py-1 rounded-lg border border-[#3f3f5f] flex items-center">
                                    <input 
                                      type="number" 
                                      placeholder="Reps"
                                      value={setData.reps}
                                      onChange={(e) => handleSetChange(ex.id, sIdx, 'reps', e.target.value)}
                                      className="w-full bg-transparent text-xs text-white focus:outline-none text-center"
                                    />
                                  </div>

                                  <button 
                                    onClick={() => toggleSetComplete(ex.id, sIdx)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${setData.completed ? 'bg-emerald-500 text-black' : 'bg-[#27273a] text-zinc-400 hover:text-white'}`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Bloque Enfriamiento 10 min */}
                      <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-[#c084fc]" />
                          <span className="text-xs font-bold text-purple-200">Enfriamiento y Estiramientos</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#c084fc]">10 min</span>
                      </div>

                      <button 
                        onClick={() => finishRoutine(routine)}
                        className="w-full py-3.5 bg-gradient-to-r from-[#c084fc] to-[#a855f7] text-black font-extrabold rounded-2xl shadow-lg shadow-purple-900/30 text-sm"
                      >
                        Finalizar y Guardar Rutina
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* PESTAÑA 2: MEDIDAS */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#c084fc]" /> Registrar Medidas Actuales
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400">Peso (kg)</label>
                    <input 
                      type="number" 
                      value={newMeasurement.weight}
                      onChange={e => setNewMeasurement({...newMeasurement, weight: e.target.value})}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Cadera / Glúteos (cm)</label>
                    <input 
                      type="number" 
                      value={newMeasurement.hips}
                      onChange={e => setNewMeasurement({...newMeasurement, hips: e.target.value})}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Cintura (cm)</label>
                    <input 
                      type="number" 
                      value={newMeasurement.waist}
                      onChange={e => setNewMeasurement({...newMeasurement, waist: e.target.value})}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Cuello (cm)</label>
                    <input 
                      type="number" 
                      value={newMeasurement.neck}
                      onChange={e => setNewMeasurement({...newMeasurement, neck: e.target.value})}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const entry = {
                      date: new Date().toISOString().split('T')[0],
                      weight: parseFloat(newMeasurement.weight),
                      hips: parseFloat(newMeasurement.hips),
                      waist: parseFloat(newMeasurement.waist),
                      neck: parseFloat(newMeasurement.neck)
                    };
                    setMeasurements([...measurements, entry]);
                    alert("¡Medidas guardadas!");
                  }}
                  className="w-full py-2.5 bg-[#c084fc] text-black font-extrabold rounded-xl text-xs"
                >
                  Guardar Registro
                </button>
              </div>

              {/* Gráfica de Evolución */}
              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a]">
                <h4 className="font-bold text-xs text-zinc-300 mb-3">Evolución de Cadera y Peso</h4>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurements}>
                      <XAxis dataKey="date" stroke="#71717a" textAnchor="end" tick={{fontSize: 9}} />
                      <YAxis stroke="#71717a" tick={{fontSize: 9}} />
                      <Tooltip contentStyle={{backgroundColor: '#12121c', borderColor: '#27273a', fontSize: '11px'}} />
                      <Line type="monotone" dataKey="hips" stroke="#c084fc" strokeWidth={2} name="Cadera (cm)" />
                      <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2} name="Peso (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: RUNNING 10K */}
          {activeTab === 'running' && (
            <div className="space-y-4">
              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#c084fc]" /> Registrar Sesión de Running
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400">Distancia (km)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej. 3.5"
                      value={newRun.distance}
                      onChange={e => setNewRun({...newRun, distance: e.target.value})}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Tiempo (minutos)</label>
                    <input 
                      type="number" 
                      placeholder="Ej. 25"
                      value={newRun.time}
                      onChange={e => setNewRun({...newRun, time: e.target.value})}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if(!newRun.distance || !newRun.time) return;
                    const pace = (parseFloat(newRun.time) / parseFloat(newRun.distance)).toFixed(2);
                    const entry = {
                      date: new Date().toISOString().split('T')[0],
                      distance: parseFloat(newRun.distance),
                      time: parseInt(newRun.time),
                      pace
                    };
                    setRuns([...runs, entry]);
                    setNewRun({ distance: '', time: '' });
                  }}
                  className="w-full py-2.5 bg-[#c084fc] text-black font-extrabold rounded-xl text-xs"
                >
                  Registrar Carrera
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historial de Carreras</h4>
                {runs.map((r, idx) => (
                  <div key={idx} className="bg-[#13131c] p-3 rounded-xl border border-[#27273a] flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white">{r.distance} km</span> en {r.time} min
                      <p className="text-[10px] text-zinc-400">{r.date}</p>
                    </div>
                    <span className="text-[#c084fc] font-semibold">{r.pace} min/km</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA 4: CALENDARIO */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a]">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-[#c084fc]" /> Calendario de Entrenamientos
                </h3>
                <p className="text-xs text-zinc-400 mb-4">Fechas registradas con actividad completada:</p>
                <div className="space-y-2">
                  {Object.keys(workoutLogs).length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No hay entrenamientos guardados todavía.</p>
                  ) : (
                    Object.keys(workoutLogs).map((dateStr) => (
                      <div 
                        key={dateStr}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className="p-3 bg-[#181824] border border-[#27273a] rounded-xl flex justify-between items-center cursor-pointer hover:border-[#c084fc] transition"
                      >
                        <span className="text-xs font-bold text-white">{dateStr}</span>
                        <span className="text-[10px] bg-purple-950 text-[#c084fc] px-2 py-0.5 rounded-full border border-purple-900">
                          {workoutLogs[dateStr].routineName}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedCalendarDate && (
                <div className="bg-[#13131c] p-4 rounded-2xl border border-[#c084fc]/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-white">Detalle del {selectedCalendarDate}</h4>
                    <button onClick={() => setSelectedCalendarDate(null)} className="text-[10px] text-zinc-400 hover:text-white">Cerrar</button>
                  </div>
                  <p className="text-xs text-[#c084fc] font-semibold">{workoutLogs[selectedCalendarDate]?.routineName}</p>
                  <div className="text-xs text-zinc-300 space-y-1">
                    {Object.entries(workoutLogs[selectedCalendarDate]?.data || {}).map(([exId, info]) => (
                      <div key={exId} className="border-t border-[#27273a] pt-1 mt-1">
                        <span className="text-[11px] text-zinc-400 block">Ejercicio ID: {exId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>

        {/* Barra de Temporizador de Descanso Flotante (120s) */}
        {timerActive && (
          <div className="absolute bottom-20 left-4 right-4 bg-[#1b1b2f] border border-[#c084fc]/40 p-3 rounded-2xl shadow-xl flex items-center justify-between z-40 animate-bounce-short">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-[#c084fc]" />
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">Descanso Activo</span>
                <span className="text-sm font-extrabold text-white">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setTimeLeft(prev => prev + 30)} 
                className="px-2 py-1 bg-[#27273a] text-xs font-bold text-[#c084fc] rounded-lg"
              >
                +30s
              </button>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className="p-2 bg-[#c084fc] text-black rounded-lg"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => { setTimerActive(false); setIsTimerRunning(false); }} 
                className="p-2 bg-[#27273a] text-zinc-400 rounded-lg hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Navegación Inferior (Móvil) */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-[#12121c] border-t border-[#27273a] flex items-center justify-around px-2 z-30">
          <button 
            onClick={() => setActiveTab('workout')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'workout' ? 'text-[#c084fc]' : 'text-zinc-500'}`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-medium">Rutina</span>
          </button>
          <button 
            onClick={() => setActiveTab('measurements')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'measurements' ? 'text-[#c084fc]' : 'text-zinc-500'}`}
          >
            <Ruler className="w-5 h-5" />
            <span className="text-[10px] font-medium">Medidas</span>
          </button>
          <button 
            onClick={() => setActiveTab('running')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'running' ? 'text-[#c084fc]' : 'text-zinc-500'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium">Running</span>
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-[#c084fc]' : 'text-zinc-500'}`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Calendario</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
