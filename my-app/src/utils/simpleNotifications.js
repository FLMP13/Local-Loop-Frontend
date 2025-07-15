// Minimal force action notification system

export const saveForceNotification = (userEmail, { _id, item, borrower, lender, totalAmount, deposit }, actionType) => {
  localStorage.setItem(`force_${userEmail}`, JSON.stringify({
    id: _id,
    type: actionType,
    time: Date.now(),
    data: { 
      title: item?.title || 'Item', 
      borrower: borrower?.nickname || borrower?.email, 
      lender: lender?.nickname || lender?.email,
      total: totalAmount, 
      deposit 
    }
  }));
};

export const getForceNotification = (userEmail) => {
  const stored = localStorage.getItem(`force_${userEmail}`);
  if (!stored) return null;
  
  const notif = JSON.parse(stored);
  if (Date.now() - notif.time > 24 * 60 * 60 * 1000) return null; // 24h limit
  
  localStorage.removeItem(`force_${userEmail}`);
  return notif;
};

export const createMessage = (type, data) => {
  if (type === 'pickup') {
    const fee = data.total - data.deposit;
    const share = fee * 0.95;
    return {
      title: '💰 Payment Received!',
      text: `${data.borrower} forced pickup of "${data.title}". Your share: €${share.toFixed(2)}`,
      variant: 'success'
    };
  }
  
  return {
    title: '📦 Item Returned!', 
    text: `${data.lender} forced return of "${data.title}". Inspection and deposit pending.`,
    variant: 'info'
  };
};
