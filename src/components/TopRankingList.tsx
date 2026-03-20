import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Festival } from "@/lib/index";
import { ROUTE_PATHS } from "@/lib/index";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface TopRankingListProps {
  festivals: Festival[];
}

export function TopRankingList({ festivals }: TopRankingListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {festivals.slice(0, 10).map((festival, index) => {
        const rank = festival.rank || index + 1;
        return (
          <motion.div key={festival.id} variants={staggerItem}>
            <Link
              to={`${ROUTE_PATHS.SEARCH}?id=${festival.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {rank}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {festival.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {festival.location}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
