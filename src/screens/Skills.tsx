import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSkillsViewModel } from '../store/useSkillsViewModel';
import { Check } from 'lucide-react';

const AVAILABLE_SKILLS = [
  'Graphic Designing',
  'Video Editing',
  'Digital Marketing',
  'AI Content',
  'Dropshipping',
  'Account Selling'
];

export function Skills() {
  const navigate = useNavigate();
  const { skills, toggleSkill } = useSkillsViewModel();

  const handleContinue = () => {
    if (skills.length > 0) {
      navigate('/home', { replace: true });
    }
  };

  return (
    <ScreenWrapper className="bg-white flex flex-col pb-0">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Select Your Skills</h1>
        <p className="text-gray-500 mt-2 text-sm">Choose the skills you want to track and build a portfolio for.</p>
      </div>

      <div className="flex-1 px-6">
        <div className="space-y-3">
          {AVAILABLE_SKILLS.map((skill) => {
            const isSelected = skills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-100 bg-white hover:border-blue-200'
                }`}
              >
                <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                  {skill}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <button
          onClick={handleContinue}
          disabled={skills.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
            skills.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save & Continue
        </button>
      </div>
    </ScreenWrapper>
  );
}
