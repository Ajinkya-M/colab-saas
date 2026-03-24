import { Deal, DealStatus } from '@/data/mockDeals';
import DealCard from './DealCard';

interface KanbanColumnProps {
  title: string;
  status: DealStatus;
  deals: Deal[];
  dotColor: string;
}

export default function KanbanColumn({ title, status, deals, dotColor }: KanbanColumnProps) {
  const filteredDeals = deals.filter((d) => d.status === status);

  return (
    <div className="min-w-[300px] w-1/4 flex flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
          <h3 className="font-label text-xs uppercase tracking-widest text-secondary font-bold">{title}</h3>
          <span className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-bold">{filteredDeals.length}</span>
        </div>
        <button className="text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Deal Cards */}
      {filteredDeals.map((deal) => (
        <DealCard key={deal.id} deal={deal} isInProduction={status === 'in_production'} />
      ))}

      {/* Add Task Button (only for in_production column) */}
      {status === 'in_production' && (
        <button className="w-full py-4 border-2 border-dashed border-outline-variant/40 rounded-xl text-outline hover:text-primary hover:border-primary/40 hover:bg-white transition-all flex items-center justify-center gap-2 text-sm font-bold">
          <span className="material-symbols-outlined">add</span>
          <span>Add Task</span>
        </button>
      )}
    </div>
  );
}
