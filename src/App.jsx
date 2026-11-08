import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Ruler, Calendar as CalendarIcon, Timer,
  TrendingUp, Play, Pause, CheckCircle2, Lock,
  ArrowRight, Activity, Award, Utensils, Heart
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const HEIGHT_CM = 159;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// Estimación de grasa corporal: fórmula Navy para mujeres.
// Las medidas se ingresan en centímetros y se convierten a pulgadas.
const calculateBodyFat = (waist, hips, neck) => {
  const w = Number(waist);
  const h = Number(hips);
  const n = Number(neck);

  if (!w || !h || !n || w + h <= n) return null;

  const inches = value => value / 2.54;
  const result =
    163.205 * Math.log10(inches(w + h - n)) -
    97.684 * Math.log10(inches(HEIGHT_CM)) -
    78.387;

  return Number.isFinite(result) && result > 0 && result < 70
    ? result
    : null;
};

const routines = [
  {
    id: 1,
    name: 'Día 1: Tirón & Espalda (1ª Dominada)',
    target: 'Espalda, Bíceps, Core',
    exercises: [
      { id: 'e1', name: 'Jalón al Pecho (Lat Pulldown)', sets: 4, reps: '8-10' },
      { id: 'e2', name: 'Dominadas Asistidas (o Negativas)', sets: 4, reps: '5-6' },
      { id: 'e3', name: 'Remo en Máquina / Polea Baja', sets: 3, reps: '10-12' },
      { id: 'e4', name: 'Curl de Bíceps con Mancuernas', sets: 3, reps: '12' }
    ]
  },
  {
    id: 2,
    name: 'Día 2: Glúteo Enfoque A (Carga Pesada)',
    target: 'Glúteos y Femorales',
    exercises: [
      { id: 'g1', name: 'Hip Thrust en Barra / Máquina', sets: 4, reps: '8-10' },
      { id: 'g2', name: 'Sentadilla Búlgara con Mancuerna', sets: 3, reps: '10 por pierna' },
      { id: 'g3', name: 'Patada de Glúteo en Polea Baja', sets: 3, reps: '12-15' },
      { id: 'g4', name: 'Peso Muerto Rumano', sets: 3, reps: '10' }
    ]
  },
  {
    id: 3,
    name: 'Día 3: Progresión Running (Cardio 10K)',
    target: 'Resistencia Aeróbica Zona 2',
    exercises: [
      { id: 'r1', name: 'Trote Continuo / Intervalos', sets: 1, reps: 'Meta actual km' }
    ]
  },
  {
    id: 4,
    name: 'Día 4: Torso & Estabilidad de Hombros',
    target: 'Hombros, Pecho, Tríceps',
    exercises: [
      { id: 't1', name: 'Press Inclinado con Mancuernas', sets: 3, reps: '10' },
      { id: 't2', name: 'Press Militar de Hombros', sets: 3, reps: '10' },
      { id: 't3', name: 'Elevaciones Laterales', sets: 4, reps: '12-15' },
      { id: 't4', name: 'Dominada Asistida (Práctica extra)', sets: 3, reps: '4-5' }
    ]
  },
  {
    id: 5,
    name: 'Día 5: Glúteo Enfoque B (Volumen & Cadena)',
    target: 'Glúteos y Cuádriceps',
    exercises: [
      { id: 'gb1', name: 'Prensa 45° (Pies altos y separados)', sets: 4, reps: '10-12' },
      { id: 'gb2', name: 'Hip Thrust con Mancuerna / Máquina', sets: 3, reps: '12' },
      { id: 'gb3', name: 'Hiperextensiones enfocadas en Glúteo', sets: 3, reps: '12-15' },
      { id: 'gb4', name: 'Abductores en Máquina', sets: 3, reps: '15' }
    ]
  }
];

