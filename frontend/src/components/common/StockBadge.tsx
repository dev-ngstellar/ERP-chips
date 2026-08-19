import React from 'react';
import { Tag } from 'antd';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StockBadgeProps {
  currentStock: number;
  minStockLevel: number;
  unit: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  currentStock,
  minStockLevel,
  unit,
}) => {
  if (currentStock <= 0) {
    return (
      <Tag
        icon={<XCircle className="inline-block w-3.5 h-3.5 mr-1" />}
        color="error"
        className="font-medium px-2 py-0.5"
      >
        Out of Stock (0 {unit})
      </Tag>
    );
  }

  if (currentStock <= minStockLevel) {
    return (
      <Tag
        icon={<AlertTriangle className="inline-block w-3.5 h-3.5 mr-1" />}
        color="warning"
        className="font-medium px-2 py-0.5"
      >
        Low Stock ({currentStock} {unit})
      </Tag>
    );
  }

  return (
    <Tag
      icon={<CheckCircle className="inline-block w-3.5 h-3.5 mr-1" />}
      color="success"
      className="font-medium px-2 py-0.5"
    >
      In Stock ({currentStock} {unit})
    </Tag>
  );
};
