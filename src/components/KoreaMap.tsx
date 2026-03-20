import { motion } from 'framer-motion';

interface KoreaMapProps {
  onRegionSelect: (region: string) => void;
  selectedRegion?: string;
}

const regions = [
  { id: 'seoul', name: '서울특별시', path: 'M250,180 L270,180 L270,200 L250,200 Z' },
  { id: 'busan', name: '부산광역시', path: 'M320,280 L340,280 L340,300 L320,300 Z' },
  { id: 'daegu', name: '대구광역시', path: 'M290,250 L310,250 L310,270 L290,270 Z' },
  { id: 'incheon', name: '인천광역시', path: 'M220,180 L240,180 L240,200 L220,200 Z' },
  { id: 'gwangju', name: '광주광역시', path: 'M200,280 L220,280 L220,300 L200,300 Z' },
  { id: 'daejeon', name: '대전광역시', path: 'M240,230 L260,230 L260,250 L240,250 Z' },
  { id: 'ulsan', name: '울산광역시', path: 'M330,260 L350,260 L350,280 L330,280 Z' },
  { id: 'sejong', name: '세종특별자치시', path: 'M235,225 L255,225 L255,235 L235,235 Z' },
  { id: 'gyeonggi', name: '경기도', path: 'M200,150 L280,150 L280,210 L200,210 Z' },
  { id: 'gangwon', name: '강원도', path: 'M280,120 L360,120 L360,200 L280,200 Z' },
  { id: 'chungbuk', name: '충청북도', path: 'M240,210 L300,210 L300,250 L240,250 Z' },
  { id: 'chungnam', name: '충청남도', path: 'M180,210 L240,210 L240,260 L180,260 Z' },
  { id: 'jeonbuk', name: '전라북도', path: 'M180,260 L250,260 L250,300 L180,300 Z' },
  { id: 'jeonnam', name: '전라남도', path: 'M150,300 L250,300 L250,360 L150,360 Z' },
  { id: 'gyeongbuk', name: '경상북도', path: 'M280,200 L360,200 L360,280 L280,280 Z' },
  { id: 'gyeongnam', name: '경상남도', path: 'M260,280 L350,280 L350,340 L260,340 Z' },
  { id: 'jeju', name: '제주특별자치도', path: 'M180,380 L260,380 L260,420 L180,420 Z' },
];

export function KoreaMap({ onRegionSelect, selectedRegion }: KoreaMapProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full max-w-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {regions.map((region) => (
            <motion.path
              key={region.id}
              d={region.path}
              fill={selectedRegion === region.id ? 'oklch(0.48 0.18 240)' : 'oklch(0.97 0.003 240)'}
              stroke="oklch(0.92 0.005 240)"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              whileHover={{ opacity: 0.7, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegionSelect(region.id)}
              style={{
                transformOrigin: 'center',
              }}
            >
              <title>{region.name}</title>
            </motion.path>
          ))}
        </g>
        {regions.map((region) => {
          const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathElement.setAttribute('d', region.path);
          const bbox = pathElement.getBBox?.() || { x: 0, y: 0, width: 0, height: 0 };
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;

          return (
            <text
              key={`label-${region.id}`}
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium pointer-events-none select-none"
              fill="oklch(0.48 0.01 240)"
            >
              {region.name.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '')}
            </text>
          );
        })}
      </svg>
    </div>
  );
}