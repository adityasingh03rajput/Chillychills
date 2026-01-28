import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to format currency without locale issues
const formatCurrency = (amount: number) => {
    return `Rs ${amount}`;
};

export const exportToExcel = (balance: any, summary?: any) => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = [
        ['Chilly Chills - Monthly Financial Report'],
        [`Month: ${getMonthName(balance.month)} ${balance.year}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['Metric', 'Value'],
        ['Total Revenue', formatCurrency(balance.totalRevenue)],
        ['Total Orders', balance.totalOrders],
        ['Completed Orders', balance.completedOrders],
        ['Cancelled Orders', balance.cancelledOrders],
        ['Refunded Amount', formatCurrency(balance.refundedAmount)],
        ['Average Order Value', formatCurrency(balance.averageOrderValue)],
        ['Completion Rate', `${balance.totalOrders > 0 ? Math.round((balance.completedOrders / balance.totalOrders) * 100) : 0}%`],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Overview');

    // Sheet 2: Revenue by Category
    if (balance.revenueByCategory && Object.keys(balance.revenueByCategory).length > 0) {
        const categoryData = [
            ['Category', 'Revenue', 'Percentage'],
            ...Object.entries(balance.revenueByCategory).map(([category, revenue]: [string, any]) => [
                category,
                formatCurrency(revenue),
                `${((revenue / balance.totalRevenue) * 100).toFixed(1)}%`
            ])
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Revenue by Category');
    }

    // Sheet 3: Peak Hours
    if (balance.peakHours && Object.keys(balance.peakHours).length > 0) {
        const peakData = [
            ['Hour', 'Orders'],
            ...Object.entries(balance.peakHours)
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([hour, count]) => [hour, count])
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(peakData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Peak Hours');
    }

    // Sheet 4: Branch Performance
    if (balance.ordersByBranch && Object.keys(balance.ordersByBranch).length > 0) {
        const branchData = [
            ['Branch', 'Orders'],
            ...Object.entries(balance.ordersByBranch).map(([branch, orders]) => [branch, orders])
        ];
        const ws4 = XLSX.utils.aoa_to_sheet(branchData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Branch Performance');
    }

    // Download
    const fileName = `ChillyChills_Report_${balance.month}_${balance.year}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

export const exportToPDF = (balance: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Chilly Chills', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Monthly Financial Report', pageWidth / 2, 30, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${getMonthName(balance.month)} ${balance.year}`, pageWidth / 2, 38, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 44, { align: 'center' });

    let currentY = 55;

    // Overview Table
    const overviewData = [
        ['Total Revenue', formatCurrency(balance.totalRevenue)],
        ['Total Orders', balance.totalOrders.toString()],
        ['Completed Orders', balance.completedOrders.toString()],
        ['Cancelled Orders', balance.cancelledOrders.toString()],
        ['Refunded Amount', formatCurrency(balance.refundedAmount)],
        ['Average Order Value', formatCurrency(balance.averageOrderValue)],
        ['Completion Rate', `${balance.totalOrders > 0 ? Math.round((balance.completedOrders / balance.totalOrders) * 100) : 0}%`],
    ];

    autoTable(doc, {
        head: [['Metric', 'Value']],
        body: overviewData,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [255, 122, 47] },
        styles: { fontSize: 10 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Revenue by Category
    if (balance.revenueByCategory && Object.keys(balance.revenueByCategory).length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Revenue by Category', 14, currentY);
        currentY += 5;

        const categoryData = Object.entries(balance.revenueByCategory).map(([category, revenue]: [string, any]) => [
            category,
            formatCurrency(revenue),
            `${((revenue / balance.totalRevenue) * 100).toFixed(1)}%`
        ]);

        autoTable(doc, {
            head: [['Category', 'Revenue', 'Percentage']],
            body: categoryData,
            startY: currentY,
            theme: 'striped',
            headStyles: { fillColor: [52, 199, 89] },
            styles: { fontSize: 9 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Peak Hours
    if (balance.peakHours && Object.keys(balance.peakHours).length > 0) {
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Peak Hours', 14, currentY);
        currentY += 5;

        const peakData = Object.entries(balance.peakHours)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 10)
            .map(([hour, count]) => [hour, count.toString()]);

        autoTable(doc, {
            head: [['Hour', 'Orders']],
            body: peakData,
            startY: currentY,
            theme: 'striped',
            headStyles: { fillColor: [255, 122, 47] },
            styles: { fontSize: 9 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Branch Performance
    if (balance.ordersByBranch && Object.keys(balance.ordersByBranch).length > 0) {
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Branch Performance', 14, currentY);
        currentY += 5;

        const branchData = Object.entries(balance.ordersByBranch).map(([branch, orders]) => [
            branch,
            orders.toString()
        ]);

        autoTable(doc, {
            head: [['Branch', 'Orders']],
            body: branchData,
            startY: currentY,
            theme: 'striped',
            headStyles: { fillColor: [52, 199, 89] },
            styles: { fontSize: 9 },
        });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Download
    const fileName = `ChillyChills_Report_${balance.month}_${balance.year}.pdf`;
    doc.save(fileName);
};

const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
};
