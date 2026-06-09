'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Challenge {
  id: number;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
}

export default function Home() {
  const [logicQuestion, setLogicQuestion] = useState<Challenge | null>(null);
  const [englishQuestion, setEnglishQuestion] = useState<Challenge | null>(null);
  const [cultureQuestion, setCultureQuestion] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchTrivia() {
      try {
        const [logicRes, englishRes, cultureRes] = await Promise.all([
          supabase.from('challenges_logic').select('*').order('id', { ascending: false }).limit(1).single(),
          supabase.from('challenges_english').select('*').order('id', { ascending: false }).limit(1).single(),
          supabase.from('challenges_culture').select('*').order('id', { ascending: false }).limit(1).single(),
        ]);

        if (logicRes.data) setLogicQuestion(logicRes.data);
        if (englishRes.data) setEnglishQuestion(englishRes.data);
        if (cultureRes.data) setCultureQuestion(cultureRes.data);
      } catch (error) {
        console.error('Error cargando los desafíos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrivia();
  }, []);

  const handleSelectOption = (category: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [category]: option }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-semibold">Cargando desafíos del día...</p>
      </div>
    );
  }

  const sections = [
    { id: 'logic', title: 'Núcleo Lógico', data: logicQuestion },
    { id: 'english', title: 'Laboratorio de Inglés', data: englishQuestion },
    { id: 'culture', title: 'Cultura General', data: cultureQuestion },
  ];

  return (
    <main className="min-h-screen bg-gray-950 p-6 text-gray-100 sm:p-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-indigo-400 sm:text-5xl">
            Desafío Diario
          </h1>
          <p className="mt-2 text-gray-400">Resuelve las trivias generadas para el día de hoy</p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => {
            if (!section.data) return null;

            const selected = selectedAnswers[section.id];
            const isCorrect = selected === section.data.respuesta_correcta;

            return (
              <section
                key={section.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-3">
                  <h2 className="text-xl font-bold text-indigo-300">{section.title}</h2>
                  {selected && (
                    <span
                      className={`rounded px-2.5 py-1 text-xs font-bold ${
                        isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    </span>
                  )}
                </div>

                <p className="mb-6 text-lg text-gray-200">{section.data.pregunta}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {section.data.opciones.map((option, idx) => {
                    const isSelected = selected === option;
                    let buttonStyle = 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200';

                    if (selected) {
                      if (option === section.data!.respuesta_correcta) {
                        buttonStyle = 'bg-green-600/30 border-green-500 text-green-200';
                      } else if (isSelected) {
                        buttonStyle = 'bg-red-600/30 border-red-500 text-red-200';
                      } else {
                        buttonStyle = 'bg-gray-800/40 border-gray-800 text-gray-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={!!selected}
                        onClick={() => handleSelectOption(section.id, option)}
                        className={`w-full rounded-lg border p-4 text-left font-medium transition-all ${buttonStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}