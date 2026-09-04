import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, BarChart3, RefreshCw, ThumbsUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NOSTALGIA_QUIZ, INITIAL_POLLS } from '../data';
import { QuizQuestion, PollItem } from '../types';

export default function NostalgiaQuizAndPolls() {
  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Polls State
  const [polls, setPolls] = useState<PollItem[]>(INITIAL_POLLS);
  const [userVoted, setUserVoted] = useState<Record<string, string>>({});

  const currentQ = NOSTALGIA_QUIZ[currentQuizIdx] || NOSTALGIA_QUIZ[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.7 }
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIdx < NOSTALGIA_QUIZ.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizCompleted(true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    if (userVoted[pollId]) return;

    setUserVoted((prev) => ({ ...prev, [pollId]: optionId }));
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        return {
          ...poll,
          options: poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )
        };
      })
    );
  };

  return (
    <section id="quiz-polls-section" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Góc Thử Tài & Giao Lưu Hài Hước
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Trắc Nghiệm & Bình Chọn Kỷ Niệm
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Cùng ôn lại những mảnh ghép ký ức ngộ nghĩnh và bình chọn cho những "nhân vật huyền thoại" của lớp sau 2 thập kỷ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Nostalgia Quiz */}
        <div className="lg:col-span-6 bg-white border border-brand-border rounded-sm p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-gold" />
              <h3 className="font-serif font-bold text-base text-brand-text">
                Thử Thách: "Bạn Còn Nhớ Kỷ Niệm Xưa?"
              </h3>
            </div>
            {!isQuizCompleted && (
              <span className="text-[10px] font-sans font-bold bg-[#FAF8F5] text-brand-gold px-2 py-1 rounded-xs border border-brand-border">
                Câu {currentQuizIdx + 1} / {NOSTALGIA_QUIZ.length}
              </span>
            )}
          </div>

          {!isQuizCompleted ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF8F5] border border-brand-border/80 rounded-xs">
                <p className="font-serif font-bold text-sm text-brand-text leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  let optStyle = 'border-brand-border bg-white text-brand-text hover:border-brand-gold';
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                    } else if (idx === selectedOption) {
                      optStyle = 'border-red-400 bg-red-50 text-red-700';
                    } else {
                      optStyle = 'border-brand-border/40 bg-gray-50/50 text-brand-text-muted opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xs border text-xs font-serif transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-xs text-xs font-serif text-brand-text">
                    <span className="font-bold font-sans text-[10px] uppercase tracking-wider text-brand-gold block mb-1">
                      💡 Ký ức tuổi học trò:
                    </span>
                    <p className="italic">{currentQ.explanation}</p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2.5 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    {currentQuizIdx < NOSTALGIA_QUIZ.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả tổng kết 🏆'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 border-2 border-brand-gold mx-auto flex items-center justify-center text-brand-gold">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-brand-text">
                  Chúc mừng bạn đã hoàn thành thử thách!
                </h4>
                <p className="text-sm font-serif italic text-brand-gold font-bold mt-1">
                  Đạt {score} / {NOSTALGIA_QUIZ.length} điểm ký ức thanh xuân
                </p>
                <p className="text-xs text-brand-text-muted font-serif italic mt-2 max-w-sm mx-auto">
                  {score >= 4
                    ? 'Bạn xứng đáng nhận danh hiệu "Thần đồng ký ức niên khóa 2003-2006"! Trí nhớ về trường xưa thật đáng nể.'
                    : 'Ký ức sau 20 năm có chút phai mờ, nhưng đừng lo, ngày 18/10 tới gặp lại bạn bè sẽ ôn lại đầy đủ ngay!'}
                </p>
              </div>

              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-gold" />
                <span>Chơi lại từ đầu</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Community Polls */}
        <div className="lg:col-span-6 bg-[#FAF8F5] border border-brand-border rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-gold" />
              <h3 className="font-serif font-bold text-base text-brand-text">
                Bình Chọn Vui Cùng Cả Lớp
              </h3>
            </div>
            <span className="text-[10px] font-sans font-bold text-brand-gold uppercase tracking-wider">
              Bình chọn ẩn danh
            </span>
          </div>

          <div className="space-y-6">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
              const votedOptId = userVoted[poll.id];

              return (
                <div key={poll.id} className="bg-white border border-brand-border rounded-xs p-4 space-y-3 shadow-2xs">
                  <h4 className="font-serif font-bold text-xs text-brand-text leading-snug">
                    {poll.question}
                  </h4>

                  <div className="space-y-2">
                    {poll.options.map((opt) => {
                      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const isUserChoice = votedOptId === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleVotePoll(poll.id, opt.id)}
                          className={`relative overflow-hidden rounded-xs border p-2.5 transition-all ${
                            votedOptId
                              ? 'cursor-default'
                              : 'cursor-pointer hover:border-brand-gold'
                          } ${
                            isUserChoice
                              ? 'border-brand-gold bg-brand-gold/5'
                              : 'border-brand-border/70 bg-[#FCFAF7]'
                          }`}
                        >
                          {/* Progress Bar background if voted */}
                          {votedOptId && (
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-brand-gold/15 transition-all duration-700"
                              style={{ width: `${percent}%` }}
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
                            <span className="font-serif text-brand-text flex items-center gap-1.5">
                              {isUserChoice && <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />}
                              <span>{opt.text}</span>
                            </span>
                            {votedOptId ? (
                              <span className="font-sans font-bold text-[10px] text-brand-gold shrink-0">
                                {percent}% ({opt.votes})
                              </span>
                            ) : (
                              <span className="text-[10px] font-sans font-medium text-brand-text-muted hover:text-brand-gold shrink-0">
                                Chọn
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-brand-text-muted pt-1">
                    <span>Tổng số: {totalVotes} lượt bình chọn</span>
                    {votedOptId && (
                      <span className="text-emerald-700 font-bold font-sans">
                        ✓ Bạn đã bình chọn
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
