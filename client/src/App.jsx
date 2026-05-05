import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [startYear, setStartYear] = useState(null);
  const [currentDateStr, setCurrentDateStr] = useState(format(new Date(), 'MM-dd'));
  const [diaryData, setDiaryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentSystemYear = new Date().getFullYear();

  // 获取全局配置 (START_YEAR)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/config`);
        setStartYear(parseInt(res.data.startYear, 10));
      } catch (err) {
        console.error('Failed to fetch config', err);
      }
    };
    fetchConfig();
  }, []);

  // 获取日记数据
  useEffect(() => {
    if (!startYear) return;

    const fetchDiary = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/diary/${currentDateStr}`);
        setDiaryData(res.data);
      } catch (err) {
        console.error('Failed to fetch diary', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [currentDateStr, startYear]);

  // 处理文本变更
  const handleTextChange = (year, newText) => {
    setDiaryData(prev => ({
      ...prev,
      [year]: newText
    }));
  };

  // 保存数据
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/diary/${currentDateStr}`, diaryData);
      alert('Saved successfully!');
    } catch (err) {
      console.error('Failed to save diary', err);
      alert('Failed to save, please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!startYear || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  // 生成固定的 5 年卡片数组
  const years = Array.from({ length: 5 }, (_, i) => startYear + i);

  // 月份英文映射
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* 顶部日期控制区 */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wider">
            {monthNames[parseInt(currentDateStr.split('-')[0], 10) - 1]} {currentDateStr.split('-')[1]}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
              <select 
                value={currentDateStr.split('-')[0]} 
                onChange={(e) => {
                  const newMonth = e.target.value;
                  const currentDay = currentDateStr.split('-')[1];
                  setCurrentDateStr(`${newMonth}-${currentDay}`);
                }}
                className="px-2 py-1 bg-transparent focus:outline-none cursor-pointer text-gray-700"
              >
                {monthNames.map((month, index) => {
                  const monthValue = String(index + 1).padStart(2, '0');
                  return <option key={monthValue} value={monthValue}>{month}</option>;
                })}
              </select>
              <span className="text-gray-300">|</span>
              <select 
                value={currentDateStr.split('-')[1]} 
                onChange={(e) => {
                  const currentMonth = currentDateStr.split('-')[0];
                  const newDay = e.target.value;
                  setCurrentDateStr(`${currentMonth}-${newDay}`);
                }}
                className="px-2 py-1 bg-transparent focus:outline-none cursor-pointer text-gray-700"
              >
                {Array.from({ length: 31 }, (_, i) => {
                  const day = String(i + 1).padStart(2, '0');
                  // 简单的日期天数限制
                  const currentMonth = currentDateStr.split('-')[0];
                  if (currentMonth === '02' && i >= 29) return null;
                  if (['04', '06', '09', '11'].includes(currentMonth) && i >= 30) return null;
                  
                  return <option key={day} value={day}>{day}</option>;
                })}
              </select>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-800 text-white px-4 py-1 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* 5 年日记卡片列表 */}
        <div className="space-y-6">
          {years.map((year) => {
            const isPast = year < currentSystemYear;
            const isCurrent = year === currentSystemYear;
            const isFuture = year > currentSystemYear;

            return (
              <div 
                key={year} 
                className={`bg-white p-6 shadow-sm border-l-4 transition-all duration-300
                  ${isCurrent ? 'border-gray-800 shadow-md' : 'border-gray-200'}
                  ${isFuture ? 'opacity-60 bg-gray-50' : ''}
                `}
              >
                <h2 className="text-xl font-semibold text-gray-700 mb-3 font-serif">
                  {year}
                </h2>
                
                {isPast && (
                  <div className="text-gray-600 whitespace-pre-wrap min-h-[60px]">
                    {diaryData[year] || <span className="italic text-gray-400">(No record)</span>}
                  </div>
                )}

                {isCurrent && (
                  <textarea
                    value={diaryData[year] || ''}
                    onChange={(e) => handleTextChange(year, e.target.value)}
                    placeholder="Write your diary for today..."
                    className="w-full min-h-[120px] p-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent resize-y bg-[#fafafa]"
                  />
                )}

                {isFuture && (
                  <div className="text-gray-400 italic min-h-[60px] flex items-center">
                    Time has yet to come...
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default App;
