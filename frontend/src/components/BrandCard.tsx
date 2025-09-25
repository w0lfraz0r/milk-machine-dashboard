import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface BrandCardProps {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  keys: string[];
  data: Record<string, number | undefined>;
}

function BrandCard({ title, imageUrl, linkUrl, keys, data }: BrandCardProps) {
  return (
    <Card className="w-full max-w-xs mx-auto flex flex-row items-center p-2 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white rounded-xl">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center w-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-20 h-20 object-contain mb-3 rounded-full border border-gray-200 bg-gray-50"
        />
        <h3 className="text-lg font-semibold text-center mb-2 text-black-700 hover:underline">{title}</h3>
      </a>
      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {keys.map((key) => (
          <Badge key={key} variant="secondary">
            {key.toUpperCase()} : {data[key] ?? '-'}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

export default BrandCard;