import { Deal } from '@/data/mockDeals';

interface DealCardProps {
  deal: Deal;
  isInProduction?: boolean;
  onDragStart?: (dealId: string) => void;
  onDragEnd?: () => void;
}

const priorityColors: Record<string, string> = {
  high: 'bg-error',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
};

export default function DealCard({ deal, isInProduction = false, onDragStart, onDragEnd }: DealCardProps) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', deal.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart?.(deal.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      className={`bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow group cursor-grab ${
        isInProduction ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      {/* Icon + Priority */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInProduction ? 'bg-primary/5' : 'bg-surface'}`}>
          <span className="material-symbols-outlined text-primary">{deal.icon}</span>
        </div>
        <span className={`w-2 h-2 rounded-full ${priorityColors[deal.priority]}`} title={`${deal.priority} Priority`}></span>
      </div>

      {/* Content */}
      <h4 className="font-headline text-on-surface font-bold text-lg mb-1 leading-tight">{deal.projectName}</h4>
      <p className="text-secondary text-sm font-medium mb-4">{deal.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
        <span className="font-headline font-bold text-primary">
          ${deal.budget.toLocaleString()}
        </span>
        <img
          alt={`${deal.brandName} contact`}
          className="w-7 h-7 rounded-full object-cover"
          src={deal.contactAvatar}
        />
      </div>
    </div>
  );
}
