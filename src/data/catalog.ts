import { localized as l, type Product } from '../types/domain';
import { productPhotos } from './photography';
export const categories = [
  { id: 'tshirts', name: l('Áo thun', 'T-shirts', '티셔츠', 'T 恤', 'Tシャツ') },
  { id: 'shirts', name: l('Sơ mi', 'Shirts', '셔츠', '衬衫', 'シャツ') },
  { id: 'knitwear', name: l('Áo dệt kim', 'Knitwear', '니트', '针织衫', 'ニット') },
  { id: 'jackets', name: l('Áo khoác', 'Jackets', '재킷', '外套', 'ジャケット') },
  { id: 'trousers', name: l('Quần', 'Trousers', '바지', '裤装', 'パンツ') },
  { id: 'accessories', name: l('Phụ kiện', 'Accessories', '액세서리', '配饰', 'アクセサリー') },
];
export const colors = [
  { id: 'ink', hex: '#292c2d', name: l('Đen mực', 'Ink', '잉크 블랙', '墨黑', 'インク') },
  { id: 'sand', hex: '#bba98a', name: l('Cát', 'Sand', '샌드', '沙色', 'サンド') },
  { id: 'olive', hex: '#6b735c', name: l('Xanh ô liu', 'Olive', '올리브', '橄榄绿', 'オリーブ') },
  { id: 'cream', hex: '#e6dfcd', name: l('Kem', 'Cream', '크림', '奶油色', 'クリーム') },
  { id: 'rust', hex: '#a05840', name: l('Nâu gạch', 'Rust', '러스트', '锈红', 'ラスト') },
  { id: 'blue', hex: '#586d83', name: l('Xanh lam', 'Blue', '블루', '蓝色', 'ブルー') },
];
export const collections = [
  {
    id: 'everyday',
    name: l('Nhịp thường ngày', 'Everyday rhythm', '일상의 리듬', '日常节奏', '日々のリズム'),
    description: l(
      'Thiết kế thiết yếu, thoải mái từ sáng đến tối.',
      'Thoughtful essentials from morning to evening.',
      '아침부터 저녁까지 편안한 에센셜.',
      '从清晨到夜晚，舒适的日常单品。',
      '朝から夜まで、心地よい定番。',
    ),
  },
  {
    id: 'city',
    name: l('Dạo phố', 'City lines', '도시의 선', '都市线条', '街のライン'),
    description: l(
      'Phom dáng gọn gàng cho nhịp sống thành thị.',
      'Clean silhouettes for life in the city.',
      '도시의 일상을 위한 깔끔한 실루엣.',
      '为都市生活打造利落廓形。',
      '街の日常に似合う、すっきりしたシルエット。',
    ),
  },
  {
    id: 'weekend',
    name: l('Cuối tuần tự do', 'Off duty', '자유로운 주말', '闲适周末', '自由な週末'),
    description: l(
      'Thả lỏng với những lớp trang phục mềm nhẹ.',
      'Unwind in soft, easy layers.',
      '부드럽고 가벼운 레이어로 편안하게.',
      '柔软轻盈的层次，让身心放松。',
      'やわらかな重ね着でリラックス。',
    ),
  },
  {
    id: 'studio',
    name: l(
      'Xưởng sáng tạo',
      'Studio studies',
      '스튜디오 스터디',
      '工作室灵感',
      'スタジオ・スタディ',
    ),
    description: l(
      'Kết cấu tinh tế và sắc màu trầm ấm.',
      'Quiet textures and warm, grounded colors.',
      '섬세한 질감과 차분한 따뜻한 색상.',
      '细腻肌理与温暖沉静的色彩。',
      '繊細な質感と、落ち着いた温かな色。',
    ),
  },
];
const descriptors = [
  l('Cotton mềm', 'Soft cotton', '소프트 코튼', '柔软棉质', 'ソフトコットン'),
  l('Phom rộng', 'Relaxed', '릴랙스', '宽松', 'リラックス'),
  l('Dệt gân', 'Ribbed', '리브', '罗纹', 'リブ'),
  l('Tối giản', 'Minimal', '미니멀', '极简', 'ミニマル'),
  l('Cấu trúc', 'Structured', '구조적', '挺括', 'ストラクチャー'),
  l('Nhẹ thoáng', 'Lightweight', '라이트', '轻盈', 'ライトウェイト'),
  l('Cổ điển', 'Classic', '클래식', '经典', 'クラシック'),
  l('Dáng thẳng', 'Straight cut', '스트레이트', '直线剪裁', 'ストレート'),
];
const accessoryNames = [
  l('Túi tote Cotton', 'Cotton tote bag', '코튼 토트백', '棉质托特包', 'コットントートバッグ'),
  l('Mũ lưỡi trai Everyday', 'Everyday cap', '에브리데이 캡', '日常棒球帽', 'エブリデイキャップ'),
  l('Khăn choàng dệt gân', 'Ribbed scarf', '리브 스카프', '罗纹围巾', 'リブマフラー'),
  l('Thắt lưng tối giản', 'Minimal belt', '미니멀 벨트', '极简腰带', 'ミニマルベルト'),
  l('Ba lô Studio', 'Studio backpack', '스튜디오 백팩', '工作室背包', 'スタジオバックパック'),
  l(
    'Túi đeo chéo nhẹ',
    'Lightweight crossbody bag',
    '라이트 크로스백',
    '轻盈斜挎包',
    'ライトクロスボディバッグ',
  ),
  l(
    'Tất cotton cổ điển',
    'Classic cotton socks',
    '클래식 코튼 양말',
    '经典棉袜',
    'クラシックコットンソックス',
  ),
  l('Mũ len City', 'City beanie', '시티 비니', '都市针织帽', 'シティビーニー'),
];
export const products: Product[] = categories.flatMap((cat, ci) =>
  descriptors.map((d, di) => {
    const n = ci * 8 + di + 1,
      id = `p-${String(n).padStart(3, '0')}`,
      basePriceVnd = 199000 + ci * 95000 + di * 20000;
    const variants = (ci === 5 ? colors.slice(0, 1) : colors.slice(0, 3)).flatMap((color, c) =>
      (ci === 5 ? ['ONE_SIZE'] : ['S', 'M', 'L', 'XL', 'XXL']).map((size, s) => ({
        id: `${id}-${color.id}-${size}`,
        productId: id,
        sku: `FLX-${n}-${c}-${size}`,
        colorId: color.id,
        size,
        stock: n === 48 ? 0 : (n + s + c) % 9 === 0 ? 0 : 3 + ((n + s + c) % 10),
        ...(di === 3 && s === 1 ? { priceOverrideVnd: basePriceVnd + 20000 } : {}),
      })),
    );
    return {
      keywords: cat.name,
      id,
      slug: `fluivix-${cat.id}-${di + 1}`,
      sku: `FLX-${String(n).padStart(3, '0')}`,
      categoryId: cat.id,
      collectionIds: [collections[di % 4].id],
      name:
        ci === 5
          ? accessoryNames[di]
          : l(
              `${cat.name.vi} ${d.vi}`,
              `${d.en} ${cat.name.en}`,
              `${d.ko} ${cat.name.ko}`,
              `${d['zh-CN']}${cat.name['zh-CN']}`,
              `${d.ja}${cat.name.ja}`,
            ),
      description: l(
        `${cat.name.vi} ${d.vi.toLowerCase()}, phom dễ mặc cho tủ đồ hằng ngày. Đường may gọn và tông màu dễ phối.`,
        `${d.en} ${cat.name.en.toLowerCase()} with an easy silhouette for your everyday wardrobe. Clean seams and versatile tones.`,
        `${d.ko} ${cat.name.ko}. 일상에 편안한 실루엣, 깔끔한 봉제와 코디하기 좋은 색상.`,
        `${d['zh-CN']}${cat.name['zh-CN']}，舒适廓形适合日常衣橱。整洁缝线与百搭色调。`,
        `${d.ja}${cat.name.ja}。毎日に心地よいシルエット、丁寧な縫製と合わせやすいカラー。`,
      ),
      materials: l(
        'Cotton pha sợi tái chế, mềm và bền. Thành phần minh họa.',
        'Cotton and recycled fiber blend, soft and durable. Illustrative composition.',
        '부드럽고 튼튼한 코튼·재생 섬유 혼방. 예시 소재입니다.',
        '棉与再生纤维混纺，柔软耐穿。面料成分仅供示例。',
        'コットンと再生繊維の混紡。柔らかく丈夫なサンプル素材。',
      ),
      care: l(
        'Giặt nhẹ ở 30°C. Phơi nơi thoáng mát, không tẩy.',
        'Gentle wash at 30°C. Air dry in shade; do not bleach.',
        '30°C에서 약하게 세탁. 그늘 건조, 표백 금지.',
        '30°C 轻柔洗涤，阴凉通风处晾干，不可漂白。',
        '30°Cでやさしく洗濯。陰干し、漂白不可。',
      ),
      basePriceVnd,
      ...(di % 3 === 0 ? { compareAtPriceVnd: basePriceVnd + 100000 } : {}),
      popularity: 1000 - n * 7,
      createdAt: new Date(Date.UTC(2026, 8, di + ci + 1)).toISOString(),
      imageUrls: productPhotos(id, cat.id),
      variants,
    };
  }),
);
export const findProduct = (id: string) => products.find((p) => p.id === id);
export const findVariant = (id: string) =>
  products.flatMap((p) => p.variants).find((v) => v.id === id);
