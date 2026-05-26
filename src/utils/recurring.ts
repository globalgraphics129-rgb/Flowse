import { Transaction, RecurringTransaction } from '../types';

export function getNextOccurrenceDate(baseDate: Date, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date {
  const next = new Date(baseDate.getTime());
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export function processRecurringTransactions(
  recurringList: RecurringTransaction[],
  currentDate: Date
): {
  newTransactions: Transaction[];
  updatedRecurringList: RecurringTransaction[];
} {
  const newTransactions: Transaction[] = [];
  const updatedRecurringList = recurringList.map(rec => {
    if (!rec.isActive) return rec;

    let updatedRec = { ...rec };
    let currentOccurrenceDate = updatedRec.lastGeneratedDate 
      ? new Date(updatedRec.lastGeneratedDate) 
      : new Date(updatedRec.startDate);

    const todayStr = currentDate.toISOString().split('T')[0];
    const getCompareDateOnlyStr = (d: Date) => d.toISOString().split('T')[0];

    // While loop to generate all occurrences up to today
    let running = true;
    let occurrencesGenerated = 0;
    
    // Safety guard to prevent infinite looping
    while (running && occurrencesGenerated < 100) {
      const occurrenceDateOnlyStr = getCompareDateOnlyStr(currentOccurrenceDate);
      
      // Check if this occurrence is in the future
      if (occurrenceDateOnlyStr > todayStr) {
        running = false;
        break;
      }
      
      // If we already generated up to lastGeneratedDate, advance to next expected date and continue
      if (updatedRec.lastGeneratedDate && getCompareDateOnlyStr(new Date(updatedRec.lastGeneratedDate)) === occurrenceDateOnlyStr) {
        currentOccurrenceDate = getNextOccurrenceDate(currentOccurrenceDate, updatedRec.frequency);
        continue;
      }

      // Generate transaction details
      const finalOccurrenceStr = occurrenceDateOnlyStr + "T09:00:00.000Z";
      const txId = 'tx_rec_' + updatedRec.id + '_' + occurrencesGenerated + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      
      newTransactions.push({
        id: txId,
        amount: updatedRec.amount,
        description: updatedRec.description,
        category: updatedRec.category,
        type: updatedRec.type,
        date: finalOccurrenceStr,
        notes: updatedRec.notes ? `${updatedRec.notes} (Recurring Instance)` : 'Recurring transaction instance'
      });

      updatedRec.lastGeneratedDate = finalOccurrenceStr;
      occurrencesGenerated++;
      
      currentOccurrenceDate = getNextOccurrenceDate(currentOccurrenceDate, updatedRec.frequency);
    }

    return updatedRec;
  });

  return { newTransactions, updatedRecurringList };
}
