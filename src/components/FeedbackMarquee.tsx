import React from 'react';
import { MessageSquareQuote } from 'lucide-react';

const feedbacks = [
  { name: "李*明", text: "界面很清爽，写作沉浸感很强！" },
  { name: "王*建", text: "RAG解析速度出乎意料的快，找设定太方便了。" },
  { name: "赵*芳", text: "思维导图功能简直是梳理大纲的神器！" },
  { name: "刘*", text: "希望能加入更多导出格式。" },
  { name: "陈*宇", text: "本地模型支持得很好，Ollama无缝接入。" },
  { name: "张*", text: "关系图谱太酷了，主角配角一目了然。" },
  { name: "周*杰", text: "工作模式直接生成文件，不用再手动复制粘贴了。" },
  { name: "吴*", text: "ngrok内网穿透的教程很详细，小白也能看懂。" },
  { name: "郑*华", text: "要是能支持多文档联合检索就更好了。" },
  { name: "孙*梅", text: "配色很舒服，长时间看眼睛不累。" },
  { name: "马*云", text: "非常棒的辅助工具，极大提升了我的码字效率。" },
  { name: "朱*", text: "期待后续加入角色卡片管理功能。" },
  { name: "胡*歌", text: "深色模式什么时候安排上？" },
  { name: "林*心", text: "AI响应速度很快，打字机效果很带感。" },
  { name: "郭*靖", text: "用它来补全设定漏洞，AI给的建议很中肯。" },
  { name: "何*", text: "免费又好用，良心软件！" },
  { name: "高*强", text: "关系图谱的连线如果能自定义颜色就好了。" },
  { name: "罗*翔", text: "法律相关的小说设定也能很好地检索出来。" },
  { name: "梁*伟", text: "文本视图阅读体验不错。" },
  { name: "宋*", text: "上传大文件稍微有点慢，希望能优化。" },
  { name: "唐*僧", text: "啰嗦的设定也能被AI精准提炼，阿弥陀佛。" },
  { name: "许*仙", text: "用来写同人小说，找原著设定太省事了。" },
  { name: "白*素", text: "导图可以导出图片吗？" },
  { name: "法*", text: "妖魔鬼怪的设定图谱很清晰。" },
  { name: "小*", text: "手机端适配得挺好，随时随地能看。" },
  { name: "老*", text: "希望能有个字数统计功能。" },
  { name: "阿*", text: "自定义AI图标这个小功能很贴心。" },
  { name: "李*白", text: "诗词歌赋也能很好地理解，不错。" },
  { name: "杜*", text: "要是能自动生成章节摘要就好了。" },
  { name: "苏*轼", text: "用它写美食文，AI给的菜谱很靠谱。" },
  { name: "王*安", text: "变法题材的小说，逻辑梳理得明明白白。" },
  { name: "曾*", text: "希望能加入历史版本回退功能。" }
];

const row1 = feedbacks.slice(0, 11);
const row2 = feedbacks.slice(11, 22);
const row3 = feedbacks.slice(22, 33);

const MarqueeRow = ({ items, speed }: { items: typeof feedbacks, speed: number }) => (
  <div className="flex w-[200%] animate-marquee-right" style={{ animationDuration: `${speed}s` }}>
    <div className="flex w-1/2 justify-around">
      {items.map((item, i) => (
        <div key={i} className="mx-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-72 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#07c160] to-[#06ad56] flex items-center justify-center text-white font-bold text-sm">
              {item.name.charAt(0)}
            </div>
            <span className="font-medium text-gray-700 text-sm">{item.name}</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
    <div className="flex w-1/2 justify-around">
      {items.map((item, i) => (
        <div key={`dup-${i}`} className="mx-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-72 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#07c160] to-[#06ad56] flex items-center justify-center text-white font-bold text-sm">
              {item.name.charAt(0)}
            </div>
            <span className="font-medium text-gray-700 text-sm">{item.name}</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function FeedbackMarquee() {
  return (
    <div className="w-full h-full bg-[#f8fafc] overflow-hidden flex flex-col justify-center relative">
      <style>{`
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-right {
          animation-name: marquee-right;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="absolute top-12 left-0 w-full text-center z-10">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <MessageSquareQuote className="text-[#07c160]" size={32} />
          用户反馈精选
        </h2>
        <p className="text-gray-500 mt-3 text-sm">感谢每一位用户的宝贵建议，马良因你们而更好</p>
      </div>

      <div className="flex flex-col gap-8 mt-24 transform -rotate-2 scale-105">
        <MarqueeRow items={row1} speed={45} />
        <MarqueeRow items={row2} speed={35} />
        <MarqueeRow items={row3} speed={50} />
      </div>
      
      {/* Gradient Overlays for smooth edges */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