export const unitPrice = (product: Product, variantId: string) =>
  product.variants.find((v) => v.id === variantId)?.priceOverrideVnd ?? product.basePriceVnd;
export const variantImage = (product: Product, variantId: string) => {
  const color = product.variants.find((v) => v.id === variantId)?.colorId;
  const index = [...new Set(product.variants.map((v) => v.colorId))].indexOf(color ?? '');
  return product.imageUrls[Math.max(0, index)] ?? product.imageUrls[0];
};
export const displayPrice = (p: Product) =>
  Math.min(...p.variants.filter((v) => v.stock > 0).map((v) => unitPrice(p, v.id)), p.basePriceVnd);
export function validateCatalog() {
  const variants = products.flatMap((p) => p.variants);
  return (
    products.length >= 48 &&
    new Set(products.map((p) => p.id)).size === products.length &&
    new Set(products.map((p) => p.sku)).size === products.length &&
    new Set(variants.map((v) => v.id)).size === variants.length &&
    new Set(variants.map((v) => v.sku)).size === variants.length &&
    new Set(products.map((p) => p.slug)).size === products.length &&
    products.every(
      (p) =>
        Number.isSafeInteger(p.basePriceVnd) &&
        p.basePriceVnd >= 0 &&
        p.variants.every(
          (v) =>
            v.productId === p.id &&
            Number.isInteger(v.stock) &&
            v.stock >= 0 &&
            (v.priceOverrideVnd === undefined ||
              (Number.isSafeInteger(v.priceOverrideVnd) && v.priceOverrideVnd >= 0)),
        ),
    )
  );
}
