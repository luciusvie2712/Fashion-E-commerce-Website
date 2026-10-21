import { localized as l } from '../../types/domain';

export const faqCopy = {
  intro: l(
    'Từ chọn size đến đặt hàng, tìm câu trả lời để tự tin khám phá FLUIVIX.',
    'From finding your size to placing an order, find answers for your FLUIVIX experience.',
    '사이즈 선택부터 주문까지, FLUIVIX를 편안하게 둘러볼 수 있는 답변을 찾아보세요.',
    '从选择尺码到下单，找到答案，安心探索 FLUIVIX。',
    'サイズ選びから注文まで。FLUIVIXを楽しむための答えを見つけてください。',
  ),
  search: l(
    'Tìm trong câu hỏi và câu trả lời',
    'Search questions and answers',
    '질문과 답변 검색',
    '搜索问题和答案',
    '質問と回答を検索',
  ),
  placeholder: l(
    'Thử “size”, “thanh toán”…',
    'Try “size”, “payment”…',
    '“사이즈”, “결제”를 검색해 보세요…',
    '试试“尺码”“支付”…',
    '「サイズ」「決済」など…',
  ),
  clear: l('Xóa tìm kiếm', 'Clear search', '검색 지우기', '清除搜索', '検索をクリア'),
  topics: l('Chủ đề', 'Topics', '주제', '主题', 'トピック'),
  all: l('Tất cả câu hỏi', 'All questions', '모든 질문', '全部问题', 'すべての質問'),
  shopping: l(
    'Chọn đồ & đặt hàng',
    'Shopping & orders',
    '쇼핑과 주문',
    '选购与下单',
    '商品選びと注文',
  ),
  delivery: l(
    'Thanh toán & giao nhận',
    'Payment & delivery',
    '결제와 배송',
    '支付与配送',
    '決済と配送',
  ),
  demo: l(
    'Tài khoản & bản demo',
    'Account & demo',
    '계정과 데모',
    '账户与演示',
    'アカウントとデモ',
  ),
  answers: l(
    'Câu trả lời dành cho bạn',
    'Answers for you',
    '궁금한 점에 대한 답변',
    '为你解答',
    '疑問にお答えします',
  ),
  count: l('Số câu hỏi', 'Questions found', '질문 수', '问题数量', '質問数'),
  empty: l(
    'Chưa tìm thấy câu trả lời phù hợp.',
    'No matching answers yet.',
    '일치하는 답변이 없습니다.',
    '暂未找到匹配的答案。',
    '一致する回答が見つかりません。',
  ),
  emptyHint: l(
    'Thử từ khóa ngắn hơn hoặc xem tất cả câu hỏi.',
    'Try a shorter search or browse all questions.',
    '더 짧은 검색어를 사용하거나 모든 질문을 확인하세요.',
    '试试更简短的关键词，或查看全部问题。',
    '短いキーワードに変えるか、すべての質問をご覧ください。',
  ),
  reset: l(
    'Xem tất cả câu hỏi',
    'Show all questions',
    '모든 질문 보기',
    '查看全部问题',
    'すべての質問を見る',
  ),
  help: l(
    'Bạn muốn chia sẻ thêm?',
    'Have something else in mind?',
    '더 나누고 싶은 이야기가 있나요?',
    '还有想分享的吗？',
    'ほかに気になることは？',
  ),
  helpBody: l(
    'Trải nghiệm biểu mẫu liên hệ hoặc khám phá các hướng dẫn chi tiết.',
    'Try the contact form or explore the detailed guides.',
    '문의 양식을 체험하거나 자세한 안내를 살펴보세요.',
    '体验联系表单，或查看详细指南。',
    'お問い合わせフォームを試すか、詳しいガイドをご覧ください。',
  ),
};

export const faqTopics = [
  { id: 'all', icon: 'all' },
  { id: 'shopping', icon: 'shopping' },
  { id: 'delivery', icon: 'delivery' },
  { id: 'demo', icon: 'demo' },
] as const;

export const faqMeta = [
  { topic: 'demo', to: '/about', label: 'about' },
  { topic: 'shopping', to: '/size-guide', label: 'sizeGuide' },
  { topic: 'shopping', to: '/track-order', label: 'track' },
  { topic: 'delivery', to: '/shipping-policy', label: 'shippingPolicy' },
  { topic: 'demo', to: '/privacy-policy', label: 'privacyPolicy' },
  { topic: 'delivery', to: '/track-order', label: 'track' },
  { topic: 'delivery', to: '/return-policy', label: 'returnPolicy' },
  { topic: 'demo', to: '/privacy-policy', label: 'privacyPolicy' },
] as const;
