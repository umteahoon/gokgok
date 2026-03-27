import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Heart, Calendar, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockFestivals, getCategoryColor, getStatusBadge, type Festival } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
import { getCurrentUser, logout, type User as AuthUser } from "@/lib/login";
import { AuthDialog } from "@/components/Login";

export default function NotMyPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleAuthSuccess = () => {
    setCurrentUser(getCurrentUser());
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const savedFestivals = mockFestivals.slice(0, 4);
  const attendedFestivals = mockFestivals.slice(4, 7);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <motion.div
          className="container mx-auto px-4 py-48"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">로그인이 필요합니다</CardTitle>
              <CardDescription className="text-base">
                곡곡의 모든 기능을 이용하려면 로그인해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setAuthDialogOpen(true)}
              >
                <LogIn className="w-5 h-5 mr-2" />
                로그인하기
              </Button>
              <p className="text-sm text-muted-foreground">
                로그인하고 곡곡의 모든 기능을 이용해보세요
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <AuthDialog
          isOpen={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }
}
    