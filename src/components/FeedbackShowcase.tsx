import React, { useState, useEffect } from 'react';
import { Star, Users, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

const mockFeedback = [
  { id: 1, name: "王*明", content: "这个AI助手真的太好用了，帮我节省了大量时间！", rating: 5 },
  { id: 2, name: "飞***鱼", content: "界面很清爽，知识库功能非常强大，推荐！", rating: 5 },
  { id: 3, name: "A*ce", content: "生成的关系图谱很直观，对梳理复杂文档很有帮助。", rating: 4 },
  { id: 4, name: "李*", content: "响应速度很快，解析长文档也没有卡顿。", rating: 5 },
  { id: 5, name: "coding***", content: "希望以后能支持更多的本地模型，目前体验已经很棒了。", rating: 4 },
  { id: 6, name: "张*三", content: "思维导图功能简直是神器，一键生成太方便了。", rating: 5 },
  { id: 7, name: "夜*", content: "用了几天，感觉比市面上很多同类产品都要好用。", rating: 5 },
  { id: 8, name: "陈*华", content: "UI设计很符合直觉，不需要学习成本就能上手。", rating: 5 },
  { id: 9, name: "s*ky", content: "文本分块和向量化做得很细致，检索准确率很高。", rating: 4 },
  { id: 10, name: "赵*", content: "非常棒的工具，强烈推荐给需要处理大量文档的人。", rating: 5 },
  { id: 11, name: "刘*强", content: "客服响应很及时，解决问题很快，点赞！", rating: 5 },
  { id: 12, name: "w*nd", content: "期待加入更多的自定义设置，总体来说很满意。", rating: 4 },
  { id: 13, name: "周*", content: "这个价格能有这样的体验，性价比非常高。", rating: 5 },
  { id: 14, name: "吴*杰", content: "一直在寻找这样的工具，终于找到了，感谢开发者！", rating: 5 },
  { id: 15, name: "m*on", content: "不仅可以聊天，还能管理知识库，一站式解决需求。", rating: 5 },
  { id: 16, name: "郑*", content: "希望能增加多端同步功能，那就完美了。", rating: 4 },
  { id: 17, name: "王*芳", content: "给团队也推荐了，大家都在用，效率提升明显。", rating: 5 },
  { id: 18, name: "s*ar", content: "界面简洁无广告，使用体验极佳。", rating: 5 },
  { id: 19, name: "林*", content: "解析PDF的速度很快，而且排版没有乱。", rating: 5 },
  { id: 20, name: "h*ro", content: "支持自定义API，这点非常棒，灵活性很高。", rating: 5 },
  { id: 21, name: "郭*辉", content: "关系图谱的交互还可以再优化一下，不过已经很不错了。", rating: 4 },
  { id: 22, name: "f*re", content: "每天都在用，已经离不开了。", rating: 5 },
  { id: 23, name: "马*", content: "希望加入语音输入功能，打字有时候太累了。", rating: 4 },
  { id: 24, name: "w*ter", content: "导出的思维导图格式很丰富，方便二次编辑。", rating: 5 },
  { id: 25, name: "朱*宇", content: "非常稳定，没有遇到过崩溃的情况。", rating: 5 },
  { id: 26, name: "e*rth", content: "给开发者加鸡腿，更新很频繁，一直在进步。", rating: 5 },
  { id: 27, name: "胡*", content: "对于写论文的人来说，这个工具简直是救星。", rating: 5 },
  { id: 28, name: "l*ght", content: "希望能增加暗黑模式，晚上用有点刺眼。", rating: 4 },
  { id: 29, name: "高*涛", content: "总体来说是一款非常优秀的AI助手，值得一试。", rating: 5 },
  { id: 30, name: "d*rk", content: "期待更多的功能加入，看好你们！", rating: 5 },
  { id: 31, name: "孙*宇", content: "非常实用的工具，大大提高了我的工作效率。", rating: 5 },
  { id: 32, name: "c*loud", content: "界面优雅，功能强大，是不可多得的好软件。", rating: 5 },
];

export default function FeedbackShowcase() {
  const { setShowFeedbackShowcase } = useStore();
  const [userCount, setUserCount] = useState(126);

  useEffect(() => {
    const storedData = localStorage.getItem('feedbackUserCount');
    const now = new Date().getTime();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const count = parsedData.count || 126;
      const lastUpdate = parsedData.lastUpdate || now;
      const weeksPassed = Math.floor((now - lastUpdate) / ONE_WEEK);
      
      if (weeksPassed > 0) {
        let newCount = count;
        for (let i = 0; i < weeksPassed; i++) {
          newCount += Math.floor(Math.random() * 5) + 2; // [2, 6]
        }
        setUserCount(newCount);
        localStorage.setItem('feedbackUserCount', JSON.stringify({
          count: newCount,
          lastUpdate: lastUpdate + weeksPassed * ONE_WEEK
        }));
      } else {
        setUserCount(count);
      }
    } else {
      localStorage.setItem('feedbackUserCount', JSON.stringify({
        count: 126,
        lastUpdate: now
      }));
    }
  }, []);
  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-[#f0f0f0] overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-gray-300 flex items-center justify-between px-4 md:px-6 bg-[#f5f5f5] flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFeedbackShowcase(false)}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
            title="返回工作区"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Star className="text-[#07c160] fill-[#07c160]" size={20} />
            用户反馈精选
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
          <Users size={16} className="text-[#07c160]" />
          <span>用户数量：<span className="font-bold text-gray-800">{userCount}</span></span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white overflow-hidden relative flex flex-col justify-center py-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">听听大家怎么说</h3>
          <p className="text-sm text-gray-500">来自真实用户的声音，是我们不断前进的动力</p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex flex-col gap-4">
          {/* Row 1: Left to Right */}
          <div className="flex w-max animate-marquee-left hover:[animation-play-state:paused]">
            {[...mockFeedback.slice(0, 8), ...mockFeedback.slice(0, 8)].map((item, index) => (
              <div 
                key={`row1-${index}`} 
                className="w-64 mx-2 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm flex-shrink-0 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{item.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>

          {/* Row 2: Right to Left */}
          <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused]">
            {[...mockFeedback.slice(8, 16), ...mockFeedback.slice(8, 16)].map((item, index) => (
              <div 
                key={`row2-${index}`} 
                className="w-64 mx-2 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm flex-shrink-0 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{item.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>

          {/* Row 3: Left to Right */}
          <div className="flex w-max animate-marquee-left hover:[animation-play-state:paused]" style={{ animationDelay: '-5s' }}>
            {[...mockFeedback.slice(16, 24), ...mockFeedback.slice(16, 24)].map((item, index) => (
              <div 
                key={`row3-${index}`} 
                className="w-64 mx-2 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm flex-shrink-0 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{item.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>

          {/* Row 4: Right to Left */}
          <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused]" style={{ animationDelay: '-10s' }}>
            {[...mockFeedback.slice(24, 32), ...mockFeedback.slice(24, 32)].map((item, index) => (
              <div 
                key={`row4-${index}`} 
                className="w-64 mx-2 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm flex-shrink-0 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{item.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
