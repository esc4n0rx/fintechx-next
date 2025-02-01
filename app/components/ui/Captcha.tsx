import { useEffect, useState } from "react";

interface CaptchaProps {
  value: string;
  onGenerate: () => void;
}

export const Captcha = ({ value, onGenerate }: CaptchaProps) => {
  useEffect(() => {
    onGenerate();
  }, []);

  return (
    <div className="flex items-center justify-between p-2 bg-gray-700 rounded-lg text-xl font-bold tracking-widest">
      <span className="text-blue-400">{value}</span>
      <button
        type="button"
        className="ml-2 text-sm text-gray-400 underline"
        onClick={onGenerate}
      >
        Atualizar
      </button>
    </div>
  );
};
