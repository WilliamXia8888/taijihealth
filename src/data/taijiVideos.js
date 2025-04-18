/**
 * 太极养生视频数据
 * 用于展示和播放太极养生相关的视频内容
 */

const taijiVideos = [
  {
    id: 1,
    title: '太极禅道健身功法基本功八式',
    level: '初级',
    duration: '15分钟',
    instructor: '张老师',
    benefits: ['舒展筋骨', '调节气息', '平衡阴阳'],
    description: '太极禅道健身功法是集易、儒、释、道、医、太极、瑜伽、普拉提等各家功法为一体的综合健身功法。基本功八式，动作简单易学，适合初级学者。',
    videoUrl: 'videos/taiji/v1.mp4',
    thumbnail: '/images/taiji/taiji-basic-8.jpg',
  },
  {
    id: 2,
    title: '五禽戏',
    level: '中级',
    duration: '20分钟',
    instructor: '李老师',
    benefits: ['强健脏腑', '疏通经络', '增强免疫力'],
    description: '五禽戏是模仿虎、鹿、熊、猿、鸟五种动物的动作而创编的健身功法。通过模仿动物的特定动作，达到强身健体、防病治病的效果。',
    videoUrl: 'videos/taiji/v2.mp4',
    thumbnail: '/images/taiji/five-animal-play.jpg',
  },
  {
    id: 3,
    title: '易筋经',
    level: '高级',
    duration: '30分钟',
    instructor: '王老师',
    benefits: ['强筋壮骨', '延年益寿', '提高气功修为'],
    description: '易筋经是一套传统的中国气功功法，据传由达摩祖师所创。通过特定的姿势和呼吸方法，达到易筋洗髓、强身健体的效果。',
    videoUrl: 'videos/taiji/v3.mp4',
    thumbnail: '/images/taiji/muscle-tendon-changing.jpg',
  },
  {
    id: 4,
    title: '八段锦',
    level: '初级',
    duration: '15分钟',
    instructor: '刘老师',
    benefits: ['疏通经络', '调和气血', '增强体质'],
    description: '八段锦是一套简单易学的传统健身气功，由八个动作组成。通过这些动作的练习，可以达到舒展筋骨、行气活血、调和阴阳的效果。',
    videoUrl: 'videos/taiji/v4.mp4',
    thumbnail: '/images/taiji/eight-section-brocade.jpg',
  },
];

// 视频分类数据
const videoCategories = [
  {
    id: 1,
    title: '太极基础',
    description: '太极入门基础动作和要领',
    thumbnail: '/images/taiji/category-basic.jpg',
    level: '初级',
    videoCount: 2,
    videos: [taijiVideos[0], taijiVideos[3]]
  },
  {
    id: 2,
    title: '气功养生',
    description: '传统气功养生功法',
    thumbnail: '/images/taiji/category-qigong.jpg',
    level: '中级',
    videoCount: 2,
    videos: [taijiVideos[1], taijiVideos[2]]
  }
];

export { taijiVideos, videoCategories };