import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner@2.0.3';

interface PDFDownloaderProps {
  orders: any[];
  menu: any[];
  branch: string;
}

export const PDFDownloader = ({ orders, menu, branch }: PDFDownloaderProps) => {
  const downloadPDF = () => {
    // Calculate analytics
    const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'rejected');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayOrders = orders.filter(o => 
      new Date(o.createdAt).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Generate text report
    const reportText = `
CHILLY CHILLS SMART CANTEEN
Analytics Report - Branch ${branch}
Generated: ${new Date().toLocaleString()}

========================================
REVENUE SUMMARY
========================================
Total Revenue: ₹${totalRevenue.toLocaleString()}
Today's Revenue: ₹${todayRevenue.toLocaleString()}
Total Orders: ${orders.length}
Today's Orders: ${todayOrders.length}

========================================
ORDER BREAKDOWN
========================================
Completed: ${orders.filter(o => o.status === 'completed').length}
Cancelled: ${orders.filter(o => o.status === 'cancelled').length}
Rejected: ${orders.filter(o => o.status === 'rejected').length}
Active: ${orders.filter(o => ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)).length}

========================================
MENU ITEMS
========================================
Total Items: ${menu.length}
Available: ${menu.filter(m => m.available).length}
Out of Stock: ${menu.filter(m => !m.available).length}

========================================
CATEGORY BREAKDOWN
========================================
${Array.from(new Set(menu.map(m => m.category))).map(cat => 
  `${cat}: ${menu.filter(m => m.category === cat).length} items`
).join('\n')}

========================================
END OF REPORT
========================================
    `;

    // Create blob and download
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chilly_Chills_Report_Branch_${branch}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully!');
  };

  return (
    <Button 
      onClick={downloadPDF}
      className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-300 gap-2 hover:bg-blue-500/30"
    >
      <Download size={16} /> Download Full Report (TXT)
    </Button>
  );
};
