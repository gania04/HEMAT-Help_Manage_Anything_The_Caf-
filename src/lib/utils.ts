export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export const redirectWithSwCleanup = (url: string) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      for (const reg of regs) {
        await reg.unregister();
      }
      globalThis.location.href = url;
    }).catch(() => {
      globalThis.location.href = url;
    });
  } else {
    globalThis.location.href = url;
  }
};
