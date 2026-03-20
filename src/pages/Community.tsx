import { motion } from "framer-motion";
import { Plus, Heart, MessageCircle, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { mockFestivals, getCategoryColor } from "@/lib/index";

interface CommunityPost {
  id: string;
  author: string;
  avatar?: string;
  festivalTitle: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  date: string;
  category: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: "1",
    author: "김민수",
    festivalTitle: "진주 남강 유등축제",
    content: "올해 유등축제 정말 환상적이었어요! 남강에 떠 있는 수천 개의 등불이 만들어내는 야경이 너무 아름다웠습니다. 가족들과 함께 좋은 추억 만들었어요.",
    images: [mockFestivals[0].image],
    likes: 124,
    comments: 18,
    date: "2026.03.15",
    category: "전통문화",
  },
  {
    id: "2",
    author: "이지은",
    festivalTitle: "보령 머드축제",
    content: "머드 체험 정말 재미있었어요! 처음엔 망설였는데 막상 해보니 스트레스가 확 풀리더라구요. 피부도 좋아진 것 같고 최고!",
    images: [mockFestivals[1].image],
    likes: 89,
    comments: 12,
    date: "2026.03.14",
    category: "체험",
  },
  {
    id: "3",
    author: "박준호",
    festivalTitle: "화천 산천어축제",
    content: "얼음 위에서 산천어 낚시 체험 정말 신기했어요. 추웠지만 그만큼 재미있었고, 직접 잡은 산천어로 회 먹으니 맛이 일품이었습니다!",
    images: [mockFestivals[2].image],
    likes: 156,
    comments: 24,
    date: "2026.03.13",
    category: "겨울축제",
  },
  {
    id: "4",
    author: "최서연",
    festivalTitle: "전주 한옥마을 축제",
    content: "한옥마을의 전통 공연과 체험 프로그램이 정말 알차더라구요. 한복 입고 사진 찍기 좋은 포토존도 많고, 전통 음식도 맛있었어요.",
    images: [mockFestivals[3].image],
    likes: 203,
    comments: 31,
    date: "2026.03.12",
    category: "전통문화",
  },
  {
    id: "5",
    author: "정우진",
    festivalTitle: "부산 불꽃축제",
    content: "광안리 해변에서 본 불꽃놀이 정말 장관이었습니다! 음악과 함께 터지는 불꽃이 환상적이었어요. 내년에도 꼭 다시 가고 싶네요.",
    images: [mockFestivals[4].image],
    likes: 278,
    comments: 42,
    date: "2026.03.11",
    category: "불꽃축제",
  },
  {
    id: "6",
    author: "강혜진",
    festivalTitle: "안동 국제탈춤페스티벌",
    content: "세계 각국의 탈춤을 한자리에서 볼 수 있어서 좋았어요. 우리나라 전통 탈춤의 매력을 다시 느낄 수 있었던 시간이었습니다.",
    images: [mockFestivals[5].image],
    likes: 167,
    comments: 28,
    date: "2026.03.10",
    category: "전통문화",
  },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full py-12 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                커뮤니티
              </h1>
              <p className="text-muted-foreground">
                축제 후기와 사진을 공유하고 다른 사람들의 경험을 확인해보세요
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              글쓰기
            </Button>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {mockPosts.map((post) => (
              <motion.div key={post.id} variants={staggerItem}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.images[0]}
                      alt={post.festivalTitle}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {post.author}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {post.date}
                        </p>
                      </div>
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {post.festivalTitle}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-6 pt-4 border-t border-border">
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {post.comments}
                        </span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors ml-auto">
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm font-medium">공유</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              더 보기
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
