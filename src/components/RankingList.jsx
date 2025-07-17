export default function RankingList() {
  // 예시 데이터
  const goods = [
    { id: 1, name: "AI 강아지 머그컵", likes: 120, img: "https://via.placeholder.com/120x120?text=Mug" },
    { id: 2, name: "고양이 포스터", likes: 98, img: "https://via.placeholder.com/120x120?text=Poster" },
    { id: 3, name: "토끼 티셔츠", likes: 75, img: "https://via.placeholder.com/120x120?text=Tshirt" },
  ];
  return (
    <section className="max-w-5xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">인기 굿즈 랭킹</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {goods.map(g => (
          <div key={g.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <img src={g.img} alt={g.name} className="w-24 h-24 object-cover rounded mb-3" />
            <div className="font-semibold">{g.name}</div>
            <div className="text-blue-600 font-bold mt-2">❤️ {g.likes}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 