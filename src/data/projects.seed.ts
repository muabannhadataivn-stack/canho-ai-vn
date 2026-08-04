import type { Project } from "@/lib/types";

/**
 * DỮ LIỆU MẪU (MOCK) — dùng cho giai đoạn dựng frontend.
 * Đây KHÔNG phải dữ liệu đã được thu thập/xác minh qua pipeline thật (xem CONTENT-PIPELINE.md).
 * Khi nối nguồn thật, thay thế toàn bộ mảng này bằng kết quả từ DB/API — không sửa lib/data-source.ts
 * ở phần export ra ngoài.
 *
 * publicationStatus quyết định việc có vào sitemap / generateStaticParams hay không —
 * xem lib/data-source.ts.
 */
export const projectsSeed: Project[] = [
  {
    id: "vinhomes-grand-park",
    slug: "vinhomes-grand-park",
    name: "Vinhomes Grand Park",
    province: "TP.HCM",
    provinceSlug: "tp-hcm",
    district: "TP. Thủ Đức",
    developer: "Vinhomes",
    propertyType: "can-ho",
    salesStatus: "dang-mo-ban",
    scale: "271 ha",
    units: "51 toà",
    buildingDensity: "≈ 22%",
    startDate: "Q2/2018",
    handoverExpected: "Q3/2026",
    updatedAt: "2026-08-03",
    publicationStatus: "published",
    pricing: {
      priceMin: 45,
      priceMax: 68,
      priceUnit: "trieu-m2",
      priceAsOf: "2026-08-03",
      priceTable: [
        { type: "2PN", areaMin: 55, areaMax: 65, priceMin: 48, priceMax: 58 },
        { type: "3PN", areaMin: 75, areaMax: 90, priceMin: 55, priceMax: 68 },
      ],
    },
    amenities: [
      { icon: "park", name: "Công viên 36ha" },
      { icon: "pool", name: "Hồ bơi" },
      { icon: "school", name: "Trường liên cấp" },
      { icon: "mall", name: "TTTM" },
    ],
    nearbyAmenities: [
      { category: "truong-hoc", name: "Trường ĐH Nông Lâm TP.HCM", distanceMeters: 1200 },
      { category: "sieu-thi-ttTM", name: "WinMart+ Long Thạnh Mỹ", distanceMeters: 450 },
    ],
    timeline: [
      { label: "Khởi công", date: "Quý 2/2018", done: true },
      { label: "Bàn giao phân khu hiện tại", date: "Dự kiến quý 3/2026", done: false },
    ],
    location: {
      address: "Nguyễn Xiển, TP. Thủ Đức",
      lat: 10.841,
      lng: 106.8375,
      commuteNote: "Cách trung tâm Quận 1 khoảng 15–18 km, di chuyển ô tô/xe máy mất khoảng 30–45 phút tuỳ giờ.",
      nearbyRoutes: [
        { name: "Xa lộ Hà Nội", type: "duong-bo" },
        { name: "Tuyến Metro số 1", type: "metro" },
      ],
    },
    media: {
      heroImage: "/images/project-fallback.webp",
      heroImageAlt: "Ảnh minh hoạ tổng thể khu đô thị căn hộ Vinhomes Grand Park, TP. Thủ Đức",
      gallery: [],
    },
    fitFor: [
      { text: "Gia đình trẻ làm việc khu Đông TP.HCM" },
      { text: "Cân nhắc: mật độ dân cư cao giờ cao điểm", caution: true },
    ],
    community: {
      url: "https://cho-cu-dan.vn/vinhomes-grand-park",
      communityName: "Chợ Cư Dân Vinhomes Grand Park",
    },
  },
  {
    id: "vinhomes-ocean-park",
    slug: "vinhomes-ocean-park",
    name: "Vinhomes Ocean Park",
    province: "Hà Nội",
    provinceSlug: "ha-noi",
    district: "Gia Lâm",
    developer: "Vinhomes",
    propertyType: "can-ho",
    salesStatus: "da-ban-giao",
    scale: "420 ha",
    startDate: "Q1/2019",
    updatedAt: "2026-07-28",
    publicationStatus: "published",
    pricing: {
      priceMin: 38,
      priceMax: 52,
      priceUnit: "trieu-m2",
      priceAsOf: "2026-07-28",
    },
    amenities: [
      { icon: "pool", name: "Biển hồ nước mặn" },
      { icon: "sport", name: "Sân thể thao đa năng" },
    ],
    nearbyAmenities: [
      { category: "cong-vien", name: "Công viên Vinschool Ocean Park", distanceMeters: 300, withinProject: true },
    ],
    timeline: [
      { label: "Khởi công", date: "Quý 1/2019", done: true },
      { label: "Bàn giao", date: "Quý 4/2021", done: true },
    ],
    location: {
      address: "Đa Tốn, Gia Lâm",
      lat: 20.9974,
      lng: 105.9622,
    },
    media: {
      heroImage: "/images/project-fallback.webp",
      heroImageAlt: "Ảnh minh hoạ khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội",
    },
    fitFor: [{ text: "Người mua ở thực, ưu tiên tiện ích nội khu đã hoàn thiện" }],
  },
  {
    id: "vinhomes-smart-city",
    slug: "vinhomes-smart-city",
    name: "Vinhomes Smart City",
    province: "Hà Nội",
    provinceSlug: "ha-noi",
    district: "Nam Từ Liêm",
    developer: "Vinhomes",
    propertyType: "can-ho",
    salesStatus: "sap-mo-ban",
    updatedAt: "2026-07-30",
    publicationStatus: "published",
    pricing: {
      // Chưa mở bán — không có priceMin/priceMax → UI hiện "Đang cập nhật giá"
    },
    amenities: [],
    nearbyAmenities: [],
    timeline: [],
    location: {
      district: undefined,
    } as Project["location"],
    media: {
      heroImage: null,
    },
    fitFor: [],
  },
  {
    id: "ecopark-grand",
    slug: "ecopark-grand",
    name: "EcoPark Grand",
    province: "Hưng Yên",
    provinceSlug: "hung-yen",
    district: "Văn Giang",
    developer: "Ecopark",
    propertyType: "can-ho",
    salesStatus: "dang-mo-ban",
    units: "12 toà",
    updatedAt: "2026-07-20",
    publicationStatus: "published",
    pricing: {
      priceMin: 32,
      priceMax: 40,
      priceUnit: "trieu-m2",
      priceAsOf: "2026-07-20",
    },
    amenities: [{ icon: "park", name: "Công viên cây xanh" }],
    nearbyAmenities: [],
    timeline: [{ label: "Khởi công", date: "Quý 3/2022", done: true }],
    location: {
      address: "Văn Giang, Hưng Yên",
    },
    media: {
      heroImage: "/images/project-fallback.webp",
      heroImageAlt: "Ảnh minh hoạ dự án EcoPark Grand, Văn Giang, Hưng Yên",
    },
    fitFor: [],
  },
  {
    id: "du-an-nhap-nhap-thu",
    slug: "du-an-nhap-thu-nghiem",
    name: "Dự án nhập thử nghiệm",
    province: "Đồng Nai",
    provinceSlug: "dong-nai",
    propertyType: "can-ho",
    salesStatus: "dang-cap-nhat",
    updatedAt: "2026-08-01",
    // draft: dữ liệu quá mỏng (chưa đạt tối thiểu 4/9 phần) — KHÔNG lên sitemap,
    // KHÔNG có trong generateStaticParams. Minh hoạ hành vi publicationStatus.
    publicationStatus: "draft",
    pricing: {},
    amenities: [],
    nearbyAmenities: [],
    timeline: [],
    location: {},
    media: { heroImage: null },
    fitFor: [],
  },
];
