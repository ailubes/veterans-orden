import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel file
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exportToExcel(data: any[], filename: string, sheetName: string = 'Data') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) return;

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4A574' }, // Bronze accent color
  };

  // Add data rows
  data.forEach(item => {
    worksheet.addRow(headers.map(key => item[key]));
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, cell => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      maxLength = Math.max(maxLength, Math.min(cellLength, 50));
    });
    column.width = maxLength + 2;
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Export data to PDF file
 */
export function exportToPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  filename: string,
  title: string,
  columns?: string[]
) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Згенеровано: ${new Date().toLocaleString('uk-UA')}`, 14, 30);
  doc.text(`Всього записів: ${data.length}`, 14, 36);

  // Prepare table data
  const headers = columns || Object.keys(data[0] || {});
  const rows = data.map(item => headers.map(key => String(item[key] || '')));

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 42,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [212, 165, 116], // Accent color
      textColor: [245, 240, 232], // Canvas color
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242],
    },
    margin: { top: 42 },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Export members data with formatted fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exportMembersData(members: any[], format: 'excel' | 'pdf') {
  const formattedData = members.map(m => ({
    'Ім\'я': m.first_name,
    'Прізвище': m.last_name,
    'Email': m.email || '',
    'Роль': formatRole(m.role),
    'Статус': formatStatus(m.status),
    'План': formatTier(m.membership_tier),
    'Область': m.oblast?.name || '',
    'Бали': m.points || 0,
    'Дата реєстрації': new Date(m.created_at).toLocaleDateString('uk-UA'),
  }));

  const filename = `members-export-${new Date().toISOString().split('T')[0]}`;

  if (format === 'excel') {
    await exportToExcel(formattedData, filename, 'Члени');
  } else {
    exportToPDF(formattedData, filename, 'Мережа Вільних Людей - Експорт Членів');
  }
}

/**
 * Export analytics data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exportAnalyticsData(data: any, format: 'excel' | 'pdf') {
  const formattedData = [{
    'Всього членів': data.totalMembers || 0,
    'Активних': data.activeMembers || 0,
    'Нових за тиждень': data.newMembersWeek || 0,
    'Нових за місяць': data.newMembersMonth || 0,
    'Всього подій': data.totalEvents || 0,
    'Найближчих подій': data.upcomingEvents || 0,
    'Всього голосувань': data.totalVotes || 0,
    'Активних голосувань': data.activeVotes || 0,
    'Всього завдань': data.totalTasks || 0,
    'Виконаних завдань': data.completedTasks || 0,
  }];

  const filename = `analytics-export-${new Date().toISOString().split('T')[0]}`;

  if (format === 'excel') {
    await exportToExcel(formattedData, filename, 'Аналітика');
  } else {
    exportToPDF(formattedData, filename, 'Мережа Вільних Людей - Аналітика');
  }
}

// Helper formatters
function formatRole(role: string): string {
  const roles: Record<string, string> = {
    super_admin: 'Супер-адмін',
    admin: 'Адмін',
    regional_leader: 'Регіональний лідер',
    group_leader: 'Лідер групи',
    full_member: 'Повноцінний член',
    silent_member: 'Мовчазний член',
    prospect: 'Потенційний',
    free_viewer: 'Спостерігач',
  };
  return roles[role] || role;
}

function formatStatus(status: string): string {
  const statuses: Record<string, string> = {
    active: 'Активний',
    pending: 'На перевірці',
    suspended: 'Призупинено',
    churned: 'Відійшов',
  };
  return statuses[status] || status;
}

function formatTier(tier: string): string {
  const tiers: Record<string, string> = {
    patron_500: 'Патрон (500 грн)',
    supporter_200: 'Прихильник (200 грн)',
    supporter_100: 'Прихильник (100 грн)',
    basic_49: 'Базовий (49 грн)',
    free: 'Безкоштовний',
  };
  return tiers[tier] || tier;
}
