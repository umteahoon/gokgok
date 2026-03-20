import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import type { Festival } from "@/lib/index";
import { getCategoryColor, getStatusBadge } from "@/lib/index";
import { hoverLift } from "@/lib/motion";

interface FestivalCardProps {
  festival: Festival;
  variant?: "default" | "compact";
}

export function FestivalCard({ festival, variant = "default" }: FestivalCardProps) {
  const statusBadge = getStatusBadge(festival.status);
  const categoryColor = getCategoryColor(festival.category);

  if (variant === "compact") {
    return (
      <motion.div
        variants={hoverLift}
        initial="rest"
        whileHover="hover"
        className="bg-card rounded-2xl overflow-hidden border border-border cursor-pointer"
      >
        <div className="aspect-video relative overflow-hidden">
          <img
            src={festival.image}
            alt={festival.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-1">
            {festival.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{festival.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span className="line-clamp-1">{festival.date}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="bg-card rounded-2xl overflow-hidden border border-border cursor-pointer"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={festival.image}
          alt={festival.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusBadge.className} backdrop-blur-sm`}>
            {statusBadge.label}
          </span>
        </div>
        {festival.rank && (
          <div className="absolute top-4 left-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">{festival.rank}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${categoryColor}`}>
            {festival.category}
          </span>
        </div>
        <h3 className="font-semibold text-xl text-foreground mb-3 line-clamp-2">
          {festival.title}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{festival.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{festival.date}</span>
          </div>
        </div>
        {festival.description && (
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {festival.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}