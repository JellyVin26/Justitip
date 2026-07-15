const fs = require('fs');
const files = [
  'src/app/trips/page.tsx',
  'src/app/seller/trips/[id]/page.tsx',
  'src/app/seller/settings/page.tsx',
  'src/app/seller/orders/page.tsx',
  'src/app/seller/listings/page.tsx',
  'src/app/seller/dashboard/page.tsx',
  'src/app/marketplace/page.tsx',
  'src/app/orders/page.tsx',
  'src/app/explore/page.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.split('<div className="max-w-6xl mx-auto px-8 py-10">').join('<div className="w-full max-w-6xl mx-auto px-8 py-10">');
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
});
