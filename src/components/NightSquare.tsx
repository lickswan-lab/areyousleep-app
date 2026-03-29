"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTION_COLORS } from "@/lib/mood-descriptions";
import { getEmotionLabel } from "@/lib/store";

interface NightSquarePost {
  id: string;
  content: string;
  emotion?: string;
  stars: number;
  created_at: string;
}

interface NightSquareProps {
  onClose: () => void;
}

// 本地版深夜广场（Supabase 上线后切换为云端）
const SQUARE_KEY = "chuangqian_night_square";

function getLocalPosts(): NightSquarePost[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SQUARE_KEY);
  return data ? JSON.parse(data) : getDefaultPosts();
}

function saveLocalPosts(posts: NightSquarePost[]) {
  localStorage.setItem(SQUARE_KEY, JSON.stringify(posts));
}

function addLocalPost(content: string, emotion?: string): NightSquarePost {
  const post: NightSquarePost = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    content, emotion, stars: 0,
    created_at: new Date().toISOString(),
  };
  const posts = getLocalPosts();
  posts.unshift(post);
  saveLocalPosts(posts);
  return post;
}

function starLocalPost(id: string) {
  const posts = getLocalPosts();
  const post = posts.find(p => p.id === id);
  if (post) { post.stars++; saveLocalPosts(posts); }
}

// 预设一些温暖的匿名帖子（冷启动）
function getDefaultPosts(): NightSquarePost[] {
  return [
    { id: "d1", content: "今晚的月亮好圆，突然就不那么难过了", emotion: "calm", stars: 23, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "d2", content: "加班到现在才回家，但猫在门口等我", emotion: "warm", stars: 47, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "d3", content: "失眠的第三天，脑子里全是她", emotion: "melancholy", stars: 15, created_at: new Date(Date.now() - 10800000).toISOString() },
    { id: "d4", content: "明天的面试好紧张，但我告诉自己已经准备好了", emotion: "anxious", stars: 31, created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: "d5", content: "刚才哭了一场，现在好多了", emotion: "heavy", stars: 38, created_at: new Date(Date.now() - 18000000).toISOString() },
    { id: "d6", content: "有时候觉得深夜才是真正属于自己的时间", emotion: "calm", stars: 52, created_at: new Date(Date.now() - 21600000).toISOString() },
    { id: "d7", content: "想家了", emotion: "melancholy", stars: 29, created_at: new Date(Date.now() - 25200000).toISOString() },
    { id: "d8", content: "今天做了一件很勇敢的事，虽然结果不怎么样", emotion: "hopeful", stars: 41, created_at: new Date(Date.now() - 28800000).toISOString() },
  ];
}

export default function NightSquare({ onClose }: NightSquareProps) {
  const [posts, setPosts] = useState<NightSquarePost[]>([]);
  const [input, setInput] = useState("");
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  useEffect(() => { setPosts(getLocalPosts()); }, []);

  const handlePost = () => {
    if (!input.trim()) return;
    addLocalPost(input.trim());
    setInput("");
    setPosts(getLocalPosts());
  };

  const handleStar = (id: string) => {
    if (starredIds.has(id)) return;
    starLocalPost(id);
    setStarredIds(new Set([...starredIds, id]));
    setPosts(getLocalPosts());
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  const onlineCount = 847 + Math.floor(Math.random() * 200); // 模拟在线人数

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom"
    >
      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={onClose} className="text-warm-300/40 text-sm press-feedback">← 返回</button>
          <h2 className="text-warm-100 text-base">深夜广场</h2>
          <div className="w-10" />
        </div>

        {/* Online count */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(100,180,140,0.1)", border: "1px solid rgba(100,180,140,0.15)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
            <span className="text-warm-300/50 text-xs">此刻有 {onlineCount} 人也睡不着</span>
          </motion.div>
        </motion.div>

        {/* Input */}
        <div className="mb-6 rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            placeholder="今晚想说点什么..."
            maxLength={200}
            rows={2}
            className="w-full bg-transparent text-warm-100 text-sm placeholder:text-warm-300/20
              focus:outline-none resize-none mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-warm-300/20 text-[10px]">{input.length}/200 · 匿名发布</span>
            <button onClick={handlePost} disabled={!input.trim()}
              className="text-accent/70 text-xs px-4 py-1.5 rounded-full glass press-feedback disabled:opacity-30">
              发出去
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-3">
          <AnimatePresence>
            {posts.map((post, i) => {
              const color = post.emotion
                ? EMOTION_COLORS[post.emotion as keyof typeof EMOTION_COLORS]
                : "rgba(130,145,165,0.5)";
              const starred = starredIds.has(post.id);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <p className="text-warm-100 text-sm leading-relaxed mb-3">{post.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.emotion && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: color?.replace(/[\d.]+\)$/, "0.1)"), color: color?.replace(/[\d.]+\)$/, "0.6)") }}>
                          {getEmotionLabel(post.emotion)}
                        </span>
                      )}
                      <span className="text-warm-300/20 text-[10px]">{formatTime(post.created_at)}</span>
                    </div>

                    <button
                      onClick={() => handleStar(post.id)}
                      className={`flex items-center gap-1 text-xs press-feedback transition-all
                        ${starred ? "text-yellow-400/70" : "text-warm-300/25"}`}
                    >
                      <span>{starred ? "⭐" : "☆"}</span>
                      <span>{post.stars + (starred ? 1 : 0)}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
