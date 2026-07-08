'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEvaluation } from '@/app/(protected)/evaluate/actions';
// @ts-expect-error
import IconChevronRight from '@tabler/icons-react/dist/esm/icons/IconChevronRight';
// @ts-expect-error
import IconChevronLeft from '@tabler/icons-react/dist/esm/icons/IconChevronLeft';
// @ts-expect-error
import IconCircleCheck from '@tabler/icons-react/dist/esm/icons/IconCircleCheck';

const EMOJIS = [
  { val: 1, label: '😞', text: 'Insuficiente' },
  { val: 2, label: '😐', text: 'Regular' },
  { val: 3, label: '🙂', text: 'Bueno' },
  { val: 4, label: '😄', text: 'Excelente' }
];

const MAX_CHARS = 200;

export default function EvaluationWizard({ evaluatorId, evaluateeId, periodId, isSM, teamMembers, evaluatedIds }: any) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<any>({
    tw: [0, 0, 0],
    dev: [0, 0, 0],
    cw: [0, 0, 0],
    sm_l: [0, 0],
    sm_f: [0, 0],
    sm_s: [0],
    comments: ''
  });

  const currentIndex = evaluatedIds.length + 1;
  const total = teamMembers.length;

  const handleScoreChange = (category: string, index: number, value: number) => {
    const newScores = { ...scores };
    newScores[category][index] = value;
    setScores(newScores);
  };

  const calculateAvg = (arr: number[]) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const isStepValid = () => {
    if (step === 1) return scores.tw.every((v: number) => v > 0);
    if (step === 2) return scores.dev.every((v: number) => v > 0);
    if (step === 3) return scores.cw.every((v: number) => v > 0);
    if (step === 4 && isSM) return [...scores.sm_l, ...scores.sm_f, ...scores.sm_s].every((v: number) => v > 0);
    return true;
  };

  const getNextEvaluatee = () => {
    const evaluatedSet = new Set(evaluatedIds);
    evaluatedSet.add(Number(evaluateeId));
    return teamMembers.find((m: any) => !evaluatedSet.has(m.id));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      evaluatorId,
      evaluateeId,
      periodId,
      tw_avg: calculateAvg(scores.tw),
      dev_avg: calculateAvg(scores.dev),
      cw_avg: calculateAvg(scores.cw),
      isSM,
      sm_l_avg: isSM ? calculateAvg(scores.sm_l) : null,
      sm_f_avg: isSM ? calculateAvg(scores.sm_f) : null,
      sm_s_avg: isSM ? calculateAvg(scores.sm_s) : null,
      comments: scores.comments
    };

    await saveEvaluation(data);
    const next = getNextEvaluatee();
    if (next) {
      router.push(`/evaluate/${next.id}`);
    } else {
      router.push('/dashboard');
    }
  };

  const renderRating = (category: string, index: number, label: string) => (
    <div key={`${category}-${index}`} style={{ marginBottom: '25px' }}>
      <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '1rem' }}>{label}</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        {EMOJIS.map(e => (
          <button
            key={e.val}
            type="button"
            className={`btn ${scores[category][index] === e.val ? 'selected' : ''}`}
            style={{ 
              flex: 1, 
              flexDirection: 'column',
              padding: '12px 5px', 
              border: '2px solid var(--border-color)',
              background: scores[category][index] === e.val ? 'var(--primary-color)' : 'var(--card-bg)',
              color: scores[category][index] === e.val ? 'white' : 'var(--text-color)',
              borderRadius: '12px',
              gap: '4px'
            }}
            onClick={() => handleScoreChange(category, index, e.val)}
          >
            <span style={{ fontSize: '1.8rem' }}>{e.label}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{e.text}</span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .btn.selected { border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2); }
      `}</style>
    </div>
  );

  const totalSteps = isSM ? 5 : 4;

  return (
    <div className="wizard">
      {/* Progress indicator */}
      <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'var(--bg-color)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
        Evaluación {currentIndex} de {total}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Paso {step} de {totalSteps}</span>
            <span>{Math.round((step/totalSteps)*100)}% Completado</span>
        </div>
        <div className="progress-bar" style={{ height: '8px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
            className="progress-fill" 
            style={{ 
                height: '100%', 
                background: 'var(--primary-color)', 
                width: `${(step / totalSteps) * 100}%`,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            />
        </div>
      </div>

      <div className="step-content" style={{ minHeight: '300px' }}>
        {step === 1 && (
            <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>🤝 Trabajo en Equipo</h3>
            {renderRating('tw', 0, '¿Participa activamente en las reuniones?')}
            {renderRating('tw', 1, '¿Ayuda a otros compañeros cuando lo necesitan?')}
            {renderRating('tw', 2, '¿Mantiene una actitud positiva y constructiva?')}
            </div>
        )}

        {step === 2 && (
            <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>💻 Desarrollo Técnico</h3>
            {renderRating('dev', 0, '¿Cumple con sus tareas técnicas asignadas?')}
            {renderRating('dev', 1, '¿La calidad de su trabajo es adecuada?')}
            {renderRating('dev', 2, '¿Propone soluciones técnicas efectivas?')}
            </div>
        )}

        {step === 3 && (
            <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>🏫 Trabajo en Clase</h3>
            {renderRating('cw', 0, '¿Se mantiene enfocado durante las horas de clase?')}
            {renderRating('cw', 1, '¿Respeta las normas de convivencia?')}
            {renderRating('cw', 2, '¿Utiliza correctamente el tiempo asignado?')}
            </div>
        )}

        {step === 4 && isSM && (
            <div>
            <h3 style={{ color: '#9f7aea', marginBottom: '20px' }}>⚡ Liderazgo Scrum Master</h3>
            {renderRating('sm_l', 0, 'Liderazgo y guía del equipo')}
            {renderRating('sm_l', 1, 'Resolución de impedimentos')}
            {renderRating('sm_f', 0, 'Facilitación de ceremonias')}
            {renderRating('sm_f', 1, 'Gestión del tablero/backlog')}
            {renderRating('sm_s', 0, 'Soporte emocional y motivacional')}
            </div>
        )}

        {(step === 5 || (step === 4 && !isSM)) && (
            <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Comentarios Finales</h3>
            <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Escribe algo constructivo sobre el desempeño de tu compañero:</p>
            <textarea 
                rows={4}
                maxLength={MAX_CHARS}
                placeholder="Ej: Muy buen compañero, siempre dispuesto a ayudar..."
                value={scores.comments}
                onChange={(e) => setScores({ ...scores, comments: e.target.value })}
                style={{ width: '100%', marginBottom: '6px', borderRadius: '15px', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: scores.comments.length >= MAX_CHARS ? '#e53e3e' : 'var(--text-muted)', marginBottom: '0' }}>
              {scores.comments.length}/{MAX_CHARS}
            </div>
            </div>
        )}
      </div>

      <div className="wizard-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '15px' }}>
        {step > 1 && (
          <button className="btn" style={{ background: 'var(--border-color)', flex: 1 }} onClick={() => setStep(step - 1)}>
            <IconChevronLeft size={18} /> Anterior
          </button>
        )}
        
        {(step < (isSM ? 5 : 4)) ? (
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, opacity: isStepValid() ? 1 : 0.5 }} 
            disabled={!isStepValid()}
            onClick={() => setStep(step + 1)}
          >
            Siguiente <IconChevronRight size={18} />
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, background: '#38a169', opacity: saving ? 0.5 : 1 }} 
            disabled={saving}
            onClick={handleSubmit}
          >
            <IconCircleCheck size={18} /> {saving ? 'Guardando...' : 'Finalizar Evaluación'}
          </button>
        )}
      </div>
    </div>
  );
}