// Pesos de alimentos: arroz, quinua y lentejas en peso cocido.
// Pollo y pescado en peso cocido/preparado. Atún escurrido.
const menus = [
  {
    name: 'Menú 1 · Pollo y atún',
    meals: [
      {
        name: 'Desayuno',
        foods: [
          '2 huevos cocidos',
          'Quinua cocida: 100 g',
          'Papaya: 150 g',
          'Proteína en polvo: porción que aporte 20 g de proteína (opcional)'
        ]
      },
      {
        name: 'Almuerzo',
        foods: [
          'Pollo al horno: 120 g',
          'Arroz cocido: 100 g',
          'Brócoli, zanahoria y pimiento: 200 g'
        ]
      },
      {
        name: 'Cena',
        foods: [
          'Atún escurrido: 100 g',
          'Lentejas cocidas: 120 g',
          'Vainitas y beterraga: 150 g'
        ]
      }
    ]
  },
  {
    name: 'Menú 2 · Anchoveta y pollo',
    meals: [
      {
        name: 'Desayuno',
        foods: [
          '2 huevos cocidos',
          'Plátano: 100 g',
          'Proteína en polvo: porción que aporte 20 g de proteína (opcional)'
        ]
      },
      {
        name: 'Almuerzo',
        foods: [
          'Anchoveta cocida: 130 g',
          'Quinua cocida: 120 g',
          'Brócoli y zanahoria: 200 g'
        ]
      },
      {
        name: 'Cena',
        foods: [
          'Pollo al horno: 100 g',
          'Lentejas cocidas: 100 g',
          'Pimiento y vainitas: 150 g'
        ]
      }
    ]
  },
  {
    name: 'Menú 3 · Huevos y pescado',
    meals: [
      {
        name: 'Desayuno',
        foods: [
          '2 huevos cocidos',
          'Papaya: 100 g',
          'Arándanos: 80 g',
          'Proteína en polvo: porción que aporte 20 g de proteína (opcional)'
        ]
      },
      {
        name: 'Almuerzo',
        foods: [
          'Pollo al horno: 120 g',
          'Arroz cocido: 100 g',
          'Brócoli, pimiento y zanahoria: 200 g'
        ]
      },
      {
        name: 'Cena',
        foods: [
          'Atún escurrido o anchoveta cocida: 120 g',
          'Quinua cocida: 100 g',
          'Lentejas cocidas: 80 g',
          'Beterraga y vainitas: 150 g'
        ]
      }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');

  const [measurements, setMeasurements] = useState(() =>
    readStorage('gymnasion_measurements', [
      { date: '2026-11-01', weight: 57, hips: 95, waist: 75, neck: 31 }
    ])
  );

  const [newMeasurement, setNewMeasurement] = useState({
    weight: '57', hips: '95', waist: '75', neck: '31'
  });

  const [routineState, setRoutineState] = useState(() =>
    readStorage('gymnasion_routine_state', {
      completedDays: [], lastResetWeek: null, isLocked: false
    })
  );

  const [workoutLogs, setWorkoutLogs] = useState(() =>
    readStorage('gymnasion_workout_logs', {})
  );

  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [activeExercises, setActiveExercises] = useState({});
  const [unitMode, setUnitMode] = useState({});
  const [warmupDone, setWarmupDone] = useState(false);
  const [cooldownDone, setCooldownDone] = useState(false);

  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  const [runs, setRuns] = useState(() =>
    readStorage('gymnasion_runs', [])
  );
  const [newRun, setNewRun] = useState({ distance: '', time: '' });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Alimentación y suplementos: registros separados por fecha.
  const [nutritionLogs, setNutritionLogs] = useState(() =>
    readStorage('gymnasion_nutrition', {})
  );
  const currentNutrition = nutritionLogs[today()] || {
    menu: 0,
    meals: [false, false, false],
    creatine: false,
    protein: false
  };

  const updateNutrition = changes => {
    setNutritionLogs(prev => {
      const existing = prev[today()] || {
        menu: 0,
        meals: [false, false, false],
        creatine: false,
        protein: false
      };
      return {
        ...prev,
        [today()]: { ...existing, ...changes }
      };
    });
  };

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

  useEffect(() => {
    localStorage.setItem('gymnasion_nutrition', JSON.stringify(nutritionLogs));
  }, [nutritionLogs]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
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
            [setIdx]: {
              ...(setsData[setIdx] || { weight: '', reps: '', completed: false }),
              [field]: val
            }
          }
        }
      };
    });
  };

  const toggleSetComplete = (exId, setIdx) => {
    setActiveExercises(prev => {
      const exData = prev[exId] || {};
      const setsData = exData.sets || {};
      const currentSet = setsData[setIdx] || {
        weight: '', reps: '', completed: false
      };
      const nextCompleted = !currentSet.completed;
      if (nextCompleted) startRestTimer();

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

  const finishRoutine = routine => {
    const date = today();
    const newLogs = {
      ...workoutLogs,
      [date]: {
        routineName: routine.name,
        data: activeExercises,
        warmupDone,
        cooldownDone
      }
    };
    setWorkoutLogs(newLogs);

    const updatedCompleted = [...new Set([...routineState.completedDays, routine.id])];
    const isAllDone = updatedCompleted.length >= routines.length;

    setRoutineState({
      completedDays: updatedCompleted,
      isLocked: isAllDone,
      lastResetWeek: new Date().toDateString()
    });

    setSelectedWorkoutId(null);
    setActiveExercises({});
    setWarmupDone(false);
    setCooldownDone(false);
    alert('¡Rutina guardada con éxito en tu calendario!');
  };

  const targetDate = new Date('2027-03-10T00:00:00');
  const daysLeft = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));

  const liveBodyFat = calculateBodyFat(
    newMeasurement.waist,
    newMeasurement.hips,
    newMeasurement.neck
  );

  const saveMeasurement = () => {
    const weight = Number(newMeasurement.weight);
    const hips = Number(newMeasurement.hips);
    const waist = Number(newMeasurement.waist);
    const neck = Number(newMeasurement.neck);

    if (![weight, hips, waist, neck].every(v => Number.isFinite(v) && v > 0)) {
      alert('Completa todas las medidas con números mayores que cero.');
      return;
    }

    const bodyFat = calculateBodyFat(waist, hips, neck);
    if (bodyFat === null) {
      alert('Revisa las medidas de cintura, cadera y cuello.');
      return;
    }

    setMeasurements(prev => [
      ...prev,
      { date: today(), weight, hips, waist, neck, bodyFat }
    ]);
    alert(`¡Medidas guardadas! Grasa corporal estimada: ${bodyFat.toFixed(1)}%`);
  };

  const selectedMenu = menus[currentNutrition.menu] || menus[0];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex justify-center font-['Manrope',sans-serif] select-none">
      <div className="w-full max-w-md bg-[#09090b] min-h-screen flex flex-col relative shadow-2xl border-x border-[#1e1e2d]">

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

        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

          {/* ENTRENAMIENTO */}
          {activeTab === 'workout' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#161622] to-[#12121c] p-4 rounded-2xl border border-[#27273a]">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#c084fc]" /> Estado Semanal
                  </h2>
                  {routineState.isLocked && (
                    <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Completados: {routineState.completedDays.length} de {routines.length} rutinas.
                </p>
                {routineState.isLocked && (
                  <button
                    onClick={() => setRoutineState({ completedDays: [], isLocked: false, lastResetWeek: null })}
                    className="mt-3 text-[11px] bg-[#27273a] text-[#c084fc] px-3 py-1.5 rounded-xl font-semibold"
                  >
                    Reiniciar Progreso Semanal
                  </button>
                )}
              </div>

              {!selectedWorkoutId ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Rutinas Optimizadas</h3>
                  {routines.map(routine => {
                    const isDone = routineState.completedDays.includes(routine.id);
                    return (
                      <div
                        key={routine.id}
                        onClick={() => !routineState.isLocked && !isDone && setSelectedWorkoutId(routine.id)}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                          isDone
                            ? 'bg-[#12121c]/50 border-emerald-900/50 opacity-70'
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
                        {isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <ArrowRight className="w-5 h-5 text-zinc-500" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                (() => {
                  const routine = routines.find(r => r.id === selectedWorkoutId);
                  return (
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedWorkoutId(null)}
                        className="text-xs text-[#c084fc] font-semibold hover:underline"
                      >
                        ← Volver a lista de rutinas
                      </button>

                      <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                        <h3 className="font-bold text-base text-white">{routine.name}</h3>
                        <p className="text-xs text-zinc-400">{routine.target}</p>

                        <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${warmupDone ? 'bg-emerald-950/30 border-emerald-800' : 'bg-purple-950/20 border-purple-900/40'}`}>
                          <span className="flex items-center gap-2 text-xs font-bold text-purple-200">
                            <Timer className="w-4 h-4" /> Calentamiento · 10 minutos
                          </span>
                          <input
                            type="checkbox"
                            checked={warmupDone}
                            onChange={e => setWarmupDone(e.target.checked)}
                            className="w-5 h-5 accent-purple-500"
                          />
                        </label>
                      </div>

                      {routine.exercises.map(ex => (
                        <div key={ex.id} className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                            <span className="text-[10px] bg-[#27273a] px-2 py-0.5 rounded text-zinc-300">Meta: {ex.reps}</span>
                          </div>
                          <div className="space-y-2">
                            {[...Array(ex.sets)].map((_, sIdx) => {
                              const setData = activeExercises[ex.id]?.sets?.[sIdx] || { weight: '', reps: '', completed: false };
                              const unit = unitMode[`${ex.id}-${sIdx}`] || 'kg';
                              return (
                                <div key={sIdx} className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${setData.completed ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-[#181824] border-[#27273a]'}`}>
                                  <span className="text-xs font-bold text-zinc-400 w-6">S{sIdx + 1}</span>
                                  <div className="flex-1 flex items-center gap-1 bg-[#12121c] px-2 py-1 rounded-lg border border-[#3f3f5f]">
                                    <input
                                      type="number"
                                      placeholder="Peso"
                                      value={setData.weight}
                                      onChange={e => handleSetChange(ex.id, sIdx, 'weight', e.target.value)}
                                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                                    />
                                    <button
                                      onClick={() => setUnitMode(prev => ({ ...prev, [`${ex.id}-${sIdx}`]: unit === 'kg' ? 'lbs' : 'kg' }))}
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
                                      onChange={e => handleSetChange(ex.id, sIdx, 'reps', e.target.value)}
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

                      <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${cooldownDone ? 'bg-emerald-950/30 border-emerald-800' : 'bg-purple-950/20 border-purple-900/40'}`}>
                        <span className="flex items-center gap-2 text-xs font-bold text-purple-200">
                          <Timer className="w-4 h-4" /> Enfriamiento · 10 minutos
                        </span>
                        <input
                          type="checkbox"
                          checked={cooldownDone}
                          onChange={e => setCooldownDone(e.target.checked)}
                          className="w-5 h-5 accent-purple-500"
                        />
                      </label>

                      <button
                        onClick={() => finishRoutine(routine)}
                        className="w-full py-3.5 bg-gradient-to-r from-[#c084fc] to-[#a855f7] text-black font-extrabold rounded-2xl shadow-lg text-sm"
                      >
                        Finalizar y Guardar Rutina
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* MEDIDAS */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#c084fc]" /> Registrar Medidas Actuales
                </h3>
                <p className="text-[10px] text-zinc-400">Estatura configurada: 159 cm · Mujer · 27 años</p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['weight', 'Peso (kg)'],
                    ['hips', 'Cadera (cm)'],
                    ['waist', 'Cintura (cm)'],
                    ['neck', 'Cuello (cm)']
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="text-[10px] text-zinc-400">{label}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement[key]}
                        onChange={e => setNewMeasurement(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-purple-950/30 border border-purple-900/50 rounded-xl p-3">
                  <p className="text-xs text-zinc-300">Porcentaje de grasa corporal estimado</p>
                  <p className="text-2xl font-extrabold text-[#c084fc]">
                    {liveBodyFat === null ? 'Completa las medidas' : `${liveBodyFat.toFixed(1)}%`}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">Estimación orientativa con fórmula de circunferencias de la Marina de EE. UU.</p>
                </div>

                <button
                  onClick={saveMeasurement}
                  className="w-full py-2.5 bg-[#c084fc] text-black font-extrabold rounded-xl text-xs"
                >
                  Guardar Registro
                </button>
              </div>

              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a]">
                <h4 className="font-bold text-xs text-zinc-300 mb-3">Evolución de Cadera y Peso</h4>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurements}>
                      <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#71717a" tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#12121c', borderColor: '#27273a', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="hips" stroke="#c084fc" strokeWidth={2} name="Cadera (cm)" />
                      <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2} name="Peso (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-3">
                  {[...measurements].reverse().map((m, i) => (
                    <div key={`${m.date}-${i}`} className="text-xs bg-[#181824] p-2 rounded-lg flex justify-between gap-2">
                      <span>{m.date} · {m.weight} kg</span>
                      <span className="text-[#c084fc]">{m.bodyFat ? `${m.bodyFat.toFixed(1)}% grasa` : 'Sin cálculo guardado'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RUNNING */}
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
                      onChange={e => setNewRun({ ...newRun, distance: e.target.value })}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Tiempo (minutos)</label>
                    <input
                      type="number"
                      placeholder="Ej. 25"
                      value={newRun.time}
                      onChange={e => setNewRun({ ...newRun, time: e.target.value })}
                      className="w-full bg-[#181824] border border-[#27273a] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!newRun.distance || !newRun.time || Number(newRun.distance) <= 0 || Number(newRun.time) <= 0) return;
                    const pace = (Number(newRun.time) / Number(newRun.distance)).toFixed(2);
                    setRuns(prev => [...prev, {
                      date: today(),
                      distance: Number(newRun.distance),
                      time: Number(newRun.time),
                      pace
                    }]);
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

          {/* ALIMENTACIÓN */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#251638] to-[#13131c] p-4 rounded-2xl border border-purple-900/50">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#c084fc]" /> Alimentación
                </h2>
                <p className="text-xs text-zinc-300 mt-2">Objetivo: reducir grasa y desarrollar masa muscular.</p>
                <p className="text-sm text-[#c084fc] font-bold mt-2">Proteína orientativa: 95–110 g al día</p>
                <p className="text-[10px] text-zinc-400 mt-1">Meta inicial estimada para 57 kg. Ajustaremos según progreso, entrenamiento y apetito.</p>
              </div>

              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                <h3 className="text-sm font-bold text-white">Elige tu menú de hoy</h3>
                <select
                  value={currentNutrition.menu}
                  onChange={e => updateNutrition({ menu: Number(e.target.value) })}
                  className="w-full bg-[#181824] border border-[#3f3f5f] rounded-xl p-3 text-xs text-white"
                >
                  {menus.map((menu, index) => (
                    <option key={index} value={index}>{menu.name}</option>
                  ))}
                </select>

                {selectedMenu.meals.map((meal, index) => (
                  <div key={meal.name} className="bg-[#181824] border border-[#27273a] rounded-xl p-3 space-y-2">
                    <label className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-white">{meal.name}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(currentNutrition.meals[index])}
                        onChange={e => {
                          const meals = [...currentNutrition.meals];
                          meals[index] = e.target.checked;
                          updateNutrition({ meals });
                        }}
                        className="w-5 h-5 accent-purple-500"
                      />
                    </label>
                    <ul className="space-y-1">
                      {meal.foods.map(food => (
                        <li key={food} className="text-xs text-zinc-300">• {food}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-zinc-500">Marca la casilla cuando hayas terminado esta comida.</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a] space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#c084fc]" /> Suplementos
                </h3>
                <label className="flex items-center justify-between bg-[#181824] p-3 rounded-xl">
                  <span>
                    <span className="block text-xs font-bold text-white">Creatina</span>
                    <span className="block text-[10px] text-zinc-400">Monohidratada · referencia habitual: 3–5 g diarios</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(currentNutrition.creatine)}
                    onChange={e => updateNutrition({ creatine: e.target.checked })}
                    className="w-5 h-5 accent-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between bg-[#181824] p-3 rounded-xl">
                  <span>
                    <span className="block text-xs font-bold text-white">Proteína en polvo</span>
                    <span className="block text-[10px] text-zinc-400">Registra si tomaste tu porción de hoy</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(currentNutrition.protein)}
                    onChange={e => updateNutrition({ protein: e.target.checked })}
                    className="w-5 h-5 accent-purple-500"
                  />
                </label>
                <p className="text-[10px] text-zinc-500">Los suplementos son opcionales. Revisa la etiqueta de tu proteína y consulta con un profesional si tienes alguna condición médica o tomas medicamentos.</p>
              </div>

              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a]">
                <h3 className="font-bold text-xs text-zinc-300 mb-2">Seguimiento de hoy</h3>
                <p className="text-xs text-zinc-400">
                  Comidas completadas: {currentNutrition.meals.filter(Boolean).length} de 3
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Creatina: {currentNutrition.creatine ? 'Registrada' : 'Pendiente'} · Proteína: {currentNutrition.protein ? 'Registrada' : 'Pendiente'}
                </p>
              </div>
            </div>
          )}

          {/* CALENDARIO */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="bg-[#13131c] p-4 rounded-2xl border border-[#27273a]">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-[#c084fc]" /> Calendario de Entrenamientos
                </h3>
                <div className="space-y-2">
                  {Object.keys(workoutLogs).length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No hay entrenamientos guardados todavía.</p>
                  ) : (
                    Object.keys(workoutLogs).sort().reverse().map(dateStr => (
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
                <div className="bg-[#13131c] p-4 rounded-2xl border border-[#c084fc]/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-white">Detalle del {selectedCalendarDate}</h4>
                    <button onClick={() => setSelectedCalendarDate(null)} className="text-[10px] text-zinc-400 hover:text-white">Cerrar</button>
                  </div>
                  <p className="text-xs text-[#c084fc] font-semibold">{workoutLogs[selectedCalendarDate]?.routineName}</p>
                  <p className="text-xs text-zinc-300">
                    Calentamiento: {workoutLogs[selectedCalendarDate]?.warmupDone ? '✓ Realizado' : '✗ No marcado'}
                  </p>
                  <p className="text-xs text-zinc-300">
                    Enfriamiento: {workoutLogs[selectedCalendarDate]?.cooldownDone ? '✓ Realizado' : '✗ No marcado'}
                  </p>
                </div>
              )}
            </div>
          )}

        </main>

        {/* TEMPORIZADOR */}
        {timerActive && (
          <div className="absolute bottom-20 left-4 right-4 bg-[#1b1b2f] border border-[#c084fc]/40 p-3 rounded-2xl shadow-xl flex items-center justify-between z-40">
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
              <button onClick={() => setTimeLeft(prev => prev + 30)} className="px-2 py-1 bg-[#27273a] text-xs font-bold text-[#c084fc] rounded-lg">+30s</button>
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-2 bg-[#c084fc] text-black rounded-lg">
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={() => { setTimerActive(false); setIsTimerRunning(false); }} className="p-2 bg-[#27273a] text-zinc-400 rounded-lg hover:text-white">✕</button>
            </div>
          </div>
        )}

        {/* NAVEGACIÓN */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-[#12121c] border-t border-[#27273a] flex items-center justify-around px-1 z-30">
          <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center gap-1 ${activeTab === 'workout' ? 'text-[#c084fc]' : 'text-zinc-500'}`}>
            <Dumbbell className="w-5 h-5" />
            <span className="text-[9px] font-medium">Rutina</span>
          </button>
          <button onClick={() => setActiveTab('measurements')} className={`flex flex-col items-center gap-1 ${activeTab === 'measurements' ? 'text-[#c084fc]' : 'text-zinc-500'}`}>
            <Ruler className="w-5 h-5" />
            <span className="text-[9px] font-medium">Medidas</span>
          </button>
          <button onClick={() => setActiveTab('running')} className={`flex flex-col items-center gap-1 ${activeTab === 'running' ? 'text-[#c084fc]' : 'text-zinc-500'}`}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-[9px] font-medium">Running</span>
          </button>
          <button onClick={() => setActiveTab('nutrition')} className={`flex flex-col items-center gap-1 ${activeTab === 'nutrition' ? 'text-[#c084fc]' : 'text-zinc-500'}`}>
            <Utensils className="w-5 h-5" />
            <span className="text-[9px] font-medium">Comidas</span>
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-[#c084fc]' : 'text-zinc-500'}`}>
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[9px] font-medium">Calendario</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
