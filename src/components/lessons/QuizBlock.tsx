"use client";

// Instant right/wrong MCQ feedback, per chapter. Click an option, see
// immediately whether it's correct (green) or not (red), read the
// explanation, move on — no submit button, no waiting. Once every
// question in a chapter has been answered, the chapter is marked
// complete in localStorage (see PROGRESS_KEY), which is what drives the
// checkmarks and progress count on the course index page. Answers are
// locked in once picked — this is a check-your-understanding tool, not a
// resettable quiz.

import { useEffect, useState } from "react";
import type { QuizQuestion } from "@/data/course";

const PROGRESS_KEY = "bloombruh:course-progress";

function markComplete(slug: string) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const progress = raw ? JSON.parse(raw) : {};
    progress[slug] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable (private browsing, storage disabled) — the
    // quiz still works, progress just won't persist across visits.
  }
}

export default function QuizBlock({
  quiz,
  chapterSlug,
}: {
  quiz: QuizQuestion[];
  chapterSlug: string;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));

  useEffect(() => {
    if (answers.every((a) => a !== null)) {
      markComplete(chapterSlug);
    }
  }, [answers, chapterSlug]);

  function selectAnswer(qIndex: number, optionIndex: number) {
    setAnswers((prev) => {
      if (prev[qIndex] !== null) return prev;
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const correctCount = answers.filter((a, i) => a === quiz[i].correctIndex).length;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          Check your understanding
        </h2>
        {answeredCount > 0 && (
          <span className="font-mono text-xs text-muted">
            {correctCount}/{answeredCount} correct
          </span>
        )}
      </div>

      <div className="mt-4 space-y-6">
        {quiz.map((q, qIndex) => {
          const selected = answers[qIndex];
          const isAnswered = selected !== null;
          return (
            <div key={qIndex} className="border border-border bg-surface/40 p-4 sm:p-5">
              <p className="text-sm font-medium text-foreground">
                {qIndex + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((option, optIndex) => {
                  const isCorrect = optIndex === q.correctIndex;
                  const isSelected = selected === optIndex;
                  let stateClass = "border-border hover:border-accent/50";
                  if (isAnswered) {
                    if (isCorrect) {
                      stateClass = "border-positive bg-positive/10 text-positive";
                    } else if (isSelected) {
                      stateClass = "border-negative bg-negative/10 text-negative";
                    } else {
                      stateClass = "border-border opacity-50";
                    }
                  }
                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => selectAnswer(qIndex, optIndex)}
                      disabled={isAnswered}
                      className={`block w-full border px-3 py-2 text-left text-sm transition-colors ${stateClass} ${
                        isAnswered ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  <span
                    className={
                      selected === q.correctIndex ? "font-semibold text-positive" : "font-semibold text-negative"
                    }
                  >
                    {selected === q.correctIndex ? "Correct: " : "Not quite: "}
                  </span>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
